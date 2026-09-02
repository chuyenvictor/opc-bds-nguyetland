/**
 * api-scheduler.mjs — Built-in 24/7 Automation Scheduler (No external cron / No n8n needed)
 * Runs daily news scraping, YouTube feed aggregation, and SEO updates automatically.
 */
import { runNewsPipeline } from './api-news-pipeline.mjs';
import { fetchYoutubeVideos } from './api-youtube-feed.mjs';
import { fetchAllRssFeeds } from './api-rss-crawler.mjs';
import { getDb, checkpointDb, logPipelineRun } from './api-content-db.mjs';
import { executeTrendResearchAndQueue } from './api-trends-research.mjs';
import { scanAndExecuteDripCampaign } from '../lib/email-drip-engine.mjs';

let schedulerInterval = null;
let lastHourlyRunKey = '';

function hasRunToday(runType, todayStr) {
    try {
        const db = getDb();
        const row = db.prepare("SELECT date(ran_at) as d FROM pipeline_runs WHERE run_type = ? AND status = 'success' ORDER BY id DESC LIMIT 1").get(runType);
        return row?.d === todayStr;
    } catch {
        return false;
    }
}

export function startScheduler() {
    console.log('[Scheduler] ⏰ Starting OPC-BĐS Built-in Scheduler (Hourly RSS Ingestion, Daily 07:00 Pipeline & 19:00 Trend Feed)');

    // Run once on initial startup after 10 seconds
    setTimeout(async () => {
        console.log('[Scheduler] 🔄 Initializing feed scan, fresh RSS crawler & WAL checkpoint on startup...');
        try {
            await fetchAllRssFeeds(true);
            await fetchYoutubeVideos('bất động sản dòng tiền đà nẵng 2026', 4);
            checkpointDb();
            console.log('[Scheduler] ✅ Startup crawl & cache initialization completed!');
        } catch (e) {
            console.warn('[Scheduler Startup Fetch]', e.message);
        }
    }, 10000);

    // Check every minute
    schedulerInterval = setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const todayStr = now.toISOString().split('T')[0];
        const currentHourKey = `${todayStr}_H${hour}`;

        // ── 1. HOURLY AUTONOMOUS RSS CRAWLING & TICKER REFRESH (Runs every hour) ──
        if (lastHourlyRunKey !== currentHourKey) {
            lastHourlyRunKey = currentHourKey;
            console.log(`[Scheduler] 🕒 [Hourly Run: ${currentHourKey}] Crawling fresh RSS from 9 official publishers...`);
            try {
                const freshFeed = await fetchAllRssFeeds(true);
                logPipelineRun({
                    run_type: 'hourly_rss_sync',
                    status: 'success',
                    articles_created: 0,
                    videos_fetched: 0,
                    details: {
                        hour: currentHourKey,
                        totalItems: freshFeed.items.length,
                        tickerItems: freshFeed.ticker.length,
                        topHeadline: freshFeed.ticker[0]?.title || 'N/A'
                    }
                });
                checkpointDb();
                console.log(`[Scheduler] 📡 Hourly Sync Complete: ${freshFeed.items.length} items crawled, ticker refreshed.`);
            } catch (err) {
                console.warn('[Scheduler Hourly Error]', err.message);
            }
        }

        // ── 2. MORNING PIPELINE (07:00 AM — Once per day) ──
        if (hour >= 7 && !hasRunToday('daily_news', todayStr)) {
            console.log(`[Scheduler] 🌅 07:00+ AM window! Executing daily BĐS News & YouTube pipeline for ${todayStr}...`);

            try {
                // 1. YouTube BĐS video fetching
                await fetchYoutubeVideos('bất động sản đà nẵng', 6);
                // 2. News crawling & AI article publishing
                await runNewsPipeline();
                // 3. Trends research & Google Sheet Queue
                await executeTrendResearchAndQueue({ query: 'bất động sản đà nẵng dòng tiền', limit: 4 });
                // 4. SQLite WAL checkpoint
                checkpointDb();
                console.log(`[Scheduler] ✅ Daily 07:00 Morning Pipeline completed successfully!`);
            } catch (err) {
                console.error('[Scheduler Error during morning pipeline]', err.message);
            }
        }

        // ── 3. EMAIL DRIP CAMPAIGN (08:00 AM — Once per day) ──
        if (hour >= 8 && !hasRunToday('email_drip_scan', todayStr)) {
            console.log(`[Scheduler] 📧 08:00+ AM window! Executing 30-Day Email Nurturing Drip Scan for ${todayStr}...`);
            try {
                const dripResult = await scanAndExecuteDripCampaign();
                logPipelineRun({
                    run_type: 'email_drip_scan',
                    status: 'success',
                    articles_created: 0,
                    videos_fetched: 0,
                    details: dripResult
                });
                checkpointDb();
                console.log(`[Scheduler] ✅ Email Drip Scan completed! Processed: ${dripResult.processed}, Sent: ${dripResult.sent}`);
            } catch (err) {
                console.warn('[Scheduler Email Drip Error]', err.message);
            }
        }

        // ── 4. EVENING FEED & VIDEO SYNC (19:00 PM — Once per day) ──
        if (hour >= 19 && !hasRunToday('evening_sync', todayStr)) {
            console.log(`[Scheduler] 🌆 19:00+ PM window! Refreshing evening YouTube feeds & market trends...`);
            try {
                await fetchYoutubeVideos('nhà đất đà nẵng homestay căn hộ', 4);
                await executeTrendResearchAndQueue({ query: 'thị trường bất động sản đà nẵng du lịch', limit: 3 });
                logPipelineRun({
                    run_type: 'evening_sync',
                    status: 'success',
                    articles_created: 0,
                    videos_fetched: 4,
                    details: { time: now.toISOString() }
                });
                checkpointDb();
                console.log(`[Scheduler] ✅ Evening 19:00 Sync completed!`);
            } catch (err) {
                console.warn('[Scheduler Evening Error]', err.message);
            }
        }
    }, 60000);
}

export function stopScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log('[Scheduler] ⏹️ Scheduler stopped.');
    }
}
