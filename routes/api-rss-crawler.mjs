/**
 * api-rss-crawler.mjs — Realtime RSS & Official News Engine for OPC-BĐS (Nguyệt Land)
 * Crawls official Vietnam newspaper RSS feeds (VnExpress, CafeF, Báo Đầu Tư, VnEconomy, VietNamNet, Tuổi Trẻ...)
 * Generates dynamic running tickers, AI rewritten articles, and 60s short video scripts.
 */

import { upsertArticle, escapeHtml, slugify } from './api-content-db.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'p');
const ROOT_P_DIR = path.join(__dirname, '..', 'p');

if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
if (!fs.existsSync(ROOT_P_DIR)) fs.mkdirSync(ROOT_P_DIR, { recursive: true });

export const RSS_SOURCES = [
    { id: 'vnexpress', name: 'VnExpress BĐS', url: 'https://vnexpress.net/rss/bat-dong-san.rss', icon: 'fa-newspaper', color: 'text-red-400' },
    { id: 'cafef', name: 'CafeF BĐS', url: 'https://cafef.vn/bat-dong-san.rss', icon: 'fa-chart-line', color: 'text-amber-400' },
    { id: 'baodautu', name: 'Báo Đầu Tư', url: 'https://baodautu.vn/bat-dong-san.rss', icon: 'fa-briefcase', color: 'text-blue-400' },
    { id: 'vneconomy', name: 'VnEconomy', url: 'https://vneconomy.vn/bat-dong-san.rss', icon: 'fa-money-bill-trend-up', color: 'text-emerald-400' },
    { id: 'vietnamnet', name: 'VietNamNet BĐS', url: 'https://vietnamnet.vn/rss/bat-dong-san.rss', icon: 'fa-globe', color: 'text-rose-400' },
    { id: 'tuoitre', name: 'Tuổi Trẻ Kinh Doanh', url: 'https://tuoitre.vn/rss/kinh-doanh.rss', icon: 'fa-building-columns', color: 'text-cyan-400' },
    { id: 'vietstock', name: 'VietStock BĐS', url: 'https://vietstock.vn/rss/bat-dong-san.rss', icon: 'fa-arrow-trend-up', color: 'text-purple-400' }
];

let rssCache = {
    timestamp: 0,
    items: [],
    ticker: []
};

// XML/Atom RSS Parser
function parseXmlRss(xmlText, source) {
    const items = [];
    const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || xmlText.match(/<entry[\s\S]*?<\/entry>/gi) || [];

    for (const itemXml of itemMatches) {
        const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        
        // Match both RSS <link>...</link> and Atom <link href="..."/>
        let link = '';
        const linkCdataMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i);
        const linkTagMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        const linkHrefMatch = itemXml.match(/<link[^>]+href=["']([^"']+)["']/i);

        if (linkCdataMatch) link = linkCdataMatch[1];
        else if (linkTagMatch && linkTagMatch[1].trim()) link = linkTagMatch[1];
        else if (linkHrefMatch) link = linkHrefMatch[1];

        const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) 
            || itemXml.match(/<description>([\s\S]*?)<\/description>/i)
            || itemXml.match(/<summary[\s\S]*?>([\s\S]*?)<\/summary>/i);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || itemXml.match(/<published>([\s\S]*?)<\/published>/i);

        let title = (titleMatch ? titleMatch[1] : '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
        link = link.trim();
        let rawDesc = (descMatch ? descMatch[1] : '').trim();
        let pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();

        if (!title || !link) continue;

        // Extract image URL from description or enclosure or media:content
        let image = '';
        const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i) 
            || itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i)
            || itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
        if (imgMatch) {
            image = imgMatch[1];
        }

        // Clean plain text summary
        let cleanDesc = rawDesc.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').trim();

        items.push({
            title: escapeHtml(title),
            rawTitle: title,
            link,
            description: escapeHtml(cleanDesc),
            rawDescription: cleanDesc,
            image: image || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
            pubDate,
            sourceId: source.id,
            sourceName: source.name,
            sourceIcon: source.icon,
            sourceColor: source.color
        });
    }

    return items;
}

// Fetch all RSS sources with 5-minute cache
export async function fetchAllRssFeeds(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && rssCache.items.length > 0 && (now - rssCache.timestamp) < 5 * 60 * 1000) {
        return rssCache;
    }

    console.log('[RSS Engine] 📡 Fetching fresh RSS feeds from official Vietnam publishers...');
    const allItems = [];

    const fetchPromises = RSS_SOURCES.map(async (source) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            const resp = await fetch(source.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) return [];
            const text = await resp.text();
            return parseXmlRss(text, source);
        } catch (err) {
            console.warn(`[RSS Engine] Warning for ${source.name}:`, err.message);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    for (const list of results) {
        allItems.push(...list);
    }

    // Sort by publication date descending
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Curate high-impact ticker items
    const tickerItems = allItems.slice(0, 15).map(item => ({
        title: item.rawTitle || item.title,
        link: item.link,
        source: item.sourceName,
        sourceColor: item.sourceColor,
        time: formatRelativeTime(item.pubDate)
    }));

    rssCache = {
        timestamp: now,
        items: allItems,
        ticker: tickerItems
    };

    console.log(`[RSS Engine] ✅ Cached ${allItems.length} total news items, ${tickerItems.length} ticker items.`);
    return rssCache;
}

function formatRelativeTime(dateStr) {
    try {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${Math.max(1, diffMins)} phút trước`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${Math.floor(diffHours / 24)} ngày trước`;
    } catch {
        return 'Vừa xong';
    }
}

// AI Transform: Chuyển tin tức RSS thành Bài viết phân tích + Kịch bản Video 60s
export async function transformNewsWithAi({ title, description, sourceName, link }) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('Chưa cấu hình GEMINI_API_KEY trong .env');
    }

    const prompt = `Bạn là Giám đốc Nghiên cứu Thị trường & CMO của NGUYỆT LAND (Đà Nẵng) — Thương hiệu BĐS Dòng Tiền, Căn hộ dịch vụ, Homestay, Khách sạn uy tín số 1 Đà Nẵng với tôn chỉ "BĐS Thật - Giá Trị Thật - Dòng Tiền Thật (8.5% - 14%/năm)".

Hãy phân tích bản tin BĐS chính thống sau đây và tạo:
1. BÀI VIẾT PHÂN TÍCH CHUYÊN SÂU (600-800 từ) có góc nhìn bản địa Đà Nẵng, chỉ rõ cơ hội dòng tiền, rủi ro pháp lý/PCCC và giải pháp đầu tư.
2. KỊCH BẢN VIDEO NGẮN 60S (Shorts/TikTok/Reels) hấp dẫn, hook giật gân, phân tích con số, CTA liên hệ Nguyệt Land (0935.509.168).

BẢN TIN GỐC:
- Tiêu đề: ${title}
- Nguồn: ${sourceName}
- Tóm tắt: ${description}
- Link gốc: ${link}

TRẢ VỀ ĐÚNG FORMAT JSON DƯỚI ĐÂY (không bọc trong markdown codeblock khác):
{
  "article": {
    "title": "Tiêu đề bài viết SEO cực chất (chứa từ khóa BĐS Đà Nẵng, Dòng Tiền)",
    "summary": "Tóm tắt 2-3 câu ngắn gọn, nêu bật con số quan trọng nhất",
    "content": "Nội dung bài viết hoàn chỉnh gồm các đề mục: 1. Bối Cảnh Thị Trường & Dữ Liệu Báo Chí; 2. Tác Động Trực Tiếp Đến BĐS Dòng Tiền Đà Nẵng; 3. Bóc Tách Bài Toán Lợi Nhuận (Cap Rate & Cash-on-Cash); 4. Lời Khuyên Độc Quyền Từ Nguyệt Land.",
    "location": "Khu vực liên quan tại Đà Nẵng (ví dụ: An Thượng, Mỹ Khê, Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ)",
    "category": "market-news",
    "cap_rate": "9.5% - 12.8%/năm",
    "tags": ["tin-nong-bds", "da-nang", "nguyet-land", "dong-tien-2026"]
  },
  "video_script_60s": {
    "hook_0_5s": "Câu giật gân mở đầu video 0-5s giữ chân người xem",
    "problem_5_20s": "Nêu vấn đề / thực trạng sốt giá / rủi ro hoặc cơ hội",
    "solution_20_45s": "Bóc tách bài toán dòng tiền thật và số liệu thẩm định tại Đà Nẵng",
    "cta_45_60s": "Kêu gọi hành động: Nhắn Zalo 0935.509.168 hoặc truy cập bds.breaths.live",
    "visual_cues": "Hướng dẫn hình ảnh / text overlay hiện lên màn hình",
    "target_platform": "TikTok, YouTube Shorts, Facebook Reels"
  }
}`;

    const models = ['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let rawAiText = '';

    for (const model of models) {
        try {
            const resp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2500,
                            responseMimeType: "application/json"
                        }
                    })
                }
            );

            if (resp.ok) {
                const data = await resp.json();
                rawAiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (rawAiText) {
                    console.log(`[RSS AI Transform] ✅ Thành công với model ${model}`);
                    break;
                }
            } else {
                console.warn(`[RSS AI Transform] Model ${model} trả về HTTP ${resp.status}`);
            }
        } catch (e) {
            console.warn(`[RSS AI Transform] Lỗi kết nối model ${model}:`, e.message);
        }
    }

    let parsedResult = null;
    if (rawAiText) {
        try {
            parsedResult = JSON.parse(rawAiText.trim());
        } catch (_) {
            const firstBrace = rawAiText.indexOf('{');
            const lastBrace = rawAiText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                try {
                    parsedResult = JSON.parse(rawAiText.substring(firstBrace, lastBrace + 1));
                } catch (e) {
                    console.warn('[JSON Parse Substr Error]', e.message);
                }
            }
        }
    }

    if (!parsedResult) {
        parsedResult = {
            article: {
                title: title,
                summary: description,
                content: description,
                location: 'Đà Nẵng',
                category: 'market-news',
                cap_rate: '9.5% - 12.8%/năm',
                tags: ['tin-nong-bds', 'da-nang', 'nguyet-land']
            },
            video_script_60s: `[0-10s] Điểm tin BĐS Đà Nẵng: ${title}\n[10-40s] ${description}\n[40-60s] Liên hệ Nguyệt Land 0935.509.168 để nhận tư vấn dòng tiền chuẩn xác.`
        };
    }

    let articleObj = {};
    if (typeof parsedResult.article === 'string') {
        articleObj = {
            title: parsedResult.title || title,
            summary: description,
            content: parsedResult.article,
            location: 'Đà Nẵng',
            category: 'market-news',
            cap_rate: '9.5% - 12.8%/năm',
            tags: ['tin-nong-bds', 'da-nang', 'nguyet-land']
        };
    } else if (typeof parsedResult.article === 'object' && parsedResult.article !== null) {
        articleObj = {
            title: parsedResult.article.title || title,
            summary: parsedResult.article.summary || description,
            content: parsedResult.article.content || JSON.stringify(parsedResult.article),
            location: parsedResult.article.location || 'Đà Nẵng',
            category: parsedResult.article.category || 'market-news',
            cap_rate: parsedResult.article.cap_rate || '9.5% - 12.8%/năm',
            tags: parsedResult.article.tags || ['tin-nong-bds', 'da-nang', 'nguyet-land']
        };
    }

    return {
        article: articleObj,
        video_script_60s: parsedResult.video_script_60s || parsedResult.video_script || 'Kịch bản đang được chuẩn hóa.'
    };
}

// HTTP API Handlers
export function handleRssApi(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    // 1. GET /api/news/ticker
    if (pathname === '/api/news/ticker' && req.method === 'GET') {
        fetchAllRssFeeds().then(feed => {
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=120'
            });
            res.end(JSON.stringify({
                success: true,
                count: feed.ticker.length,
                updatedAt: new Date(feed.timestamp).toISOString(),
                ticker: feed.ticker
            }));
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        });
        return;
    }

    // 2. GET /api/news/rss-feed
    if (pathname === '/api/news/rss-feed' && req.method === 'GET') {
        const sourceFilter = url.searchParams.get('source');
        const limit = parseInt(url.searchParams.get('limit') || '30', 10);
        const refresh = url.searchParams.get('refresh') === '1';

        fetchAllRssFeeds(refresh).then(feed => {
            let filtered = feed.items;
            if (sourceFilter) {
                filtered = filtered.filter(item => item.sourceId === sourceFilter);
            }
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=180'
            });
            res.end(JSON.stringify({
                success: true,
                total: filtered.length,
                sources: RSS_SOURCES,
                items: filtered.slice(0, limit)
            }));
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        });
        return;
    }

    // 3. POST /api/news/ai-transform
    if (pathname === '/api/news/ai-transform' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 50000) {
                res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, message: 'Payload quá lớn' }));
                req.destroy();
            }
        });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body || '{}');
                if (!payload.title) {
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    return res.end(JSON.stringify({ success: false, message: 'Thiếu thông tin title' }));
                }

                console.log(`[RSS AI Transform] Processing: "${payload.title}" from ${payload.sourceName || 'Báo Chí'}`);
                const result = await transformNewsWithAi(payload);

                let publishedUrl = null;
                if (payload.autoPublish && result.article) {
                    const articleData = result.article;
                    const slug = slugify(articleData.title, true);
                    upsertArticle({
                        ...articleData,
                        slug,
                        source_url: payload.link || '',
                        author: 'Nguyệt Land × AI Insight',
                        status: 'published'
                    });
                    publishedUrl = `/p/${slug}.html`;
                }

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    transformed: result,
                    publishedUrl
                }));
            } catch (err) {
                console.error('[RSS AI Transform Error]', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, message: 'Endpoint không tồn tại' }));
}
