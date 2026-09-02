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

        // Send Telegram alert if token configured
        const botToken = context.env.TELEGRAM_BOT_TOKEN;
        const chatId = context.env.TELEGRAM_CHAT_ID || '-1003891453026';
        if (botToken) {
            const msg = `🔥 <b>[LEAD KHẢO SÁT & BẢNG DÒNG TIỀN MỚI]</b>\n` +
                `👤 <b>Họ tên:</b> ${name}\n` +
                `📞 <b>SĐT / Zalo:</b> <code>${rawPhone}</code>\n` +
                `💰 <b>Ngân sách:</b> ${body.budget || '10 Tỷ – 20 Tỷ'}\n` +
                `🏢 <b>BĐS quan tâm:</b> ${body.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng'}\n` +
                `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;

            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
            }).catch(() => {});
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Cảm ơn Quý khách ${name}! Nguyệt Land đã tiếp nhận yêu cầu và sẽ liên hệ trong 5 - 15 phút.`
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
