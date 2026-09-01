/**
 * lib/brand-personas-nguyetland.mjs — Nguyệt Land Multi-Persona Brand Architecture
 * Hệ thống 4 Nhân Vật Thương Hiệu Cá Nhân Hóa cho Nguyệt Land (Đà Nẵng)
 */

export const NGUYET_LAND_PERSONAS = {
    NGUYET_FOUNDER: {
        id: 'NGUYET_FOUNDER',
        name: 'Chị Hải Nguyệt',
        title: 'Founder & Chuyên Gia BĐS Bản Địa Đà Nẵng',
        role: 'Người Truyền Cảm Hứng & Thẩm Định Thực Địa',
        avatar: '/img/nguyet-bds.png',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        quote: 'Người bản địa — BĐS thật — Giá trị thật — Dòng tiền thật.',
        tone: 'Chân thành, ấm áp, sâu sát thực tế, kinh nghiệm 15 năm tại các quận biển Đà Nẵng, hiểu rõ văn hóa sống và thói quen thuê phòng của khách quốc tế.',
        specialties: ['Phố Tây An Thượng', 'Bãi biển Mỹ Khê', 'Đàm phán giá với chủ nhà địa phương', 'Thẩm định công suất phòng thực tế']
    },
    VICTOR_CFO: {
        id: 'VICTOR_CFO',
        name: 'Victor Chuyên',
        title: 'Cố Vấn Tài Chính & Trưởng Ban Thẩm Định Định Lượng',
        role: 'Chuyên Gia Tài Chính & AI BĐS',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        quote: 'Số liệu không biết nói dối — Phân tích Cap Rate & Dòng tiền ròng bỏ túi sau thuế phí.',
        tone: 'Sắc bén, logic, định lượng, bảng tính dòng tiền chi tiết, cấu trúc vốn an toàn, tối ưu đòn bẩy ngân hàng tối đa 50%.',
        specialties: ['Bảng tính Cap Rate & Cash-on-Cash', 'Cơ cấu nợ ngân hàng', 'Thẩm định 4 lớp an toàn', 'Định giá tài sản 10 - 80 Tỷ']
    },
    MINH_LEGAL: {
        id: 'MINH_LEGAL',
        name: 'Luật Sư Minh',
        title: 'Trưởng Ban Thẩm Định Pháp Lý & PCCC',
        role: 'Chuyên Gia Pháp Lý BĐS & Giấy Phép',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        quote: 'Chuẩn quy hoạch — Nghiệm thu PCCC — Sổ đỏ hoàn công mới xuống tiền.',
        tone: 'Nghiêm cẩn, an toàn, cảnh báo rủi ro quy hoạch mở đường, kiểm tra nghiệm thu PCCC và hồ sơ xây dựng.',
        specialties: ['Kiểm tra quy hoạch Đà Nẵng', 'Nghiệm thu PCCC căn hộ', 'Giấy phép xây dựng chuẩn tầng', 'Hợp đồng chuyển nhượng an toàn']
    },
    VIP_INVESTOR: {
        id: 'VIP_INVESTOR',
        name: 'Anh Tuấn & Chị Lan',
        title: 'Nhà Đầu Tư VIP (Hà Nội & TP.HCM)',
        role: 'Góc Nhìn Nhà Đầu Tư Thực Chiến',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        quote: 'Tìm kiếm kênh trú ẩn an toàn và dòng tiền thụ động ổn định từ xa.',
        tone: 'Thực tế, đặt những câu hỏi trăn trở về quản lý vận hành từ xa, tỷ lệ kín phòng mùa mưa bão, bảo trì tài sản.',
        specialties: ['Quản lý vận hành từ xa', 'Dòng tiền thụ động', 'So sánh BĐS Đà Nẵng vs Hà Nội/TP.HCM']
    }
};

/**
 * Tạo danh sách 5 chủ đề Podcast xoay quanh các cặp nhân vật thương hiệu
 */
export function generatePersonaPodcasts(rssItems) {
    const episodes = [
        {
            episode_num: 1,
            title: 'Giải Mã Dòng Tiền Phố Tây An Thượng: Cap Rate 13.8%/Năm Có Thật Không?',
            location: 'Phố Tây An Thượng (Ngũ Hành Sơn)',
            cap_rate: '11.5% - 13.8%/năm',
            host: NGUYET_LAND_PERSONAS.NGUYET_FOUNDER,
            guest: NGUYET_LAND_PERSONAS.VICTOR_CFO,
            duration: '04:45',
            summary: 'Chị Hải Nguyệt cùng Victor Chuyên bóc tách thực tế công suất phòng khách Tây và bảng tính dòng tiền ròng một tòa căn hộ 10 phòng tại An Thượng.',
            dialogue: [
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '00:00 - 00:45',
                    text: 'Xin chào quý anh chị nhà đầu tư! Hôm nay Hải Nguyệt cùng anh Victor Chuyên sẽ đưa quý vị đến với Phố Tây An Thượng — nơi mà khách du lịch quốc tế và các bạn Digital Nomad đổ về cực kỳ đông đúc trong quý 3 này.'
                },
                {
                    speaker: 'Victor Chuyên',
                    role: 'CFO Thẩm Định',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                    color: 'text-sky-400',
                    time: '00:45 - 01:50',
                    text: 'Chào chị Nguyệt và quý vị! Nhìn vào bảng số liệu tài chính quý 3, giá thuê phòng căn hộ full nội thất tại An Thượng dao động từ 9 đến 14 triệu/tháng, tỷ lệ lấp đầy luôn đạt 90-95%. Một tòa 10 phòng cho doanh thu ròng từ 100 - 140 triệu/tháng, đưa Cap Rate lên mức 12% - 13.8%/năm.'
                },
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '01:50 - 03:15',
                    text: 'Đúng vậy anh Victor! Nguyệt vừa dẫn một anh khách VIP Hà Nội đi khảo sát thực địa tòa 7 tầng tại đây. Chủ nhà người bản địa xây dựng rất chắc chắn, có lối thoát hiểm riêng. Khách Tây họ ở cả năm không đổi chỗ vì vị trí đi bộ ra biển chỉ 3 phút.'
                },
                {
                    speaker: 'Victor Chuyên',
                    role: 'CFO Thẩm Định',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                    color: 'text-sky-400',
                    time: '03:15 - 04:15',
                    text: 'Lời khuyên của tôi cho các nhà đầu tư: Hãy yêu cầu Nguyệt Land xuất file sao kê dòng tiền 6 tháng gần nhất và kiểm tra sổ đỏ hoàn công trước khi đặt cọc để đảm bảo an toàn vốn 100%.'
                },
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '04:15 - 04:45',
                    text: 'Quý nhà đầu tư muốn nhận trọn bộ hồ sơ thẩm định 3 tòa căn hộ tốt nhất An Thượng tuần này, hãy nhắn tin ngay cho Nguyệt qua Zalo 0935.509.168 hoặc truy cập bds.breaths.live nhé!'
                }
            ]
        },
        {
            episode_num: 2,
            title: 'Soi 5 Tiêu Chuẩn PCCC & Sổ Đỏ Hoàn Công Trước Khi Xuống Tiền Ven Biển Mỹ Khê',
            location: 'Biển Mỹ Khê & Bãi Tắm T20 (Sơn Trà)',
            cap_rate: '10.5% - 12.5%/năm',
            host: NGUYET_LAND_PERSONAS.NGUYET_FOUNDER,
            guest: NGUYET_LAND_PERSONAS.MINH_LEGAL,
            duration: '05:00',
            summary: 'Chị Hải Nguyệt và Luật Sư Minh chỉ ra những lỗi PCCC chết người khiến tòa nhà bị đình chỉ kinh doanh và cách thẩm định pháp lý sạch.',
            dialogue: [
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '00:00 - 00:50',
                    text: 'Chào quý vị! Rất nhiều khách hàng tâm sự với Nguyệt rằng họ mua tòa nhà dòng tiền nhưng sau đó bị phạt vì không đạt chuẩn PCCC. Hôm nay Luật Sư Minh — Trưởng ban pháp lý Nguyệt Land sẽ cùng Nguyệt làm rõ vấn đề này.'
                },
                {
                    speaker: 'Luật Sư Minh',
                    role: 'Trưởng Ban Pháp Lý',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                    color: 'text-emerald-400',
                    time: '00:50 - 02:20',
                    text: 'Chào chị Nguyệt! Đối với các tòa nhà cho thuê lưu trú từ 5 tầng trở lên tại Đà Nẵng, có 3 tiêu chuẩn PCCC sống còn: Thứ nhất là thang thoát hiểm thứ 2 độc lập ngoài trời hoặc thang kín có quạt tăng áp. Thứ hai là hệ thống báo cháy tự động truyền tín hiệu về trung tâm. Thứ ba là cửa chống cháy ngăn khói các tầng.'
                },
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '02:20 - 03:40',
                    text: 'Chính vì vậy, toàn bộ giỏ hàng do Nguyệt Land phân phối đều đã được Luật Sư Minh thẩm định hồ sơ PCCC tận nơi. Nếu chủ nhà chưa hoàn thiện biên bản nghiệm thu, Nguyệt Land sẽ yêu cầu chủ nhà bổ sung xong xuôi mới giới thiệu đến nhà đầu tư.'
                },
                {
                    speaker: 'Luật Sư Minh',
                    role: 'Trưởng Ban Pháp Lý',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                    color: 'text-emerald-400',
                    time: '03:40 - 04:30',
                    text: 'Thêm một điểm nữa là Sổ đỏ phải ghi nhận diện tích sàn xây dựng hoàn công đúng giấy phép. Nếu xây vượt tầng, việc xin giấy phép kinh doanh lưu trú sẽ gặp rất nhiều rủi ro pháp lý.'
                },
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '04:30 - 05:00',
                    text: 'An tâm pháp lý là an tâm hưởng dòng tiền! Quý vị cần kiểm tra quy hoạch và PCCC miễn phí tại Đà Nẵng, gọi ngay Hotline 0935.509.168 cho Nguyệt Land nhé!'
                }
            ]
        },
        {
            episode_num: 3,
            title: 'Kinh Nghiệm Vận Hành Tòa Căn Hộ Từ Xa: Nhà Đầu Tư Hà Nội Chia Sẻ Thực Tế',
            location: 'Đường Hồ Nghinh & Phạm Văn Đồng',
            cap_rate: '9.8% - 12.0%/năm',
            host: NGUYET_LAND_PERSONAS.NGUYET_FOUNDER,
            guest: NGUYET_LAND_PERSONAS.VIP_INVESTOR,
            duration: '04:30',
            summary: 'Anh Tuấn (Nhà đầu tư Hà Nội sở hữu 2 tòa căn hộ tại Đà Nẵng) chia sẻ cách anh ngủ ngon tại Hà Nội mà dòng tiền 180 triệu/tháng vẫn đổ về tài khoản đều đặn nhờ Nguyệt Land.',
            dialogue: [
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '00:00 - 00:45',
                    text: 'Hôm nay trong số Podcast đặc biệt, Nguyệt rất vui được trò chuyện cùng anh Tuấn — một nhà đầu tư kỳ cựu từ Hà Nội đã tin tưởng đồng hành cùng Nguyệt Land sở hữu 2 tòa căn hộ tại quận Sơn Trà.'
                },
                {
                    speaker: 'Anh Tuấn',
                    role: 'Nhà Đầu Tư VIP',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                    color: 'text-purple-400',
                    time: '00:45 - 02:00',
                    text: 'Chào chị Nguyệt! Ban đầu khi ở Hà Nội muốn mua tài sản tiền chục tỷ trong Đà Nẵng, tôi rất lo lắng chuyện ai quản lý, ai đón khách và bảo trì đồ đạc. Nhưng sau khi nhờ Nguyệt Land kết nối đơn vị vận hành chuyên nghiệp cam kết doanh thu, 2 năm qua tháng nào tôi cũng nhận đủ 180 triệu đúng ngày mùng 5.'
                },
                {
                    speaker: 'Chị Hải Nguyệt',
                    role: 'Founder Nguyệt Land',
                    avatar: '/img/nguyet-bds.png',
                    color: 'text-amber-400',
                    time: '02:00 - 03:30',
                    text: 'Nguyệt Land luôn tâm niệm: Bán một bất động sản dòng tiền không phải là xong, mà là bắt đầu mối quan hệ đồng hành lâu dài. Chúng tôi hỗ trợ chủ nhà từ khâu ký hợp đồng với chuỗi vận hành uy tín cho đến kiểm toán sao kê định kỳ.'
                },
                {
                    speaker: 'Anh Tuấn',
                    role: 'Nhà Đầu Tư VIP',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                    color: 'text-purple-400',
                    time: '03:30 - 04:30',
                    text: 'Với tôi, Đà Nẵng là nơi đáng đầu tư nhất vì du lịch phục hồi mạnh và môi trường sống trong lành. Cảm ơn chị Nguyệt và đội ngũ đã giúp tôi có được tài sản dòng tiền như ý!'
                }
            ]
        }
    ];

    return episodes;
}
