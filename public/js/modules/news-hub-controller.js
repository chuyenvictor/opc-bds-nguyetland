/**
 * js/modules/news-hub-controller.js — Realtime News Hub & Hourly Sync Controller
 * Nguyệt Land BĐS Dòng Tiền Đà Nẵng 2026 (SaaS Modular Component)
 */

(function() {
    'use strict';

    window.startNextHourlyCountdown = function() {
        function tick() {
            const now = new Date();
            const nextHour = new Date(now);
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            const diffMs = nextHour - now;
            const mins = String(Math.floor(diffMs / 60000)).padStart(2, '0');
            const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
            const el = document.getElementById('lbl-next-hourly-countdown');
            if (el) el.innerText = `${mins}:${secs}`;
        }
        tick();
        setInterval(tick, 1000);
    };

    window.cleanSummaryText = function(raw) {
        if (!raw) return 'Phân tích chi tiết dòng tiền, Cap Rate và pháp lý quy hoạch BĐS Đà Nẵng 2026.';
        if (typeof raw === 'object') return raw.summary || JSON.stringify(raw);
        let str = String(raw).trim();
        if (str.startsWith('{') || str.includes('"article"')) {
            try {
                const parsed = JSON.parse(str);
                return parsed.article?.summary || parsed.summary || str;
            } catch (_) {}
        }
        return str.replace(/<[^>]*>?/gm, '').replace(/```json|```/g, '').trim();
    };
})();
