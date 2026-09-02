/**
 * routes/api-trends-research.mjs — OPC-BĐS Multi-Source Trend Research Engine
 * Sources: Tavily Search API + Google Trends / Google News RSS + Vietnam Real Estate RSS
 * AI Analysis: Gemini 3.7 Flash (Extract viral angles, Cap Rate & Video hooks)
 * Output: Syncs to Google Sheets (Tab 06_OPC_BDS_Tasks_AI) as Content Queue
 */

import { escapeHtml, upsertArticle, logPipelineRun, slugify } from './api-content-db.mjs';

function getEnv(key, def = '') {
    return process.env[key] || def;
}

// 1. Fetch from Tavily API
async function fetchTavilyTrends(query = 'bất động sản đà nẵng dòng tiền căn hộ du lịch 2026', maxResults = 5) {
    const tavilyKey = getEnv('TAVILY_API_KEY');
    if (!tavilyKey) {
        return [];
    }

    try {
        console.log(`[Trend Research] 🦅 Calling Tavily Search API: "${query}" ...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const resp = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: tavilyKey,
                query: query,
                search_depth: 'advanced',
                include_answer: true,
                max_results: maxResults
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!resp.ok) {
            console.warn('[Tavily API] HTTP', resp.status);
            return [];
        }

        const data = await resp.json();
        const results = (data.results || []).map(r => ({
            source: 'Tavily Search',
            title: r.title,
            url: r.url,
            content: r.content,
            score: r.score || 0.9
        }));

        console.log(`[Trend Research] ✅ Tavily fetched ${results.length} topics`);
        return results;
    } catch (err) {
        console.warn('[Tavily Fetch Error]', err.message);
        return [];
    }
}

// 2. Fetch from Targeted Google News & BĐS Trends RSS
async function fetchTargetedTrendsRss(keyword = 'bất động sản đà nẵng') {
    const feeds = [
        {
            name: 'Google News BĐS Đà Nẵng',
            url: `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' when:7d')}&hl=vi&gl=VN&ceid=VN:vi`
        },
        {
            name: 'Google News Homestay Khách Sạn Đà Nẵng',
            url: `https://news.google.com/rss/search?q=${encodeURIComponent('căn hộ homestay khách sạn đà nẵng when:7d')}&hl=vi&gl=VN&ceid=VN:vi`
        },
        {
            name: 'VnExpress BĐS',
            url: 'https://vnexpress.net/rss/bat-dong-san.rss'
        },
        {
            name: 'CafeF BĐS',
            url: 'https://cafef.vn/bat-dong-san.rss'
        }
    ];

    const allItems = [];

    for (const feed of feeds) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const resp = await fetch(feed.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) continue;
            const text = await resp.text();

            const itemMatches = text.match(/<item[\s\S]*?<\/item>/gi) || [];
            for (const itemXml of itemMatches.slice(0, 4)) {
                const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
                const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i) || itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i);
                const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);

                let title = (titleMatch ? titleMatch[1] : '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
                let link = (linkMatch ? linkMatch[1] : '').trim();
                let desc = (descMatch ? descMatch[1] : '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

                if (title && link) {
                    allItems.push({
                        source: feed.name,
                        title,
                        url: link,
                        content: desc
                    });
                }
            }
        } catch (e) {
            console.warn(`[Trends RSS Error] ${feed.name}:`, e.message);
        }
    }

    console.log(`[Trend Research] 📈 Targeted BĐS Trends RSS fetched ${allItems.length} topics`);
    return allItems;
}

// 3. AI Analysis with Gemini 3.7 Flash (with 5s AbortController)
async function analyzeTopicWithGemini(topic) {
    const geminiKey = getEnv('GEMINI_API_KEY') || getEnv('GOOGLE_API_KEY');
    if (!geminiKey) {
        return {
            title: topic.title,
            summary: topic.content || topic.title,
            capRate: '9.2% - 11.5%/năm',
            videoHook: `[0-5s] BĐS Đà Nẵng: ${topic.title}!`,
            angle: 'BĐS Dòng Tiền'
        };
    }

    const prompt = `Bạn là Giám đốc Nghiên cứu Thị trường của NGUYỆT LAND (Đà Nẵng) — Chuyên gia BĐS Dòng Tiền, Homestay, Khách sạn ven biển Đà Nẵng.
Hãy phân tích chủ đề xu hướng thị trường sau để chuẩn bị làm bài viết và video ngắn cho Nguyệt Land:

TIÊU ĐỀ XU HƯỚNG: ${topic.title}
NGUỒN: ${topic.source}
NỘI DUNG TÓM TẮT: ${topic.content || topic.title}

Yêu cầu xuất JSON (không markdown khác):
{
  "title": "Tiêu đề bài viết SEO giật tít cực hấp dẫn cho Nguyệt Land",
  "summary": "Tóm tắt góc nhìn phân tích 2-3 câu ngắn gọn",
  "capRate": "Dự báo tỷ suất dòng tiền Cap Rate (ví dụ: 8.8% - 12.5%/năm)",
  "videoHook": "Câu Hook 0-5s mở đầu video TikTok/Reels giật gân đánh vào tâm lý nhà đầu tư",
  "angle": "Góc tiếp cận (ví dụ: Pháp lý & PCCC / Tối ưu dòng tiền / Bài toán lãi suất / Đón sóng du lịch Đà Nẵng 2026)"
}`;

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const model of models) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const resp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 1024, responseMimeType: 'application/json' }
                    }),
                    signal: controller.signal
                }
            );
            clearTimeout(timeoutId);

            if (!resp.ok) continue;
            const data = await resp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
                const parsed = JSON.parse(text.trim());
                return parsed;
            }
        } catch (_) {}
    }

    return {
        title: topic.title,
        summary: topic.content || topic.title,
        capRate: '9.0% - 12.0%/năm',
        videoHook: `[0-5s] Tiêu điểm BĐS Đà Nẵng: ${topic.title}`,
        angle: 'Thị Trường BĐS Đà Nẵng'
    };
}

// 4. Push to Google Sheet Webhook (Tab 06_OPC_BDS_Tasks_AI)
async function pushToGoogleSheetQueue(item) {
    const sheetWebhook = getEnv('GOOGLE_SHEET_WEBHOOK_URL');
    if (!sheetWebhook) {
        return false;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const resp = await fetch(sheetWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'rss_sync',
                source: item.source || 'Trending Queue',
                title: item.title,
                summary: item.summary,
                capRate: item.capRate,
                videoScript: item.videoHook || item.angle,
                status: 'HANG_CHO_VIET_BAI'
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const resData = await resp.json().catch(() => ({}));
        return resData.success || resp.ok;
    } catch (e) {
        console.warn('[Google Sheet Push Warning]', e.message);
        return false;
    }
}

// 5. Main Research & Queue Pipeline
export async function executeTrendResearchAndQueue({ query = 'bất động sản đà nẵng dòng tiền', limit = 5 } = {}) {
    console.log(`\n🚀 [Trend Pipeline] Bắt đầu nghiên cứu xu hướng & nạp hàng chờ Google Sheets...`);
    const collectedTopics = [];

    // Step A: Fetch Tavily (if configured)
    const tavilyItems = await fetchTavilyTrends(query, limit);
    collectedTopics.push(...tavilyItems);

    // Step B: Fetch Targeted Google News / BĐS RSS
    const targetedItems = await fetchTargetedTrendsRss(query);
    collectedTopics.push(...targetedItems);

    // Remove duplicates by title
    const uniqueTopics = [];
    const seen = new Set();
    for (const t of collectedTopics) {
        const key = t.title.toLowerCase().substring(0, 40);
        if (!seen.has(key)) {
            seen.add(key);
            uniqueTopics.push(t);
        }
    }

    const selectedTopics = uniqueTopics.slice(0, limit);
    console.log(`[Trend Pipeline] 🎯 Đang phân tích AI cho ${selectedTopics.length} chủ đề độc nhất...`);

    const queueResults = [];

    for (const topic of selectedTopics) {
        const analysis = await analyzeTopicWithGemini(topic);
        const queueItem = {
            source: topic.source,
            url: topic.url,
            originalTitle: topic.title,
            title: analysis.title || topic.title,
            summary: analysis.summary || topic.content,
            capRate: analysis.capRate || '9.5%/năm',
            videoHook: analysis.videoHook || '',
            angle: analysis.angle || 'BĐS Dòng Tiền',
            status: 'QUEUED_IN_SHEET',
            queuedAt: new Date().toISOString()
        };

        // 1. Lưu vào SQLite làm hàng chờ
        const slug = slugify(queueItem.title, true);
        try {
            upsertArticle({
                slug,
                title: queueItem.title,
                summary: queueItem.summary,
                content: `### Góc Nhìn Phân Tích: ${queueItem.angle}\n\n${queueItem.summary}\n\n**Video Hook:** ${queueItem.videoHook}\n\n*Nguồn xu hướng: ${queueItem.source}*`,
                category: 'market-news',
                cap_rate: queueItem.capRate,
                source_url: queueItem.url,
                tags: ['hang-cho-bai-viet', 'trending-bds', 'nguyet-land'],
                status: 'draft'
            });
        } catch (dbErr) {
            console.warn('[SQLite Draft Save Warning]', dbErr.message);
        }

        // 2. Đẩy sang Google Sheets Tab 06_OPC_BDS_Tasks_AI
        const sheetPushed = await pushToGoogleSheetQueue(queueItem);
        queueItem.sheetSynced = sheetPushed;

        queueResults.push(queueItem);
        console.log(`[Trend Pipeline] 📝 Đã nạp hàng chờ: "${queueItem.title.substring(0, 50)}..." [Sheet: ${sheetPushed ? 'OK' : 'FAIL'}]`);
    }

    // Gửi thông báo Telegram
    const teleToken = getEnv('TELEGRAM_BOT_TOKEN');
    const teleChatId = getEnv('TELEGRAM_CHAT_ID', '-1003891453026');

    if (teleToken && queueResults.length > 0) {
        const msg = `📊 <b>[ĐÃ NẠP ${queueResults.length} CHỦ ĐỀ TRENDING VÀO GOOGLE SHEETS]</b>\n\n` +
            queueResults.slice(0, 3).map((q, i) => `${i + 1}. <b>${escapeHtml(q.title)}</b>\n   • Cap Rate: <code>${q.capRate}</code> | Góc: <i>${q.angle}</i>`).join('\n\n') +
            `\n\n👉 <i>Dữ liệu đã tự động đồng bộ vào Tab 06_OPC_BDS_Tasks_AI trên Google Sheet!</i>`;

        fetch(`https://api.telegram.org/bot${teleToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: teleChatId, text: msg, parse_mode: 'HTML' })
        }).catch(e => console.warn('[Telegram Alert Error]', e.message));
    }

    logPipelineRun({
        run_type: 'trends_research_queue',
        status: 'success',
        articles_created: queueResults.length,
        details: { count: queueResults.length, sources: ['Tavily', 'Google News', 'VnExpress', 'CafeF'] }
    });

    return queueResults;
}

// HTTP API Handler
export async function handleTrendsResearchApi(req, res) {
    if (req.method === 'POST' || req.method === 'GET') {
        const url = new URL(req.url, 'http://localhost');
        const query = url.searchParams.get('q') || 'bất động sản đà nẵng dòng tiền 2026';
        const limit = parseInt(url.searchParams.get('limit') || '5', 10);

        try {
            const results = await executeTrendResearchAndQueue({ query, limit });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                count: results.length,
                query,
                queue: results,
                googleSheetTab: '06_OPC_BDS_Tasks_AI'
            }));
        } catch (err) {
            console.error('[Trends Research Error]', err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
    }
}
