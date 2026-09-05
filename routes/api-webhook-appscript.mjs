/**
 * routes/api-webhook-appscript.mjs — OPC-BĐS Webhook nhận dữ liệu từ Apps Script
 * Cho phép Google Apps Script gọi ngược về server để:
 *   - Ghi Lead mới từ Form Google Sheet
 *   - Cập nhật trạng thái Email Nurturing
 *   - Kích hoạt pipeline từ xa
 */
import '../lib/load-env.mjs';
import { upsertLeadDb, upsertUser } from './api-content-db.mjs';

const getWebhookSecret = () => process.env.WEBHOOK_SECRET || 'opc-bds-nguyet-land-2026';
const getTelegramBotToken = () => process.env.TELEGRAM_BOT_TOKEN;
const getTelegramChatId = () => process.env.TELEGRAM_CHAT_ID || '-1003891453026';

export async function handleAppScriptWebhook(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        try {
            const data = JSON.parse(body || '{}');

            const action = (data.action || 'unknown').toLowerCase();
            console.log(`[Apps Script Webhook] Action: ${action} | Time: ${new Date().toLocaleString('vi-VN')}`);

            // Webhook secret validation (bỏ qua xác thực cho heartbeat health check nếu cần)
            const webhookSecret = getWebhookSecret();
            const providedSecret = data.secret || req.headers['x-webhook-secret'] || '';
            if (webhookSecret && action !== 'heartbeat' && providedSecret !== webhookSecret) {
                res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: false, message: 'Unauthorized: Sai hoặc thiếu Webhook Secret Token' }));
            }

            switch (action) {
                case 'new_lead': {
                    // Lead mới từ Google Form / Apps Script
                    const leadId = 'LEAD_GAS_' + Date.now().toString(36).toUpperCase();
                    upsertLeadDb({
                        lead_id: leadId,
                        name: data.name || 'Khách VIP',
                        phone: data.phone || '',
                        email: data.email || '',
                        property: data.property || 'BĐS Dòng Tiền Đà Nẵng',
                        budget: data.budget || '5 - 15 Tỷ',
                        heat: data.heat || 'HOT',
                        source: 'Google Sheet Form',
                        note: data.note || '',
                        email_step: 1
                    });
                    await notifyTelegram(`🔥 <b>[LEAD MỚI TỪ GOOGLE SHEET]</b>\n• Tên: <b>${data.name}</b>\n• SĐT: <code>${data.phone}</code>\n• Ngân sách: ${data.budget}\n• Tài sản: ${data.property}`);
                    return sendJson(res, { success: true, leadId, message: 'Lead đã được ghi nhận' });
                }

                case 'register_user': {
                    // Đăng ký từ Apps Script
                    const userId = 'USR_GAS_' + Date.now().toString(36).toUpperCase();
                    upsertUser({
                        user_id: userId,
                        name: data.name || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        role: data.role || 'VIP_INVESTOR',
                        budget: data.budget || '5 - 15 Tỷ',
                        status: 'ACTIVE'
                    });
                    return sendJson(res, { success: true, userId, message: 'Thành viên đã được đăng ký' });
                }

                case 'rss_sync': {
                    // Đồng bộ tin tức từ scanner
                    console.log(`[Apps Script Webhook] RSS Sync: "${data.title?.substring(0, 50)}..."`);
                    return sendJson(res, { success: true, message: 'RSS sync nhận thành công' });
                }

                case 'heartbeat': {
                    return sendJson(res, {
                        success: true,
                        message: 'Hệ thống đang hoạt động tốt',
                        timestamp: new Date().toISOString(),
                        domain: 'bds.breaths.live'
                    });
                }

                default:
                    return sendJson(res, { success: true, action, message: 'Action nhận thành công' });
            }
        } catch (e) {
            console.error('[Apps Script Webhook Error]', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: e.message }));
        }
    });
}

function sendJson(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

async function notifyTelegram(text) {
    const botToken = getTelegramBotToken();
    const chatId = getTelegramChatId();
    if (!botToken) return;
    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
        });
    } catch (_) {}
}
