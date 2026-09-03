/**
 * Cloudflare Pages Edge Serverless Function
 * Route: POST /api/leads/submit
 * Architecture: Zero-Lost Lead Resilience (CEO LUCKY / OPC-BĐS 2026)
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
                message: 'Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại hợp lệ (tối thiểu 9 số).'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const now = new Date();
        const leadId = 'LEAD_' + Date.now().toString(36).toUpperCase();
        const clientIp = context.request.headers.get('cf-connecting-ip') || context.request.headers.get('x-forwarded-for') || 'Unknown IP';
        const clientCountry = context.request.headers.get('cf-ipcountry') || 'VN';
        const userAgent = context.request.headers.get('user-agent') || 'Browser';
        const referer = context.request.headers.get('referer') || 'https://bds.breaths.live/';

        const leadPayload = {
            leadId,
            name,
            phone: rawPhone,
            cleanPhone,
            email: (body.email || '').trim(),
            budget: body.budget || '10 Tỷ – 20 Tỷ',
            propertyTitle: body.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng',
            note: body.note || 'Yêu cầu thẩm định dòng tiền & sổ đỏ',
            source: body.source || 'Cloudflare Edge Portal',
            clientIp,
            clientCountry,
            userAgent: userAgent.slice(0, 150),
            referer,
            timestamp: now.toISOString(),
            createdAtVn: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        };

        // 🛡️ Always output structured lead log so Cloudflare Edge Log captures 100% of leads
        console.log(`[ZERO-LOST-LEAD] ✅ Captured: ${leadId} | ${name} | ${rawPhone} | ${leadPayload.budget}`);

        const dispatchPromises = [];

        // 1️⃣ TẦNG 1: Telegram Bot Alert (Kèm AbortSignal Timeout 4s để chống nghẽn Edge)
        const botToken = context.env.TELEGRAM_BOT_TOKEN;
        const chatId = context.env.TELEGRAM_CHAT_ID || '-1003891453026';
        if (botToken) {
            const teleMsg = `🔥 <b>[VIP LEAD KHẢO SÁT & BẢNG DÒNG TIỀN]</b>\n` +
                `🎫 <b>Mã Lead:</b> <code>${leadId}</code>\n` +
                `👤 <b>Nhà đầu tư:</b> ${name}\n` +
                `📞 <b>SĐT / Zalo:</b> <code>${rawPhone}</code>\n` +
                (leadPayload.email ? `📧 <b>Email:</b> ${leadPayload.email}\n` : '') +
                `💰 <b>Ngân sách:</b> ${leadPayload.budget}\n` +
                `🏢 <b>BĐS quan tâm:</b> ${leadPayload.propertyTitle}\n` +
                `🌐 <b>Vị trí / IP:</b> ${clientCountry} (${clientIp})\n` +
                `⏰ <b>Thời gian:</b> ${leadPayload.createdAtVn}`;

            const telePromise = fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: teleMsg, parse_mode: 'HTML' }),
                signal: AbortSignal.timeout(4000)
            }).catch(err => console.warn('[Lead Submit] Telegram dispatch warning:', err.message));

            dispatchPromises.push(telePromise);
        }

        // 2️⃣ TẦNG 2: Google Sheets / CRM Webhook Sync (Đảm bảo lưu trữ bền vững vĩnh viễn)
        const sheetWebhook = context.env.GOOGLE_SHEETS_WEBHOOK_URL || context.env.GOOGLE_SHEET_WEBHOOK_URL || context.env.CRM_WEBHOOK_URL;
        if (sheetWebhook) {
            const sheetPromise = fetch(sheetWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload),
                signal: AbortSignal.timeout(5000)
            }).catch(err => console.warn('[Lead Submit] Sheets sync warning:', err.message));

            dispatchPromises.push(sheetPromise);
        }

        // 3️⃣ TẦNG 3: n8n Lead Nurturing Pipeline
        const n8nWebhook = context.env.N8N_BDS_LEAD_WEBHOOK;
        if (n8nWebhook) {
            const n8nPromise = fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload),
                signal: AbortSignal.timeout(4000)
            }).catch(err => console.warn('[Lead Submit] n8n sync warning:', err.message));

            dispatchPromises.push(n8nPromise);
        }

        // Đợi các kênh dispatch hoàn tất hoặc timeout
        if (dispatchPromises.length > 0) {
            await Promise.allSettled(dispatchPromises);
        }

        return new Response(JSON.stringify({
            success: true,
            leadId,
            message: `Cảm ơn Quý khách ${name}! Nguyệt Land đã tiếp nhận thông tin (Mã: ${leadId}) và chuyên gia sẽ kết nối Zalo trong 5 - 15 phút.`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        console.error('[Lead Submit Fatal Error]', err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            message: 'Đã xảy ra lỗi khi gửi thông tin. Vui lòng liên hệ Hotline/Zalo: 0935509168' 
        }), {
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
