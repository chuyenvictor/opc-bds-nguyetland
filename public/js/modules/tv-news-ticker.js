/**
 * js/modules/tv-news-ticker.js — TV Broadcast News Ticker (2X Speed Boost)
 * Nguyệt Land BĐS Dòng Tiền Đà Nẵng 2026 (SaaS Modular Component)
 */

(function() {
    'use strict';

    let isTickerManuallyPaused = false;

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

    window.loadLiveTicker = async function(showSpin = false) {
        const spinIcon = document.getElementById('icon-ticker-refresh');
        if (showSpin && spinIcon) spinIcon.classList.add('fa-spin');
        
        try {
            const res = await fetch('/api/news/ticker?refresh=1');
            if (!res.ok) return;
            const data = await res.json();
            let tickerList = data.ticker && data.ticker.length > 0 ? data.ticker : [];
            if (typeof window.getSocialProofTickerItems === 'function') {
                tickerList = [...window.getSocialProofTickerItems(), ...tickerList];
            }
            if (tickerList.length > 0) {
                const itemsHtml = tickerList.map((t, idx) => {
                    const badgeColor = t.badgeClass || (
                        idx % 4 === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        idx % 4 === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        idx % 4 === 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    );
                    return `
                    <span class="inline-flex items-center gap-2 mx-3.5 flex-shrink-0">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${badgeColor} shadow-sm">
                            ${t.source} • ${t.time}
                        </span>
                        <a href="${t.link || '#'}" class="hover:text-amber-300 text-slate-100 transition font-medium tracking-wide">
                            ${t.title}
                        </a>
                    </span>
                    `;
                }).join(' <span class="text-amber-400/50 font-bold mx-1">✦</span> ');

                // Duplicate content for smooth infinite seamless loop
                const fullTicker = `<div class="inline-flex items-center">${itemsHtml}</div><div class="inline-flex items-center">${itemsHtml}</div>`;
                const tickerEl = document.getElementById('ticker-content');
                if (tickerEl) {
                    tickerEl.innerHTML = fullTicker;
                    setTimeout(window.applyTvBroadcastSpeed, 100);
                }
            }

            if (data.updatedAt) {
                const updatedEl = document.getElementById('lbl-last-updated');
                if (updatedEl) {
                    const d = new Date(data.updatedAt);
                    updatedEl.innerText = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} (${d.getDate()}/${d.getMonth() + 1})`;
                }
            }
        } catch (err) {
            console.warn('[Live Ticker Fetch]', err);
        } finally {
            if (spinIcon) setTimeout(() => spinIcon.classList.remove('fa-spin'), 600);
        }
    };

    window.addEventListener('resize', () => {
        if (typeof window.applyTvBroadcastSpeed === 'function') {
            window.applyTvBroadcastSpeed();
        }
    });
})();
