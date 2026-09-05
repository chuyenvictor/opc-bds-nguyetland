/**
 * server/routes/leads.routes.mjs — CRM Lead Capture & Nurturing Domain Routes
 * Endpoints: /api/leads/submit, /api/bds/lead-submit, /api/bds/leads/submit, /api/bds/leads/recent
 */
import { Router } from '../core/router.mjs';
import { sendJson, sendOk, sendBadRequest, sendTooManyRequests, sendInternalError } from '../core/response.mjs';
import { checkRateLimit } from '../middleware/rate-limiter.mjs';
import { taskQueue } from '../middleware/async-task-queue.mjs';
import { escapeHtml, upsertLeadDb, getLeadsDb } from '../../routes/api-content-db.mjs';
import { handleRecentLeadsActivity } from '../../routes/api-bds-leads.mjs';
import { handleDripCampaignRun } from '../../routes/api-auth.mjs';

export const leadsRouter = new Router();

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 25000) {
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

async function handleLeadSubmission(req, res) {
    const rateCheck = checkRateLimit(req, 'lead');
    if (rateCheck.limited) {
        return sendTooManyRequests(res, rateCheck.message);
    }

    try {
        const lead = await parseJsonBody(req);
        const name = (lead.name || '').trim();
        const phone = (lead.phone || '').trim();
        const email = (lead.email || '').trim();
        const property = lead.property || lead.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng';
        const budget = lead.budget || '5 - 15 Tỷ';
        const source = lead.source || 'Website Portal Realtime';
        const note = lead.note || '';

        if (!name || !phone) {
            return sendBadRequest(res, 'Vui lòng cung cấp Họ tên và Số điện thoại');
        }

        const leadId = 'LEAD_' + Date.now().toString(36).toUpperCase();
        const budgetVal = parseFloat(budget.replace(/[^0-9.]/g, '')) || 0;
        const heat = budgetVal >= 20 ? 'VERY_HOT' : budgetVal >= 10 ? 'HOT' : 'WARM';

        // 1. Lưu CSDL SQLite
        upsertLeadDb({
            lead_id: leadId,
            name,
            phone,
            email,
            property,
            budget,
            heat,
            source,
            note,
            email_step: 1,
            status: 'NEW'
        });

        // 2. Out-of-Band Background Webhooks
        taskQueue.enqueue('Telegram Lead Alert', async () => {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID || '-1003891453026';
            if (!botToken) return;

            const heatBadge = heat === 'VERY_HOT' ? '🔥 [LEAD KIM CƯƠNG >20 TỶ]' : heat === 'HOT' ? '⚡ [LEAD HOT DÒNG TIỀN]' : '💎 [LEAD TIỀM NĂNG]';
            const text = `${heatBadge}\n\n` +
                `👤 <b>Họ tên:</b> ${escapeHtml(name)}\n` +
                `📞 <b>Hotline/Zalo:</b> <code>${escapeHtml(phone)}</code>\n` +
                `📧 <b>Email:</b> ${escapeHtml(email || 'Chưa cung cấp')}\n` +
                `🏠 <b>Tài sản quan tâm:</b> <b>${escapeHtml(property)}</b>\n` +
                `💰 <b>Ngân sách:</b> <b>${escapeHtml(budget)}</b>\n` +
                `📌 <b>Nguồn:</b> ${escapeHtml(source)}\n` +
                `📝 <b>Ghi chú:</b> ${escapeHtml(note || 'Quan tâm bảng dòng tiền')}\n` +
                `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}\n\n` +
                `👉 <i>Đã kích hoạt hệ thống tự động đồng bộ CRM đa kênh!</i>`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
            });
        });

        taskQueue.enqueue('Google Sheet Lead Sync', async () => {
            const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
            if (sheetUrl) {
                await fetch(sheetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'submit_lead',
                        leadId,
                        name,
                        phone,
                        email,
                        propertyTitle: property,
                        budget,
                        source,
                        note,
                        heat
                    })
                });
            }
        });

        taskQueue.enqueue('n8n Lead Webhook', async () => {
            const n8nUrl = process.env.N8N_BDS_LEAD_WEBHOOK || 'http://localhost:5678/webhook/bds-lead-capture';
            try {
                await fetch(n8nUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leadId, name, phone, email, property, budget, heat, source, note })
                });
            } catch (_) { /* n8n optional local server */ }
        });

        // Phản hồi siêu tốc trong < 30ms
        sendOk(res, {
            leadId,
            status: 'RECEIVED',
            message: 'Đăng ký thẩm định thành công. Chuyên viên Nguyệt Land sẽ gửi bảng dòng tiền chi tiết qua Zalo!'
        }, 'Tiếp nhận thành công');

    } catch (err) {
        console.error('[Lead Submit Error]', err);
        sendInternalError(res);
    }
}

leadsRouter.post('/api/leads/submit', handleLeadSubmission);
leadsRouter.post('/api/bds/lead-submit', handleLeadSubmission);
leadsRouter.post('/api/bds/leads/submit', handleLeadSubmission);

// GET /api/bds/leads/recent (Social Proof Feed)
leadsRouter.get('/api/bds/leads/recent', (req, res) => {
    try {
        const leads = getLeadsDb({ limit: 10 });
        const masked = leads.map(l => {
            const p = (l.phone || '').trim();
            const maskedPhone = p.length >= 7 ? p.slice(0, 3) + '****' + p.slice(-3) : '09****168';
            return {
                name: l.name || 'Nhà Đầu Tư VIP',
                phone: maskedPhone,
                property: l.property || 'BĐS Dòng Tiền Đà Nẵng',
                budget: l.budget || '10 - 20 Tỷ',
                created_at: l.created_at || new Date().toISOString()
            };
        });
        sendOk(res, { recentLeads: masked });
    } catch (err) {
        sendInternalError(res);
    }
});

// GET /api/leads/recent-activity (Realtime Social Proof Notifications)
leadsRouter.get('/api/leads/recent-activity', async (req, res) => {
    await handleRecentLeadsActivity(req, res);
});

// POST /api/leads/run-email-drip (Trigger Email Drip Nurturing Campaign)
leadsRouter.post('/api/leads/run-email-drip', async (req, res) => {
    await handleDripCampaignRun(req, res);
});

