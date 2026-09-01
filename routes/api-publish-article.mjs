import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { upsertArticle } from './api-content-db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'p');
const ROOT_P_DIR = path.join(__dirname, '..', 'p');

if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
if (!fs.existsSync(ROOT_P_DIR)) fs.mkdirSync(ROOT_P_DIR, { recursive: true });

function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export async function handlePublishArticle(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        try {
            const article = JSON.parse(body || '{}');
            const title = article.title || 'Tài Sản BĐS Dòng Tiền Đà Nẵng';
            const slug = slugify(title) + '-' + Date.now().toString().slice(-4);
            const fileName = `${slug}.html`;
            const filePath = path.join(ARTICLES_DIR, fileName);
            const rootFilePath = path.join(ROOT_P_DIR, fileName);

            const htmlContent = `<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Nguyệt Land BĐS Dòng Tiền Đà Nẵng</title>
    <meta name="description" content="${article.summary || title + ' - Thẩm định bởi Nguyệt Land. Giá: ' + (article.price || 'Thương lượng') + ', Dòng tiền: ' + (article.monthlyRevenue || 'Cao')}">
    <meta name="keywords" content="BĐS dòng tiền Đà Nẵng, ${title}, căn hộ dịch vụ Đà Nẵng, Nguyệt Land">
    <meta name="author" content="Nguyệt Land × Victor AI">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="https://bds.breaths.live/p/${fileName}">

    <!-- Open Graph Meta Tags -->
    <meta property="og:locale" content="vi_VN">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="NGUYỆT LAND — BĐS Dòng Tiền Đà Nẵng">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="Giá: ${article.price || 'Thương lượng'} | Dòng tiền: ${article.monthlyRevenue || 'Cao'} | Cap Rate: ${article.capRate || '9.2%'}">
    <meta property="og:image" content="${article.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'}">
    <meta property="og:url" content="https://bds.breaths.live/p/${fileName}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="Giá: ${article.price || 'Thương lượng'} | Dòng tiền: ${article.monthlyRevenue || 'Cao'} | Cap Rate: ${article.capRate || '9.2%'}">
    <meta name="twitter:image" content="${article.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'}">

    <!-- Schema.org Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": "${title}",
      "description": "${article.summary || title}",
      "url": "https://bds.breaths.live/p/${fileName}",
      "image": "${article.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'}",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "VND",
        "price": "${article.price || 'Thương lượng'}",
        "availability": "https://schema.org/InStock",
        "validFrom": "${new Date().toISOString()}"
      },
      "author": {
        "@type": "Person",
        "name": "Nguyệt Land",
        "telephone": "+84935509168",
        "url": "https://bds.breaths.live"
      }
    }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Be Vietnam Pro', sans-serif; background: #090d16; color: #f1f5f9; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(245, 158, 11, 0.2); }
    </style>
</head>
<body class="min-h-screen flex flex-col antialiased">
    <header class="p-4 border-b border-amber-500/20 bg-slate-900/90 flex justify-between items-center max-w-5xl mx-auto w-full sticky top-0 z-50">
        <a href="/" class="flex items-center gap-3">
            <img src="/img/nguyet-bds.png" alt="Nguyệt Land" class="w-10 h-10 rounded-full border border-amber-400 object-cover" />
            <div>
                <p class="font-serif font-bold text-amber-300 text-base">NGUYỆT LAND</p>
                <p class="text-[10px] text-slate-400">BĐS Dòng Tiền Đà Nẵng</p>
            </div>
        </a>
        <a href="https://zalo.me/0935509168" target="_blank" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl text-white shadow-lg flex items-center gap-2">
            <i class="fa-solid fa-phone"></i> Zalo / Hotline: 0935.509.168
        </a>
    </header>

    <main class="max-w-4xl mx-auto w-full p-6 space-y-6 flex-1">
        <div class="relative h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <img src="${article.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'}" alt="${title}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6">
                <span class="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[11px] rounded-full uppercase">
                    ⭐ ĐÃ THẨM ĐỊNH SỔ ĐỎ & DÒNG TIỀN
                </span>
                <h1 class="font-serif font-black text-2xl lg:text-4xl text-slate-50 mt-2">${title}</h1>
                <p class="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                    <i class="fa-solid fa-location-dot text-amber-400"></i> ${article.location || 'Đà Nẵng'}
                </p>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
            <div class="glass-card p-4 rounded-2xl border-l-4 border-amber-500">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Giá Bán</span>
                <p class="text-lg font-black text-amber-400 font-serif">${article.price || 'N/A'}</p>
            </div>
            <div class="glass-card p-4 rounded-2xl border-l-4 border-emerald-500">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Dòng Tiền / Tháng</span>
                <p class="text-lg font-black text-emerald-400 font-serif">${article.monthlyRevenue || 'N/A'}</p>
            </div>
            <div class="glass-card p-4 rounded-2xl border-l-4 border-cyan-500">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Net Cap Rate</span>
                <p class="text-lg font-black text-cyan-300 font-serif">${article.capRate || '9.2%'}</p>
            </div>
        </div>

        <article class="glass-card p-6 lg:p-8 rounded-3xl space-y-4 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
            ${article.content || 'Nội dung phân tích chi tiết đang được cập nhật.'}
        </article>

        <div class="glass-card p-6 rounded-3xl text-center space-y-4 border border-emerald-500/30">
            <h3 class="font-serif font-bold text-xl text-amber-300">Đặt Lịch Khảo Sát Thực Tế Cùng Nguyệt Land</h3>
            <p class="text-xs text-slate-300">Xem trực tiếp sổ đỏ gốc, bảng kê doanh thu 12 tháng gần nhất và thẩm định PCCC.</p>
            <div class="flex flex-wrap justify-center gap-3">
                <a href="https://zalo.me/0935509168" target="_blank" onclick="gtag('event','click_zalo_cta',{event_category:'OPC-BDS',property:'${title}'})"
                   class="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2">
                    <i class="fa-solid fa-comments"></i> Chat Zalo Trực Tiếp (0935.509.168)
                </a>
                <button onclick="shareToZaloArticle()" class="px-5 py-3 bg-blue-600/80 hover:bg-blue-500/80 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-blue-500/40">
                    <i class="fa-solid fa-share-nodes"></i> Chia Sẻ Zalo
                </button>
                <button onclick="copyArticleLink()" class="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2">
                    <i class="fa-solid fa-copy"></i> Sao Chép Link
                </button>
            </div>
        </div>
    </main>

    <footer class="p-6 border-t border-slate-800 text-center text-xs text-slate-400">
        © 2026 NGUYỆT LAND — BĐS DÒNG TIỀN ĐÀ NẴNG. Hotline: 0935.509.168
    </footer>

    <script>
        const ARTICLE_TITLE = '${title}';
        const ARTICLE_URL = 'https://bds.breaths.live/p/${fileName}';

        function shareToZaloArticle() {
            const text = encodeURIComponent('🏡 ' + ARTICLE_TITLE + '\\n👉 ' + ARTICLE_URL + '\\n📞 Nguyệt Land: 0935.509.168');
            window.open('https://zalo.me/share/shareZalo?url=' + encodeURIComponent(ARTICLE_URL) + '&desc=' + text, '_blank');
            if (typeof gtag === 'function') gtag('event', 'share_article', { method: 'zalo', property: ARTICLE_TITLE });
        }

        function copyArticleLink() {
            navigator.clipboard.writeText(ARTICLE_URL).then(() => {
                alert('✅ Đã sao chép link bài viết!\\nDán vào Zalo, Facebook hoặc tin nhắn để chia sẻ.');
                if (typeof gtag === 'function') gtag('event', 'share_article', { method: 'copy_link', property: ARTICLE_TITLE });
            }).catch(() => {
                prompt('Sao chép link này:', ARTICLE_URL);
            });
        }
    </script>
</body>
</html>`;

            fs.writeFileSync(filePath, htmlContent, 'utf8');
            fs.writeFileSync(rootFilePath, htmlContent, 'utf8');
            console.log(`[Publisher] Created public article: ${filePath}`);

            // Also save to SQLite Database
            try {
                upsertArticle({
                    slug,
                    title,
                    summary: article.summary || '',
                    content: article.content || '',
                    location: article.location || 'Đà Nẵng',
                    price: article.price || null,
                    cap_rate: article.capRate || null,
                    monthly_revenue: article.monthlyRevenue || null,
                    image_url: article.image || null,
                    category: 'cashflow',
                    tags: ['bds-dong-tien', 'da-nang', 'nguyet-land'],
                    status: 'published'
                });
            } catch (dbErr) {
                console.warn('[Publisher SQLite Sync Warning]', dbErr.message);
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                slug: slug,
                url: `/p/${fileName}`,
                fullUrl: `http://localhost:8088/p/${fileName}`,
                publicDomainUrl: `https://bds.breaths.live/p/${fileName}`,
                message: 'Đã xuất bản bài viết thành công lên hệ thống!'
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    });
}
