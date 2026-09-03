/**
 * Cloudflare Pages Edge Serverless Function
 * Route: POST /api/leads/consultation
 * Architecture: Zero-Lost Lead Booking Engine (CEO LUCKY / OPC-BĐS 2026)
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
        const bookingCode = 'OPC_' + Math.floor(100000 + Math.random() * 900000);
        const clientIp = context.request.headers.get('cf-connecting-ip') || context.request.headers.get('x-forwarded-for') || 'Unknown IP';
        const clientCountry = context.request.headers.get('cf-ipcountry') || 'VN';
        const userAgent = context.request.headers.get('user-agent') || 'Browser';

        const bookingPayload = {
            type: 'CONSULTATION_BOOKING',
            bookingCode,
            name,
            phone: rawPhone,
            cleanPhone,
            property: body.property || 'Tòa Căn Hộ Phố Tây An Thượng',
            preferredTime: body.preferredTime || 'Hôm nay / Sớm nhất',
            budget: body.budget || '15 - 30 Tỷ',
            clientIp,
            clientCountry,
            userAgent: userAgent.slice(0, 150),
            timestamp: now.toISOString(),
            createdAtVn: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        };

        console.log(`[ZERO-LOST-BOOKING] ✅ Registered: ${bookingCode} | ${name} | ${rawPhone} | ${bookingPayload.property}`);

        const dispatchPromises = [];

        // 1️⃣ TẦNG 1: Telegram Alert
        const botToken = context.env.TELEGRAM_BOT_TOKEN;
        const chatId = context.env.TELEGRAM_CHAT_ID || '-1003891453026';
        if (botToken) {
            const teleMsg = `🔥 <b>[LỊCH HẸN KHẢO SÁT THỰC ĐỊA BĐS MỚI]</b>\n` +
                `🎫 <b>Mã Đặt Chỗ:</b> <code>${bookingCode}</code>\n` +
                `👤 <b>Nhà đầu tư:</b> ${name}\n` +
                `📞 <b>SĐT / Zalo:</b> <code>${rawPhone}</code>\n` +
                `🏢 <b>Tài sản khảo sát:</b> ${bookingPayload.property}\n` +
                `⏰ <b>Thời gian hẹn:</b> ${bookingPayload.preferredTime}\n` +
                `💰 <b>Ngân sách:</b> ${bookingPayload.budget}\n` +
                `🌐 <b>Vị trí:</b> ${clientCountry} (${clientIp})\n` +
                `⏱️ <b>Tiếp nhận lúc:</b> ${bookingPayload.createdAtVn}`;

            const telePromise = fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: teleMsg, parse_mode: 'HTML' }),
                signal: AbortSignal.timeout(4000)
            }).catch(err => console.warn('[Consultation Booking] Telegram dispatch warning:', err.message));

            dispatchPromises.push(telePromise);
        }

        // 2️⃣ TẦNG 2: Google Sheets / CRM Webhook Fallback
        const sheetWebhook = context.env.GOOGLE_SHEETS_WEBHOOK_URL || context.env.GOOGLE_SHEET_WEBHOOK_URL || context.env.CRM_WEBHOOK_URL;
        if (sheetWebhook) {
            const sheetPromise = fetch(sheetWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload),
                signal: AbortSignal.timeout(5000)
            }).catch(err => console.warn('[Consultation Booking] Sheets sync warning:', err.message));

            dispatchPromises.push(sheetPromise);
        }

        if (dispatchPromises.length > 0) {
            await Promise.allSettled(dispatchPromises);
        }

        return new Response(JSON.stringify({
            success: true,
            bookingCode,
            message: `Đặt lịch khảo sát thực địa thành công! Mã đặt chỗ: ${bookingCode}. Chuyên gia Nguyệt Land sẽ liên hệ xác nhận trong 5 - 15 phút.`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
        console.error('[Consultation Booking Fatal Error]', err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            message: 'Đã xảy ra lỗi khi đặt lịch. Vui lòng liên hệ Hotline/Zalo: 0935509168' 
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
