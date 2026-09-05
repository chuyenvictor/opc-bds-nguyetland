/**
 * Cloudflare Pages Edge Serverless Function
 * Route: GET /api/news/ticker
 * Purpose: Curated Real-Time News Ticker Feed for Da Nang Cashflow Real Estate
 */

export async function onRequestGet(context) {
    try {
        const curatedTicker = [
            {
                title: "Bảng giá đất Đà Nẵng 2026: Phố Tây An Thượng và Võ Nguyên Giáp dẫn đầu thanh khoản",
                link: "https://bds.breaths.live/p/bang-gia-dat-da-nang-2026"
            },
            {
                title: "5 Tiêu chuẩn nghiệm thu PCCC bắt buộc đối với tòa căn hộ dịch vụ và mini hotel Đà Nẵng",
                link: "https://bds.breaths.live/p/5-tieu-chuan-pccc"
            },
            {
                title: "Làn sóng Digital Nomad bùng nổ: Tỷ lệ lấp đầy căn hộ dịch vụ An Thượng đạt trên 92.8%",
                link: "https://bds.breaths.live/p/digital-nomad-da-nang"
            },
            {
                title: "So sánh Cap Rate BĐS dòng tiền: 15 tỷ đầu tư Đà Nẵng đạt lợi nhuận ròng 10-12%/năm",
                link: "https://bds.breaths.live/p/so-sanh-cap-rate-da-nang"
            },
            {
                title: "Cẩm nang & Checklist 36 điểm thẩm định BĐS dòng tiền thực chiến do Nguyệt Land phát hành",
                link: "https://bds.breaths.live/dossier"
            },
            {
                title: "Nghị quyết 136/2024/QH15 thúc đẩy thành lập Khu thương mại tự do Đà Nẵng tạo đòn bẩy kinh tế",
                link: "https://bds.breaths.live/news"
            },
            {
                title: "Du lịch Đà Nẵng quý 3/2026 tăng trưởng mạnh, doanh thu lưu trú khách sạn ven biển vượt kỳ vọng",
                link: "https://bds.breaths.live/news"
            }
        ];

        return new Response(JSON.stringify({
            success: true,
            count: curatedTicker.length,
            updatedAt: new Date().toISOString(),
            ticker: curatedTicker
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=120'
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
