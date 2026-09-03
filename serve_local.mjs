import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAiGenerate } from './routes/api-ai-studio.mjs';
import { handleBdsLeadSubmit, handleRecentLeadsActivity } from './routes/api-bds-leads.mjs';
import { handleGetTrends } from './routes/api-trends-bridge.mjs';
import { handlePublishArticle } from './routes/api-publish-article.mjs';
import { handleContentApi, handleContentPost } from './routes/api-content-db.mjs';
import { handlePipelineRun } from './routes/api-news-pipeline.mjs';
import { handleYoutubeApi } from './routes/api-youtube-feed.mjs';
import { handleRssApi } from './routes/api-rss-crawler.mjs';
import { handleAuthRegister, handleAuthLogin, handleLeadConsultation, handleAdminDashboard, handleDripCampaignRun } from './routes/api-auth.mjs';
import { handleAppScriptWebhook } from './routes/api-webhook-appscript.mjs';
import { executeTop5DailyGeneration } from './routes/api-news-generator-engine.mjs';
import { handleTrendsResearchApi } from './routes/api-trends-research.mjs';
import { startScheduler } from './routes/api-scheduler.mjs';
import { checkCorsOrigin } from './lib/security.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Error Handlers (BUG-12 FIX)
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[FATAL UncaughtException]', err);
});

// Simple env loader
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [k, ...v] = trimmed.split('=');
                if (k && v.length) {
                    process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
                }
            }
        });
    }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '8088', 10);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    const origin = req.headers['origin'];
    const allowedOrigin = checkCorsOrigin(origin);
    if (allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret');

    // OWASP Security Headers (SaaS Standard)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedPath = (req.url || '/').split('?')[0].replace(/\/+$/, '') || '/';

    // Health Endpoint
    if (parsedPath === '/api/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            status: 'HEALTHY',
            service: 'OPC-BDS Nguyet Land Master Server',
            port: PORT,
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // Content DB Endpoints
    if (parsedPath.startsWith('/api/content/')) {
        if (req.method === 'GET') return handleContentApi(req, res);
        if (req.method === 'POST') return handleContentPost(req, res);
    }

    // YouTube Feed Endpoints
    if (parsedPath.startsWith('/api/youtube/')) {
        return handleYoutubeApi(req, res);
    }

    // 1-Click Top 5 Daily News & Podcast/Shorts Generation
    if (parsedPath === '/api/news/generate-top5-daily' && req.method === 'POST') {
        executeTop5DailyGeneration()
            .then(articles => {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, count: articles.length, articles }));
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            });
        return;
    }

    // RSS & Official Vietnam News Endpoints
    if (parsedPath.startsWith('/api/news/')) {
        return handleRssApi(req, res);
    }

    // Pipeline Trigger
    if (parsedPath.startsWith('/api/pipeline/run/')) {
        return handlePipelineRun(req, res);
    }

    // Tavily & Google Trends Research -> Google Sheet Queue Endpoint
    if (parsedPath === '/api/trends/research-and-queue') {
        return handleTrendsResearchApi(req, res);
    }

    // Apps Script Webhook (nhận dữ liệu từ Google Sheet)
    if (parsedPath === '/api/webhook/appscript' && req.method === 'POST') {
        return handleAppScriptWebhook(req, res);
    }

    // Status Endpoint (kiểm tra toàn hệ thống)
    if (parsedPath === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
            status: 'OPERATIONAL',
            service: 'OPC-BĐS Nguyệt Land v2.0',
            version: '2.0.0',
            domain: process.env.PUBLIC_DOMAIN || 'https://bds.breaths.live',
            port: PORT,
            timestamp: new Date().toISOString(),
            timezone: 'Asia/Ho_Chi_Minh',
            features: {
                rss_scanner: true,
                gemini_ai: !!process.env.GEMINI_API_KEY,
                telegram_bot: !!process.env.TELEGRAM_BOT_TOKEN,
                google_sheet_webhook: !!process.env.GOOGLE_SHEET_WEBHOOK_URL,
                firebase_auth: !!process.env.FIREBASE_API_KEY,
                vip_member_portal: true,
                lead_capture: true,
                email_nurturing_30day: true,
                tavily_google_trends_queue: true
            }
        }));
    }

    // Auth & Member Portal Routes
    if (parsedPath === '/api/auth/register' && req.method === 'POST') {
        return handleAuthRegister(req, res);
    }
    if (parsedPath === '/api/auth/login' && req.method === 'POST') {
        return handleAuthLogin(req, res);
    }
    if (parsedPath === '/api/leads/consultation' && req.method === 'POST') {
        return handleLeadConsultation(req, res);
    }
    if (parsedPath === '/api/admin/dashboard' && req.method === 'GET') {
        return handleAdminDashboard(req, res);
    }
    if (parsedPath === '/api/leads/run-email-drip' && req.method === 'POST') {
        return handleDripCampaignRun(req, res);
    }

    // AI Studio Route
    if (parsedPath === '/api/ai/generate' && req.method === 'POST') {
        return handleAiGenerate(req, res);
    }

    // Publish Article Route
    if (parsedPath === '/api/articles/publish' && req.method === 'POST') {
        return handlePublishArticle(req, res);
    }

    // Lead Recent Activity Stream Route (UX-06)
    if (parsedPath === '/api/leads/recent-activity' && req.method === 'GET') {
        return handleRecentLeadsActivity(req, res);
    }

    // Lead Capture Route
    if ((parsedPath === '/api/leads/submit' || parsedPath === '/api/bds/lead-submit' || parsedPath === '/api/bds/leads/submit' || parsedPath === '/api/leads/consultation') && req.method === 'POST') {
        return handleBdsLeadSubmit(req, res);
    }

    // Trends Bridge Route
    if (parsedPath === '/api/trends/latest' && req.method === 'GET') {
        return handleGetTrends(req, res);
    }

    // Static Article Pages (/p/...)
    if (parsedPath.startsWith('/p/')) {
        let candidate = parsedPath.endsWith('.html') ? parsedPath : parsedPath + '.html';
        let articleFile = path.join(__dirname, candidate);
        if (!fs.existsSync(articleFile)) {
            articleFile = path.join(__dirname, 'public', candidate);
        }
        if (fs.existsSync(articleFile) && fs.statSync(articleFile).isFile()) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return fs.createReadStream(articleFile).pipe(res);
        }
    }

    // Page Routing
    let targetFile = 'index.html';
    const ua = req.headers['user-agent'] || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    if (parsedPath === '/studio' || parsedPath === '/studio.html') {
        targetFile = 'studio.html';
    } else if (parsedPath === '/news' || parsedPath === '/news.html') {
        targetFile = 'news.html';
    } else if (parsedPath === '/favicon.ico') {
        targetFile = 'img/nguyet-bds.png';
    } else if (parsedPath === '/' || parsedPath === '/index.html') {
        targetFile = 'index.html';
    } else {
        targetFile = parsedPath.startsWith('/') ? parsedPath.substring(1) : parsedPath;
    }

    let filePath = path.join(__dirname, targetFile);
    filePath = path.normalize(filePath);

    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            const mobileFile = path.join(__dirname, 'index_mobile.html');
            filePath = (isMobile && fs.existsSync(mobileFile)) ? mobileFile : path.join(__dirname, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`500 Server Error: ${error.code}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`======================================================`);
    console.log(`🏡 OPC-BĐS NGUYỆT LAND SERVER — PORT http://localhost:${PORT}`);
    console.log(`📰 Bản Tin & Video BĐS: http://localhost:${PORT}/news`);
    console.log(`🎨 AI Cashflow Studio:  http://localhost:${PORT}/studio`);
    console.log(`📊 Research & Queue:    http://localhost:${PORT}/api/trends/research-and-queue`);
    console.log(`======================================================`);

    // Start background automation scheduler
    startScheduler();
});
