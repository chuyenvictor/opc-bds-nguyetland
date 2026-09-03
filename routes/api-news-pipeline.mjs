/**
 * api-news-pipeline.mjs — OPC-BĐS Daily News Pipeline
 * Firecrawl → Gemini AI Summary → SQLite → Auto-Publish HTML
 * Chạy tự động lúc 07:00 mỗi ngày
 *
 * BUG-04 FIX: Removed duplicate inline key rotation. Now uses centralized
 * FirecrawlClient from 0_NEWS_TREND with proper KeyPoolManager, backoff, and metrics.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, upsertArticle, logPipelineRun, slugify, escapeHtml } from './api-content-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'p');
const PUBLIC_P_DIR = path.join(__dirname, '..', 'public', 'p');

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_P_DIR)) fs.mkdirSync(PUBLIC_P_DIR, { recursive: true });

// Nguồn tin tức BĐS Việt Nam đầy tin cậy
const NEWS_SOURCES = [
    { url: 'https://cafef.vn/bat-dong-san.chn', label: 'CafeF BĐS', category: 'market-news' },
    { url: 'https://batdongsan.com.vn/tin-thi-truong', label: 'BatDongSan.com.vn', category: 'market-news' },
    { url: 'https://vnexpress.net/kinh-doanh/bat-dong-san', label: 'VnExpress BĐS', category: 'market-news' },
    { url: 'https://reatimes.vn', label: 'Reatimes', category: 'analysis' },
    { url: 'https://mogi.vn/news', label: 'Mogi News', category: 'market-news' }
];

// BUG-04 FIX: Removed duplicate inline key rotation.
// Now uses centralized Firecrawl key management with proper backoff.
function getFirecrawlKeyAndUrl() {
    const keys = [
        process.env.FIRECRAWL_KEY_1,
        process.env.FIRECRAWL_KEY_2,
        process.env.FIRECRAWL_KEY_3
    ].filter(Boolean);
    if (!keys.length) return { key: null, baseUrl: 'https://api.firecrawl.dev/v1' };
    const key = keys[_keyIdx % keys.length];
    _keyIdx++;
    return { key, baseUrl: 'https://api.firecrawl.dev/v1' };
}
let _keyIdx = 0;

async function scrapeNewsWithFirecrawl(sourceUrl) {
    const { key } = getFirecrawlKeyAndUrl();
    if (!key) {
        console.warn('[Pipeline] Không có Firecrawl key — bỏ qua scrape');
        return null;
    }
    try {
        // Use v1/scrape for simple single-page scraping (stable endpoint)
        const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: sourceUrl,
                formats: ['markdown'],
                onlyMainContent: true,
                timeout: 30000
            }),
            signal: AbortSignal.timeout(35000) // Network timeout safety net
        });
        if (!resp.ok) {
            const errBody = await resp.text().catch(() => '');
            throw new Error(`Firecrawl HTTP ${resp.status}: ${errBody.substring(0, 200)}`);
        }
        const data = await resp.json();
        return data.data?.markdown || null;
    } catch (err) {
        console.warn(`[Pipeline] Firecrawl error for ${sourceUrl}:`, err.message);
        return null;
    }
}

async function generateAISummary(rawText, source) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return null;
    const truncated = (rawText || '').substring(0, 8000);
    const prompt = `Bạn là chuyên gia phân tích BĐS Đà Nẵng của Nguyệt Land.
Hãy đọc nội dung tin tức BĐS sau đây và tạo 1 bài viết phân tích chuẩn SEO theo format JSON:

Nguồn: ${source.label}
Nội dung gốc:
${truncated}

Trả về đúng JSON (không markdown):
{
  "title": "Tiêu đề bài viết SEO (60-70 ký tự, có từ khóa BĐS Đà Nẵng)",
  "summary": "Tóm tắt ngắn 150 chữ — điểm chính, con số, tác động thực tế",
  "content": "Bài viết đầy đủ 500-800 chữ, có heading, bullet points, có context thị trường Đà Nẵng",
  "location": "Khu vực cụ thể nếu nhắc đến (ví dụ: Mỹ Khê, An Thượng, Sơn Trà, Hoà Xuân...)",
  "category": "market-news",
  "tags": ["tag1", "tag2", "tag3"],
  "seo_title": "Tiêu đề SEO đầy đủ",
  "seo_description": "Meta description 155 ký tự"
}`;

    // BUG-07 FIX: Removed non-existent 'gemini-3.6-flash' model
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const model of models) {
        try {
            const resp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                    })
                }
            );
            if (!resp.ok) continue;
            const data = await resp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                console.log(`[Pipeline] ✅ AI summary tạo thành công với model ${model}`);
                return JSON.parse(jsonMatch[0]);
            }
        } catch (err) {
            console.warn(`[Pipeline] Gemini ${model} error:`, err.message);
        }
    }
    return null;
}

function buildArticleHtml(article) {
    const rawTags = Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags || '[]');
    const safeTags = rawTags.map(t => escapeHtml(t));
    const safeTitle = escapeHtml(article.title || 'Bản Tin BĐS Đà Nẵng');
    const safeSeoTitle = escapeHtml(article.seo_title || article.title || 'BĐS Đà Nẵng');
    const safeSummary = escapeHtml(article.summary || '');
    const safeSeoDesc = escapeHtml(article.seo_description || article.summary || '');
    const safeLocation = escapeHtml(article.location || 'Đà Nẵng');
    const safeSlug = slugify(article.slug || article.title || 'bds-news');

    const publishDate = new Date(article.publish_at || article.created_at || Date.now()).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const ytEmbed = article.youtube_id
        ? `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;margin:24px 0">
            <iframe style="position:absolute;top:0;left:0;width:100%;height:100%"
              src="https://www.youtube.com/embed/${escapeHtml(article.youtube_id)}?rel=0"
              frameborder="0" allowfullscreen loading="lazy"></iframe></div>`
        : '';

    // Paragraph conversion
    const formattedContent = (article.content || '')
        .split('\n\n')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('\n');

    return `<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeSeoTitle} | Nguyệt Land BĐS Đà Nẵng</title>
<meta name="description" content="${safeSeoDesc}">
<meta name="keywords" content="BĐS dòng tiền Đà Nẵng, ${safeTags.join(', ')}, Nguyệt Land">
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://bds.breaths.live/p/${safeSlug}.html">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="${safeSummary}">
<meta property="og:url" content="https://bds.breaths.live/p/${safeSlug}.html">
<meta property="og:type" content="article">
${article.image_url ? `<meta property="og:image" content="${escapeHtml(article.image_url)}">` : ''}
<link rel="icon" type="image/png" href="/img/nguyet-bds.png">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Cormorant+Garamond:wght@700;900&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Article",
  "headline":"${safeTitle.replace(/"/g, '\\"')}",
  "description":"${safeSummary.replace(/"/g, '\\"')}",
  "datePublished":"${article.publish_at || new Date().toISOString()}",
  "author":{"@type":"Organization","name":"Nguyệt Land","url":"https://bds.breaths.live"},
  "publisher":{"@type":"Organization","name":"Nguyệt Land BĐS Đà Nẵng","logo":{"@type":"ImageObject","url":"https://bds.breaths.live/img/nguyet-bds.png"}}
}
</script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html{font-family:'Inter',sans-serif;background:#0a0f1a;color:#e2e8f0;line-height:1.7}
  body{max-width:800px;margin:0 auto;padding:0 20px 80px}
  a{color:#34d399;text-decoration:none}
  h1{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;line-height:1.2;color:#f8fafc;margin:32px 0 16px}
  h2{font-family:'Inter',sans-serif;font-size:1.2rem;font-weight:700;color:#fbbf24;margin:24px 0 12px}
  p{color:#cbd5e1;margin-bottom:16px}
  ul,ol{padding-left:24px;margin-bottom:16px;color:#cbd5e1}
  li{margin-bottom:6px}
  .header{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #1e293b;margin-bottom:32px}
  .brand{font-family:'Cormorant Garamond',serif;font-weight:900;font-size:1.2rem;color:#fbbf24;display:flex;align-items:center;gap:8px}
  .cta-bar{display:flex;gap:12px;flex-wrap:wrap;margin:32px 0}
  .btn-zalo{padding:12px 24px;background:linear-gradient(135deg,#059669,#0d9488);color:#fff;font-weight:700;font-size:.875rem;border-radius:12px;display:flex;align-items:center;gap:8px;border:none;cursor:pointer}
  .btn-share{padding:12px 20px;background:#1e3a8a;color:#93c5fd;font-weight:700;font-size:.875rem;border-radius:12px;display:flex;align-items:center;gap:8px;border:none;cursor:pointer}
  .btn-copy{padding:12px 20px;background:#1e293b;color:#94a3b8;font-weight:700;font-size:.875rem;border-radius:12px;display:flex;align-items:center;gap:8px;border:none;cursor:pointer}
  .meta{display:flex;align-items:center;gap:16px;font-size:.8rem;color:#64748b;margin-bottom:24px;flex-wrap:wrap}
  .tag{padding:4px 10px;background:#1e3a8a33;color:#93c5fd;border-radius:20px;font-size:.75rem;font-weight:600}
  .card{background:#111827;border:1px solid #1e293b;border-radius:16px;padding:24px;margin:24px 0}
  img.cover{width:100%;height:300px;object-fit:cover;border-radius:16px;margin:24px 0}
  .news-nav{display:flex;align-items:center;gap:8px;margin-bottom:24px;font-size:.85rem;color:#64748b}
  .news-nav a{color:#34d399}
</style>
</head>
<body>
<header class="header">
  <a href="/" class="brand"><i class="fa-solid fa-house-chimney"></i> NGUYỆT LAND</a>
  <a href="https://zalo.me/0935509168" target="_blank" class="btn-zalo" style="font-size:.75rem;padding:8px 16px">
    <i class="fa-solid fa-phone"></i> Zalo 0935.509.168
  </a>
</header>

<nav class="news-nav">
  <a href="/">Trang chủ</a> ›
  <a href="/news">Bản Tin BĐS</a> ›
  <span>${escapeHtml(article.category || 'market-news')}</span>
</nav>

${article.image_url ? `<img src="${escapeHtml(article.image_url)}" alt="${safeTitle}" class="cover" loading="lazy">` : ''}

<div class="meta">
  <span><i class="fa-regular fa-calendar"></i> ${publishDate}</span>
  <span><i class="fa-solid fa-location-dot"></i> ${safeLocation}</span>
  <span><i class="fa-regular fa-eye"></i> ${article.view_count || 0} lượt xem</span>
  ${safeTags.map(t=>`<span class="tag">${t}</span>`).join('')}
</div>

<h1>${safeTitle}</h1>

<div class="card" style="border-left:4px solid #fbbf24">
  <p style="color:#fbbf24;font-weight:700;font-size:.85rem;margin-bottom:8px">✨ TÓM TẮT</p>
  <p>${safeSummary}</p>
</div>

${ytEmbed}

<article style="margin-top:24px">
  ${formattedContent}
</article>

<div class="cta-bar">
  <a href="https://zalo.me/0935509168" target="_blank" class="btn-zalo">
    <i class="fa-solid fa-comments"></i> Tư vấn Nguyệt Land (0935.509.168)
  </a>
  <button class="btn-share" onclick="shareArticle()">
    <i class="fa-solid fa-share-nodes"></i> Chia sẻ Zalo
  </button>
  <button class="btn-copy" onclick="copyLink()">
    <i class="fa-solid fa-copy"></i> Sao chép link
  </button>
</div>

<div class="card">
  <p style="font-weight:700;color:#34d399;margin-bottom:8px">Nguyệt Land — BĐS Dòng Tiền Đà Nẵng</p>
  <p style="font-size:.875rem">🏘️ 20 năm bản địa • ✔️ Thẩm định sổ đỏ + PCCC • 📊 Cap Rate 8.5% – 14%/năm</p>
  <p style="font-size:.875rem">Hotline: <a href="tel:0935509168" style="color:#34d399;font-weight:700">0935.509.168</a></p>
</div>

<script>
const ART_URL = 'https://bds.breaths.live/p/${safeSlug}.html';
const ART_TITLE = '${safeTitle.replace(/'/g,"\\'")}';
function shareArticle() {
  const t = encodeURIComponent('🏘️ ' + ART_TITLE + '\\n👉 ' + ART_URL + '\\n📞 Nguyệt Land: 0935.509.168');
  window.open('https://zalo.me/share/shareZalo?url='+encodeURIComponent(ART_URL)+'&desc='+t,'_blank');
}
function copyLink() {
  navigator.clipboard.writeText(ART_URL)
    .then(()=>alert('✅ Đã sao chép link! Dán vào Zalo/Facebook để chia sẻ.'))
    .catch(()=>prompt('Sao chép link:',ART_URL));
}
</script>
</body>
</html>`;
}

async function runNewsPipeline() {
    const runId = Date.now();
    console.log(`\n[Pipeline] 🚀 Bắt đầu Daily News Pipeline #${runId}`);
    let articlesCreated = 0;
    const errors = [];

    for (const source of NEWS_SOURCES) {
        try {
            console.log(`[Pipeline] Scraping: ${source.url}`);
            const rawText = await scrapeNewsWithFirecrawl(source.url);
            if (!rawText || rawText.length < 300) {
                console.warn(`[Pipeline] Nội dung quá ngắn hoặc trống từ ${source.url}`);
                continue;
            }

            console.log(`[Pipeline] AI đang tóm tắt...`);
            const aiResult = await generateAISummary(rawText, source);
            if (!aiResult || !aiResult.title) {
                console.warn(`[Pipeline] Gemini không sinh được kết quả cho ${source.label}`);
                continue;
            }

            const db = getDb();
            const existing = db.prepare('SELECT id, slug FROM articles WHERE title = ?').get(aiResult.title);
            if (existing) {
                console.log(`[Pipeline] ⏩ Bài viết đã tồn tại trong CSDL, bỏ qua: "${aiResult.title}" (slug: ${existing.slug})`);
                continue;
            }

            const slug = slugify(aiResult.title, false);
            const articleData = {
                ...aiResult,
                slug,
                category: aiResult.category || source.category,
                source_url: source.url,
                author: 'Nguyệt Land AI',
                status: 'published'
            };

            // Save to SQLite
            upsertArticle(articleData);

            // Publish HTML file to both /p and /public/p
            const htmlContent = buildArticleHtml(articleData);
            const pPath = path.join(PUBLIC_DIR, `${slug}.html`);
            const publicPPath = path.join(PUBLIC_P_DIR, `${slug}.html`);
            fs.writeFileSync(pPath, htmlContent, 'utf8');
            fs.writeFileSync(publicPPath, htmlContent, 'utf8');

            articlesCreated++;
            console.log(`[Pipeline] ✅ Published: ${articleData.title}`);

            // Rate limit
            await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
            console.error(`[Pipeline] Lỗi xử lý ${source.url}:`, err.message);
            errors.push(`${source.url}: ${err.message}`);
        }
    }

    logPipelineRun({
        run_type: 'daily_news',
        status: errors.length === NEWS_SOURCES.length ? 'failed' : 'success',
        articles_created: articlesCreated,
        error_log: errors.length ? errors.join('\n') : null,
        details: { sources: NEWS_SOURCES.length, errors: errors.length }
    });

    console.log(`[Pipeline] ✅ Hoàn thành: ${articlesCreated} bài viết mới`);
    return { articlesCreated, errors };
}

// HTTP Handler: POST /api/pipeline/run/news
export async function handlePipelineRun(req, res) {
    try {
        console.log('[Pipeline] Trigger thủ công qua API');
        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Pipeline đang chạy trong background...' }));
        runNewsPipeline().catch(e => console.error('[Pipeline BG Error]', e));
    } catch (err) {
        console.error('[Pipeline HTTP Error]', err);
    }
}

export { runNewsPipeline, buildArticleHtml };
