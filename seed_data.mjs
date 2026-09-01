/**
 * Seed initial featured YouTube videos and articles into SQLite
 */
import { upsertVideo, upsertArticle, getStats } from './routes/api-content-db.mjs';

const SEED_VIDEOS = [
    {
        youtube_id: 'qXq0W1M3HjQ',
        title: 'Thị Trường BĐS Đà Nẵng 2026: Dòng Tiền Đang Đổ Về Đâu? | Phân Tích Thực Chiến',
        description: 'Đánh giá chi tiết cơ hội đầu tư căn hộ dịch vụ và khách sạn mini tại khu vực Mỹ Khê, Sơn Trà và Ngũ Hành Sơn năm 2026. Bóc tách tỷ suất sinh lời thực tế từ 9.5% đến 12%/năm.',
        channel_name: 'Nguyệt Land BĐS Dòng Tiền',
        thumbnail_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
        published_at: '2026-08-28T08:00:00Z',
        ai_summary: 'BĐS ven biển Đà Nẵng tiếp tục giữ vị thế số 1 về khai thác du lịch với công suất phòng đạt trên 88%. Căn hộ Studio tại An Thượng đạt Cap Rate 10.5%/năm.',
        category: 'bds-danang',
        is_featured: 1
    },
    {
        youtube_id: 'jNQXAC9IVRw',
        title: '5 Tiêu Chuẩn PCCC Bắt Buộc Phải Soi Kỹ Trước Khi Xuống Tiền Mua Tòa Căn Hộ',
        description: 'Hướng dẫn kiểm tra biên bản nghiệm thu PCCC, thang thoát hiểm ngoài trời và hệ thống báo cháy theo tiêu chuẩn QCVN 06:2022/BXD tại Đà Nẵng.',
        channel_name: 'Pháp Lý BĐS Đà Nẵng',
        thumbnail_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        published_at: '2026-08-29T10:30:00Z',
        ai_summary: 'Không mua tòa nhà chưa nghiệm thu PCCC hoặc thiếu lối thoát hiểm thứ 2. Nguyệt Land cung cấp dịch vụ thẩm định pháp lý và PCCC miễn phí trước khi đặt cọc.',
        category: 'legal',
        is_featured: 1
    },
    {
        youtube_id: 'kJQP7kiw5Fk',
        title: 'Làn Sóng Khách Tây & Digital Nomad Đổ Bộ Phố An Thượng Mỹ An',
        description: 'Khám phá vì sao khách du mục số Âu - Mỹ sẵn sàng ký hợp đồng thuê dài hạn 12 tháng với giá 10 - 15 triệu/tháng tại phố Tây Đà Nẵng.',
        channel_name: 'Thị Trường BĐS Biển',
        thumbnail_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        published_at: '2026-08-30T07:15:00Z',
        ai_summary: 'Hợp đồng thuê 6-12 tháng trả trước giúp tối ưu dòng tiền, giảm 80% chi phí vận hành dọn phòng so với mô hình cho thuê ngắn ngày.',
        category: 'cashflow',
        is_featured: 1
    }
];

const SEED_ARTICLES = [
    {
        slug: 'bang-gia-dat-da-nang-2026-cap-rate-vuot-12-phan-tram',
        title: 'Bóc Tách Bảng Giá Đất Đà Nẵng 2026: 3 Vị Trí Nào Có Cap Rate Vượt 12%/Năm?',
        summary: 'Phân tích bảng giá đất điều chỉnh mới tại TP. Đà Nẵng và Top 3 khu vực vàng tạo dòng tiền vượt trội: Phố Tây An Thượng, Dương Đình Nghệ và Cửa Ngõ Nguyễn Văn Thoại.',
        content: `Quyết định điều chỉnh bảng giá đất thương mại dịch vụ và đất ở đô thị mới của TP. Đà Nẵng năm 2026 đã tạo ra sự dịch chuyển lớn về cơ cấu dòng vốn. Giá đất nền mặt biển Võ Nguyên Giáp đã chạm ngưỡng 250 - 350 Tr/m2, khiến tỷ suất Cap Rate của các khách sạn lớn bị nén xuống còn 7.5% - 8.5%.

Top 3 Khu Vực Vàng Tạo Dòng Tiền Đột Phá:
1. Phố Tây An Thượng (Mỹ An, Ngũ Hành Sơn): Mức giá đất các đường nội bộ dao động 120 - 180 Tr/m2, giá thuê phòng studio đạt 8.5 - 14 Tr/tháng/phòng. Cap Rate ròng đạt từ 9.8% - 11.2%/năm.
2. Khu Đô Thị Dương Đình Nghệ & Hà Bổng (Phước Mỹ, Sơn Trà): Khu vực tập trung khách Hàn Quốc và chuyên gia lưu trú. Tỷ lệ lấp đầy quanh năm luôn >90%, Cap Rate đạt 10.5%/năm.
3. Khu Vực Nam Cầu Rồng (Nguyễn Văn Thoại): Cửa ngõ kết nối trung tâm Hải Châu và Biển Mỹ Khê, lưu lượng khách dồi dào, thanh khoản tài sản cực cao.

Khuyến Nghị Từ Nguyệt Land: Nên ưu tiên các tòa nhà đã hoàn công đầy đủ trên sổ đỏ và có sẵn hệ thống PCCC nghiệm thu chuẩn để tránh phát sinh chi phí cải tạo sau mua.`,
        location: 'An Thượng, Mỹ An, Ngũ Hành Sơn',
        category: 'market-news',
        image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200',
        tags: ['bảng-giá-đất-2026', 'an-thượng', 'cap-rate', 'đà-nẵng'],
        status: 'published'
    },
    {
        slug: 'lan-song-du-muc-so-digital-nomad-kin-phong-pho-an-thuong',
        title: 'Làn Sóng Du Mục Số (Digital Nomad): Tại Sao Khách Tây Đang Kín Phòng Dài Hạn Phố An Thượng?',
        summary: 'Đà Nẵng lọt Top 10 điểm đến hấp dẫn nhất toàn cầu cho Digital Nomad. Căn hộ studio full tiện ích, internet tốc độ cao trở thành gà đẻ trứng vàng.',
        content: `Với chi phí sinh hoạt hợp lý, tốc độ Internet cao, biển đẹp và môi trường sống an toàn, Đà Nẵng đang đón hàng chục ngàn người làm việc từ xa từ Châu Âu, Úc, Mỹ và Nga đến lưu trú từ 3 - 12 tháng.

Đặc Điểm Bất Động Sản Khách Tây Ưa Chuộng:
- Căn hộ Studio có bếp riêng, ánh sáng tự nhiên và ban công thoáng mát.
- Bàn làm việc công thái học + Đường truyền Internet tốc độ cao riêng biệt từng phòng.
- Hệ thống Smart Lock tự động hóa check-in không cần qua lễ tân.
- Vị trí cách biển đi bộ dưới 500m và gần các phòng Gym, quán café, siêu thị 24/7.

Lợi Thế Cho Chủ Sở Hữu: Hợp đồng thuê 6 tháng - 1 năm trả tiền trước giúp dòng tiền của chủ nhà luôn ổn định, giảm thiểu 80% chi phí dọn dẹp hàng ngày so với khách du lịch ngắn ngày.`,
        location: 'Mỹ Khê & An Thượng',
        category: 'analysis',
        image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
        tags: ['digital-nomad', 'khách-tây', 'mỹ-khê', 'cho-thuê'],
        status: 'published'
    }
];

for (const v of SEED_VIDEOS) upsertVideo(v);
for (const a of SEED_ARTICLES) upsertArticle(a);

console.log('✅ Seeded initial database records:');
console.log(getStats());
