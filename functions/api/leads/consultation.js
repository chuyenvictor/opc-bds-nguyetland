export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const name = (body.name || '').trim();
        const rawPhone = (body.phone || '').trim();

        if (!name || rawPhone.length < 9) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại hợp lệ.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const bookingCode = 'OPC_' + Math.floor(100000 + Math.random() * 900000);

        // Send Telegram alert if token configured
        const botToken = context.env.TELEGRAM_BOT_TOKEN;
        const chatId = context.env.TELEGRAM_CHAT_ID || '-1003891453026';
        if (botToken) {
            const msg = `🔥 <b>[LỊCH HẸN KHẢO SÁT BĐS MỚI]</b>\n` +
                `🎫 <b>Mã Đặt Chỗ:</b> <code>${bookingCode}</code>\n` +
                `👤 <b>Họ tên:</b> ${name}\n` +
                `📞 <b>SĐT / Zalo:</b> <code>${rawPhone}</code>\n` +
                `🏢 <b>BĐS:</b> ${body.property || 'Tòa Căn Hộ Phố Tây An Thượng'}\n` +
                `⏰ <b>Thời gian mong muốn:</b> ${body.preferredTime || 'Hôm nay'}\n` +
                `💰 <b>Ngân sách:</b> ${body.budget || '15 - 30 Tỷ'}`;

            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
            }).catch(() => {});
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Đặt lịch khảo sát thành công! Mã đặt chỗ: ${bookingCode}. Chuyên gia Nguyệt Land sẽ liên hệ trong 5 phút.`,
            bookingCode
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err) {
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
