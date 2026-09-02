export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const rawPhone = (body.phone || '').trim();
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
        const password = (body.password || '').trim();

        const ADMIN_PHONES = ['0989890022', '0935509168', '0905123456'];
        const isAdmin = ADMIN_PHONES.includes(cleanPhone);

        if (isAdmin && password && password !== 'Typhudola@2026$' && password !== '123456') {
            return new Response(JSON.stringify({
                success: false,
                message: 'Mật khẩu quản trị viên không chính xác!'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const role = isAdmin ? 'ADMIN' : 'VIP_INVESTOR';
        const adminName = cleanPhone === '0989890022' ? 'Victor (Co-Founder & AI Architect)' : 'Nguyệt Land (Co-Founder & Chuyên Gia Bản Địa)';

        const user = {
            user_id: (isAdmin ? 'ADM_' : 'USR_') + Date.now().toString(36).toUpperCase(),
            name: body.name || (isAdmin ? adminName : 'Nhà Đầu Tư VIP'),
            phone: rawPhone,
            email: body.email || (isAdmin ? 'teambosskingdom2@gmail.com' : ''),
            role,
            budget: 'Trên 50 Tỷ',
            status: 'ACTIVE'
        };

        return new Response(JSON.stringify({
            success: true,
            message: isAdmin ? 'Đăng nhập Quản Trị Viên thành công!' : `Chào mừng ${user.name} đã đăng nhập Hội Viên VIP!`,
            user,
            token: 'CF_EDGE_JWT_' + user.user_id
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
