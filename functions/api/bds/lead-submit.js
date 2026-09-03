/**
 * Cloudflare Pages Edge Serverless Function
 * Route: POST /api/bds/lead-submit
 * Architecture: Zero-Lost Lead Appraisal Form (CEO LUCKY / OPC-BĐS 2026)
 */
export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const name = (body.name || '').trim();
        const rawPhone = (body.phone || '').trim();
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        if (!name || cleanPhone.length < 9) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Vui lòng cung cấp Họ tên và Số điện thoại hợp lệ (tối thiểu 9 số).'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const now = new Date();
        const leadId = 'APPRAISAL_' + Date.now().toString(36).toUpperCase();
        const clientIp = context.request.headers.get('cf-connecting-ip') || context.request.headers.get('x-forwarded-for') || 'Unknown IP';
        const clientCountry = context.request.headers.get('cf-ipcountry') || 'VN';

        const leadPayload = {
            type: 'APPRAISAL_REQUEST',
            leadId,
            name,
            phone: rawPhone,
            budget: body.budget || '15 - 30 Tỷ',
            propertyTitle: body.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng',
            note: body.note || '',
            clientIp,
            clientCountry,
            timestamp: now.toISOString(),
            createdAtVn: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        };

        console.log(`[ZERO-LOST-APPRAISAL] ✅ Captured: ${leadId} | ${name} | ${rawPhone}`);

        const dispatchPromises = [];

        // 1️⃣ TẦNG 1: Telegram Alert
        const botToken = context.env.TELEGRAM_BOT_TOKEN;
        const chatId = context.env.TELEGRAM_CHAT_ID || '-1003891453026';
        if (botToken) {
            const teleMsg = `🔥 <b>[YÊU CẦU THẨM ĐỊNH BĐS DÒNG TIỀN MỚI]</b>\n` +
                `🎫 <b>Mã:</b> <code>${leadId}</code>\n` +
                `👤 <b>Nhà đầu tư:</b> ${name}\n` +
                `📞 <b>SĐT / Zalo:</b> <code>${rawPhone}</code>\n` +
                `💰 <b>Ngân sách:</b> ${leadPayload.budget}\n` +
                `🏢 <b>Tài sản:</b> ${leadPayload.propertyTitle}\n` +
                `🌐 <b>Vị trí:</b> ${clientCountry} (${clientIp})\n` +
                `⏰ <b>Thời gian:</b> ${leadPayload.createdAtVn}`;

            const telePromise = fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: teleMsg, parse_mode: 'HTML' }),
                signal: AbortSignal.timeout(4000)
            }).catch(err => console.warn('[Appraisal Submit] Telegram dispatch warning:', err.message));

            dispatchPromises.push(telePromise);
        }

        // 2️⃣ TẦNG 2: Google Sheets / CRM Webhook Fallback
        const sheetWebhook = context.env.GOOGLE_SHEETS_WEBHOOK_URL || context.env.GOOGLE_SHEET_WEBHOOK_URL || context.env.CRM_WEBHOOK_URL;
        if (sheetWebhook) {
            const sheetPromise = fetch(sheetWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload),
                signal: AbortSignal.timeout(5000)
            }).catch(err => console.warn('[Appraisal Submit] Sheets sync warning:', err.message));

            dispatchPromises.push(sheetPromise);
        }

        if (dispatchPromises.length > 0) {
            await Promise.allSettled(dispatchPromises);
        }

        return new Response(JSON.stringify({
            success: true,
            leadId,
            message: 'Đã tiếp nhận yêu cầu thẩm định. Nguyệt Land sẽ liên hệ tư vấn chuyên sâu trong 5 - 15 phút!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        console.error('[Appraisal Submit Fatal Error]', err.message);
        return new Response(JSON.stringify({ success: false, message: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}
