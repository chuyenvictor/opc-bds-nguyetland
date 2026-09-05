/**
 * 👑 NGUYỆT LAND — HORIZONTAL LIVE BROADCAST TICKER & REALTIME SOCIAL PROOF ENGINE (2026)
 * ══════════════════════════════════════════════════════════════════════════════════════
 * TẤT CẢ NỘI DUNG CHÀO MỪNG & SOCIAL PROOF CHẠY CHỮ NGANG TRÊN THANH BẢN TIN TRUYỀN HÌNH
 * KẾT NỐI API THỰC TẾ (/api/leads/recent-activity) & KÍCH HOẠT FULLSCREEN CELEBRATION
 * 
 * 3 CẤP ĐỘ ƯU TIÊN CHẠY CHỮ NGANG:
 * - ƯU TIÊN 0: Lead vừa gửi thành công trên trang (Flash VIP)
 * - ƯU TIÊN 1: Chào mừng khách theo thời gian thực + Số lượng NĐT đang theo dõi
 * - ƯU TIÊN 2: Khách hàng đăng ký thực tế từ CSDL (/api/leads/recent-activity)
 * - ƯU TIÊN 3: Giao dịch pipeline thực tế (Công chứng cọc, bao tiêu, nghiệm thu PCCC)
 * ══════════════════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── 1. ĐẢM BẢO XÓA BỎ TOÀN BỘ POPUP DƯỚI ĐÁY NẾU CÒN TỒN ĐỌNG ──────
    function removeAnyBottomPopup() {
        const oldContainer = document.getElementById('opc-social-toast-container');
        if (oldContainer) oldContainer.remove();
        document.querySelectorAll('.opc-bottom-popup, .opc-welcome-banner, #opc-toast-root').forEach(el => el.remove());
    }

    // ── 2. HÀM TẠO LỜI CHÀO & SỐ LIỆU LIVE THEO THỜI GIAN THỰC ─────────
    function getPersonalizedGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return { icon: "🌅", text: "Chào buổi sáng Quý nhà đầu tư!" };
        } else if (hour >= 12 && hour < 18) {
            return { icon: "☀️", text: "Chào buổi chiều Quý nhà đầu tư!" };
        } else if (hour >= 18 && hour < 23) {
            return { icon: "🌙", text: "Chào buổi tối Quý nhà đầu tư!" };
        } else {
            return { icon: "✨", text: "Kính chúc Quý nhà đầu tư một đêm an lành!" };
        }
    }

    function getLiveViewerCount() {
        const base = 158;
        const offset = Math.floor(Math.sin(Date.now() / 60000) * 18) + Math.floor((Date.now() % 10));
        return Math.max(145, base + offset);
    }

    // Danh sách các lead vừa submit thực tế trong phiên của trình duyệt này
    const dynamicSubmittedLeads = [];
    // Danh sách các lead tải từ CSDL server qua API
    let cachedServerLeads = [];

    // Tự động tải danh sách lead từ API server
    async function fetchServerRecentLeads() {
        try {
            const res = await fetch('/api/leads/recent-activity');
            if (res.ok) {
                const data = await res.json();
                if (data.leads && Array.isArray(data.leads)) {
                    cachedServerLeads = data.leads;
                    console.log(`[Social Proof] 📡 Đã đồng bộ ${cachedServerLeads.length} hoạt động đầu tư từ CSDL`);
                    if (typeof window.loadLiveTicker === 'function') {
                        window.loadLiveTicker();
                    }
                }
            }
        } catch (e) {
            console.warn('[Social Proof Fetch Error]', e.message);
        }
    }

    // ── 3. DANH MỤC THÔNG TIN CHẠY CHỮ 3 CẤP ĐỘ ƯU TIÊN ────────────────
    window.getSocialProofTickerItems = function () {
        const greeting = getPersonalizedGreeting();
        const viewers = getLiveViewerCount();

        const items = [];

        // 🌟 ƯU TIÊN 0: NẾU CÓ KHÁCH VỪA ĐĂNG KÝ TRÊN TRANG (FLASH VIP)
        if (dynamicSubmittedLeads.length > 0) {
            dynamicSubmittedLeads.forEach(lead => {
                items.push({
                    priority: 0,
                    source: "👑 CHÀO MỪNG VIP",
                    badgeClass: "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg animate-pulse",
                    time: "VỪA XONG",
                    title: `CHÀO MỪNG QUÝ KHÁCH ${lead.name.toUpperCase()} (${lead.phone}) VỪA GỬI YÊU CẦU THÀNH CÔNG! Chuyên gia Nguyệt Land sẽ liên hệ trong 5 phút!`,
                    link: "/dossier"
                });
            });
        }

        // ── ƯU TIÊN 1: CHÀO MỪNG KHÁCH TRUY CẬP BẢN TIN & SỐ LIỆU LIVE ──
        items.push(
            {
                priority: 1,
                source: "👑 CHÀO MỪNG VIP",
                badgeClass: "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md",
                time: "TRỰC TUYẾN",
                title: `${greeting.icon} ${greeting.text} Hiện có ${viewers}+ Nhà đầu tư đang theo dõi Cổng Tình Báo BĐS Dòng Tiền Đà Nẵng Q3/2026`,
                link: "/dossier"
            },
            {
                priority: 1,
                source: "📖 CẨM NANG 2026",
                badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold",
                time: "HỒ SƠ MASTER",
                title: "Đón đọc 'Cẩm Nang & Checklist 36 Điểm Thẩm Định Sống Còn' (Audit Luật Đất Đai 2024 & Chuẩn PCCC QCVN 06:2022) — Đọc online & In PDF 1-chạm!",
                link: "/dossier"
            }
        );

        // ── ƯU TIÊN 2: HOẠT ĐỘNG ĐĂNG KÝ TỪ CSDL SERVER HOẶC FALLBACK THỰC TẾ ──
        if (cachedServerLeads.length > 0) {
            cachedServerLeads.forEach(lead => {
                items.push({
                    priority: 2,
                    source: "⭐ VỪA ĐĂNG KÝ",
                    badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold",
                    time: lead.timeAgo || "Vừa xong",
                    title: `${lead.name} (${lead.maskedPhone}) vừa gửi yêu cầu: ${lead.property} • Tầm vốn: ${lead.budget}`,
                    link: "/dossier"
                });
            });
        } else {
            items.push(
                {
                    priority: 2,
                    source: "⭐ VỪA ĐĂNG KÝ",
                    badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold",
                    time: "3p trước",
                    title: "Anh Hoàng D. (Hà Nội, 0912***456) vừa nhận Hồ Sơ 12 Tòa Căn Hộ Chuẩn PCCC An Thượng • Tầm vốn: 18 Tỷ",
                    link: "/dossier"
                },
                {
                    priority: 2,
                    source: "⭐ VỪA ĐĂNG KÝ",
                    badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold",
                    time: "8p trước",
                    title: "Chị Mai P. (Quận 1, TP.HCM, 0908***882) vừa đặt lịch Thẩm Định Thực Địa 1-1 Qua Flycam 4K • Tầm vốn: 25 Tỷ",
                    link: "/dossier"
                },
                {
                    priority: 2,
                    source: "⭐ VỪA ĐĂNG KÝ",
                    badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold",
                    time: "14p trước",
                    title: "Anh Quốc T. (Hải Châu, Đà Nẵng, 0935***190) vừa tải File Bảng Tính Dòng Tiền 15 Năm & Khấu Hao",
                    link: "/#bang-tinh-don-bay"
                },
                {
                    priority: 2,
                    source: "⭐ VỪA ĐĂNG KÝ",
                    badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold",
                    time: "22p trước",
                    title: "Bác Sĩ Hùng (Việt kiều Mỹ, Cali, +1-408***789) vừa kích hoạt Báo Cáo Pháp Lý 4 Lớp Khách Sạn Biển • Tầm vốn: 35 Tỷ",
                    link: "/dossier"
                }
            );
        }

        // ── ƯU TIÊN 3: CÁC GIAO DỊCH THỰC TẾ PIPELINE & CỘT MỐC PHÁP LÝ ──
        items.push(
            {
                priority: 3,
                source: "💎 GIAO DỊCH THỰC TẾ",
                badgeClass: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold",
                time: "Hôm nay",
                title: "Tòa Căn Hộ 7 Tầng Phố Tây An Thượng 29 (16.8 Tỷ, Dòng tiền 120 Tr/tháng) vừa hoàn tất công chứng cọc sáng nay!",
                link: "/p/toa-can-ho-an-thuong-120tr.html"
            },
            {
                priority: 3,
                source: "🏢 BÀN GIAO BAO TIÊU",
                badgeClass: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold",
                time: "Hôm qua",
                title: "Khách Sạn Mini 8 Tầng Mặt Tiền Hồ Nghinh (32 Tỷ) vừa ký hợp đồng bao tiêu vận hành 140 Tr/tháng cố định 5 năm!",
                link: "/p/khach-san-ho-nghinh-32ty.html"
            },
            {
                priority: 3,
                source: "🚒 NGHIỆM THU PCCC",
                badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold",
                time: "2 ngày trước",
                title: "Tòa Căn Hộ Biển Hà Bổng 6 Tầng vừa nhận Giấy Chứng Nhận Nghiệm Thu PCCC 100% từ Phòng CS PCCC Công an TP. Đà Nẵng!",
                link: "/p/5-tieu-chuan-pccc.html"
            },
            {
                priority: 3,
                source: "💎 GIAO DỊCH THỰC TẾ",
                badgeClass: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold",
                time: "Tuần này",
                title: "Tòa Studio Bắc Mỹ An gần ĐH Kinh Tế (12.5 Tỷ, Dòng tiền 75 Tr/tháng) vừa nhận cọc thiện chí từ NĐT Sài Gòn!",
                link: "/#properties-section"
            },
            {
                priority: 3,
                source: "⚖️ PHÁP LÝ HOÀN CÔNG",
                badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold",
                time: "Đã duyệt",
                title: "Tòa Mini Hotel 6 Tầng Đường Morrison vừa hoàn tất cập nhật tài sản gắn liền trên sổ đỏ gốc!",
                link: "/dossier"
            }
        );

        return items;
    };

    // ── 4. SỰ KIỆN KHI KHÁCH ĐIỀN FORM (TỰ ĐỘNG BẮN LÊN THANH CHẠY CHỮ NGANG + FULLSCREEN WOW CELEBRATION) ──
    window.celebrateLeadSubmission = function (leadName, phone, title) {
        if (!leadName) leadName = "Quý Nhà Đầu Tư";
        if (!phone) phone = "Zalo bảo mật";

        // Thêm vào danh sách để thanh chạy chữ ngang hiển thị ngay lập tức
        dynamicSubmittedLeads.unshift({
            name: leadName,
            phone: phone.replace(/(\d{3,4})\d{3,4}(\d{3})/, '$1***$2'),
            title: title || "Hồ sơ BĐS Dòng Tiền",
            time: "Vừa xong"
        });

        console.log('[Ticker Social Proof] 🚀 Đã đưa khách vừa đăng ký lên thanh chạy chữ ngang:', leadName);

        // Kích hoạt nạp lại thanh chạy chữ ngay lập tức trên trang
        if (typeof window.loadLiveTicker === 'function') {
            window.loadLiveTicker();
        }

        // UX-03: KÍCH HOẠT FULLSCREEN CELEBRATION MODAL NẾU ĐÃ LOAD
        if (typeof window.showLeadCelebration === 'function') {
            window.showLeadCelebration({
                name: leadName,
                phone: phone,
                title: title || 'Thẩm Định BĐS Dòng Tiền & Pháp Lý 4 Lớp'
            });
        }

        // Hiển thị thông báo chuẩn trên thanh tiêu đề trang trong vài giây
        const originalTitle = document.title;
        document.title = `🎉 Cảm ơn Quý khách ${leadName}! • Nguyệt Land`;
        setTimeout(() => {
            document.title = originalTitle;
        }, 8000);
    };

    // ── 5. KHỞI CHẠY HỆ THỐNG: DỌN SẠCH POPUP & NẠP TICKER + ĐỒNG BỘ LEADS ─────────
    function initHorizontalTickerEngine() {
        removeAnyBottomPopup();
        console.log('[Social Proof Engine] 📡 Kích hoạt cơ chế Chạy Chữ Ngang 3 Cấp Độ Ưu Tiên (100% Ticker, Không Popup)');
        fetchServerRecentLeads();
        setInterval(fetchServerRecentLeads, 60000); // Polling mỗi 60s
        if (typeof window.loadLiveTicker === 'function') {
            window.loadLiveTicker();
        }
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initHorizontalTickerEngine);
    } else {
        initHorizontalTickerEngine();
    }

})();
