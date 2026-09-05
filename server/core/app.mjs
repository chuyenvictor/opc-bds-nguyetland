/**
 * server/core/app.mjs — Enterprise SaaS Core Application Engine
 * Orchestrates Middlewares, Domain Routers, Static Asset Streaming & Anti-Bottleneck Handlers.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from './router.mjs';
import { authRouter } from '../routes/auth.routes.mjs';
import { leadsRouter } from '../routes/leads.routes.mjs';
import { contentRouter } from '../routes/content.routes.mjs';
import { newsRouter } from '../routes/news.routes.mjs';
import { studioRouter } from '../routes/studio.routes.mjs';
import { opsRouter } from '../routes/ops.routes.mjs';
import { serveStaticFile } from '../middleware/static-server.mjs';
import { checkCorsOrigin } from '../../lib/security.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '../..');

export const appRouter = new Router();

// Mount all domain routers
appRouter.use(authRouter);
appRouter.use(leadsRouter);
appRouter.use(contentRouter);
appRouter.use(newsRouter);
appRouter.use(studioRouter);
appRouter.use(opsRouter);

/**
 * Master HTTP Request Dispatcher
 */
export async function handleRequest(req, res) {
    // 1. CORS Validation
    const corsAllowed = checkCorsOrigin(req, res);
    if (!corsAllowed && req.method === 'OPTIONS') {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('CORS Origin Not Allowed');
    }
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    const parsedUrl = new URL(req.url, 'http://localhost');
    let pathname = parsedUrl.pathname;

    // 2. Dispatch to Domain API Routers
    if (pathname.startsWith('/api/')) {
        const handled = await appRouter.handle(req, res, pathname);
        if (handled) return;

        // Fallback for unmatched API routes
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
            success: false,
            message: `API Endpoint không tồn tại: ${req.method} ${pathname}`,
            timestamp: new Date().toISOString()
        }));
    }

    // 3. Web Page Rewrites (Clean URLs)
    let targetRelFile = pathname;
    if (pathname === '/' || pathname === '') {
        targetRelFile = 'index.html';
    } else if (pathname === '/news') {
        targetRelFile = 'news.html';
    } else if (pathname === '/studio') {
        targetRelFile = 'studio.html';
    } else if (pathname === '/dossier') {
        targetRelFile = 'dossier.html';
    } else if (pathname.startsWith('/p/')) {
        targetRelFile = pathname.endsWith('.html') ? pathname : pathname + '.html';
    }

    // 4. High-Performance Static Delivery
    const served = serveStaticFile(req, res, targetRelFile, appDir);
    if (served) return;

    // 5. Final 404 Handler
    const notFoundPage = path.join(appDir, '404.html');
    if (serveStaticFile(req, res, '404.html', appDir)) return;

    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found — Nguyệt Land BĐS</h1>');
}
