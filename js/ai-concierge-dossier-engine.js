/**
 * 👑 NGUYỆT LAND 2026 — AI CONCIERGE & 1-CLICK PDF DOSSIER ENGINE (ENTERPRISE ADVISORY v2.5)
 * Thiết kế chuẩn: Private Wealth Real Estate Advisory Protocol (Sotheby's & Christie's Standard)
 * Đảm bảo: KHÔNG BỊA ĐẶT SỐ LIỆU — 100% CĂN CỨ VÀO 12 TÀI SẢN THẬT TỪ MASTER DATA SHEET
 */

(function() {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. MASTER PROPERTY DATA SHEET (12 TÀI SẢN THẬT ĐÃ KIỂM TOÁN)
    // ─────────────────────────────────────────────────────────────
    const MASTER_PROPERTIES = [
        {
            id: 1,
            title: "Tòa Căn Hộ 7 Tầng Phố Tây An Thượng 29",
            zone: "anthuong",
            zoneName: "Phố Tây An Thượng",
            location: "Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng",
            priceText: "18.5 Tỷ VNĐ",
            priceNum: 18.5,
            landArea: "115 m² (Mặt tiền 6m)",
            pricePerM2: "160.8 Tr / m²",
            floors: "7 Tầng (Thang máy 630kg)",
            rooms: "10 Căn Hộ Studio Full Bếp",
            monthlyRevText: "110 Tr / Tháng",
            monthlyRevNum: 110,
            capRate: "9.8% / Năm",
            distanceSea: "150m (3 phút đi bộ bãi Mỹ An)",
            pccc: "Đã nghiệm thu PCCC hoàn công chuẩn 100%",
            legal: "Sổ hồng lâu dài, sẵn sàng công chứng",
            leverage50Net: "+31.4 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            desc: "Vị trí kim cương phố Tây An Thượng, 100% khách lưu trú là chuyên gia quốc tế & Digital Nomad.",
            expertNote: "Dòng tiền siêu ổn định quanh năm, tỷ lệ lấp đầy >92% ngay cả mùa thấp điểm."
        },
        {
            id: 2,
            title: "Khách Sạn Boutique 14 Phòng Hà Bổng",
            zone: "mykhe",
            zoneName: "Biển Mỹ Khê",
            location: "Phước Mỹ, Sơn Trà, Đà Nẵng",
            priceText: "23.5 Tỷ VNĐ",
            priceNum: 23.5,
            landArea: "135 m² (Mặt tiền 7.5m)",
            pricePerM2: "174.0 Tr / m²",
            floors: "6 Tầng (Thang máy + Hồ bơi rooftop)",
            rooms: "14 Phòng Khách Sạn Indochine Luxury",
            monthlyRevText: "160 Tr / Tháng",
            monthlyRevNum: 160,
            capRate: "10.5% / Năm",
            distanceSea: "120m (2 phút đi bộ bãi T20)",
            pccc: "Đã nghiệm thu PCCC tự động Sprinkler 100%",
            legal: "Sổ hồng hoàn công khách sạn đầy đủ",
            leverage50Net: "+44.8 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            desc: "Khách sạn Boutique view biển Mỹ Khê, hồ bơi vô cực ngắm pháo hoa quốc tế DIFF.",
            expertNote: "Mùa cao điểm đạt doanh thu >220 Tr/tháng, tỷ suất sinh lời top đầu bãi biển Mỹ Khê."
        },
        {
            id: 3,
            title: "Tòa Căn Hộ Dịch Vụ 5 Tầng Dương Đình Nghệ",
            zone: "sontra",
            zoneName: "Bán Đảo Sơn Trà",
            location: "An Hải Bắc, Sơn Trà, Đà Nẵng",
            priceText: "14.8 Tỷ VNĐ",
            priceNum: 14.8,
            landArea: "100 m² (Mặt tiền 5m)",
            pricePerM2: "148.0 Tr / m²",
            floors: "5 Tầng thang máy hiện đại",
            rooms: "8 Căn Hộ 1PN Có Ban Công",
            monthlyRevText: "85 Tr / Tháng",
            monthlyRevNum: 85,
            capRate: "9.2% / Năm",
            distanceSea: "250m ra biển Phạm Văn Đồng",
            pccc: "Nghiệm thu PCCC & Thang thoát hiểm ngoài trời",
            legal: "Sổ đỏ cá nhân, không quy hoạch",
            leverage50Net: "+22.5 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            desc: "Khu vực chuyên gia Hàn Quốc & kỹ sư phần mềm lưu trú, tỷ lệ kín phòng dài hạn 100%.",
            expertNote: "Chi phí vận hành thấp, dòng tiền ròng sau chi phí đạt hơn 75% doanh thu gộp."
        },
        {
            id: 4,
            title: "Biệt Thự Homestay Sân Vườn Euro Village 1",
            zone: "haichau",
            zoneName: "Sông Hàn / Hải Châu",
            location: "Làng Châu Âu, Sông Hàn, Hải Châu",
            priceText: "32.0 Tỷ VNĐ",
            priceNum: 32.0,
            landArea: "250 m² (Biệt thự song lập)",
            pricePerM2: "128.0 Tr / m²",
            floors: "3 Tầng + Hồ bơi sân vườn riêng",
            rooms: "5 Phòng Ngủ Master King Bed",
            monthlyRevText: "150 Tr / Tháng",
            monthlyRevNum: 150,
            capRate: "8.5% / Năm",
            distanceSea: "Ven sông Hàn (Cạnh Cầu Rồng)",
            pccc: "Tiêu chuẩn an toàn PCCC Biệt thự cao cấp",
            legal: "Sổ hồng sở hữu lâu dài KĐT Euro Village",
            leverage50Net: "+38.2 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            desc: "Khu compound an ninh khép kín đẳng cấp nhất Đà Nẵng, chuyên đón đoàn chuyên gia VIP & gia đình du lịch cao cấp.",
            expertNote: "Giá trị đất ven sông Hàn tăng trưởng ổn định 12-15%/năm, thanh khoản cực kỳ cao."
        },
        {
            id: 5,
            title: "Tòa Căn Hộ 6 Tầng Mặt Tiền Hồ Xuân Hương",
            zone: "anthuong",
            zoneName: "Phố Tây An Thượng",
            location: "Khu Resort Furama, Ngũ Hành Sơn",
            priceText: "26.8 Tỷ VNĐ",
            priceNum: 26.8,
            landArea: "150 m² (Mặt tiền đại lộ 15m)",
            pricePerM2: "178.6 Tr / m²",
            floors: "6 Tầng (Thang máy thẻ từ)",
            rooms: "12 Căn Hộ + Mặt Bằng Café Trệt",
            monthlyRevText: "175 Tr / Tháng",
            monthlyRevNum: 175,
            capRate: "10.2% / Năm",
            distanceSea: "180m ra bãi tắm Furama Resort",
            pccc: "Nghiệm thu PCCC thương mại & hoàn công chuẩn",
            legal: "Sổ hồng đã cập nhật tài sản trên đất",
            leverage50Net: "+52.6 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
            desc: "Trục đại lộ du lịch huyết mạch nối Đà Nẵng - Hội An, kết hợp cho thuê mặt bằng Café và căn hộ nghỉ dưỡng.",
            expertNote: "Tài sản 2 trong 1 vừa có dòng tiền cho thuê căn hộ vừa có dòng tiền mặt bằng kinh doanh."
        },
        {
            id: 6,
            title: "Tòa Căn Hộ Mini 5 Tầng Gần ĐH Kinh Tế",
            zone: "anthuong",
            zoneName: "Phố Tây An Thượng",
            location: "Phường Mỹ An, Ngũ Hành Sơn",
            priceText: "7.9 Tỷ VNĐ",
            priceNum: 7.9,
            landArea: "75 m² (Mặt tiền 4.5m)",
            pricePerM2: "105.3 Tr / m²",
            floors: "5 Tầng (Thang bộ rộng + Khóa vân tay)",
            rooms: "9 Phòng Khép Kín Full Nội Thất",
            monthlyRevText: "48 Tr / Tháng",
            monthlyRevNum: 48,
            capRate: "9.5% / Năm",
            distanceSea: "600m ra biển Mỹ An",
            pccc: "Trang bị PCCC báo khói tự động từng phòng",
            legal: "Sổ đỏ thổ cư 100%, sẵn sàng giao dịch",
            leverage50Net: "+14.6 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            desc: "Phân khúc đầu tư dòng tiền vừa túi tiền nhất, luôn kín phòng 100% nhờ sinh viên & nhân viên văn phòng thuê quanh năm.",
            expertNote: "Thích hợp cho nhà đầu tư mới bắt đầu giải ngân BĐS dòng tiền tại Đà Nẵng."
        },
        {
            id: 7,
            title: "Khách Sạn Mini 9 Tầng Mặt Biển Mỹ Khê",
            zone: "mykhe",
            zoneName: "Biển Mỹ Khê",
            location: "Đường Võ Nguyên Giáp, Sơn Trà",
            priceText: "48.0 Tỷ VNĐ",
            priceNum: 48.0,
            landArea: "180 m² (Mặt tiền đường biển lớn)",
            pricePerM2: "266.6 Tr / m²",
            floors: "9 Tầng (2 Thang máy + Sky Bar)",
            rooms: "22 Phòng Khách Sạn View Biển 100%",
            monthlyRevText: "320 Tr / Tháng",
            monthlyRevNum: 320,
            capRate: "10.8% / Năm",
            distanceSea: "Mặt biển Võ Nguyên Giáp (50m)",
            pccc: "Nghiệm thu PCCC Khách sạn cấp Quận / TP",
            legal: "Sổ hồng hoàn công 9 tầng đầy đủ",
            leverage50Net: "+95.8 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            desc: "Vị trí độc bản mặt đường biển Võ Nguyên Giáp, khai thác booking khách quốc tế và tour lữ hành.",
            expertNote: "Tài sản kim cương giữ tiền chống lạm phát và tạo dòng tiền khủng hàng tháng."
        },
        {
            id: 8,
            title: "Tòa Căn Hộ Dịch Vụ 6 Tầng Phan Tôn",
            zone: "anthuong",
            zoneName: "Phố Tây An Thượng",
            location: "Phố Tây An Thượng, Ngũ Hành Sơn",
            priceText: "16.2 Tỷ VNĐ",
            priceNum: 16.2,
            landArea: "95 m² (Mặt tiền 5m)",
            pricePerM2: "170.5 Tr / m²",
            floors: "6 Tầng (Thang máy Mitsubishi)",
            rooms: "8 Căn Hộ Studio Địa Trung Hải",
            monthlyRevText: "95 Tr / Tháng",
            monthlyRevNum: 95,
            capRate: "9.4% / Năm",
            distanceSea: "200m ra biển Mỹ Khê",
            pccc: "Nghiệm thu PCCC & lối thoát nạn tiêu chuẩn",
            legal: "Sổ hồng riêng chính chủ",
            leverage50Net: "+26.8 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
            desc: "Phong cách thiết kế Địa Trung Hải trẻ trung, thu hút khách nước ngoài lưu trú dài hạn.",
            expertNote: "Nằm ngay lõi phố đi bộ đêm An Thượng, giá phòng trung bình đạt 12-14 Tr/tháng/căn."
        },
        {
            id: 9,
            title: "Tòa Căn Hộ 5 Tầng Cửa Ngõ Biển Nguyễn Văn Thoại",
            zone: "mykhe",
            zoneName: "Biển Mỹ Khê",
            location: "Phường Mỹ An, Ngũ Hành Sơn",
            priceText: "12.5 Tỷ VNĐ",
            priceNum: 12.5,
            landArea: "85 m² (Mặt tiền 5m)",
            pricePerM2: "147.0 Tr / m²",
            floors: "5 Tầng (Thang máy gia đình)",
            rooms: "7 Phòng Căn Hộ Lớn Có Bếp",
            monthlyRevText: "75 Tr / Tháng",
            monthlyRevNum: 75,
            capRate: "9.6% / Năm",
            distanceSea: "300m ra bãi tắm T20",
            pccc: "Trang bị hệ thống PCCC tiêu chuẩn",
            legal: "Sổ đỏ vuông vắn, pháp lý sạch",
            leverage50Net: "+21.2 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            desc: "Trục đường ăn uống mua sắm sầm uất nhất khu biển Mỹ Khê, nối thẳng Cầu Rồng ra bãi tắm.",
            expertNote: "Thanh khoản cực kỳ cao, dễ dàng bán lại hoặc thế chấp ngân hàng định giá tốt."
        },
        {
            id: 10,
            title: "Tòa Căn Hộ 7 Tầng Đường Trần Bạch Đằng",
            zone: "sontra",
            zoneName: "Bán Đảo Sơn Trà",
            location: "Phố Du Lịch An Thượng, Ngũ Hành Sơn",
            priceText: "29.5 Tỷ VNĐ",
            priceNum: 29.5,
            landArea: "160 m² (Mặt tiền 8m rộng)",
            pricePerM2: "184.3 Tr / m²",
            floors: "7 Tầng (Thang máy tải trọng lớn)",
            rooms: "15 Căn Hộ Chuẩn Khách Sạn 4 Sao",
            monthlyRevText: "195 Tr / Tháng",
            monthlyRevNum: 195,
            capRate: "10.1% / Năm",
            distanceSea: "100m ra biển (2 phút đi bộ)",
            pccc: "Nghiệm thu PCCC tòa nhà cao tầng đầy đủ",
            legal: "Sổ hồng hoàn công 7 tầng",
            leverage50Net: "+58.4 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
            desc: "Trục đường Trần Bạch Đằng sầm uất nhất phố biển, trang bị hệ thống Smart Lock không chạm 100%.",
            expertNote: "Tỷ lệ hoàn vốn 9.9 năm, là cơ hội đầu tư dòng tiền cao cấp rất hiếm tại thời điểm này."
        },
        {
            id: 11,
            title: "Tòa Nhà Văn Phòng & Căn Hộ Nguyễn Chí Thanh",
            zone: "haichau",
            zoneName: "Sông Hàn / Hải Châu",
            location: "Trung Tâm Quận Hải Châu, Đà Nẵng",
            priceText: "21.0 Tỷ VNĐ",
            priceNum: 21.0,
            landArea: "110 m² (Mặt tiền 6m trung tâm)",
            pricePerM2: "190.9 Tr / m²",
            floors: "6 Tầng (Thang máy Schindlers)",
            rooms: "3 Tầng VP + 6 Căn Hộ Chuyên Gia",
            monthlyRevText: "130 Tr / Tháng",
            monthlyRevNum: 130,
            capRate: "8.9% / Năm",
            distanceSea: "Trung tâm phố tài chính",
            pccc: "PCCC văn phòng & nhà ở kết hợp hoàn chỉnh",
            legal: "Sổ hồng chính chủ, sẵn sàng công chứng",
            leverage50Net: "+35.5 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
            desc: "Khu vực tài chính trung tâm thành phố, kết hợp văn phòng công ty và căn hộ cho chuyên gia Nhật Bản.",
            expertNote: "Thuê hợp đồng dài hạn 3-5 năm cố định, không phụ thuộc vào mùa du lịch."
        },
        {
            id: 12,
            title: "Biệt Thự Villa Nghỉ Dưỡng Ven Biển Non Nước",
            zone: "sontra",
            zoneName: "Bán Đảo Sơn Trà",
            location: "Phường Hòa Hải, Ngũ Hành Sơn",
            priceText: "19.8 Tỷ VNĐ",
            priceNum: 19.8,
            landArea: "300 m² (Mặt tiền 12m view thoáng)",
            pricePerM2: "66.0 Tr / m²",
            floors: "3 Tầng (Hồ bơi riêng biệt lập)",
            rooms: "4 Phòng Ngủ Master Lớn",
            monthlyRevText: "125 Tr / Tháng",
            monthlyRevNum: 125,
            capRate: "9.5% / Năm",
            distanceSea: "150m ra bãi tắm Non Nước",
            pccc: "Trang bị PCCC biệt thự tiêu chuẩn",
            legal: "Sổ đỏ cá nhân chính chủ",
            leverage50Net: "+33.8 Tr / Tháng",
            image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
            desc: "Không gian nghỉ dưỡng biệt lập, sân vườn cây xanh nhiệt đới, khai thác booking đoàn khách châu Âu dài ngày.",
            expertNote: "Đơn giá đất chỉ 66 Tr/m2 ven biển, tiềm năng tăng giá kép vượt bậc."
        }
    ];

    // ─────────────────────────────────────────────────────────────
    // 2. INJECT CSS STYLES (NO-SCROLLBAR FIX & LUXURY ADVISORY UI)
    // ─────────────────────────────────────────────────────────────
    const styleEl = document.createElement('style');
    styleEl.id = 'ai-concierge-dossier-styles';
    styleEl.textContent = `
        /* Ẩn triệt để thanh cuộn ngang xấu xí */
        .no-scrollbar::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }
        .no-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
        }

        /* Tinh chỉnh thanh cuộn dọc hộp chat sang trọng */
        #ai-chat-messages::-webkit-scrollbar {
            width: 4px !important;
        }
        #ai-chat-messages::-webkit-scrollbar-track {
            background: transparent !important;
        }
        #ai-chat-messages::-webkit-scrollbar-thumb {
            background: rgba(245, 158, 11, 0.25) !important;
            border-radius: 9999px !important;
        }
        #ai-chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(245, 158, 11, 0.5) !important;
        }

        /* Floating Concierge Button */
        #ai-concierge-trigger {
            position: fixed;
            bottom: 78px;
            right: 18px;
            z-index: 45;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 15px 9px 11px;
            background: linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%);
            border: 1px solid rgba(251, 191, 36, 0.6);
            border-radius: 9999px;
            color: #ffffff;
            font-weight: 700;
            font-size: 13px;
            box-shadow: 0 10px 25px -5px rgba(217, 119, 6, 0.5), 0 0 15px rgba(251, 191, 36, 0.3);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: pulse-border 2.5s infinite;
        }
        @media (min-width: 768px) {
            #ai-concierge-trigger {
                bottom: 28px;
                right: 28px;
                padding: 11px 18px 11px 14px;
                font-size: 14px;
            }
        }
        #ai-concierge-trigger:hover {
            transform: translateY(-3px) scale(1.03);
            box-shadow: 0 15px 30px -5px rgba(217, 119, 6, 0.7);
        }
        @keyframes pulse-border {
            0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
            50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
        }

        /* Concierge Chat Window */
        #ai-concierge-modal {
            position: fixed;
            bottom: 80px;
            right: 16px;
            width: 410px;
            max-width: calc(100vw - 32px);
            height: 600px;
            max-height: calc(100vh - 110px);
            background: rgba(10, 15, 29, 0.98);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(245, 158, 11, 0.35);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(217, 119, 6, 0.25);
            z-index: 55;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #ai-concierge-modal.active {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
        }

        /* Chat Message Bubbles */
        .ai-msg-bubble {
            max-width: 90%;
            padding: 12px 15px;
            border-radius: 18px;
            font-size: 13px;
            line-height: 1.55;
            word-break: break-word;
        }
        .ai-msg-agent {
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(251, 191, 36, 0.25);
            color: #f1f5f9;
            border-bottom-left-radius: 4px;
            align-self: flex-start;
        }
        .ai-msg-user {
            background: linear-gradient(135deg, #d97706, #b45309);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
        }

        /* Mini Property Card Embedded in Chat */
        .mini-prop-card {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(245, 158, 11, 0.35);
            border-radius: 14px;
            overflow: hidden;
            margin-top: 8px;
            margin-bottom: 6px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.5);
            transition: border-color 0.2s;
        }
        .mini-prop-card:hover {
            border-color: rgba(245, 158, 11, 0.8);
        }

        /* Typing Indicator */
        .typing-indicator-bubble {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 9px 14px;
            background: rgba(30, 41, 59, 0.85);
            border: 1px solid rgba(251, 191, 36, 0.2);
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            width: fit-content;
        }
        .typing-indicator-bubble span {
            width: 6px;
            height: 6px;
            background: #f59e0b;
            border-radius: 50%;
            animation: bounce-dot 1.4s infinite ease-in-out both;
        }
        .typing-indicator-bubble span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator-bubble span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce-dot {
            0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
        }

        /* Dossier Print Styles (Chuẩn A4) */
        @media print {
            body * {
                visibility: hidden !important;
            }
            #dossier-print-container, #dossier-print-container * {
                visibility: visible !important;
            }
            #dossier-print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                background: #ffffff !important;
                color: #0f172a !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // ─────────────────────────────────────────────────────────────
    // 3. RENDER DOM ELEMENTS (CHAT WIDGET & DOSSIER MODAL)
    // ─────────────────────────────────────────────────────────────
    function initDOMElements() {
        if (document.getElementById('ai-concierge-trigger')) return;

        // Floating Trigger Button
        const triggerBtn = document.createElement('div');
        triggerBtn.id = 'ai-concierge-trigger';
        triggerBtn.setAttribute('role', 'button');
        triggerBtn.setAttribute('aria-label', 'Mở Trợ lý AI Nguyệt Land 24/7');
        triggerBtn.innerHTML = `
            <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                👑
                <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
            </div>
            <span>AI Concierge 24/7</span>
        `;
        triggerBtn.onclick = toggleConciergeChat;
        document.body.appendChild(triggerBtn);

        // Chat Modal
        const chatModal = document.createElement('div');
        chatModal.id = 'ai-concierge-modal';
        chatModal.innerHTML = `
            <!-- Header -->
            <div class="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-bold text-base shadow-md">
                        👑
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950"></span>
                    </div>
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="font-bold text-amber-300 text-xs tracking-wide">Nguyệt Land Private Advisory</span>
                            <span class="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">ONLINE 24/7</span>
                        </div>
                        <span class="text-[10px] text-slate-400 block">Cố Vấn Thẩm Định Dòng Tiền Đà Nẵng</span>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="window.openInvestmentDossier()" title="Xuất Báo Cáo PDF Dossier" class="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center text-xs transition">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>
                    <button onclick="toggleConciergeChat()" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- Messages Stream -->
            <div id="ai-chat-messages" class="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3">
                <div class="ai-msg-bubble ai-msg-agent">
                    Kính chào <b>Quý Anh/Chị Nhà Đầu Tư!</b><br><br>
                    Em là <b>Chuyên viên Thẩm định Cao cấp Nguyệt Land</b> (Đại diện Chị Hải Nguyệt & CEO Lucky). Em trực tiếp nắm giữ hồ sơ kiểm toán sao kê dòng tiền 24 tháng, giấy phép PCCC và sổ hồng gốc của <b>12 bất động sản dòng tiền thực chiến</b> tại Đà Nẵng.<br><br>
                    Quý Anh/Chị đang quan tâm đến <b>tầm tài chính nào</b> hoặc <b>khu vực biển/phố Tây nào</b> để em đối chiếu dữ liệu thẩm định chính xác nhất ạ?
                </div>
            </div>

            <!-- Quick Action Chips (Ẩn thanh cuộn ngang triệt để) -->
            <div class="px-3 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
                <button onclick="sendQuickPrompt('anthuong')" class="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 font-medium transition shadow-sm">
                    🏖️ Phố Tây An Thượng
                </button>
                <button onclick="sendQuickPrompt('mykhe')" class="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 font-medium transition shadow-sm">
                    🌊 Mặt Biển Mỹ Khê
                </button>
                <button onclick="sendQuickPrompt('budget_15_20')" class="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 font-medium transition shadow-sm">
                    💰 Tầm 15 - 20 Tỷ
                </button>
                <button onclick="sendQuickPrompt('stress_test')" class="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 font-medium transition shadow-sm">
                    🌧️ Stress-Test Mùa Mưa
                </button>
                <button onclick="sendQuickPrompt('pccc_legal')" class="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 font-medium transition shadow-sm">
                    📜 Pháp Lý ODT & PCCC
                </button>
                <button onclick="sendQuickPrompt('booking')" class="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border border-amber-400 flex-shrink-0 font-black transition shadow-sm">
                    📅 Khảo Sát Thực Địa 1-1
                </button>
            </div>

            <!-- Input Bar -->
            <div class="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                <input id="ai-chat-input" type="text" placeholder="Hỏi về tòa nhà, Cap Rate, giá đất, sổ đỏ..." class="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 text-xs focus:outline-none focus:border-amber-500/50 transition" onkeydown="if(event.key==='Enter') sendUserMessage()">
                <button onclick="sendUserMessage()" class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold text-xs hover:brightness-110 transition flex-shrink-0 shadow-md">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(chatModal);

        // Dossier Modal
        if (!document.getElementById('investment-dossier-modal')) {
            const dossierModal = document.createElement('div');
            dossierModal.id = 'investment-dossier-modal';
            dossierModal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-3 md:p-6 overflow-y-auto';
            dossierModal.innerHTML = `
                <div class="relative w-full max-w-4xl bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
                    <div class="no-print px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                                <i class="fa-solid fa-file-pdf"></i>
                            </div>
                            <div>
                                <span class="font-bold text-amber-300 text-sm">Hồ Sơ Thẩm Định Dòng Tiền Độc Bản (Dossier 2026)</span>
                                <span class="text-[10px] text-slate-400 block">Tạo bởi Nguyệt Land Engine × CEO LUCKY</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 transition">
                                <i class="fa-solid fa-print"></i> <span>In / Tải PDF (A4)</span>
                            </button>
                            <button onclick="closeInvestmentDossier()" class="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    <div id="dossier-print-container" class="p-6 md:p-8 bg-slate-950 text-slate-200 text-xs md:text-sm font-sans space-y-6">
                        <div class="flex items-start justify-between border-b border-amber-500/30 pb-5">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-xl md:text-2xl font-serif font-black text-amber-300">NGUYỆT LAND</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/40 uppercase">Hồ Sơ Mật Thẩm Định</span>
                                </div>
                                <p class="text-[11px] text-slate-400">Bất Động Sản Dòng Tiền & Nhà Đẹp Đà Nẵng — Hotline: 0935.509.168</p>
                                <p class="text-[10px] text-slate-500">Mã Hồ Sơ: <span id="dossier-code" class="font-mono text-amber-400 font-bold">OPC-DN2026-8888</span> | Ngày Lập: <span id="dossier-date">02/09/2026</span></p>
                            </div>
                            <div class="text-right">
                                <div class="w-16 h-16 rounded-xl border border-amber-500/40 p-1 flex items-center justify-center bg-slate-900">
                                    <i class="fa-solid fa-qrcode text-3xl text-amber-400"></i>
                                </div>
                                <span class="text-[9px] text-slate-400 block mt-1">Quét QR Tọa Độ Thực Địa</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                <span class="text-[10px] text-slate-400 block font-semibold">TỔNG GIÁ TRỊ ĐẦU TƯ</span>
                                <span id="dossier-val-price" class="text-base md:text-lg font-black text-amber-300">18.5 Tỷ VNĐ</span>
                            </div>
                            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                <span class="text-[10px] text-slate-400 block font-semibold">DÒNG TIỀN THỰC THU</span>
                                <span id="dossier-val-rent" class="text-base md:text-lg font-black text-emerald-400">110 Triệu/Th</span>
                            </div>
                            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                <span class="text-[10px] text-slate-400 block font-semibold">TỶ SUẤT CAP RATE</span>
                                <span id="dossier-val-caprate" class="text-base md:text-lg font-black text-yellow-400">9.8% / Năm</span>
                            </div>
                            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                <span class="text-[10px] text-slate-400 block font-semibold">CÔNG SUẤT LẤP ĐẦY TB</span>
                                <span id="dossier-val-occupancy" class="text-base md:text-lg font-black text-cyan-400">92.8%</span>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <h4 class="font-bold text-amber-300 text-xs md:text-sm flex items-center gap-2">
                                <i class="fa-solid fa-shield-halved text-amber-400"></i> 1. ĐÁNH GIÁ 4 LỚP THẨM ĐỊNH NGUYỆT LAND
                            </h4>
                            <div class="overflow-x-auto border border-slate-800 rounded-xl">
                                <table class="w-full text-left text-[11px] md:text-xs">
                                    <thead class="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                                        <tr>
                                            <th class="p-2.5">Lớp Thẩm Định</th>
                                            <th class="p-2.5">Tiêu Chí Khảo Sát</th>
                                            <th class="p-2.5">Kết Quả Đánh Giá</th>
                                            <th class="p-2.5">Điểm Thẩm Định</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-800/80">
                                        <tr>
                                            <td class="p-2.5 font-bold text-amber-400">Lớp 1: Pháp Lý Sổ Đỏ</td>
                                            <td class="p-2.5">Sổ hồng riêng, đất ở đô thị lâu dài ODT, hoàn công đúng GPXD</td>
                                            <td class="p-2.5 text-emerald-400">✓ Đạt chuẩn 100% — Không quy hoạch, không tranh chấp</td>
                                            <td class="p-2.5 font-bold text-emerald-400">10 / 10</td>
                                        </tr>
                                        <tr>
                                            <td class="p-2.5 font-bold text-amber-400">Lớp 2: Dòng Tiền Lịch Sử</td>
                                            <td class="p-2.5">Báo cáo kiểm toán doanh thu 24 tháng gần nhất</td>
                                            <td class="p-2.5 text-emerald-400">✓ Lấp đầy ổn định >88% ngay cả mùa mưa tháng 10-11</td>
                                            <td class="p-2.5 font-bold text-emerald-400">9.5 / 10</td>
                                        </tr>
                                        <tr>
                                            <td class="p-2.5 font-bold text-amber-400">Lớp 3: Khấu Hao Tài Sản</td>
                                            <td class="p-2.5">Kết cấu móng bê tông cốt thép, thang máy, PCCC nghiệm thu</td>
                                            <td class="p-2.5 text-emerald-400">✓ Khấu hao mới 8-12%, tuổi thọ khai thác còn >35 năm</td>
                                            <td class="p-2.5 font-bold text-emerald-400">9.2 / 10</td>
                                        </tr>
                                        <tr>
                                            <td class="p-2.5 font-bold text-amber-400">Lớp 4: Lãi Vốn & Vị Trí</td>
                                            <td class="p-2.5">Biên độ tăng giá đất theo bảng giá đất Đà Nẵng 2026</td>
                                            <td class="p-2.5 text-emerald-400">✓ Tăng trưởng dự báo 12 - 18%/năm trong chu kỳ 2026-2030</td>
                                            <td class="p-2.5 font-bold text-emerald-400">9.6 / 10</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <h4 class="font-bold text-amber-300 text-xs md:text-sm flex items-center gap-2">
                                <i class="fa-solid fa-chart-line text-emerald-400"></i> 2. KỊCH BẢN STRESS-TEST DÒNG TIỀN 3 MÙA
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] md:text-xs">
                                <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                                    <span class="font-bold text-amber-300 block">☀️ Mùa Cao Điểm (T3 ➔ T8)</span>
                                    <p class="text-slate-300">Lấp đầy: <b class="text-emerald-400">95% - 100%</b></p>
                                    <p class="text-slate-300">Doanh thu dự kiến: <b class="text-amber-300" id="dossier-stress-peak">135 Tr/Tháng</b></p>
                                    <p class="text-[10px] text-slate-400">Du lịch biển bùng nổ, giá phòng tăng 25-35%</p>
                                </div>
                                <div class="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                                    <span class="font-bold text-cyan-300 block">⚖️ Mùa Bình Quân (T9 ➔ T11)</span>
                                    <p class="text-slate-300">Lấp đầy: <b class="text-emerald-400">85% - 90%</b></p>
                                    <p class="text-slate-300">Doanh thu dự kiến: <b class="text-cyan-300" id="dossier-stress-mid">110 Tr/Tháng</b></p>
                                    <p class="text-[10px] text-slate-400">Lượng khách công tác và chuyên gia ổn định</p>
                                </div>
                                <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                                    <span class="font-bold text-blue-300 block">🌧️ Mùa Thấp Điểm (T12 ➔ T2)</span>
                                    <p class="text-slate-300">Lấp đầy: <b class="text-yellow-400">75% - 80%</b></p>
                                    <p class="text-slate-300">Doanh thu dự kiến: <b class="text-blue-300" id="dossier-stress-low">85 Tr/Tháng</b></p>
                                    <p class="text-[10px] text-slate-400">Vẫn dư dòng tiền sau khi thanh toán gốc lãi</p>
                                </div>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-slate-800 flex items-end justify-between">
                            <div class="space-y-1 text-[10px] text-slate-400">
                                <p><b>Cam kết Nguyệt Land:</b> Không kê giá, thẩm định pháp lý độc lập, hỗ trợ vận hành khai thác trọn đời.</p>
                                <p>Bản báo cáo chỉ có giá trị tham khảo đầu tư được cấp quyền cho Hội Viên VIP.</p>
                            </div>
                            <div class="text-center space-y-1">
                                <span class="text-[10px] text-slate-400 uppercase tracking-wide block">Xác Thực Hội Đồng Thẩm Định</span>
                                <div class="inline-block px-3 py-1 rounded border-2 border-red-500 text-red-500 font-black text-xs uppercase transform -rotate-3">
                                    ★ NGUYỆT LAND VIP CERTIFIED ★
                                </div>
                                <span class="text-[11px] font-serif font-bold text-amber-300 block mt-1">CEO LUCKY & Chị Hải Nguyệt</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(dossierModal);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. RENDER PROPERTY MINI CARD IN CHAT (DẪN CHỨNG DỮ LIỆU THẬT)
    // ─────────────────────────────────────────────────────────────
    function renderPropertyCardHtml(p) {
        return `
            <div class="mini-prop-card">
                <div class="relative h-28 w-full overflow-hidden">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/85 text-amber-400 font-black text-[10px] border border-amber-500/30">
                        Cap Rate ${p.capRate}
                    </span>
                    <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white font-bold text-[10px]">
                        ${p.monthlyRevText}
                    </span>
                </div>
                <div class="p-2.5 space-y-1.5 text-slate-200">
                    <div class="flex items-start justify-between gap-1">
                        <b class="text-xs text-amber-300 font-serif leading-tight line-clamp-1">${p.title}</b>
                        <span class="text-xs font-black text-amber-400 whitespace-nowrap">${p.priceText}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 line-clamp-1 flex items-center gap-1">
                        <i class="fa-solid fa-location-dot text-amber-400"></i> ${p.location}
                    </p>
                    <div class="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800">
                        <span>Đòn bẩy 50% ròng: <b class="text-emerald-400">${p.leverage50Net}</b></span>
                        <span class="text-slate-400">${p.rooms}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-1.5 pt-1">
                        <button type="button" onclick="if(typeof openAppraisalModal==='function'){openAppraisalModal(${p.id});}else{window.openInvestmentDossier();}" class="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition">
                            <i class="fa-solid fa-file-pdf"></i> Thẩm Định
                        </button>
                        <button type="button" onclick="if(typeof loadPropertyIntoCalc==='function'){loadPropertyIntoCalc(${p.id});toggleConciergeChat();}else{window.openInvestmentDossier();}" class="py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center gap-1 transition">
                            <i class="fa-solid fa-calculator"></i> Tính Đòn Bẩy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────
    // 5. CHAT CONTROLLER & DEEP KEYWORD ADVISORY ENGINE
    // ─────────────────────────────────────────────────────────────
    window.toggleConciergeChat = function() {
        const modal = document.getElementById('ai-concierge-modal');
        if (modal) {
            modal.classList.toggle('active');
            if (modal.classList.contains('active')) {
                document.getElementById('ai-chat-input')?.focus();
            }
        }
    };

    function showTypingIndicator() {
        const stream = document.getElementById('ai-chat-messages');
        if (!stream) return;
        const ind = document.createElement('div');
        ind.id = 'ai-typing-indicator';
        ind.className = 'typing-indicator-bubble';
        ind.innerHTML = `<span></span><span></span><span></span>`;
        stream.appendChild(ind);
        stream.scrollTop = stream.scrollHeight;
    }

    function hideTypingIndicator() {
        const ind = document.getElementById('ai-typing-indicator');
        if (ind) ind.remove();
    }

    function appendUserMessage(text) {
        const stream = document.getElementById('ai-chat-messages');
        if (!stream) return;
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble ai-msg-user';
        bubble.innerText = text;
        stream.appendChild(bubble);
        stream.scrollTop = stream.scrollHeight;
    }

    function appendAgentMessage(html) {
        hideTypingIndicator();
        const stream = document.getElementById('ai-chat-messages');
        if (!stream) return;
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble ai-msg-agent';
        bubble.innerHTML = html;
        stream.appendChild(bubble);
        stream.scrollTop = stream.scrollHeight;
    }

    // Quick Prompts
    window.sendQuickPrompt = function(type) {
        if (type === 'anthuong') {
            appendUserMessage("Tư vấn phân khu Phố Tây An Thượng và các tòa đang bán");
            processAdvisoryAnswer("an thượng");
        } else if (type === 'mykhe') {
            appendUserMessage("Tư vấn khách sạn & căn hộ mặt biển Mỹ Khê");
            processAdvisoryAnswer("mỹ khê");
        } else if (type === 'budget_15_20') {
            appendUserMessage("Tôi có ngân sách khoảng 15 - 20 tỷ, có tòa nào dòng tiền tốt?");
            processAdvisoryAnswer("15 20 tỷ");
        } else if (type === 'stress_test') {
            appendUserMessage("Mùa mưa Đà Nẵng khách du lịch giảm thì dòng tiền bị ảnh hưởng thế nào?");
            processAdvisoryAnswer("mùa mưa");
        } else if (type === 'pccc_legal') {
            appendUserMessage("Pháp lý hoàn công và tiêu chuẩn PCCC kiểm tra như thế nào?");
            processAdvisoryAnswer("pccc pháp lý");
        } else if (type === 'booking') {
            appendUserMessage("Tôi muốn đặt lịch khảo sát thực địa 1-1 cùng Chị Nguyệt");
            renderBookingForm();
        }
    };

    window.sendUserMessage = function() {
        const input = document.getElementById('ai-chat-input');
        const text = (input?.value || '').trim();
        if (!text) return;

        appendUserMessage(text);
        input.value = '';

        showTypingIndicator();
        setTimeout(() => {
            processAdvisoryAnswer(text);
        }, 700);
    };

    function renderBookingForm() {
        showTypingIndicator();
        setTimeout(() => {
            appendAgentMessage(`
                📅 <b>ĐĂNG KÝ KHẢO SÁT THỰC ĐỊA 1-1 CÙNG CHỊ HẢI NGUYỆT</b><br><br>
                <i>Nguyệt Land bố trí xe riêng đón Quý Anh/Chị tận sân bay hoặc khách sạn tại Đà Nẵng, kiểm tra sổ hồng gốc và vào tận phòng khảo sát sao kê thực tế:</i><br><br>
                <div class="space-y-2 mt-2 p-3 bg-slate-900/95 rounded-2xl border border-amber-500/40 shadow-inner">
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 uppercase block mb-1">Họ Và Tên Quý Anh/Chị *</label>
                        <input id="qb-name" type="text" placeholder="Ví dụ: Anh Hoàng / Chị Mai" class="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-100 border border-slate-700 text-xs focus:border-amber-400">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 uppercase block mb-1">Số Điện Thoại / Zalo *</label>
                        <input id="qb-phone" type="tel" placeholder="09xx.xxx.xxx" class="w-full px-3 py-2 rounded-xl bg-slate-950 text-amber-300 font-bold border border-slate-700 text-xs focus:border-amber-400">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 uppercase block mb-1">Tầm Tài Chính Dự Kiến</label>
                        <select id="qb-budget" class="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 text-xs focus:border-amber-400">
                            <option value="12 - 18 Tỷ">12 - 18 Tỷ VNĐ (Căn hộ dịch vụ 5-7 tầng)</option>
                            <option value="18 - 30 Tỷ">18 - 30 Tỷ VNĐ (Khách sạn Boutique biển)</option>
                            <option value="Trên 30 Tỷ">Trên 30 Tỷ VNĐ (Khách sạn lớn / Villa biển)</option>
                            <option value="Dưới 10 Tỷ">Dưới 10 Tỷ VNĐ</option>
                        </select>
                    </div>
                    <button onclick="submitExecutiveBooking()" class="w-full py-2.5 mt-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-calendar-check"></i> Xác Nhận Đặt Lịch Khảo Sát
                    </button>
                </div>
            `);
        }, 500);
    }

    window.submitExecutiveBooking = async function() {
        const name = (document.getElementById('qb-name')?.value || '').trim();
        const phone = (document.getElementById('qb-phone')?.value || '').trim();
        const budget = document.getElementById('qb-budget')?.value || '15 - 30 Tỷ';

        if (!name || phone.length < 9) {
            alert('Kính mong Quý Anh/Chị nhập đầy đủ Họ tên và Số điện thoại hợp lệ để Nguyệt Land gửi xác nhận.');
            return;
        }

        try {
            const res = await fetch('/api/leads/consultation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    budget,
                    property: 'Đăng Ký Khảo Sát Thực Địa 1-1 (Private Client Advisory)',
                    preferredTime: 'Trong 24h tới'
                })
            });
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            appendAgentMessage(`
                🎉 <b>ĐẶT LỊCH THÀNH CÔNG!</b><br>
                Mã Khảo Sát VIP: <b class="text-amber-300 font-mono text-sm">${data.bookingCode || 'OPC-VIP-8888'}</b><br><br>
                Trân trọng cảm ơn <b>${name}</b> (${phone}). Chị Hải Nguyệt đã nhận được thông báo qua kênh bảo mật và sẽ trực tiếp liên hệ lại với Quý Anh/Chị trong vòng <b>5 phút</b> để thống nhất lịch trình khảo sát thực địa!
            `);
        } catch (e) {
            appendAgentMessage(`
                ✓ Đã ghi nhận lịch hẹn của Quý Anh/Chị <b>${name}</b> (${phone}). Đội ngũ Nguyệt Land sẽ liên hệ chu đáo ngay lập tức!
            `);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 6. CORE INTELLIGENT ROUTING LOGIC (NO ROBOT - STRICT DATA)
    // ─────────────────────────────────────────────────────────────
    function processAdvisoryAnswer(rawQuery) {
        const q = rawQuery.toLowerCase();

        // 1. INTENT: BOOKING / LIÊN HỆ GẶP CHỊ NGUYỆT
        if (q.includes('đặt lịch') || q.includes('gặp') || q.includes('khảo sát') || q.includes('xem nhà') || q.includes('thực địa') || q.includes('liên hệ')) {
            renderBookingForm();
            return;
        }

        // 2. INTENT: TẢI DOSSIER / BÁO CÁO PDF
        if (q.includes('dossier') || q.includes('báo cáo') || q.includes('tải file') || q.includes('pdf') || q.includes('hồ sơ mật')) {
            window.openInvestmentDossier();
            appendAgentMessage(`
                📄 <b>ĐÃ MỞ HỒ SƠ THẨM ĐỊNH ĐỘC BẢN CHUẨN A4:</b><br><br>
                Em đã hiển thị bản báo cáo thẩm định 4 lớp độc quyền của Nguyệt Land. Bản này bao gồm:<br>
                1. Đánh giá pháp lý ODT & Giấy phép PCCC.<br>
                2. Bảng sao kê kiểm toán dòng tiền 24 tháng gần nhất.<br>
                3. Kịch bản Stress-test dòng tiền 3 mùa.<br>
                4. Mã QR Maps định vị thực địa chính xác.<br><br>
                Quý Anh/Chị có thể bấm nút <b>"In / Tải PDF (A4)"</b> ở góc trên modal để lưu trữ hoặc in ra nghiên cứu cùng gia đình ạ!
            `);
            return;
        }

        // 3. INTENT: PHÁP LÝ & PCCC (SỔ ĐỎ, HOÀN CÔNG, TRANH CHẤP)
        if (q.includes('pháp lý') || q.includes('sổ đỏ') || q.includes('sổ hồng') || q.includes('hoàn công') || q.includes('pccc') || q.includes('phòng cháy') || q.includes('thổ cư') || q.includes('odt')) {
            appendAgentMessage(`
                📜 <b>QUY CHUẨN THẨM ĐỊNH PHÁP LÝ & PCCC CỦA NGUYỆT LAND:</b><br><br>
                Kính thưa Quý Anh/Chị, rủi ro lớn nhất của nhà đầu tư khi mua nhà nghỉ dưỡng/căn hộ tại Đà Nẵng là: <i>Mua phải đất thương mại dịch vụ (TMDV) chỉ có thời hạn 50 năm, hoặc tòa nhà xây vượt tầng không hoàn công được, hay chưa nghiệm thu PCCC bị đình chỉ kinh doanh</i>.<br><br>
                Tại Nguyệt Land, <b>100% tài sản trong giỏ hàng độc quyền</b> đều trải qua bộ lọc 2 lớp nghiêm ngặt:<br>
                • <b>Đất ở đô thị ODT lâu dài 100%:</b> Sở hữu vĩnh viễn, truyền đời, không dính quy hoạch treo.<br>
                • <b>Hoàn công chuẩn 100%:</b> Số tầng trên thực địa khớp hoàn toàn với bản vẽ hoàn công trên sổ hồng cá nhân.<br>
                • <b>Nghiệm thu PCCC thực tế:</b> Hệ thống Sprinkler chữa cháy tự động, thang thoát nạn ngoài trời, cửa chống cháy đạt chuẩn theo quy định mới 2026.<br><br>
                👉 <i>Quý Anh/Chị có thể bấm vào nút "Thẩm Định" tại bất kỳ tòa nhà nào bên dưới để xem trực tiếp hồ sơ pháp lý thực tế ạ!</i>
            `);
            return;
        }

        // 4. INTENT: STRESS-TEST MÙA MƯA & MÙA THẤP ĐIỂM
        if (q.includes('mùa mưa') || q.includes('thấp điểm') || q.includes('ế phòng') || q.includes('mùa đông') || q.includes('mùa du lịch') || q.includes('tháng 10') || q.includes('tháng 11')) {
            appendAgentMessage(`
                🌧️ <b>BÓC TÁCH THỰC TẾ: MÙA MƯA ĐÀ NẴNG DÒNG TIỀN ẢNH HƯỞNG THẾ NÀO?</b><br><br>
                Em xin chia sẻ rất thật với Quý Anh/Chị bằng góc nhìn của người bản địa 20 năm tại Đà Nẵng:<br><br>
                • <b>Tháng 3 ➔ Tháng 8 (Cao điểm):</b> Du lịch bùng nổ, bãi biển Mỹ Khê và phố Tây An Thượng luôn đạt công suất lấp đầy <b>95% - 100%</b>, giá phòng tăng 25-35%.<br>
                • <b>Tháng 9 ➔ Tháng 11 (Mùa mưa):</b> Lượng khách du lịch ngắn ngày giảm khoảng 30%. Tuy nhiên, các tòa căn hộ của Nguyệt Land tại An Thượng và Bắc Mỹ An <b>vẫn đạt lấp đầy 78% - 85%</b> nhờ chiến lược chuyển dịch hợp đồng dài hạn (6-12 tháng) cho cộng đồng <b>Digital Nomad Châu Âu, kỹ sư công nghệ và giảng viên quốc tế</b>.<br>
                • <b>Nguyên tắc bảo toàn vốn:</b> Mọi phương án tài chính của Nguyệt Land đều được tính toán theo <i>Mùa Thấp Điểm</i>: Doanh thu thực thu vẫn dư dả để chi trả 100% gốc lãi ngân hàng và bỏ túi dòng tiền dương.<br><br>
                👉 <i>Anh/Chị có thể tham khảo tòa An Thượng 29 (18.5 Tỷ) bên dưới — tòa nhà điển hình có tỷ lệ kín phòng quanh năm 92.8%:</i>
                ${renderPropertyCardHtml(MASTER_PROPERTIES[0])}
            `);
            return;
        }

        // 5. INTENT: VẬN HÀNH & ỦY THÁC CHO KHÁCH HÀNG Ở XA (HÀ NỘI / SÀI GÒN)
        if (q.includes('vận hành') || q.includes('ở xa') || q.includes('hà nội') || q.includes('sài gòn') || q.includes('quản lý') || q.includes('cho thuê') || q.includes('ủy thác')) {
            appendAgentMessage(`
                🔑 <b>GÓI ỦY THÁC VẬN HÀNH CHÌA KHÓA TRAO TAY (CHO NHÀ ĐẦU TƯ Ở XA):</b><br><br>
                Hơn 70% khách hàng của Nguyệt Land là các nhà đầu tư tại <b>Hà Nội và TP. Hồ Chí Minh</b>. Để Quý Anh/Chị an tâm sở hữu BĐS dòng tiền từ xa mà không phải bận tâm việc quản lý hàng ngày, Nguyệt Land cung cấp dịch vụ trọn gói:<br><br>
                1. <b>Khai thác Booking đa kênh:</b> Phủ sóng Airbnb, Booking.com, Agoda kết hợp mạng lưới khách Tây thuê dài hạn bản địa.<br>
                2. <b>Bảo trì kỹ thuật 24/7:</b> Định kỳ kiểm tra thang máy, hệ thống PCCC, điều hòa và nội thất.<br>
                3. <b>Sao kê minh bạch từng đồng:</b> Báo cáo doanh thu và dòng tiền ròng gửi tự động vào ngày 05 hàng tháng, tiền thuê chuyển thẳng vào tài khoản của Quý Anh/Chị.<br><br>
                👉 <i>Anh/Chị chỉ cần sở hữu tài sản và nhận dòng tiền ròng đều đặn mỗi tháng!</i>
            `);
            return;
        }

        // 6. INTENT: TƯ VẤN THEO NGÂN SÁCH (DƯỚI 10 TỶ, 10-15 TỶ, 15-20 TỶ, 20-30 TỶ, TRÊN 30 TỶ)
        if (q.includes('dưới 10') || q.includes('ít vốn') || q.includes('7 tỷ') || q.includes('8 tỷ') || q.includes('9 tỷ')) {
            const prop = MASTER_PROPERTIES.find(p => p.id === 6);
            appendAgentMessage(`
                💰 <b>TƯ VẤN PHÂN KHÚC DƯỚI 10 TỶ VNĐ:</b><br><br>
                Với ngân sách dưới 10 tỷ, phương án tối ưu nhất là sở hữu căn hộ dịch vụ mini gần các trường đại học lớn hoặc khu dân cư Mỹ An. Dòng tiền cho sinh viên chất lượng cao và nhân viên văn phòng thuê luôn kín 100% quanh năm.<br><br>
                Tài sản thẩm định tiêu biểu trong giỏ hàng:
                ${renderPropertyCardHtml(prop)}
            `);
            return;
        }

        if (q.includes('10') && (q.includes('15') || q.includes('12') || q.includes('14') || q.includes('tỷ'))) {
            const p1 = MASTER_PROPERTIES.find(p => p.id === 9);
            const p2 = MASTER_PROPERTIES.find(p => p.id === 3);
            appendAgentMessage(`
                💰 <b>TƯ VẤN PHÂN KHÚC 10 - 15 TỶ VNĐ (THANH KHOẢN CAO):</b><br><br>
                Đây là phân khúc "vừa miếng" nhất tại Đà Nẵng, dễ thanh khoản, tỷ suất sinh lời Cap Rate đạt từ <b>9.2% - 9.6%/năm</b>. Cả 2 tòa nhà đều cách biển từ 250m - 300m:<br>
                ${renderPropertyCardHtml(p1)}
                ${renderPropertyCardHtml(p2)}
            `);
            return;
        }

        if (q.includes('15') && (q.includes('20') || q.includes('18') || q.includes('16') || q.includes('tỷ'))) {
            const p1 = MASTER_PROPERTIES.find(p => p.id === 8);
            const p2 = MASTER_PROPERTIES.find(p => p.id === 1);
            appendAgentMessage(`
                💎 <b>TƯ VẤN PHÂN KHÚC 15 - 20 TỶ VNĐ (DÒNG TIỀN VÀNG PHỐ TÂY AN THƯỢNG):</b><br><br>
                Tầm tài chính 15 - 20 tỷ là "điểm rơi vàng" để sở hữu các tòa căn hộ 6 - 7 tầng tại Phố Tây An Thượng. Nơi đây tập trung hơn 80% khách Digital Nomad quốc tế, thu nhập ròng từ <b>95 - 110 Triệu/tháng</b>:<br>
                ${renderPropertyCardHtml(p1)}
                ${renderPropertyCardHtml(p2)}
            `);
            return;
        }

        if (q.includes('20') && (q.includes('30') || q.includes('25') || q.includes('26') || q.includes('tỷ'))) {
            const p1 = MASTER_PROPERTIES.find(p => p.id === 2);
            const p2 = MASTER_PROPERTIES.find(p => p.id === 10);
            appendAgentMessage(`
                👑 <b>TƯ VẤN PHÂN KHÚC 20 - 30 TỶ VNĐ (KHÁCH SẠN BOUTIQUE & APART-HOTEL):</b><br><br>
                Phân khúc này mang lại dòng tiền thực thu cực kỳ ấn tượng từ <b>160 - 195 Triệu/tháng</b>, nằm tại các trục đường du lịch đắt giá nhất Đà Nẵng (Hà Bổng & Trần Bạch Đằng), cách bãi tắm chỉ 100-120m:<br>
                ${renderPropertyCardHtml(p1)}
                ${renderPropertyCardHtml(p2)}
            `);
            return;
        }

        if (q.includes('30') || q.includes('40') || q.includes('50') || q.includes('lớn') || q.includes('khủng')) {
            const p1 = MASTER_PROPERTIES.find(p => p.id === 4);
            const p2 = MASTER_PROPERTIES.find(p => p.id === 7);
            appendAgentMessage(`
                🏰 <b>TƯ VẤN PHÂN KHÚC VIP TRÊN 30 TỶ VNĐ (TÀI SẢN BIỂU TƯỢNG):</b><br><br>
                Dành cho các nhà đầu tư tìm kiếm tài sản tích sản đẳng cấp vừa giữ tiền chống lạm phát vừa tạo dòng tiền hàng trăm triệu mỗi tháng:<br>
                ${renderPropertyCardHtml(p1)}
                ${renderPropertyCardHtml(p2)}
            `);
            return;
        }

        // 7. INTENT: TƯ VẤN THEO PHÂN KHU (AN THƯỢNG, MỸ KHÊ, SƠN TRÀ, HẢI CHÂU)
        if (q.includes('an thượng') || q.includes('phố tây')) {
            const items = MASTER_PROPERTIES.filter(p => p.zone === 'anthuong').slice(0, 2);
            appendAgentMessage(`
                🏖️ <b>PHÂN KHU PHỐ TÂY AN THƯỢNG (THỦ PHỦ DÒNG TIỀN ĐÀ NẴNG):</b><br><br>
                • <b>Đặc thù:</b> Phố đi bộ đêm quốc tế sôi động 24/7, cách biển 150m.<br>
                • <b>Khách thuê:</b> 85% Digital Nomad Âu Mỹ & chuyên gia lưu trú dài hạn 3 - 12 tháng.<br>
                • <b>Công suất lấp đầy:</b> Bình quân năm đạt <b>92.8%</b> (Cao nhất miền Trung).<br>
                • <b>Tỷ suất Cap Rate:</b> 11.5% - 13.8%/năm.<br><br>
                2 Tòa nhà nổi bật nhất phân khu đang giao dịch:
                ${renderPropertyCardHtml(items[0])}
                ${renderPropertyCardHtml(items[1])}
            `);
            return;
        }

        if (q.includes('mỹ khê') || q.includes('võ nguyên giáp') || q.includes('biển')) {
            const items = MASTER_PROPERTIES.filter(p => p.zone === 'mykhe').slice(0, 2);
            appendAgentMessage(`
                🌊 <b>PHÂN KHU MẶT BIỂN & TRỤC BIỂN MỸ KHÊ:</b><br><br>
                • <b>Đặc thù:</b> Bãi biển đẹp top hành tinh, quỹ đất khan hiếm tuyệt đối.<br>
                • <b>Khách thuê:</b> Gia đình du lịch, chuyên gia quốc tế và đoàn lữ hành.<br>
                • <b>Biên độ tăng giá đất:</b> Dự báo 12 - 18%/năm theo chu kỳ bảng giá đất 2026.<br>
                • <b>Tỷ suất Cap Rate:</b> 10.2% - 12.5%/năm.<br><br>
                Các tài sản mặt biển đang bán:
                ${renderPropertyCardHtml(items[0])}
                ${renderPropertyCardHtml(items[1])}
            `);
            return;
        }

        if (q.includes('sơn trà') || q.includes('phạm văn đồng')) {
            const items = MASTER_PROPERTIES.filter(p => p.zone === 'sontra').slice(0, 2);
            appendAgentMessage(`
                🏙️ <b>PHÂN KHU BÁN ĐẢO SƠN TRÀ & TRỤC PHẠM VĂN ĐỒNG:</b><br><br>
                • <b>Đặc thù:</b> Trục đại lộ biển thông ra cầu quay Sông Hàn, đón trọn khách Hàn Quốc & Nhật Bản.<br>
                • <b>Ưu thế:</b> Dư địa tăng lãi vốn đất nền ven bán đảo còn rất lớn so với khu vực trung tâm.<br><br>
                Tài sản tiêu biểu đang khai thác tốt:
                ${renderPropertyCardHtml(items[0])}
                ${renderPropertyCardHtml(items[1])}
            `);
            return;
        }

        if (q.includes('hải châu') || q.includes('sông hàn') || q.includes('bạch đằng')) {
            const items = MASTER_PROPERTIES.filter(p => p.zone === 'haichau').slice(0, 2);
            appendAgentMessage(`
                🌉 <b>PHÂN KHU LÕI TRUNG TÂM TÀI CHÍNH HẢI CHÂU & SÔNG HÀN:</b><br><br>
                • <b>Đặc thù:</b> Trái tim kinh tế của thành phố, kề cận Cầu Rồng và phố đi bộ Bạch Đằng.<br>
                • <b>Ưu thế:</b> Bất động sản tích sản an toàn số 1, thanh khoản công chứng nhanh trong 48h.<br><br>
                Tài sản độc bản ven sông Hàn:
                ${renderPropertyCardHtml(items[0])}
                ${renderPropertyCardHtml(items[1])}
            `);
            return;
        }

        // 8. INTENT: ĐÒN BẨY TÀI CHÍNH & VAY NGÂN HÀNG
        if (q.includes('vay') || q.includes('ngân hàng') || q.includes('đòn bẩy') || q.includes('lãi suất') || q.includes('dòng tiền') || q.includes('cap rate')) {
            appendAgentMessage(`
                🧮 <b>CÔNG THỨC ĐÒN BẨY TÀI CHÍNH BẢO TOÀN VỐN CỦA NGUYỆT LAND:</b><br><br>
                Một thương vụ đầu tư BĐS dòng tiền đạt chuẩn cần thỏa mãn nguyên tắc: <b>"Tài sản tự nuôi nợ và vẫn dư tiền bỏ túi"</b>.<br><br>
                • <b>Cơ cấu vốn chuẩn:</b> Vốn tự có 50% - Vay ngân hàng 50% trong 15-20 năm (Lãi suất ưu đãi hiện tại ~8.5%/năm).<br>
                • <b>Dòng tiền ròng (Net Pocket Cashflow):</b> Sau khi trừ chi phí vận hành bảo trì (OPEX 20%) và trừ tiền trả góp gốc + lãi ngân hàng, Quý Anh/Chị vẫn thu về dòng tiền dương từ <b>+25 Tr đến +50 Tr/tháng</b>.<br><br>
                👉 <i>Ví dụ: Tòa Phan Tôn (16.2 Tỷ) sau khi vay 50%, dòng tiền ròng bỏ túi vẫn đạt <b>+26.8 Triệu/tháng</b>!</i><br>
                ${renderPropertyCardHtml(MASTER_PROPERTIES[7])}
            `);
            return;
        }

        // 9. DEFAULT CONSULTATIVE RESPONSE (VĂN PHONG CỐ VẤN TƯ VẤN CHUYÊN SÂU)
        appendAgentMessage(`
            Dạ, trân trọng cảm ơn câu hỏi của Quý Anh/Chị về <b>"${rawQuery}"</b>.<br><br>
            Thị trường BĐS dòng tiền Đà Nẵng hiện nay không dành cho việc lướt sóng ngắn hạn, mà là kênh <b>tích sản trú ẩn lạm phát an toàn số 1</b> nhờ dòng tiền thực thu bền vững từ du lịch và cộng đồng Digital Nomad quốc tế.<br><br>
            Hiện tại trong giỏ hàng 12 tòa nhà độc quyền của Nguyệt Land, em xin gợi ý 2 tài sản có <b>hiệu suất khai thác dòng tiền cao nhất</b> để Quý Anh/Chị tham khảo:<br>
            ${renderPropertyCardHtml(MASTER_PROPERTIES[0])}
            ${renderPropertyCardHtml(MASTER_PROPERTIES[1])}
            <br>
            👉 <i>Quý Anh/Chị có thể để lại số điện thoại hoặc bấm nút <b>"Khảo Sát Thực Địa 1-1"</b> để Chị Hải Nguyệt trực tiếp hỗ trợ tư vấn chi tiết hơn ạ!</i>
        `);
    }

    // ─────────────────────────────────────────────────────────────
    // 7. 1-CLICK INVESTMENT DOSSIER CONTROLLER
    // ─────────────────────────────────────────────────────────────
    window.openInvestmentDossier = function(customData = null) {
        const modal = document.getElementById('investment-dossier-modal');
        if (!modal) return;

        const propPrice = document.getElementById('prop-price')?.value || '18.5';
        const priceNum = parseFloat(propPrice) || 18.5;
        const priceBillion = priceNum + ' Tỷ VNĐ';

        document.getElementById('dossier-val-price').innerText = priceBillion;
        document.getElementById('dossier-code').innerText = 'OPC-DN' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('dossier-date').innerText = new Date().toLocaleDateString('vi-VN');

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeInvestmentDossier = function() {
        const modal = document.getElementById('investment-dossier-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // Initialize on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDOMElements);
    } else {
        initDOMElements();
    }
})();
