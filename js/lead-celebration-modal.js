/**
 * 👑 NGUYỆT LAND — LEAD SUBMISSION CELEBRATION & VIP ONBOARDING WOW ENGINE
 * Kích hoạt màn hình vinh danh VIP + Bắn pháo hoa Confetti Canvas mượt mà 60fps
 * khi Khách hàng / Nhà đầu tư gửi form thành công.
 */
(function () {
    'use strict';

    // ── 1. LIGHTWEIGHT NATIVE CONFETTI PARTICLES ENGINE (NO EXTERNAL LIBS) ────
    function launchConfetti(durationMs = 4000) {
        const canvas = document.createElement('canvas');
        canvas.id = 'vip-confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '99998';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const colors = ['#fbbf24', '#f59e0b', '#10b981', '#34d399', '#38bdf8', '#f43f5e', '#ffffff'];
        const particles = [];
        const count = 120;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: width * 0.5 + (Math.random() - 0.5) * 200,
                y: height * 0.4 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 18,
                vy: (Math.random() - 0.7) * 16 - 4,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 10,
                gravity: 0.35,
                drag: 0.98,
                opacity: 1
            });
        }

        const startTime = Date.now();
        function frame() {
            const elapsed = Date.now() - startTime;
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.vx *= p.drag;
                p.vy *= p.drag;
                p.vy += p.gravity;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.vRot;

                if (elapsed > durationMs - 1000) {
                    p.opacity = Math.max(0, 1 - (elapsed - (durationMs - 1000)) / 1000);
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            });

            if (elapsed < durationMs) {
                requestAnimationFrame(frame);
            } else {
                canvas.remove();
            }
        }
        requestAnimationFrame(frame);
    }

    // ── 2. CELEBRATION MODAL MODAL WINDOW ────────────────────────────────────
    window.showLeadCelebration = function (leadData = {}) {
        const leadName = leadData.name || leadData.fullName || 'Quý Nhà Đầu Tư';
        const phone = leadData.phone || '';
        const intent = leadData.title || leadData.interest || 'Thẩm Định BĐS Dòng Tiền & Pháp Lý';
        const maskedPhone = phone.replace(/(\d{3,4})\d{3,4}(\d{3})/, '$1***$2') || 'Bảo mật Zalo';
        const vipCode = 'VIP-' + Math.floor(1000 + Math.random() * 9000);

        // Bắn pháo hoa Confetti
        launchConfetti(4500);

        // Tạo Modal
        const modal = document.createElement('div');
        modal.id = 'vip-celebration-modal';
        modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 transition-all duration-500 opacity-0';

        modal.innerHTML = `
            <style>
                @keyframes badgeFloat {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-8px) scale(1.05); }
                }
                .vip-badge-anim { animation: badgeFloat 2.5s infinite ease-in-out; }
            </style>
            <div class="relative max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400 shadow-2xl text-center text-slate-100">
                <!-- Close Button -->
                <button id="btn-close-celebration" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-slate-300 text-sm flex items-center justify-center transition" title="Đóng">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <!-- Floating VIP Trophy Badge -->
                <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl shadow-xl vip-badge-anim mb-4">
                    🏆
                </div>

                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider mb-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> KÍCH HOẠT QUYỀN ƯU TIÊN VIP
                </div>

                <h2 class="text-xl sm:text-2xl font-black font-serif text-slate-50 mb-1 leading-snug">
                    Chúc Mừng Quý Khách <span class="text-amber-400">${leadName.toUpperCase()}</span>!
                </h2>
                <p class="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed font-medium">
                    Hệ thống đã chuyển giao yêu cầu <b>"${intent}"</b> trực tiếp tới Chuyên Gia Nguyệt Land.
                </p>

                <!-- Priority Card Info -->
                <div class="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-xs text-left space-y-2.5 my-4">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-400">Mã Hồ Sơ Thẩm Định:</span>
                        <span class="font-mono font-black text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30">${vipCode}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-400">Số Điện Thoại Xác Nhận:</span>
                        <span class="font-bold text-slate-200">${maskedPhone}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-400">Cam Kết Thời Gian Phản Hồi:</span>
                        <span class="font-bold text-emerald-400 flex items-center gap-1">
                            <i class="fa-regular fa-clock"></i> <span id="celeb-countdown">05:00</span>
                        </span>
                    </div>
                </div>

                <!-- Call to Action -->
                <div class="space-y-2.5 mt-5">
                    <a href="https://zalo.me/0935509168" target="_blank" class="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]">
                        <i class="fa-solid fa-comments text-base"></i>
                        <span>Nhắn Zalo Nguyệt Land Ngay (Ưu Tiên 1-1)</span>
                    </a>
                    <button id="btn-continue-explore" class="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700">
                        Tiếp Tục Xem Kho BĐS Dòng Tiền & Bản Tin
                    </button>
                </div>

                <div class="mt-4 text-[10px] text-slate-400">
                    🔒 <i>Thông tin được bảo mật 100% theo tiêu chuẩn thẩm định độc quyền Nguyệt Land.</i>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
        });

        // 5-minute countdown display (counting down)
        let totalSeconds = 300;
        const countdownEl = document.getElementById('celeb-countdown');
        const countInterval = setInterval(() => {
            totalSeconds--;
            if (totalSeconds <= 0) {
                clearInterval(countInterval);
                return;
            }
            const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
            const secs = String(totalSeconds % 60).padStart(2, '0');
            if (countdownEl) countdownEl.innerText = `${mins}:${secs}`;
        }, 1000);

        function dismissModal() {
            clearInterval(countInterval);
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            setTimeout(() => {
                if (modal && modal.parentNode) modal.remove();
            }, 500);
        }

        const closeBtn = document.getElementById('btn-close-celebration');
        if (closeBtn) closeBtn.addEventListener('click', dismissModal);

        const continueBtn = document.getElementById('btn-continue-explore');
        if (continueBtn) continueBtn.addEventListener('click', dismissModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) dismissModal();
        });
    };
})();
