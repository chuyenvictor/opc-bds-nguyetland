/**
 * api-scheduler.mjs — Built-in 24/7 Automation Scheduler (No external cron / No n8n needed)
 * Runs daily news scraping, YouTube feed aggregation, and SEO updates automatically.
 *
 * BUG-11 FIX: Each task wrapped in isolated try-catch. Scheduler never crashes on single task failure.
 * Added Telegram alerting on critical scheduler errors.
 */
import { runNewsPipeline } from './api-news-pipeline.mjs';
import { fetchYoutubeVideos } from './api-youtube-feed.mjs';
import { fetchAllRssFeeds } from './api-rss-crawler.mjs';
import { getDb, checkpointDb, logPipelineRun } from './api-content-db.mjs';
import { executeTrendResearchAndQueue } from './api-trends-research.mjs';
import { scanAndExecuteDripCampaign } from '../lib/email-drip-engine.mjs';

let schedulerInterval = null;
let lastHourlyRunKey = '';

// BUG-11 FIX: Alert on scheduler failures
function alertSchedulerError(taskName, error) {
    console.error(`[Scheduler] ❌ Task "${taskName}" failed:`, error.message);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '-1003891453026';
    if (botToken) {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: `⚠️ <b>[SCHEDULER ERROR]</b>\n\n📛 <b>Task:</b> ${taskName}\n❌ <b>Lỗi:</b> <code>${(error.message || '').substring(0, 500)}</code>\n⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}\n\n<i>Scheduler vẫn tiếp tục chạy các task khác.</i>`,
                parse_mode: 'HTML'
            })
        }).catch(() => { /* silent */ });
    }
}

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
            alertSchedulerError('Startup Initialization', e);
        }
    }, 10000);

    // BUG-11 FIX: Global try-catch wrapping the entire interval callback
    schedulerInterval = setInterval(async () => {
        try {
            const now = new Date();
            const hour = now.getHours();
            const todayStr = now.toISOString().split('T')[0];
            const currentHourKey = `${todayStr}_H${hour}`;

            // ── 1. HOURLY AUTONOMOUS RSS CRAWLING & TICKER REFRESH ──
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
                    alertSchedulerError('Hourly RSS Sync', err);
                }
            }

            // ── 2. MORNING PIPELINE (07:00 AM — Once per day) ──
            if (hour >= 7 && !hasRunToday('daily_news', todayStr)) {
                console.log(`[Scheduler] 🌅 07:00+ AM window! Executing daily BĐS News & YouTube pipeline for ${todayStr}...`);
                try {
                    await fetchYoutubeVideos('bất động sản đà nẵng', 6);
                    await runNewsPipeline();
                    await executeTrendResearchAndQueue({ query: 'bất động sản đà nẵng dòng tiền', limit: 4 });
                    checkpointDb();
                    console.log(`[Scheduler] ✅ Daily 07:00 Morning Pipeline completed successfully!`);
                } catch (err) {
                    alertSchedulerError('Morning Pipeline', err);
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
                    alertSchedulerError('Email Drip Campaign', err);
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
                    alertSchedulerError('Evening Sync', err);
                }
            }
        } catch (fatalErr) {
            // BUG-11 FIX: Even if something unexpected happens, scheduler keeps running
            console.error('[Scheduler] 🔴 Unexpected error in scheduler loop:', fatalErr);
            alertSchedulerError('Scheduler Loop (Fatal)', fatalErr);
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

// UPG-03: Export scheduler health status
export function getSchedulerStatus() {
    return {
        running: !!schedulerInterval,
        lastHourlyRun: lastHourlyRunKey || 'none',
        uptimeSeconds: Math.floor(process.uptime())
    };
}
