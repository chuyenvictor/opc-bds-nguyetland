/**
 * js/modules/tv-news-ticker.js — TV Broadcast News Ticker (2X Speed Boost)
 * Nguyệt Land BĐS Dòng Tiền Đà Nẵng 2026 (SaaS Modular Component)
 */

(function() {
    'use strict';

    let isTickerManuallyPaused = false;

    // Curated high-yield real-time fallback ticker items
    const FALLBACK_TICKER = [
        {
            title: "Bảng giá đất Đà Nẵng 2026: Phố Tây An Thượng và Võ Nguyên Giáp dẫn đầu thanh khoản",
            source: "Báo Đầu Tư",
            time: "3p trước",
            link: "/p/bang-gia-dat-da-nang-2026"
        },
        {
            title: "5 Tiêu chuẩn nghiệm thu PCCC bắt buộc đối với tòa căn hộ dịch vụ và mini hotel Đà Nẵng",
            source: "Báo Xây Dựng",
            time: "8p trước",
            link: "/p/5-tieu-chuan-pccc"
        },
        {
            title: "Làn sóng Digital Nomad bùng nổ: Tỷ lệ lấp đầy căn hộ dịch vụ An Thượng đạt trên 92.8%",
            source: "VnExpress",
            time: "15p trước",
            link: "/p/digital-nomad-da-nang"
        },
        {
            title: "So sánh Cap Rate BĐS dòng tiền: 15 tỷ đầu tư Đà Nẵng đạt lợi nhuận ròng 10-12%/năm",
            source: "CafeF",
            time: "25p trước",
            link: "/p/so-sanh-cap-rate-da-nang"
        },
        {
            title: "Cẩm nang & Checklist 36 điểm thẩm định BĐS dòng tiền thực chiến do Nguyệt Land phát hành",
            source: "Nguyệt Land",
            time: "Vừa cập nhật",
            link: "/dossier"
        },
        {
            title: "Nghị quyết 136/2024/QH15 thúc đẩy thành lập Khu thương mại tự do Đà Nẵng tạo đòn bẩy kinh tế",
            source: "Báo Tuổi Trẻ",
            time: "40p trước",
            link: "/news"
        },
        {
            title: "Du lịch Đà Nẵng quý 3/2026 tăng trưởng mạnh, doanh thu lưu trú khách sạn ven biển vượt kỳ vọng",
            source: "Thanh Niên",
            time: "1h trước",
            link: "/news"
        }
    ];

    window.pauseTicker = function() {
        if (isTickerManuallyPaused) return;
        const el = document.getElementById('ticker-content');
        if (el) el.style.animationPlayState = 'paused';
    };

    window.resumeTicker = function() {
        if (isTickerManuallyPaused) return;
        const el = document.getElementById('ticker-content');
        if (el) el.style.animationPlayState = 'running';
    };

    window.toggleTickerPlayPause = function() {
        isTickerManuallyPaused = !isTickerManuallyPaused;
        const el = document.getElementById('ticker-content');
        const icon = document.getElementById('icon-ticker-playpause');
        if (isTickerManuallyPaused) {
            if (el) el.style.animationPlayState = 'paused';
            if (icon) icon.className = 'fa-solid fa-play text-amber-400';
        } else {
            if (el) el.style.animationPlayState = 'running';
            if (icon) icon.className = 'fa-solid fa-pause';
        }
    };

    window.applyTvBroadcastSpeed = function() {
        const tickerEl = document.getElementById('ticker-content');
        if (!tickerEl) return;
        
        const totalWidth = tickerEl.scrollWidth;
        const halfWidth = totalWidth / 2;
        
        // 2X Speed Boost: 150 px/s (Mobile) and 175 px/s (Desktop)
        const speedPxPerSec = window.innerWidth < 640 ? 150 : 175;
        const calculatedDuration = Math.max(6, halfWidth / speedPxPerSec);
        
        tickerEl.style.animationDuration = `${calculatedDuration.toFixed(1)}s`;
    };

    function renderTickerMarkup(tickerList) {
        if (!tickerList || tickerList.length === 0) return;
        const tickerEl = document.getElementById('ticker-content');
        if (!tickerEl) return;

        const itemsHtml = tickerList.map((t, idx) => {
            const badgeColor = t.badgeClass || (
                idx % 4 === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                idx % 4 === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                idx % 4 === 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            );
            const sourceLabel = t.source || 'THỜI SỰ BĐS';
            const timeLabel = t.time || 'Vừa cập nhật';

            return `
            <span class="inline-flex items-center gap-2 mx-3.5 flex-shrink-0">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${badgeColor} shadow-sm">
                    ${sourceLabel} • ${timeLabel}
                </span>
                <a href="${t.link || '#'}" class="hover:text-amber-300 text-slate-100 transition font-medium tracking-wide">
                    ${t.title}
                </a>
            </span>
            `;
        }).join(' <span class="text-amber-400/50 font-bold mx-1">✦</span> ');

        // Duplicate content for smooth infinite seamless loop
        tickerEl.innerHTML = `<div class="inline-flex items-center">${itemsHtml}</div><div class="inline-flex items-center">${itemsHtml}</div>`;
        setTimeout(window.applyTvBroadcastSpeed, 100);
    }

    window.loadLiveTicker = async function(showSpin = false) {
        const spinIcon = document.getElementById('icon-ticker-refresh');
        if (showSpin && spinIcon) spinIcon.classList.add('fa-spin');
        
        try {
            let tickerList = [];
            let updatedAt = null;

            try {
                const res = await fetch('/api/news/ticker?refresh=1');
                if (res.ok) {
                    const data = await res.json();
                    if (data.ticker && Array.isArray(data.ticker) && data.ticker.length > 0) {
                        tickerList = data.ticker;
                        updatedAt = data.updatedAt;
                    }
                }
            } catch (fetchErr) {
                console.warn('[Live Ticker API Offline, using fallback]', fetchErr);
            }

            // If API returned nothing or was offline, use curated fallback
            if (tickerList.length === 0) {
                tickerList = FALLBACK_TICKER;
            }

            if (typeof window.getSocialProofTickerItems === 'function') {
                tickerList = [...window.getSocialProofTickerItems(), ...tickerList];
            }

            renderTickerMarkup(tickerList);

            const updatedEl = document.getElementById('lbl-last-updated');
            if (updatedEl) {
                const d = updatedAt ? new Date(updatedAt) : new Date();
                updatedEl.innerText = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} (${d.getDate()}/${d.getMonth() + 1})`;
            }
        } catch (err) {
            console.warn('[Live Ticker Error]', err);
            renderTickerMarkup(FALLBACK_TICKER);
        } finally {
            if (spinIcon) setTimeout(() => spinIcon.classList.remove('fa-spin'), 600);
        }
    };

    window.addEventListener('resize', () => {
        if (typeof window.applyTvBroadcastSpeed === 'function') {
            window.applyTvBroadcastSpeed();
        }
    });

    // 🚀 Auto-execute on page load so ticker NEVER stays stuck on loading placeholder
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.loadLiveTicker();
            setInterval(window.loadLiveTicker, 60000);
        });
    } else {
        window.loadLiveTicker();
        setInterval(window.loadLiveTicker, 60000);
    }
})();
