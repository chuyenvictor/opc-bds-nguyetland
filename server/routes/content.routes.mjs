/**
 * server/routes/content.routes.mjs — Real Estate Catalog & Articles Domain Routes
 * Endpoints: /api/content/articles, /api/content/videos, /api/content/stats, /api/content/leads, /api/content/users
 */
import { Router } from '../core/router.mjs';
import { sendJson, sendOk, sendBadRequest, sendNotFound, sendInternalError } from '../core/response.mjs';
import { memoryCache } from '../middleware/memory-cache.mjs';
import { requireAdminAuth } from '../../lib/security.mjs';
import {
    getArticles,
    getArticleBySlug,
    upsertArticle,
    getVideos,
    upsertVideo,
    getStats,
    getYoutubeChannels,
    upsertYoutubeChannel,
    getLeadsDb,
    getUsers
} from '../../routes/api-content-db.mjs';

export const contentRouter = new Router();

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

// GET /api/content/articles
contentRouter.get('/api/content/articles', (req, res) => {
    try {
        const urlObj = new URL(req.url, 'http://localhost');
        const limit = parseInt(urlObj.searchParams.get('limit') || '20', 10);
        const category = urlObj.searchParams.get('category') || undefined;
        const cacheKey = `content_articles_${limit}_${category || 'all'}`;

        const cached = memoryCache.get(cacheKey);
        if (cached) {
            return sendJson(res, 200, cached);
        }

        const articles = getArticles({ limit, category });
        const payload = { total: articles.length, articles };
        memoryCache.set(cacheKey, payload, 60); // 60s TTL
        sendJson(res, 200, payload);
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// GET /api/content/articles/:slug
contentRouter.get('/api/content/articles/:slug', (req, res) => {
    try {
        const slug = req.params.slug;
        const article = getArticleBySlug(slug);
        if (!article) return sendNotFound(res, 'Không tìm thấy bài viết');
        sendJson(res, 200, article);
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// POST /api/content/articles
contentRouter.post('/api/content/articles', async (req, res) => {
    const admin = requireAdminAuth(req, res);
    if (!admin) return;

    try {
        const data = await parseJsonBody(req);
        if (!data.title) return sendBadRequest(res, 'Thiếu tiêu đề bài viết');
        const id = upsertArticle(data);
        memoryCache.clearByPrefix('content_articles');
        sendOk(res, { id, slug: data.slug }, 'Đã lưu bài viết');
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// GET /api/content/videos
contentRouter.get('/api/content/videos', (req, res) => {
    try {
        const urlObj = new URL(req.url, 'http://localhost');
        const limit = parseInt(urlObj.searchParams.get('limit') || '20', 10);
        const videos = getVideos({ limit });
        sendJson(res, 200, { total: videos.length, videos });
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// GET /api/content/stats
contentRouter.get('/api/content/stats', (req, res) => {
    try {
        const cached = memoryCache.get('content_stats');
        if (cached) return sendJson(res, 200, cached);

        const stats = getStats();
        memoryCache.set('content_stats', stats, 30);
        sendJson(res, 200, stats);
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// GET /api/content/channels
contentRouter.get('/api/content/channels', (req, res) => {
    try {
        const channels = getYoutubeChannels();
        sendJson(res, 200, channels);
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// GET /api/content/leads (Admin Only)
contentRouter.get('/api/content/leads', (req, res) => {
    const admin = requireAdminAuth(req, res);
    if (!admin) return;

    try {
        const urlObj = new URL(req.url, 'http://localhost');
        const limit = parseInt(urlObj.searchParams.get('limit') || '50', 10);
        const leads = getLeadsDb({ limit });
        sendJson(res, 200, leads);
    } catch (err) {
        sendInternalError(res, err.message);
    }
});

// GET /api/content/users (Admin Only)
contentRouter.get('/api/content/users', (req, res) => {
    const admin = requireAdminAuth(req, res);
    if (!admin) return;

    try {
        const users = getUsers({ limit: 50 });
        sendJson(res, 200, users);
    } catch (err) {
        sendInternalError(res, err.message);
    }
});
