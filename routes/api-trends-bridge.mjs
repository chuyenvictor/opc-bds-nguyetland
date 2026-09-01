import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TRENDS_RAW_DIR = path.join(__dirname, '..', '..', '..', '0_NEWS_TREND', 'output', 'raw_data');

export async function handleGetTrends(req, res) {
    try {
        let latestTrend = null;

        if (fs.existsSync(TRENDS_RAW_DIR)) {
            const files = fs.readdirSync(TRENDS_RAW_DIR)
                .filter(f => f.endsWith('.json'))
                .sort((a, b) => fs.statSync(path.join(TRENDS_RAW_DIR, b)).mtimeMs - fs.statSync(path.join(TRENDS_RAW_DIR, a)).mtimeMs);

            if (files.length > 0) {
                const latestFile = path.join(TRENDS_RAW_DIR, files[0]);
                latestTrend = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            success: true,
            trends: latestTrend?.items || [],
            category: latestTrend?.category || 'bds',
            scannedAt: latestTrend?.scannedAt || new Date().toISOString()
        }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: err.message }));
    }
}
