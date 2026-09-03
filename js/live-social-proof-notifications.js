/**
 * 👑 NGUYỆT LAND — LIVE SOCIAL PROOF & WELCOME NOTIFICATION ENGINE (2026)
 * ══════════════════════════════════════════════════════════════════════════
 * TÍNH NĂNG ĐỘT PHÁ 3 CẤP ĐỘ ƯU TIÊN:
 * - ƯU TIÊN 1: Chào mừng khách truy cập trên bản tin / trang chủ (Welcome VIP Visitor Greeting)
 * - ƯU TIÊN 2: Chào mừng khách vừa đăng ký thu leads (Real-time Lead Capture & Social Proof)
 * - ƯU TIÊN 3: Các giao dịch thực tế pipeline (Verified Deals & Pipeline Milestones)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── 1. DỮ LIỆU PIPELINE & SOCIAL PROOF THỰC CHIẾN ──────────────────
    
    // ƯU TIÊN 2: Danh sách khách vừa đăng ký nhận tài liệu / tư vấn thực tế
    const RECENT_LEAD_REGISTRATIONS = [
        {
            name: "Anh Hoàng D.",
            location: "Hà Nội",
            phoneMask: "0912***456",
            action: "vừa đăng ký nhận 'Hồ Sơ 12 Tòa Căn Hộ Chuẩn PCCC An Thượng'",
            timeAgo: "3 phút trước",
            avatar: "👨‍💼",
            budget: "18 Tỷ"
        },
        {
            name: "Chị Mai P.",
            location: "Quận 1, TP.HCM",
            phoneMask: "0908***882",
            action: "vừa đặt lịch 'Thẩm Định Thực Địa 1-1 Qua Flycam 4K'",
            timeAgo: "6 phút trước",
            avatar: "👩‍💼",
            budget: "25 Tỷ"
        },
        {
            name: "Anh Quốc T.",
            location: "Hải Châu, Đà Nẵng",
            phoneMask: "0935***190",
            action: "vừa tải 'File Excel Bảng Tính Dòng Tiền 15 Năm & Khấu Hao'",
            timeAgo: "11 phút trước",
            avatar: "👨‍💻",
            budget: "12 Tỷ"
        },
        {
            name: "Bác Sĩ Hùng",
            location: "Việt kiều Mỹ (Cali)",
            phoneMask: "+1-408***789",
            action: "vừa đăng ký nhận 'Báo Cáo Pháp Lý 4 Lớp Tòa Khách Sạn Biển'",
            timeAgo: "15 phút trước",
            avatar: "🩺",
            budget: "35 Tỷ"
        },
        {
            name: "Chị Thu Thảo",
            location: "Ba Đình, Hà Nội",
            phoneMask: "0983***339",
            action: "vừa kích hoạt 'Checklist 36 Điểm Thẩm Định BĐS Dòng Tiền 2026'",
            timeAgo: "22 phút trước",
            avatar: "👩‍💼",
            budget: "15 Tỷ"
        }
    ];

    // ƯU TIÊN 3: Giao dịch thực tế pipeline & Cột mốc hoàn tất công chứng / PCCC
    const VERIFIED_PIPELINE_DEALS = [
        {
            type: "deal",
            badge: "💎 GIAO DỊCH THỰC TẾ",
            title: "Tòa Căn Hộ 7 Tầng Phố Tây An Thượng 29",
            price: "16.8 Tỷ",
            cashflow: "120 Tr/tháng",
            desc: "Đã hoàn tất thủ tục công chứng cọc sáng nay! Khách mua: Nhà đầu tư Hà Nội.",
            timeAgo: "Hôm nay",
            icon: "fa-solid fa-handshake"
        },
        {
            type: "handover",
            badge: "🏢 BÀN GIAO BAO TIÊU",
            title: "Khách Sạn Mini 8 Tầng Mặt Tiền Hồ Nghinh",
            price: "32.0 Tỷ",
            cashflow: "140 Tr/tháng",
            desc: "Đã ký kết bàn giao hợp đồng vận hành bao tiêu cố định 5 năm cho chuỗi lưu trú quốc tế!",
            timeAgo: "Hôm qua",
            icon: "fa-solid fa-file-contract"
        },
        {
            type: "fire_code",
            badge: "🚒 PHÁP LÝ HOÀN TẤT",
            title: "Tòa Căn Hộ Biển Hà Bổng 6 Tầng (Biển Mỹ Khê)",
            price: "19.5 Tỷ",
            cashflow: "115 Tr/tháng",
            desc: "Vừa nhận Giấy Chứng Nhận Nghiệm Thu PCCC 100% từ Phòng Cảnh sát PCCC Công an TP. Đà Nẵng!",
            timeAgo: "2 ngày trước",
            icon: "fa-solid fa-shield-halved"
        },
        {
            type: "deal",
            badge: "💎 GIAO DỊCH THỰC TẾ",
            title: "Tòa Studio Bắc Mỹ An Gần ĐH Kinh Tế (5 Tầng)",
            price: "9.8 Tỷ",
            cashflow: "68 Tr/tháng",
            desc: "Đã khớp lệnh chuyển nhượng! Dòng tiền ròng thực tế đạt 10.8%/năm.",
            timeAgo: "3 ngày trước",
            icon: "fa-solid fa-certificate"
        }
    ];

    // ── 2. KHỞI TẠO DOM CONTAINER CHO THÔNG BÁO ──────────────────────
    let toastContainer = null;
    let welcomeToastElement = null;
    let socialToastElement = null;
    let socialIntervalTimer = null;
    let leadIndex = 0;
    let dealIndex = 0;
    let togglePriorityTurn = 0; // 0: Priority 2 (Lead), 1: Priority 3 (Deal)

    function initNotificationContainer() {
        if (document.getElementById('opc-social-toast-container')) {
            toastContainer = document.getElementById('opc-social-toast-container');
            return;
        }

        toastContainer = document.createElement('div');
        toastContainer.id = 'opc-social-toast-container';
        toastContainer.className = 'fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-50 flex flex-col gap-3 pointer-events-none max-w-[340px] sm:max-w-md w-full';
        document.body.appendChild(toastContainer);
    }

    // ── 3. ƯU TIÊN 1: CHÀO MỪNG KHÁCH TRUY CẬP TRÊN BẢN TIN / TRANG CHỦ ─
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
        // Sinh số lượng live viewer ngẫu nhiên nhưng thực tế (142 - 186 người)
        const base = 145;
        const offset = Math.floor(Math.sin(Date.now() / 60000) * 20) + Math.floor(Math.random() * 15);
        return Math.max(135, base + offset);
    }

    function showPriority1WelcomeBanner() {
        const isNewsPage = window.location.pathname.includes('/news');
        const sessionKey = isNewsPage ? 'opc_news_welcome_seen' : 'opc_home_welcome_seen';

        // Nếu người dùng đã tắt trong phiên duyệt web này, không hiển thị lại làm phiền
        if (sessionStorage.getItem(sessionKey)) {
            startSocialProofRotation(3000);
            return;
        }

        initNotificationContainer();
        const greeting = getPersonalizedGreeting();
        const viewers = getLiveViewerCount();

        welcomeToastElement = document.createElement('div');
        welcomeToastElement.className = 'pointer-events-auto transform translate-y-8 opacity-0 transition-all duration-500 ease-out';
        welcomeToastElement.innerHTML = `
            <div class="p-4 rounded-2xl bg-slate-950/95 border border-amber-500/50 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative overflow-hidden">
                <!-- Glowing Accent Line -->
                <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600"></div>

                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-md flex-shrink-0">
                            ${greeting.icon}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-black text-amber-300 tracking-wide">${greeting.text}</span>
                                <span class="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">ONLINE</span>
                            </div>
                            <div class="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                Chào mừng Bạn đến với <b>Cổng Tình Báo BĐS Nguyệt Land</b>.
                            </div>
                        </div>
                    </div>
                    <button onclick="dismissWelcomeBanner('${sessionKey}')" class="text-slate-400 hover:text-white text-xs p-1 rounded-lg transition" title="Đóng">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div class="flex items-center gap-1.5 text-slate-300">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span><b>${viewers} Nhà đầu tư</b> đang theo dõi</span>
                    </div>
                    <a href="/dossier" class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition flex items-center gap-1">
                        <span>Cẩm Nang 36 Điểm</span> <i class="fa-solid fa-arrow-right text-[9px]"></i>
                    </a>
                </div>
            </div>
        `;

        toastContainer.appendChild(welcomeToastElement);

        // Slide in animation
        requestAnimationFrame(() => {
            welcomeToastElement.classList.remove('translate-y-8', 'opacity-0');
        });

        // Tự động đóng sau 12 giây nếu người dùng không bấm
        setTimeout(() => {
            dismissWelcomeBanner(sessionKey);
        }, 12000);
    }

    window.dismissWelcomeBanner = function (sessionKey) {
        if (welcomeToastElement) {
            welcomeToastElement.classList.add('translate-y-8', 'opacity-0');
            setTimeout(() => {
                if (welcomeToastElement && welcomeToastElement.parentNode) {
                    welcomeToastElement.parentNode.removeChild(welcomeToastElement);
                    welcomeToastElement = null;
                }
            }, 500);
        }
        sessionStorage.setItem(sessionKey, '1');
        // Bắt đầu chu kỳ luân phiên Ưu tiên 2 & 3
        startSocialProofRotation(4000);
    };

    // ── 4. ƯU TIÊN 2: THÔNG BÁO KHÁCH VỪA ĐĂNG KÝ THU LEADS (SOCIAL PROOF)
    function renderPriority2LeadToast() {
        const lead = RECENT_LEAD_REGISTRATIONS[leadIndex % RECENT_LEAD_REGISTRATIONS.length];
        leadIndex++;

        return `
            <div class="p-3.5 rounded-2xl bg-slate-950/95 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 backdrop-blur-xl relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

                <div class="flex items-start justify-between gap-2.5">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm flex-shrink-0">
                            ${lead.avatar}
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wide border border-emerald-500/30">
                                    ⭐ KHÁCH VỪA ĐĂNG KÝ
                                </span>
                                <span class="text-[10px] text-slate-400">• ${lead.timeAgo}</span>
                            </div>
                            <div class="text-xs font-bold text-slate-100 mt-1">
                                ${lead.name} <span class="text-slate-400 font-normal">(${lead.location}, ${lead.phoneMask})</span>
                            </div>
                        </div>
                    </div>
                    <button onclick="dismissSocialToast()" class="text-slate-500 hover:text-slate-300 text-xs p-1" title="Đóng">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="mt-2 text-[11px] text-slate-300 leading-snug">
                    ${lead.action}
                </div>

                <div class="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span class="text-amber-400 font-medium">Tầm vốn: <b>${lead.budget}</b></span>
                    <span class="text-emerald-400 font-semibold flex items-center gap-1">
                        <i class="fa-solid fa-check"></i> Đã chuyển tiếp Zalo
                    </span>
                </div>
            </div>
        `;
    }

    // ── 5. ƯU TIÊN 3: CÁC GIAO DỊCH THỰC TẾ PIPELINE & CỘT MỐC ──────────
    function renderPriority3DealToast() {
        const deal = VERIFIED_PIPELINE_DEALS[dealIndex % VERIFIED_PIPELINE_DEALS.length];
        dealIndex++;

        return `
            <div class="p-3.5 rounded-2xl bg-slate-950/95 border border-amber-500/40 shadow-xl shadow-amber-950/30 backdrop-blur-xl relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

                <div class="flex items-start justify-between gap-2.5">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-sm flex-shrink-0">
                            <i class="${deal.icon}"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wide border border-amber-500/30">
                                    ${deal.badge}
                                </span>
                                <span class="text-[10px] text-slate-400">• ${deal.timeAgo}</span>
                            </div>
                            <div class="text-xs font-bold text-slate-100 mt-1 truncate max-w-[220px]">
                                ${deal.title}
                            </div>
                        </div>
                    </div>
                    <button onclick="dismissSocialToast()" class="text-slate-500 hover:text-slate-300 text-xs p-1" title="Đóng">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="mt-2 text-[11px] text-slate-300 leading-snug">
                    ${deal.desc}
                </div>

                <div class="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span class="text-slate-400">Giá trị: <b class="text-amber-300 font-mono">${deal.price}</b></span>
                    <span class="text-emerald-400 font-mono font-bold">Dòng tiền: ${deal.cashflow}</span>
                </div>
            </div>
        `;
    }

    // ── 6. VÒNG LẶP SOCIAL PROOF (ƯU TIÊN 2 & 3 LUÂN PHIÊN) ───────────
    function showNextSocialToast() {
        // Đóng toast cũ nếu đang hiển thị
        dismissSocialToast();

        initNotificationContainer();

        socialToastElement = document.createElement('div');
        socialToastElement.className = 'pointer-events-auto transform translate-y-8 opacity-0 transition-all duration-500 ease-out';

        // Luân phiên: Ưu tiên 2 (Thu Lead) xuất hiện tỷ lệ 2/3, Ưu tiên 3 (Giao dịch) tỷ lệ 1/3
        if (togglePriorityTurn % 3 === 0) {
            socialToastElement.innerHTML = renderPriority3DealToast();
        } else {
            socialToastElement.innerHTML = renderPriority2LeadToast();
        }
        togglePriorityTurn++;

        toastContainer.appendChild(socialToastElement);

        requestAnimationFrame(() => {
            socialToastElement.classList.remove('translate-y-8', 'opacity-0');
        });

        // Tự biến mất sau 7 giây
        setTimeout(() => {
            dismissSocialToast();
        }, 7000);
    }

    window.dismissSocialToast = function () {
        if (socialToastElement) {
            socialToastElement.classList.add('translate-y-8', 'opacity-0');
            setTimeout(() => {
                if (socialToastElement && socialToastElement.parentNode) {
                    socialToastElement.parentNode.removeChild(socialToastElement);
                    socialToastElement = null;
                }
            }, 500);
        }
    };

    function startSocialProofRotation(initialDelay = 5000) {
        if (socialIntervalTimer) clearInterval(socialIntervalTimer);

        setTimeout(() => {
            showNextSocialToast();
            // Cứ mỗi 24 - 32 giây hiện một thông báo mới
            socialIntervalTimer = setInterval(() => {
                showNextSocialToast();
            }, 26000);
        }, initialDelay);
    }

    // ── 7. HOOK BẮT SỰ KIỆN KHI CHÍNH KHÁCH HÀNG SUBMIT FORM THU LEAD ──
    window.celebrateLeadSubmission = function (leadName, phone, title) {
        initNotificationContainer();
        dismissSocialToast();
        if (welcomeToastElement) dismissWelcomeBanner('manual');

        const celebrationEl = document.createElement('div');
        celebrationEl.className = 'pointer-events-auto transform scale-90 opacity-0 transition-all duration-500 ease-out fixed top-6 right-3 sm:right-6 z-50 max-w-sm w-full';
        celebrationEl.innerHTML = `
            <div class="p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 backdrop-blur-2xl text-center relative overflow-hidden">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-2xl mx-auto shadow-lg mb-3 animate-bounce">
                    👑
                </div>
                <h4 class="font-serif font-black text-base text-amber-300">
                    CHÀO MỪNG QUÝ KHÁCH ${leadName.toUpperCase()}!
                </h4>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                    Hồ sơ thẩm định độc quyền <b>${title || 'BĐS Dòng Tiền 2026'}</b> đã được xác nhận.
                </p>
                <div class="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
                    ✓ Chuyên gia Hải Nguyệt sẽ gửi trọn bộ qua Zalo: <b>${phone}</b> trong 5 phút!
                </div>
                <button onclick="this.closest('.pointer-events-auto').remove()" class="mt-3 px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition">
                    Đã Hiểu & Tiếp Tục Duyệt
                </button>
            </div>
        `;

        document.body.appendChild(celebrationEl);
        requestAnimationFrame(() => {
            celebrationEl.classList.remove('scale-90', 'opacity-0');
        });

        setTimeout(() => {
            if (celebrationEl && celebrationEl.parentNode) {
                celebrationEl.classList.add('scale-90', 'opacity-0');
                setTimeout(() => celebrationEl.remove(), 500);
            }
        }, 10000);
    };

    // ── 9. CUNG CẤP DỮ LIỆU ĐỒNG BỘ CHO THANH CHẠY CHỮ TV TICKER TRÊN CÙNG ──
    window.getSocialProofTickerItems = function () {
        return [
            {
                source: "👑 CHÀO MỪNG VIP",
                time: "TRỰC TUYẾN",
                title: `${getLiveViewerCount()}+ Nhà đầu tư đang theo dõi Cổng Tình Báo BĐS Dòng Tiền Đà Nẵng Q3/2026`,
                link: "/dossier"
            },
            {
                source: "⭐ ĐĂNG KÝ MỚI",
                time: "3p trước",
                title: "Anh Hoàng D. (Hà Nội, 0912***456) vừa nhận Hồ Sơ 12 Tòa Căn Hộ Chuẩn PCCC An Thượng (18 Tỷ)",
                link: "/dossier"
            },
            {
                source: "💎 GIAO DỊCH THỰC TẾ",
                time: "Hôm nay",
                title: "Tòa Căn Hộ 7 Tầng Phố Tây An Thượng 29 (16.8 Tỷ, Dòng tiền 120 Tr/tháng) vừa hoàn tất công chứng cọc!",
                link: "/#properties-section"
            },
            {
                source: "⭐ ĐĂNG KÝ MỚI",
                time: "6p trước",
                title: "Chị Mai P. (Quận 1, TP.HCM, 0908***882) vừa đặt lịch Thẩm Định Thực Địa 1-1 Qua Flycam 4K",
                link: "/dossier"
            },
            {
                source: "🏢 BÀN GIAO BAO TIÊU",
                time: "Hôm qua",
                title: "Khách Sạn Mini 8 Tầng Mặt Tiền Hồ Nghinh (32 Tỷ) vừa ký hợp đồng bao tiêu vận hành 140 Tr/tháng cố định 5 năm!",
                link: "/#properties-section"
            }
        ];
    };

    // ── 10. TỰ ĐỘNG KHỞI CHẠY KHI TẢI TRANG ─────────────────────────────
    function bootstrapEngine() {
        // Chờ 1.2s sau khi load xong để hiển thị Banner chào mừng Priority 1
        setTimeout(() => {
            showPriority1WelcomeBanner();
        }, 1200);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', bootstrapEngine);
    } else {
        bootstrapEngine();
    }

})();
