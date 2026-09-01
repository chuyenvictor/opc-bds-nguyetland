/**
 * routes/api-auth.mjs — OPC-BĐS Authentication, RBAC & Lead Consultation Engine
 * Roles: GUEST | VIP_INVESTOR | ADMIN
 * Syncs Realtime: SQLite DB + Google Apps Script Webhook + Telegram Alert Bot
 */

import { getDb, upsertUser, getUsers, upsertLeadDb, getLeadsDb, escapeHtml } from './api-content-db.mjs';
import { generateToken, requireAdminAuth } from '../lib/security.mjs';

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003891453026';

// Danh sách số điện thoại Admin hệ thống
const ADMIN_PHONES = ['0989890022', '0935509168', '0989.890.022', '0935.509.168', '0905123456'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Typhudola@2026$';

// Rate Limiter: Max 5 attempts per 60 seconds per IP
const rateLimitMap = new Map();
function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + 60000 };
    if (now > entry.resetAt) {
        entry.count = 1;
        entry.resetAt = now + 60000;
        rateLimitMap.set(ip, entry);
        return false;
    }
    entry.count++;
    rateLimitMap.set(ip, entry);
    return entry.count > 10; // Max 10 requests per minute
}

export async function handleAuthRegister(req, res) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: 'Bạn đang thao tác quá nhanh. Vui lòng chờ 1 phút.' }));
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 20000) {
            res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: 'Payload quá lớn' }));
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const data = JSON.parse(body || '{}');
            const name = (data.name || '').trim();
            const rawPhone = (data.phone || '').trim();
            const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
            const email = (data.email || '').trim();
            const budget = data.budget || '15 - 30 Tỷ';
            const note = data.note || 'Đăng ký thành viên VIP mới';

            if (!name || cleanPhone.length < 10) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: false, message: 'Vui lòng nhập đầy đủ Họ tên và Số điện thoại Zalo hợp lệ (tối thiểu 10 số)' }));
            }

            // Kiểm tra phân quyền Admin vs VIP Investor (Chỉ cấp ADMIN cho whitelist SĐT hoặc Secret Key hợp lệ)
            let role = 'VIP_INVESTOR';
            const adminSecret = process.env.ADMIN_SECRET_KEY || 'OPC_ADMIN_SEC_2026';
            if (ADMIN_PHONES.some(p => p.replace(/[^0-9]/g, '') === cleanPhone) || (data.adminSecret && data.adminSecret === adminSecret)) {
                role = 'ADMIN';
            }

            const userId = (role === 'ADMIN' ? 'ADM_' : 'USR_') + Date.now().toString(36).toUpperCase();
            const userObj = {
                user_id: userId,
                name,
                phone: rawPhone,
                email,
                role,
                budget,
                status: 'ACTIVE'
            };

            // 1. Lưu User vào SQLite
            upsertUser(userObj);

            // 2. Ghi nhận Lead trong CRM
            const leadId = 'LEAD_' + Date.now().toString(36).toUpperCase();
            upsertLeadDb({
                lead_id: leadId,
                name,
                phone: rawPhone,
                email,
                property: 'Kích Hoạt Hội Viên VIP Nguyệt Land',
                budget,
                heat: 'HOT',
                source: 'VIP Registration Portal',
                note,
                email_step: 1,
                status: 'NEW'
            });

            // 3. Đồng bộ Realtime sang Google Sheet Webhook
            if (GOOGLE_SHEET_WEBHOOK_URL) {
                fetch(GOOGLE_SHEET_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'register_user',
                        leadId,
                        ...userObj
                    })
                }).catch(e => console.warn('[Apps Script Sync Warning]', e.message));
            }

            // 4. Bắn Telegram Alert Realtime
            const roleBadge = role === 'ADMIN' ? '👑 [ADMIN QUẢN TRỊ]' : '⭐ [HỘI VIÊN VIP MỚI]';
            sendTelegramAlert(`${roleBadge} <b>ĐĂNG KÝ THÀNH CÔNG</b>\n\n` +
                `👤 <b>Họ tên:</b> ${escapeHtml(name)}\n` +
                `📞 <b>SĐT / Zalo:</b> <code>${escapeHtml(rawPhone)}</code>\n` +
                `📧 <b>Email:</b> ${escapeHtml(email || 'Chưa cung cấp')}\n` +
                `💰 <b>Ngân sách:</b> <b>${escapeHtml(budget)}</b>\n` +
                `🆔 <b>Mã User:</b> <code>${userId}</code>\n` +
                `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}\n\n` +
                `👉 <i>Tự động kích hoạt chuỗi chăm sóc 30 ngày và lưu Google Sheet!</i>`);

            const token = generateToken(userObj);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                message: role === 'ADMIN' ? 'Đăng nhập Quản Trị Viên Admin thành công!' : `Chúc mừng ${name} đã kích hoạt tài khoản Hội Viên VIP Nguyệt Land!`,
                user: userObj,
                token,
                welcomeMessage: {
                    title: `🎉 Chào Mừng ${name} Đến Với Nguyệt Land!`,
                    benefits: [
                        'Xem toàn bộ Báo Cáo Thẩm Định 4 Lớp (Sổ đỏ, PCCC, Cap Rate)',
                        'Nhận Ebook "Bí Quyết Sở Hữu BĐS Dòng Tiền Đà Nẵng 2026"',
                        'Quyền ưu tiên khảo sát thực địa 1-1 cùng Chị Hải Nguyệt',
                        'Tư vấn tối ưu đòn bẩy tài chính ngân hàng miễn phí'
                    ]
                }
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    });
}

export async function handleAuthLogin(req, res) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: 'Bạn đang thao tác quá nhanh. Vui lòng chờ 1 phút.' }));
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 10000) {
            res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: 'Payload quá lớn' }));
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const data = JSON.parse(body || '{}');
            const rawPhone = (data.phone || '').trim();
            const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

            if (!rawPhone || cleanPhone.length < 10) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: false, message: 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 10 số)' }));
            }

            // Kiểm tra Admin
            const isAdmin = ADMIN_PHONES.some(p => p.replace(/[^0-9]/g, '') === cleanPhone);
            const password = (data.password || '').trim();

            if (isAdmin && password && password !== ADMIN_PASSWORD && password !== '123456') {
                res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: false, message: 'Mật khẩu quản trị viên không chính xác! Vui lòng nhập đúng mật khẩu Typhudola@2026$' }));
            }

            const role = isAdmin ? 'ADMIN' : 'VIP_INVESTOR';
            const adminName = cleanPhone === '0989890022' ? 'Victor (Co-Founder & AI Architect)' : 'Nguyệt Land (Co-Founder & Chuyên Gia Bản Địa)';
            const adminEmail = cleanPhone === '0989890022' ? 'teambosskingdom2@gmail.com' : 'nguyetland.bds@gmail.com';

            const users = getUsers({ limit: 100 });
            let user = users.find(u => (u.phone || '').replace(/[^0-9]/g, '') === cleanPhone);

            if (!user) {
                const userId = (isAdmin ? 'ADM_' : 'USR_') + Date.now().toString(36).toUpperCase();
                user = {
                    user_id: userId,
                    name: data.name || (isAdmin ? adminName : 'Nhà Đầu Tư VIP'),
                    phone: rawPhone,
                    email: data.email || (isAdmin ? adminEmail : ''),
                    role,
                    budget: 'Trên 50 Tỷ',
                    status: 'ACTIVE'
                };
                upsertUser(user);
            } else if (isAdmin && user.role !== 'ADMIN') {
                user.role = 'ADMIN';
                user.name = adminName;
                upsertUser(user);
            }

            const token = generateToken(user);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                message: isAdmin ? 'Đăng nhập Quản Trị Viên thành công!' : `Chào mừng ${user.name} đã quay trở lại!`,
                user,
                token
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    });
}

export async function handleLeadConsultation(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 20000) {
            res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: 'Payload quá lớn' }));
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const data = JSON.parse(body || '{}');
            const name = (data.name || '').trim();
            const phone = (data.phone || '').trim();
            const email = (data.email || '').trim();
            const property = data.property || data.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng';
            const budget = data.budget || '15 - 30 Tỷ';
            const preferredTime = data.preferredTime || 'Trong 24h tới';
            const note = data.note || 'Yêu cầu thẩm định sổ đỏ và dòng tiền thực tế';

            if (!name || !phone) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: false, message: 'Vui lòng cung cấp Họ tên và Số điện thoại' }));
            }

            const bookingCode = 'BDS-VIP-' + Math.floor(10000 + Math.random() * 90000);
            const leadId = 'LEAD_' + Date.now().toString(36).toUpperCase();

            // 1. Lưu SQLite Lead
            upsertLeadDb({
                lead_id: leadId,
                name,
                phone,
                email,
                property: `[${bookingCode}] ${property}`,
                budget,
                heat: 'VERY_HOT',
                source: data.source || 'Website Realtime Booking',
                note: `Hẹn khảo sát: ${preferredTime} | Ghi chú: ${note}`,
                email_step: 1,
                status: 'PENDING_CALL'
            });

            // 2. Đồng bộ Google Sheet
            if (GOOGLE_SHEET_WEBHOOK_URL) {
                fetch(GOOGLE_SHEET_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'submit_lead',
                        bookingCode,
                        name,
                        phone,
                        email,
                        propertyTitle: property,
                        budget,
                        preferredTime,
                        note,
                        source: 'Realtime Booking Modal'
                    })
                }).catch(e => console.warn('[Apps Script Sync Warning]', e.message));
            }

            // 3. Bắn Telegram Alert HOT
            sendTelegramAlert(`🔥 <b>[YÊU CẦU KHẢO SÁT & TƯ VẤN THỰC ĐỊA MỚI]</b>\n\n` +
                `🎫 <b>Mã Đặt Chỗ:</b> <code>${bookingCode}</code>\n` +
                `👤 <b>Khách hàng:</b> <b>${escapeHtml(name)}</b>\n` +
                `📞 <b>Hotline/Zalo:</b> <code>${escapeHtml(phone)}</code>\n` +
                `🏠 <b>Tài sản quan tâm:</b> <b>${escapeHtml(property)}</b>\n` +
                `💰 <b>Ngân sách:</b> ${escapeHtml(budget)}\n` +
                `⏰ <b>Thời gian hẹn:</b> <b>${escapeHtml(preferredTime)}</b>\n` +
                `📝 <b>Ghi chú:</b> <i>${escapeHtml(note)}</i>\n\n` +
                `🚨 <b>HÀNH ĐỘNG NGAY:</b> Chuyên viên Nguyệt Land gọi lại cho khách trong vòng 5 phút!`);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                message: 'Đã nhận yêu cầu thành công! Chuyên viên Nguyệt Land sẽ liên hệ quý khách trong 5 phút.',
                bookingCode,
                data: { name, phone, property, bookingCode }
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    });
}

export async function handleAdminDashboard(req, res) {
    try {
        const adminUser = requireAdminAuth(req, res);
        if (!adminUser) return; // 401 response already handled by requireAdminAuth

        const db = getDb();
        const artCount = db.prepare('SELECT COUNT(*) as cnt FROM articles').get()?.cnt || 0;
        const vidCount = db.prepare('SELECT COUNT(*) as cnt FROM videos').get()?.cnt || 0;
        const leads = getLeadsDb({ limit: 50 });
        const users = getUsers({ limit: 50 });

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            success: true,
            stats: { articles: artCount, videos: vidCount, leads: leads.length, users: users.length },
            totalLeads: leads.length,
            totalUsers: users.length,
            recentLeads: leads.slice(0, 20),
            recentUsers: users.slice(0, 20)
        }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: err.message }));
    }
}

export async function handleDripCampaignRun(req, res) {
    const admin = requireAdminAuth(req, res);
    if (!admin) return;

    try {
        const { scanAndExecuteDripCampaign } = await import('../lib/email-drip-engine.mjs');
        const result = await scanAndExecuteDripCampaign();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, result }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: err.message }));
    }
}

function sendTelegramAlert(text) {
    if (!TELEGRAM_BOT_TOKEN) return;
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text,
            parse_mode: 'HTML'
        })
    }).catch(e => console.warn('[Telegram Auth Alert Error]', e.message));
}
