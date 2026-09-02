/**
 * Nguyệt Land VIP - PWA Install & Offline Experience Engine 2026
 */
(function () {
  let deferredPrompt = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[Nguyet Land PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Nguyet Land PWA] Service Worker registration failed:', err);
        });
    });
  }

  // If already installed as app, skip showing install banner
  if (isStandalone) {
    console.log('[Nguyet Land PWA] Running in standalone PWA mode');
    return;
  }

  // 2. Capture Android / Chrome install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[Nguyet Land PWA] Capture beforeinstallprompt event');
    
    // Show VIP Install Banner after 3 seconds if not dismissed
    const dismissed = localStorage.getItem('nguyet_pwa_dismissed');
    if (!dismissed) {
      setTimeout(showPwaInstallBanner, 3000);
    }
  });

  // 3. Render Floating PWA Install Banner
  function showPwaInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-20 md:bottom-6 right-3 md:right-6 z-50 max-w-sm w-[calc(100%-24px)] md:w-auto glass-gold border border-amber-500/50 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl animate-bounce-short transition-all duration-300';
    
    banner.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 flex-shrink-0 shadow-lg">
          <img src="/img/nguyet-bds.png" alt="Nguyệt Land App" class="w-full h-full rounded-[10px] object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <h4 class="font-sans font-black text-xs text-amber-300 flex items-center gap-1.5">
              <span>Cài Đặt App Nguyệt Land</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">VIP</span>
            </h4>
            <button onclick="dismissPwaBanner()" class="text-slate-400 hover:text-white text-xs p-0.5" title="Đóng">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <p class="text-[11px] text-slate-300 mt-1 leading-snug">
            Mở nhanh giỏ hàng & tính dòng tiền trực tiếp từ màn hình chính điện thoại.
          </p>
          <div class="mt-2.5 flex items-center gap-2">
            <button onclick="triggerPwaInstall()" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-[11px] flex items-center gap-1.5 shadow-md active:scale-95 transition">
              <i class="fa-solid fa-mobile-screen-button"></i> <span>Cài Đặt 1-Chạm</span>
            </button>
            <button onclick="dismissPwaBanner()" class="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 text-[11px] font-semibold transition">
              Để sau
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
  }

  // 4. Trigger Install Action
  window.triggerPwaInstall = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[Nguyet Land PWA] User accepted install prompt');
        }
        deferredPrompt = null;
        dismissPwaBanner();
      });
    } else if (isIOS) {
      alert('📱 HƯỚNG DẪN CÀI ĐẶT TRÊN IPHONE (iOS):\n\n1. Nhấn vào biểu tượng "Chia sẻ" (nút vuông mũi tên lên ở dưới đáy Safari)\n2. Cuộn xuống và chọn "Thêm vào Màn hình chính" (Add to Home Screen)\n3. Nhấn "Thêm" (Add) ở góc trên bên phải để hoàn tất!');
    } else {
      alert('💡 Bạn có thể cài đặt ứng dụng bằng cách nhấn vào menu 3 chấm trên trình duyệt và chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".');
    }
  };

  // 5. Dismiss Banner
  window.dismissPwaBanner = function () {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(() => banner.remove(), 300);
    }
    localStorage.setItem('nguyet_pwa_dismissed', '1');
  };

  // If iOS and not dismissed, show iOS tip banner after 4 seconds on mobile
  if (isIOS && !isStandalone && window.innerWidth < 768) {
    const dismissed = localStorage.getItem('nguyet_pwa_dismissed');
    if (!dismissed) {
      setTimeout(showPwaInstallBanner, 4000);
    }
  }
})();
