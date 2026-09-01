/**
 * lib/email-drip-engine.mjs — OPC-BĐS 30-Day Email Nurturing Drip Engine
 * Tự động quét và điều phối chuỗi email nuôi dưỡng nhà đầu tư VIP:
 * Milestones: Day 1, Day 3, Day 7, Day 14, Day 21, Day 30
 * Đồng bộ hóa SQLite DB + Google Apps Script Webhook + Telegram Alert
 */

import { getDb } from '../routes/api-content-db.mjs';

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003891453026';

// Các cột mốc gửi email trong chuỗi 30 ngày
export const DRIP_MILESTONES = [1, 3, 7, 14, 21, 30];

export const MILESTONE_TITLES = {
    1: 'Day 1: Chào mừng VIP & Tặng Ebook Báo Cáo Thẩm Định 4 Lớp',
    3: 'Day 3: Bài toán 10 Tỷ — Tiết kiệm 5.5% vs Căn hộ dòng tiền 85 Triệu/tháng',
    7: 'Day 7: Làn sóng Digital Nomad — Bí quyết phòng luôn kín >92% tại An Thượng',
    14: 'Day 14: Cảnh báo sống còn — 5 tiêu chuẩn PCCC bắt buộc trước khi đặt cọc',
    21: 'Day 21: Nghệ thuật đòn bẩy — Sở hữu tòa 18 Tỷ chỉ với 6 Tỷ vốn tự có',
    30: 'Day 30: Lời mời khảo sát thực địa 1-1 cùng Chị Hải Nguyệt tại Đà Nẵng'
};

/**
 * Gửi email một bước cụ thể qua Google Apps Script Webhook
 */
export async function sendDripEmailViaWebhook(email, name, step) {
    if (!email || !email.includes('@')) return false;

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
        console.warn(`[Drip Engine] ⚠️ Chưa cấu hình GOOGLE_SHEET_WEBHOOK_URL — Bỏ qua gửi email Day ${step} tới ${email}`);
        return false;
    }

    try {
        const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'trigger_drip_email',
                email: email.trim(),
                name: (name || 'Quý Nhà Đầu Tư').trim(),
                step: parseInt(step, 10)
            })
        });

        if (!response.ok) {
            console.warn(`[Drip Engine] Webhook trả về status ${response.status} cho email ${email}`);
            return false;
        }

        const resData = await response.json().catch(() => ({}));
        return resData.success !== false;
    } catch (err) {
        console.error(`[Drip Engine] Lỗi gọi Apps Script Webhook cho ${email}:`, err.message);
        return false;
    }
}

/**
 * Quét toàn bộ danh sách Leads trong SQLite và gửi email kế tiếp cho người đủ điều kiện
 */
export async function scanAndExecuteDripCampaign() {
    console.log('\n═══════════════════════════════════════════════════════════════════════');
    console.log('📧 [OPC-BĐS DRIP ENGINE] QUÉT VÀ THỰC THI CHUỖI EMAIL NURTURING 30 NGÀY');
    console.log(`⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`);
    console.log('═══════════════════════════════════════════════════════════════════════');

    const db = getDb();
    const leads = db.prepare(`
        SELECT id, lead_id, name, email, phone, property, email_step, created_at 
        FROM leads 
        WHERE email IS NOT NULL AND email LIKE '%@%' AND email_step < 30
    `).all();

    console.log(`[Drip Engine] Tìm thấy ${leads.length} lead có email hợp lệ trong CSDL.`);
    if (leads.length === 0) return { processed: 0, sent: 0 };

    const now = Date.now();
    let sentCount = 0;
    const updateStmt = db.prepare('UPDATE leads SET email_step = ? WHERE id = ?');

    for (const lead of leads) {
        const createdTime = new Date(lead.created_at).getTime();
        if (isNaN(createdTime)) continue;

        const diffDays = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
        const currentStep = lead.email_step || 0;

        // Tìm cột mốc tiếp theo mà lead đã đạt đủ số ngày
        for (const milestone of DRIP_MILESTONES) {
            if (diffDays >= (milestone === 1 ? 0 : milestone) && currentStep < milestone) {
                console.log(`[Drip Engine] 🎯 Lead "${lead.name}" (${lead.email}) đủ điều kiện nhận: [Day ${milestone}] (Đã tham gia ${diffDays} ngày)`);

                const success = await sendDripEmailViaWebhook(lead.email, lead.name, milestone);
                if (success) {
                    updateStmt.run(milestone, lead.id);
                    sentCount++;
                    console.log(`[Drip Engine] ✅ Đã gửi thành công Day ${milestone} tới ${lead.email}`);

                    // Bắn Telegram thông báo nếu là mốc quan trọng (Day 14 PCCC hoặc Day 30 Khảo Sát)
                    if (milestone === 14 || milestone === 30) {
                        notifyTelegramMilestone(lead, milestone);
                    }
                }
                break; // Mỗi lần quét chỉ gửi 1 email kế tiếp để tránh spam
            }
        }
    }

    console.log(`[Drip Engine] 🏁 Hoàn thành đợt quét: Đã gửi ${sentCount} email thành công.\n`);
    return { processed: leads.length, sent: sentCount };
}

function notifyTelegramMilestone(lead, milestone) {
    if (!TELEGRAM_BOT_TOKEN) return;
    const title = MILESTONE_TITLES[milestone] || `Day ${milestone}`;
    const text = `📬 <b>[DRIP EMAIL NURTURING TỰ ĐỘNG]</b>\n\n` +
        `🎯 <b>Cột mốc:</b> <code>${title}</code>\n` +
        `👤 <b>Khách hàng:</b> <b>${lead.name}</b>\n` +
        `📧 <b>Email:</b> ${lead.email}\n` +
        `📞 <b>SĐT/Zalo:</b> <code>${lead.phone}</code>\n` +
        `🏠 <b>Quan tâm:</b> ${lead.property || 'BĐS Dòng Tiền'}\n` +
        `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}\n\n` +
        `👉 <i>Khách hàng đã nhận email chuyên sâu và chuẩn bị cho bước tư vấn 1-1!</i>`;

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text,
            parse_mode: 'HTML'
        })
    }).catch(e => console.warn('[Telegram Drip Alert Error]', e.message));
}
