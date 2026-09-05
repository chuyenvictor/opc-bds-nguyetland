/**
 * js/modules/mobile-drawer.js — Mobile Navigation Drawer Component
 * Nguyệt Land BĐS Dòng Tiền Đà Nẵng 2026 (SaaS Modular Component)
 */

(function() {
    'use strict';

    window.toggleMobileDrawer = function() {
        const backdrop = document.getElementById('mobile-drawer-backdrop');
        const drawer = document.getElementById('mobile-drawer');
        if (!drawer) return;
        const isClosed = drawer.classList.contains('translate-x-full');
        if (isClosed) {
            backdrop?.classList.remove('hidden');
            setTimeout(() => backdrop?.classList.remove('opacity-0'), 10);
            drawer.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
        } else {
            drawer.classList.add('translate-x-full');
            backdrop?.classList.add('opacity-0');
            setTimeout(() => backdrop?.classList.add('hidden'), 300);
            document.body.style.overflow = '';
        }
    };
})();
