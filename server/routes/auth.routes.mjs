/**
 * server/routes/auth.routes.mjs — Auth & VIP Member Domain Routes
 * Endpoints: /api/auth/register, /api/auth/login, /api/leads/consultation, /api/admin/dashboard
 */
import { Router } from '../core/router.mjs';
import { sendJson, sendOk, sendBadRequest, sendUnauthorized, sendForbidden, sendTooManyRequests, sendInternalError } from '../core/response.mjs';
import { checkRateLimit } from '../middleware/rate-limiter.mjs';
import { taskQueue } from '../middleware/async-task-queue.mjs';
import { getDb, upsertUser, getUsers, upsertLeadDb, getLeadsDb, escapeHtml } from '../../routes/api-content-db.mjs';
import { generateToken, requireAdminAuth } from '../../lib/security.mjs';

const ADMIN_PHONES = ['0989890022', '0935509168', '0989.890.022', '0935.509.168', '0905123456'];

export const authRouter = new Router();

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 50000) {
                reject(new Error('PAYLOAD_TOO_LARGE'));
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

// POST /api/auth/register
authRouter.post('/api/auth/register', async (req, res) => {
    const rateCheck = checkRateLimit(req, 'auth');
    if (rateCheck.limited) {
        return sendTooManyRequests(res, rateCheck.message);
    }

    try {
        const data = await parseJsonBody(req);
        const name = (data.name || '').trim();
        const rawPhone = (data.phone || '').trim();
        const email = (data.email || '').trim();
        const budget = data.budget || '5 - 15 Tỷ';
        const note = (data.note || '').trim();
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        if (!name || cleanPhone.length < 10) {
            return sendBadRequest(res, 'Vui lòng cung cấp Họ tên và Số điện thoại hợp lệ (tối thiểu 10 số)');
        }

        let role = 'VIP_INVESTOR';
        const adminSecret = process.env.ADMIN_SECRET_KEY;
        if (ADMIN_PHONES.some(p => p.replace(/[^0-9]/g, '') === cleanPhone) || (adminSecret && data.adminSecret && data.adminSecret === adminSecret)) {
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

        // 3. Asynchronous Out-of-Band Dispatch (Non-blocking queue)
        taskQueue.enqueue('Sync Register User Webhook', async () => {
            const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
            if (sheetUrl) {
                await fetch(sheetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'register_user', leadId, ...userObj })
                });
            }
        });

        taskQueue.enqueue('Telegram Register Alert', async () => {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID || '-1003891453026';
            if (!botToken) return;

            const roleBadge = role === 'ADMIN' ? '👑 [ADMIN QUẢN TRỊ]' : '⭐ [HỘI VIÊN VIP MỚI]';
            const alertText = `${roleBadge} <b>ĐĂNG KÝ THÀNH CÔNG</b>\n\n` +
                `👤 <b>Họ tên:</b> ${escapeHtml(name)}\n` +
                `📞 <b>SĐT / Zalo:</b> <code>${escapeHtml(rawPhone)}</code>\n` +
                `📧 <b>Email:</b> ${escapeHtml(email || 'Chưa cung cấp')}\n` +
                `💰 <b>Ngân sách:</b> <b>${escapeHtml(budget)}</b>\n` +
                `🆔 <b>Mã User:</b> <code>${userId}</code>\n` +
                `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}\n\n` +
                `👉 <i>Tự động kích hoạt chuỗi chăm sóc 30 ngày và lưu Google Sheet!</i>`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: alertText, parse_mode: 'HTML' })
            });
        });

        const token = generateToken(userObj);

        sendJson(res, 200, {
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
        });

    } catch (err) {
        console.error('[Auth Register Error]', err);
        sendInternalError(res);
    }
});

// POST /api/auth/login
authRouter.post('/api/auth/login', async (req, res) => {
    const rateCheck = checkRateLimit(req, 'auth');
    if (rateCheck.limited) {
        return sendTooManyRequests(res, rateCheck.message);
    }

    try {
        const data = await parseJsonBody(req);
        const rawPhone = (data.phone || '').trim();
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        if (!rawPhone || cleanPhone.length < 10) {
            return sendBadRequest(res, 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 10 số)');
        }

        const isAdmin = ADMIN_PHONES.some(p => p.replace(/[^0-9]/g, '') === cleanPhone);
        const password = (data.password || '').trim();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (isAdmin) {
            if (!adminPassword) {
                return sendJson(res, 503, { success: false, message: 'Hệ thống Admin chưa được cấu hình. Vui lòng liên hệ quản trị viên.' });
            }
            if (!password) {
                return sendUnauthorized(res, 'Vui lòng nhập mật khẩu quản trị viên để đăng nhập.');
            }
            if (password !== adminPassword) {
                return sendUnauthorized(res, 'Mật khẩu quản trị viên không chính xác. Vui lòng thử lại hoặc liên hệ Admin.');
            }
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
        sendJson(res, 200, {
            success: true,
            message: `Đăng nhập thành công! Chào mừng ${user.name}`,
            user,
            token
        });

    } catch (err) {
        console.error('[Auth Login Error]', err);
        sendInternalError(res);
    }
});

// POST /api/leads/consultation
authRouter.post('/api/leads/consultation', async (req, res) => {
    const rateCheck = checkRateLimit(req, 'lead');
    if (rateCheck.limited) {
        return sendTooManyRequests(res, rateCheck.message);
    }

    try {
        const data = await parseJsonBody(req);
        const name = (data.name || '').trim();
        const phone = (data.phone || '').trim();
        const email = (data.email || '').trim();
        const property = data.propertyTitle || data.property || 'BĐS Dòng Tiền Đà Nẵng';
        const budget = data.budget || '10 - 25 Tỷ';
        const preferredTime = data.preferredTime || 'Trong tuần này';
        const note = data.note || '';

        if (!name || !phone) {
            return sendBadRequest(res, 'Vui lòng cung cấp Họ tên và Số điện thoại');
        }

        const bookingCode = 'BDS-VIP-' + Math.floor(10000 + Math.random() * 90000);
        const leadId = 'LEAD_' + Date.now().toString(36).toUpperCase();

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

        // Background Webhooks
        taskQueue.enqueue('Consultation Sheet Sync', async () => {
            const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
            if (sheetUrl) {
                await fetch(sheetUrl, {
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
                });
            }
        });

        taskQueue.enqueue('Consultation Telegram Alert', async () => {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID || '-1003891453026';
            if (!botToken) return;

            const text = `🔥 <b>[YÊU CẦU KHẢO SÁT & TƯ VẤN THỰC ĐỊA MỚI]</b>\n\n` +
                `🎫 <b>Mã Đặt Chỗ:</b> <code>${bookingCode}</code>\n` +
                `👤 <b>Khách hàng:</b> <b>${escapeHtml(name)}</b>\n` +
                `📞 <b>Hotline/Zalo:</b> <code>${escapeHtml(phone)}</code>\n` +
                `🏠 <b>Tài sản quan tâm:</b> <b>${escapeHtml(property)}</b>\n` +
                `💰 <b>Ngân sách:</b> ${escapeHtml(budget)}\n` +
                `⏰ <b>Thời gian hẹn:</b> ${escapeHtml(preferredTime)}\n` +
                `📝 <b>Ghi chú:</b> ${escapeHtml(note || 'Khảo sát dòng tiền thực địa')}\n\n` +
                `⚡ <i>Hệ thống đã điều phối tư vấn 1-1 cho Chị Hải Nguyệt!</i>`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
            });
        });

        sendOk(res, {
            bookingCode,
            leadId,
            message: 'Yêu cầu tư vấn thực địa đã được ghi nhận. Chị Hải Nguyệt sẽ liên hệ trong 15 phút!'
        }, 'Đặt lịch thành công');

    } catch (err) {
        console.error('[Consultation Error]', err);
        sendInternalError(res);
    }
});

// GET /api/admin/dashboard
authRouter.get('/api/admin/dashboard', (req, res) => {
    const admin = requireAdminAuth(req, res);
    if (!admin) return;

    try {
        const users = getUsers({ limit: 50 });
        const leads = getLeadsDb({ limit: 50 });
        sendOk(res, {
            stats: {
                totalUsers: users.length,
                totalLeads: leads.length,
                hotLeads: leads.filter(l => l.heat === 'HOT' || l.heat === 'VERY_HOT').length,
                timestamp: new Date().toISOString()
            },
            recentUsers: users.slice(0, 10),
            recentLeads: leads.slice(0, 10)
        });
    } catch (err) {
        sendInternalError(res);
    }
});
