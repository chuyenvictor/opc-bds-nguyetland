/**
 * server/routes/studio.routes.mjs — AI Studio & Content Production Domain Routes
 * Endpoints: /api/ai/generate, /api/publish/article, /api/trends/research
 */
import { Router } from '../core/router.mjs';
import { handleAiGenerate } from '../../routes/api-ai-studio.mjs';
import { handlePublishArticle } from '../../routes/api-publish-article.mjs';
import { handleTrendsResearchApi } from '../../routes/api-trends-research.mjs';
import { handleGetTrends } from '../../routes/api-trends-bridge.mjs';

export const studioRouter = new Router();

// POST /api/ai/generate
studioRouter.post('/api/ai/generate', async (req, res) => {
    await handleAiGenerate(req, res);
});

// POST /api/publish/article & POST /api/articles/publish (SaaS Article Publisher)
studioRouter.post('/api/publish/article', async (req, res) => {
    await handlePublishArticle(req, res);
});
studioRouter.post('/api/articles/publish', async (req, res) => {
    await handlePublishArticle(req, res);
});

// GET /api/trends/latest (AI Studio Trends Feed)
studioRouter.get('/api/trends/latest', async (req, res) => {
    await handleGetTrends(req, res);
});

// Trends Research & Sheet Queue APIs
studioRouter.get('/api/trends/research', async (req, res) => {
    await handleTrendsResearchApi(req, res);
});
studioRouter.post('/api/trends/research', async (req, res) => {
    await handleTrendsResearchApi(req, res);
});
studioRouter.get('/api/trends/research-and-queue', async (req, res) => {
    await handleTrendsResearchApi(req, res);
});
studioRouter.post('/api/trends/research-and-queue', async (req, res) => {
    await handleTrendsResearchApi(req, res);
});

