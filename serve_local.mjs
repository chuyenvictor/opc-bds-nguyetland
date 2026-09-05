/**
 * serve_local.mjs — OPC-BĐS Nguyệt Land SaaS Production Server Entrypoint
 * Port: 8088 | Micro-Engine Architecture | Anti-Bottleneck Protected
 */
import './lib/load-env.mjs';
import http from 'http';
import { handleRequest } from './server/core/app.mjs';
import { startScheduler } from './routes/api-scheduler.mjs';

// Global Process Resilience Handlers
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[FATAL UncaughtException]', err);
});

const PORT = parseInt(process.env.PORT || '8088', 10);

const server = http.createServer(async (req, res) => {
    try {
        await handleRequest(req, res);
    } catch (err) {
        console.error('[Server Request Error]', err);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
        }
    }
});

server.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════════════════════════╗`);
    console.log(`║ 🚀 NGUYỆT LAND BĐS — ENTERPRISE SAAS SYSTEM IS LIVE                ║`);
    console.log(`║ 🌐 Local:   http://localhost:${PORT}/                                   ║`);
    console.log(`║ 📰 News:    http://localhost:${PORT}/news                               ║`);
    console.log(`║ 📊 Dossier: http://localhost:${PORT}/dossier                            ║`);
    console.log(`║ 🎨 Studio:  http://localhost:${PORT}/studio                             ║`);
    console.log(`║ ⚡ Status:  http://localhost:${PORT}/api/status                         ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);

    // Auto-boot hourly background cron scheduler
    startScheduler();
});

export { server };
