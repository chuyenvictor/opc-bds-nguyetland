/**
 * server/routes/ops.routes.mjs — System Operations, Health & Telemetry Domain Routes
 * Endpoints: /api/status, /api/health, /api/db/checkpoint, /api/webhook/appscript
 */
import { Router } from '../core/router.mjs';
import { sendJson, sendOk } from '../core/response.mjs';
import { memoryCache } from '../middleware/memory-cache.mjs';
import { taskQueue } from '../middleware/async-task-queue.mjs';
import { getSchedulerStatus } from '../../routes/api-scheduler.mjs';
import { checkpointDb } from '../../routes/api-content-db.mjs';
import { handleAppScriptWebhook } from '../../routes/api-webhook-appscript.mjs';

export const opsRouter = new Router();

// GET /api/status — Full System & Anti-Bottleneck Telemetry
opsRouter.get('/api/status', (req, res) => {
    sendJson(res, 200, {
        status: 'OPERATIONAL',
        service: 'OPC-BĐS Nguyệt Land v2.5 (SaaS Modular)',
        timestamp: new Date().toISOString(),
        domain: process.env.PUBLIC_DOMAIN || 'https://bds.breaths.live',
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        antiBottleneck: {
            cache: memoryCache.getMetrics(),
            taskQueue: taskQueue.getMetrics()
        },
        services: {
            database: 'SQLite WAL Mode (Optimized)',
            gemini_ai_studio: true,
            youtube_data_api: true,
            telegram_alerts: true,
            lead_capture: true,
            email_nurturing_30day: true
        },
        scheduler: getSchedulerStatus()
    });
});

// GET /api/health — Lightweight Liveness Probe
opsRouter.get('/api/health', (req, res) => {
    sendJson(res, 200, {
        status: 'UP',
        timestamp: new Date().toISOString()
    });
});

// POST /api/db/checkpoint — Force SQLite WAL Truncate
opsRouter.post('/api/db/checkpoint', (req, res) => {
    checkpointDb();
    sendOk(res, { status: 'CHECKPOINT_DONE' }, 'Đã thực hiện WAL checkpoint');
});

// Apps Script Webhook
opsRouter.get('/api/webhook/appscript', async (req, res) => {
    await handleAppScriptWebhook(req, res);
});
opsRouter.post('/api/webhook/appscript', async (req, res) => {
    await handleAppScriptWebhook(req, res);
});
