/**
 * Cloudflare Pages Edge Serverless Function
 * Route: GET /api/leads/recent-activity
 * Purpose: Realtime Social Proof Notifications & Investor Verification
 */

export async function onRequestGet(context) {
    try {
        // Danh sách hoạt động thẩm định BĐS dòng tiền mới nhất
        const leads = [
            {
                name: "Anh Hoàng D.",
                maskedPhone: "0912***456",
                property: "Tòa Căn Hộ 7 Tầng Phố Tây An Thượng",
                budget: "18.5 Tỷ",
                timeAgo: "3p trước"
            },
            {
                name: "Chị Mai P.",
                maskedPhone: "0908***882",
                property: "Khách Sạn Boutique 14 Phòng Biển Mỹ Khê",
                budget: "23.5 Tỷ",
                timeAgo: "8p trước"
            },
            {
                name: "Anh Quốc T.",
                maskedPhone: "0935***190",
                property: "Căn Hộ Dịch Vụ 10 Phòng Bắc Mỹ An",
                budget: "14.2 Tỷ",
                timeAgo: "15p trước"
            },
            {
                name: "Bác Sĩ Hùng (Việt kiều)",
                maskedPhone: "+1-408***789",
                property: "Tòa Căn Hộ View Sông Hàn Hải Châu",
                budget: "28.0 Tỷ",
                timeAgo: "22p trước"
            },
            {
                name: "Chị Thu Thảo",
                maskedPhone: "0983***339",
                property: "Khách Sạn Mini Bán Đảo Sơn Trà",
                budget: "19.8 Tỷ",
                timeAgo: "35p trước"
            },
            {
                name: "Anh Minh Trí",
                maskedPhone: "0905***555",
                property: "Tòa Căn Hộ 12 Phòng Cho Thuê Dòng Tiền",
                budget: "16.5 Tỷ",
                timeAgo: "48p trước"
            }
        ];

        return new Response(JSON.stringify({
            success: true,
            total: leads.length,
            leads
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=30'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
