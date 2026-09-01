/**
 * api-scheduler.mjs — Built-in 24/7 Automation Scheduler (No external cron / No n8n needed)
 * Runs daily news scraping, YouTube feed aggregation, and SEO updates automatically.
 */
import { runNewsPipeline } from './api-news-pipeline.mjs';
import { fetchYoutubeVideos } from './api-youtube-feed.mjs';
import { getDb, checkpointDb, logPipelineRun } from './api-content-db.mjs';
import { executeTrendResearchAndQueue } from './api-trends-research.mjs';
import { scanAndExecuteDripCampaign } from '../lib/email-drip-engine.mjs';

let schedulerInterval = null;

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
    console.log('[Scheduler] ⏰ Starting OPC-BĐS Built-in Scheduler (Daily 07:00 Pipeline & 19:00 Trend Feed)');

    // Run once on initial startup after 15 seconds
    setTimeout(async () => {
        console.log('[Scheduler] 🔄 Initializing feed scan & WAL checkpoint on startup...');
        try {
            await fetchYoutubeVideos('bất động sản dòng tiền đà nẵng 2026', 4);
            checkpointDb();
        } catch (e) {
            console.warn('[Scheduler Startup Fetch]', e.message);
        }
    }, 15000);

    // Check every minute
    schedulerInterval = setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();
        const todayStr = now.toISOString().split('T')[0];

        // 1. Morning Pipeline (Anytime from 07:00 AM onwards, once per day)
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

        // 2. Email Drip Campaign (Anytime from 08:00 AM onwards, once per day)
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

        // 2. Evening Feed & Video Sync (Anytime from 19:00 PM onwards, once per day)
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
