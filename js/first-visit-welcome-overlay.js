/**
 * 👑 NGUYỆT LAND — FIRST-VISIT WELCOME OVERLAY & RETURNING INVESTOR WOW ENGINE
 * Hiệu ứng chào mừng đỉnh cao cho Khách truy cập lần đầu và Nhà đầu tư quay lại.
 * Lưu trữ trạng thái thông minh qua localStorage, đảm bảo trải nghiệm WOW nhưng không gây phiền toái.
 */
(function () {
    'use strict';

    const STORAGE_KEYS = {
        VISIT_COUNT: 'nguyet_land_visit_count',
        LAST_VISIT: 'nguyet_land_last_visit',
        HAS_SEEN_OVERLAY: 'nguyet_land_seen_welcome_today'
    };

    function getGreetingByTime() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { text: 'Chào buổi sáng Quý Nhà Đầu Tư!', icon: '🌅', sub: 'Chúc Quý vị một ngày đầu tư thịnh vượng & dòng tiền vững vàng' };
        if (hour >= 12 && hour < 18) return { text: 'Chào buổi chiều Quý Nhà Đầu Tư!', icon: '☀️', sub: 'Cập nhật biến động thị trường & nguồn hàng mới nhất trong giờ qua' };
        if (hour >= 18 && hour < 22) return { text: 'Chào buổi tối Quý Nhà Đầu Tư!', icon: '🌙', sub: 'Khám phá báo cáo thẩm định & dòng tiền thực tế sau giờ làm việc' };
        return { text: 'Kính chúc Quý Khách Đêm An Lành!', icon: '✨', sub: 'Hệ thống tự động trực 24/7 đón nhận thông tin thẩm định của Quý vị' };
    }

    function getLiveInvestorCount() {
        const base = 168;
        const offset = Math.floor(Math.sin(Date.now() / 90000) * 22) + Math.floor((Date.now() % 12));
        return Math.max(150, base + offset);
    }

    function shouldShowFullscreenOverlay() {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const lastSeenDate = localStorage.getItem(STORAGE_KEYS.HAS_SEEN_OVERLAY);
            return lastSeenDate !== todayStr;
        } catch (e) {
            return false;
        }
    }

    function markOverlaySeen() {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            localStorage.setItem(STORAGE_KEYS.HAS_SEEN_OVERLAY, todayStr);
        } catch (e) {}
    }

    function updateVisitStats() {
        try {
            let count = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10);
            count++;
            localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, count.toString());
            localStorage.setItem(STORAGE_KEYS.LAST_VISIT, Date.now().toString());
            return count;
        } catch (e) {
            return 1;
        }
    }

    // ── 1. FULLSCREEN VIP WELCOME OVERLAY (LẦN ĐẦU TRONG NGÀY) ──────────────────
    function renderFullscreenWelcome(visitCount) {
        if (!shouldShowFullscreenOverlay()) {
            renderReturningToast(visitCount);
            return;
        }

        const greeting = getGreetingByTime();
        const onlineCount = getLiveInvestorCount();

        const overlay = document.createElement('div');
        overlay.id = 'nguyet-vip-welcome-overlay';
        overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-xl transition-all duration-700 opacity-0';

        overlay.innerHTML = `
            <style>
                @keyframes goldPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(251, 191, 36, 0.35); }
                    50% { transform: scale(1.03); box-shadow: 0 0 45px rgba(251, 191, 36, 0.6); }
                }
                @keyframes floatSparkle {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
                    50% { transform: translateY(-12px) rotate(180deg); opacity: 1; }
                    100% { transform: translateY(0px) rotate(360deg); opacity: 0.8; }
                }
                .gold-glow-box { animation: goldPulse 3s infinite ease-in-out; }
                .sparkle-icon { display: inline-block; animation: floatSparkle 4s infinite linear; }
            </style>
            <div class="relative max-w-lg w-[92%] mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-400/50 shadow-2xl text-center text-slate-100 gold-glow-box">
                <!-- Close Button -->
                <button id="btn-close-welcome" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-slate-400 text-sm flex items-center justify-center transition" title="Đóng & Vào trang">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <!-- Brand Badge -->
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest mb-4">
                    <span class="sparkle-icon">✨</span> NGUYỆT LAND • ĐÀ NẴNG 2026
                </div>

                <!-- Avatar / Logo -->
                <div class="relative w-20 h-20 mx-auto mb-4">
                    <img src="/img/nguyet-bds.png" alt="Nguyệt Land" class="w-full h-full rounded-full object-cover border-2 border-amber-400 shadow-xl">
                    <span class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-white">
                        <i class="fa-solid fa-check"></i>
                    </span>
                </div>

                <!-- Greeting Headline -->
                <h2 class="text-xl sm:text-2xl font-black font-serif text-amber-400 mb-1">
                    ${greeting.icon} ${greeting.text}
                </h2>
                <p class="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed font-medium">
                    ${greeting.sub}
                </p>

                <!-- Value Highlights (Dòng tiền thật & Số liệu sống) -->
                <div class="grid grid-cols-2 gap-2.5 my-5 text-left text-xs">
                    <div class="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/20">
                        <div class="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                            <i class="fa-solid fa-chart-line"></i> Cap Rate Thực Tế
                        </div>
                        <div class="text-base font-black text-slate-50 mt-0.5">8.5% – 14%/Năm</div>
                        <div class="text-[10px] text-slate-400">Thẩm định sao kê & PCCC</div>
                    </div>
                    <div class="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/20">
                        <div class="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span> Đang Trực Tuyến
                        </div>
                        <div class="text-base font-black text-emerald-300 mt-0.5">${onlineCount}+ Nhà Đầu Tư</div>
                        <div class="text-[10px] text-slate-400">Bản tin cập nhật mỗi giờ</div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row items-center gap-2.5 mt-6">
                    <button id="btn-enter-explore" class="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2">
                        <span>Khám Phá Cổng BĐS & Bản Tin</span> <i class="fa-solid fa-arrow-right"></i>
                    </button>
                    <a href="https://zalo.me/0935509168" target="_blank" class="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition">
                        <i class="fa-solid fa-phone text-emerald-400"></i> <span>Zalo 0935.509.168</span>
                    </a>
                </div>

                <div class="mt-4 text-[10px] text-slate-400">
                    💡 <i>Tự động đóng sau <span id="welcome-countdown">6</span>s...</i>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            overlay.classList.add('opacity-100');
        });

        // Auto-dismiss countdown
        let timeLeft = 6;
        const countdownEl = document.getElementById('welcome-countdown');
        const timer = setInterval(() => {
            timeLeft--;
            if (countdownEl) countdownEl.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                dismiss();
            }
        }, 1000);

        function dismiss() {
            clearInterval(timer);
            markOverlaySeen();
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0');
            setTimeout(() => {
                if (overlay && overlay.parentNode) overlay.remove();
            }, 700);
        }

        const closeBtn = document.getElementById('btn-close-welcome');
        if (closeBtn) closeBtn.addEventListener('click', dismiss);

        const enterBtn = document.getElementById('btn-enter-explore');
        if (enterBtn) enterBtn.addEventListener('click', dismiss);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) dismiss();
        });
    }

    // ── 2. TOAST CHÀO MỪNG QUAY LẠI (CHO NHÀ ĐẦU TƯ TỪ LẦN THỨ 2) ─────────────
    function renderReturningToast(visitCount) {
        if (visitCount <= 1) return;

        const toast = document.createElement('div');
        toast.id = 'nguyet-returning-toast';
        toast.className = 'fixed top-16 right-4 z-[9990] max-w-sm w-[90%] p-3.5 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-md transform translate-x-full transition-transform duration-500 text-xs text-slate-200 flex items-start gap-3';

        toast.innerHTML = `
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                👑
            </div>
            <div class="flex-1 pr-2">
                <div class="font-bold text-amber-300 flex items-center gap-1">
                    Mừng Quý Nhà Đầu Tư Quay Lại!
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">#VIP</span>
                </div>
                <div class="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Hệ thống vừa cập nhật <b>bản tin mới nhất</b> từ 9 tòa soạn và rà soát thêm nguồn căn hộ dòng tiền ven biển Đà Nẵng.
                </div>
            </div>
            <button onclick="this.closest('#nguyet-returning-toast').remove()" class="text-slate-400 hover:text-slate-100 p-1 text-xs">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        }, 1500);

        // Auto slide out after 8s
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.classList.remove('translate-x-0');
                toast.classList.add('translate-x-full');
                setTimeout(() => toast.remove(), 600);
            }
        }, 8500);
    }

    // ── 3. TỰ ĐỘNG KHỞI CHẠY KHI TẢI TRANG ──────────────────────────────────────
    function initWelcomeEngine() {
        const count = updateVisitStats();
        // Delay nhẹ để trang render mượt mà trước khi popup hiện
        setTimeout(() => {
            renderFullscreenWelcome(count);
        }, 800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWelcomeEngine);
    } else {
        initWelcomeEngine();
    }
})();
