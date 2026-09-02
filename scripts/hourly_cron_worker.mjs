/**
 * hourly_cron_worker.mjs — Standalone Hourly Worker for OPC-BĐS (Nguyệt Land)
 * Can be run via:
 * 1. Linux crontab: 0 * * * * cd /path/to/apps/nguyet-land-bds && node scripts/hourly_cron_worker.mjs
 * 2. PM2: pm2 start scripts/hourly_cron_worker.mjs --name bds-hourly-crawler
 * 3. GitHub Actions / Cloudflare Worker webhook
 */

import { fetchAllRssFeeds } from '../routes/api-rss-crawler.mjs';
import { runNewsPipeline } from '../routes/api-news-pipeline.mjs';
import { fetchYoutubeVideos } from '../routes/api-youtube-feed.mjs';
import { checkpointDb, logPipelineRun } from '../routes/api-content-db.mjs';

async function runHourlyCrawl() {
    const timestamp = new Date().toISOString();
    console.log(`[Hourly Worker] 🚀 Starting Hourly BĐS Ingestion at ${timestamp}...`);

    try {
        // 1. Fetch fresh RSS from 9 newspapers
        const feed = await fetchAllRssFeeds(true);
        console.log(`[Hourly Worker] 📡 Fetched ${feed.items.length} news items, ${feed.ticker.length} ticker headlines.`);

        // 2. Fetch latest YouTube market videos
        await fetchYoutubeVideos('bất động sản đà nẵng dòng tiền 2026', 4);

        // 3. Log pipeline execution
        logPipelineRun({
            run_type: 'standalone_hourly_cron',
            status: 'success',
            articles_created: 0,
            videos_fetched: 4,
            details: {
                timestamp,
                itemsCount: feed.items.length,
                topTicker: feed.ticker[0]?.title || 'N/A'
            }
        });

        // 4. SQLite WAL checkpoint
        checkpointDb();
        console.log(`[Hourly Worker] ✅ Hourly Crawl Completed Successfully!`);
        process.exit(0);
    } catch (err) {
        console.error(`[Hourly Worker Error]`, err.message);
        process.exit(1);
    }
}

runHourlyCrawl();
