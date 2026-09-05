/**
 * server/routes/news.routes.mjs — Realtime News, RSS & Broadcast Ticker Domain Routes
 * Endpoints: /api/news/ticker, /api/news/rss-feed, /api/news/ai-transform, /api/news/generate-top5-daily, /api/youtube/*
 */
import { Router } from '../core/router.mjs';
import { sendJson, sendOk, sendInternalError } from '../core/response.mjs';
import { memoryCache } from '../middleware/memory-cache.mjs';
import { handleRssApi } from '../../routes/api-rss-crawler.mjs';
import { handleYoutubeApi } from '../../routes/api-youtube-feed.mjs';
import { executeTop5DailyGeneration } from '../../routes/api-news-generator-engine.mjs';
import { handlePipelineRun } from '../../routes/api-news-pipeline.mjs';
import { handleGetTrends } from '../../routes/api-trends-bridge.mjs';

export const newsRouter = new Router();

// GET /api/news/ticker (High-frequency cached endpoint)
newsRouter.get('/api/news/ticker', async (req, res) => {
    const urlObj = new URL(req.url, 'http://localhost');
    const forceRefresh = urlObj.searchParams.get('refresh') === '1';

    if (!forceRefresh) {
        const cached = memoryCache.get('live_ticker_cache');
        if (cached) {
            return sendJson(res, 200, cached);
        }
    }

    // Proxy to existing crawler logic
    await handleRssApi(req, res);
});

// GET /api/news/rss-feed
newsRouter.get('/api/news/rss-feed', async (req, res) => {
    await handleRssApi(req, res);
});

// POST /api/news/ai-transform
newsRouter.post('/api/news/ai-transform', async (req, res) => {
    await handleRssApi(req, res);
});

// POST /api/news/generate-top5-daily
newsRouter.post('/api/news/generate-top5-daily', async (req, res) => {
    try {
        const result = await executeTop5DailyGeneration();
        memoryCache.clearByPrefix('content_articles');
        memoryCache.delete('live_ticker_cache');
        sendJson(res, 200, result);
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// POST & GET /api/pipeline/run/:type
newsRouter.post('/api/pipeline/run/:type', async (req, res) => {
    await handlePipelineRun(req, res);
});
newsRouter.get('/api/pipeline/run/:type', async (req, res) => {
    await handlePipelineRun(req, res);
});

// YouTube Feeds
newsRouter.get('/api/youtube/videos', async (req, res) => {
    await handleYoutubeApi(req, res);
});
newsRouter.post('/api/youtube/fetch', async (req, res) => {
    await handleYoutubeApi(req, res);
});

// GET /api/trends & GET /api/trends/latest
newsRouter.get('/api/trends', (req, res) => {
    handleGetTrends(req, res);
});
newsRouter.get('/api/trends/latest', (req, res) => {
    handleGetTrends(req, res);
});

