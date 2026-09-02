export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const name = (body.name || '').trim();
        const rawPhone = (body.phone || '').trim();
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        if (!name || cleanPhone.length < 9) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại hợp lệ.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const user = {
            user_id: 'USR_' + Date.now().toString(36).toUpperCase(),
            name,
            phone: rawPhone,
            email: body.email || '',
            role: 'VIP_INVESTOR',
            budget: body.budget || '5 - 15 Tỷ',
            status: 'ACTIVE'
        };

        return new Response(JSON.stringify({
            success: true,
            message: `Chúc mừng ${name} đã kích hoạt tài khoản Hội Viên VIP Nguyệt Land!`,
            user,
            token: 'CF_EDGE_JWT_' + user.user_id,
            welcomeMessage: {
                title: `🎉 Chào Mừng ${name} Đến Với Nguyệt Land!`,
                benefits: [
                    'Xem toàn bộ Báo Cáo Thẩm Định 4 Lớp (Sổ đỏ, PCCC, Cap Rate)',
                    'Nhận Ebook "Bí Quyết Sở Hữu BĐS Dòng Tiền Đà Nẵng 2026"',
                    'Quyền ưu tiên khảo sát thực địa 1-1 cùng Chị Hải Nguyệt',
                    'Tư vấn tối ưu đòn bẩy tài chính ngân hàng miễn phí'
                ]
            }
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
