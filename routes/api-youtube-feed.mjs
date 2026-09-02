/**
 * api-youtube-feed.mjs — YouTube Data API v3 integration for BĐS Đà Nẵng
 * Fetches videos from channels / search, generates AI summaries, saves to SQLite
 */
import { upsertVideo, getVideos, getYoutubeChannels, logPipelineRun } from './api-content-db.mjs';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Fetch recent videos for given queries or channels
export async function fetchYoutubeVideos(query = 'bất động sản đà nẵng', maxResults = 6) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        console.warn('[YouTube Feed] Không tìm thấy YOUTUBE_API_KEY trong .env');
        return [];
    }

    try {
        const searchUrl = `${YOUTUBE_API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`;
        const res = await fetch(searchUrl);
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`YouTube API HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const items = data.items || [];
        const videos = [];

        for (const item of items) {
            const videoId = item.id?.videoId;
            if (!videoId) continue;

            const snippet = item.snippet || {};
            const title = snippet.title || '';
            const description = snippet.description || '';
            const channelTitle = snippet.channelTitle || '';
            const publishedAt = snippet.publishedAt || new Date().toISOString();
            const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            // Tóm tắt nhanh bằng Gemini nếu có key
            let aiSummary = description.substring(0, 200);
            try {
                aiSummary = await summarizeVideoWithGemini(title, description);
            } catch (sumErr) {
                console.warn(`[YouTube AI Summary] Lỗi tóm tắt video ${videoId}:`, sumErr.message);
            }

            const videoRecord = {
                youtube_id: videoId,
                title,
                description,
                channel_name: channelTitle,
                channel_id: snippet.channelId || '',
                thumbnail_url: thumbnail,
                published_at: publishedAt,
                ai_summary: aiSummary || title,
                category: 'bds-danang',
                relevance_score: 0.9,
                is_featured: 1
            };

            upsertVideo(videoRecord);
            videos.push(videoRecord);
        }

        logPipelineRun({
            run_type: 'youtube_fetch',
            status: 'success',
            videos_fetched: videos.length,
            details: { query, count: videos.length }
        });

        console.log(`[YouTube Feed] ✅ Đã lưu ${videos.length} videos BĐS Đà Nẵng vào SQLite`);
        return videos;
    } catch (err) {
        console.error('[YouTube Feed Error]', err.message);
        logPipelineRun({
            run_type: 'youtube_fetch',
            status: 'failed',
            error_log: err.message
        });
        return [];
    }
}

async function summarizeVideoWithGemini(title, description) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return description.substring(0, 180);

    const prompt = `Bạn là chuyên gia BĐS Đà Nẵng của Nguyệt Land. Hãy tóm tắt video BĐS sau đây thành 2-3 câu súc tích (dưới 80 chữ) tập trung vào giá trị cốt lõi, cơ hội đầu tư hoặc cảnh báo thị trường:
Tiêu đề: ${title}
Mô tả: ${description}`;

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const model of models) {
        try {
            const resp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.5, maxOutputTokens: 200 }
                    })
                }
            );

            if (resp.ok) {
                const data = await resp.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (text) return text;
            }
        } catch (_) {}
    }

    return description.substring(0, 180);
}

// HTTP API Handlers for YouTube Feed
export function handleYoutubeApi(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    if (pathname === '/api/youtube/fetch') {
        const query = url.searchParams.get('q') || 'bất động sản đà nẵng';
        const limit = parseInt(url.searchParams.get('limit') || '6', 10);

        fetchYoutubeVideos(query, limit).then(videos => {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, count: videos.length, videos }));
        }).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        });
        return;
    }

    if (pathname === '/api/youtube/videos') {
        const videos = getVideos({ limit: 12 });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(videos));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, message: 'Not found' }));
}
