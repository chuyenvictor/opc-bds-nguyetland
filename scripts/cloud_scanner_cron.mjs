/**
 * scripts/cloud_scanner_cron.mjs — OPC-BĐS Cloud Cron Scanner (GitHub Actions)
 * Chạy mỗi 10 phút trên GitHub Actions, không cần máy chủ riêng:
 *   1. Quét RSS 7 báo lớn Việt Nam
 *   2. Phân tích AI Gemini 2.0 Flash → BĐS Dòng Tiền Đà Nẵng
 *   3. Đồng bộ Google Sheet Webhook (Apps Script)
 *   4. Gửi Telegram Alert Channel
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003891453026';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '1E8sUXO4g4E6Gxi0hYlP0W3X8KYmgroJiUIERaiXGV3g';

const RSS_FEEDS = [
    { name: 'VnExpress BĐS', url: 'https://vnexpress.net/rss/bat-dong-san.rss' },
    { name: 'CafeF BĐS', url: 'https://cafef.vn/bat-dong-san.rss' },
    { name: 'Báo Đầu Tư BĐS', url: 'https://baodautu.vn/bat-dong-san.rss' },
    { name: 'VnEconomy BĐS', url: 'https://vneconomy.vn/bat-dong-san.rss' },
    { name: 'VietNamNet BĐS', url: 'https://vietnamnet.vn/rss/bat-dong-san.rss' },
    { name: 'Nhịp Cầu Đầu Tư', url: 'https://nhipcaudautu.vn/rss/linh-vuc/bat-dong-san' },
    { name: 'Đất Vàng', url: 'https://datvang.com/feed/' }
];

// ── Bước 1: Fetch & Parse RSS ──────────────────────────────────────────────
async function fetchFeed(feed) {
    try {
        const resp = await fetch(feed.url, {
            headers: { 'User-Agent': 'OPC-BDS-Scanner/2.0 (bds.breaths.live)' },
            signal: AbortSignal.timeout(8000)
        });
        if (!resp.ok) return [];
        const xml = await resp.text();
        return parseRssItems(xml, feed.name);
    } catch (e) {
        console.warn(`[RSS] Lỗi tải ${feed.name}: ${e.message}`);
        return [];
    }
}

function parseRssItems(xml, sourceName) {
    const items = [];
    const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
    for (const block of itemBlocks.slice(0, 5)) {
        const title = extractTag(block, 'title');
        const link = extractTag(block, 'link');
        const desc = extractTag(block, 'description').replace(/<[^>]*>/g, '').trim();
        const pubDate = extractTag(block, 'pubDate');
        if (title && link) {
            items.push({ title, link, desc, pubDate, sourceName });
        }
    }
    return items;
}

function extractTag(xml, tag) {
    const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'));
    if (cdataMatch) return cdataMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
    const plainMatch = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
    return plainMatch ? plainMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : '';
}

// ── Bước 2: Phân tích Gemini AI ────────────────────────────────────────────
async function analyzeWithGemini(item) {
    if (!GEMINI_API_KEY) return null;
    const prompt = `Bạn là chuyên gia BĐS Dòng Tiền tại Nguyệt Land (Đà Nẵng, Q3/2026).
Phân tích tin tức BĐS:
Tiêu đề: ${item.title}
Tóm tắt: ${item.desc.substring(0, 300)}

Trả về JSON ngắn gọn (không giải thích thêm):
{"headline":"<Tiêu đề bán hàng hấp dẫn dưới 15 từ tiếng Việt>","impact":"<Tác động BĐS Đà Nẵng, 1 câu>","cap_rate":"<Ước tính Cap Rate vd: 9-12%/năm>","advice":"<Lời khuyên hành động cho nhà đầu tư, 1 câu>","heat":"HOT|WARM|NEUTRAL"}`;

    try {
        const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.4, maxOutputTokens: 400, responseMimeType: 'application/json' }
                }),
                signal: AbortSignal.timeout(15000)
            }
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn(`[Gemini AI] Lỗi phân tích: ${e.message}`);
        return null;
    }
}

// ── Bước 3: Đồng bộ Google Sheet (Apps Script Webhook) ─────────────────────
async function syncToGoogleSheet(item, ai) {
    if (!GOOGLE_SHEET_WEBHOOK_URL) {
        console.warn('[Sheet Sync] Chưa có GOOGLE_SHEET_WEBHOOK_URL. Bỏ qua.');
        return false;
    }
    try {
        const payload = {
            action: 'rss_sync',
            sheetId: GOOGLE_SHEET_ID,
            timestamp: new Date().toISOString(),
            source: item.sourceName,
            title: ai?.headline || item.title,
            original_title: item.title,
            link: item.link,
            summary: ai?.impact || item.desc.substring(0, 200),
            cap_rate: ai?.cap_rate || '8.5% - 12%/năm',
            advice: ai?.advice || 'Ưu tiên tài sản có PCCC và sổ đỏ hoàn công',
            heat: ai?.heat || 'NEUTRAL'
        };
        const resp = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000)
        });
        console.log(`[Sheet Sync] ✅ Đồng bộ "${item.title.substring(0, 40)}..." → HTTP ${resp.status}`);
        return resp.ok;
    } catch (e) {
        console.warn(`[Sheet Sync] Lỗi: ${e.message}`);
        return false;
    }
}

// ── Bước 4: Gửi Telegram Alert ─────────────────────────────────────────────
async function sendTelegram(item, ai) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.warn('[Telegram] Chưa có TELEGRAM_BOT_TOKEN. Bỏ qua.');
        return;
    }
    const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    const heat = ai?.heat || 'NEUTRAL';
    const heatIcon = heat === 'HOT' ? '🔥' : heat === 'WARM' ? '⚡' : '📰';

    let msg = `${heatIcon} <b>[TIN NÓNG BĐS DÒNG TIỀN — NGUYỆT LAND]</b> <i>${timeStr}</i>\n\n`;
    msg += `📌 <b>${(ai?.headline || item.title).substring(0, 100)}</b>\n`;
    msg += `🏛️ <i>Nguồn: ${item.sourceName}</i>\n\n`;

    if (ai) {
        msg += `💡 <b>Phân tích AI:</b>\n`;
        msg += `• <b>Tác động Đà Nẵng:</b> ${ai.impact}\n`;
        msg += `• <b>Cap Rate dự báo:</b> <code>${ai.cap_rate}</code>\n`;
        msg += `• <b>Lời khuyên:</b> <i>${ai.advice}</i>\n\n`;
    } else {
        msg += `📝 ${item.desc.substring(0, 200)}...\n\n`;
    }

    msg += `🔗 <a href="${item.link}">Đọc bài gốc tại ${item.sourceName}</a>\n`;
    msg += `🌐 <a href="https://bds.breaths.live/news">Portal Bản Tin BĐS Nguyệt Land</a>\n`;
    msg += `📞 <b>Hotline/Zalo:</b> <code>0935.509.168</code>`;

    try {
        const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: msg,
                parse_mode: 'HTML',
                disable_web_page_preview: false
            }),
            signal: AbortSignal.timeout(10000)
        });
        console.log(`[Telegram] ✅ Đã gửi: "${item.title.substring(0, 50)}..." → ${resp.status}`);
    } catch (e) {
        console.warn(`[Telegram] Lỗi gửi: ${e.message}`);
    }
}

// ── Main: Chạy toàn chu kỳ quét ────────────────────────────────────────────
async function main() {
    console.log('══════════════════════════════════════════════════════════════');
    console.log('🏡 OPC-BĐS CLOUD SCANNER v2.0 — NGUYỆT LAND (GITHUB ACTIONS)');
    console.log(`⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    console.log(`📡 Quét ${RSS_FEEDS.length} nguồn báo BĐS uy tín Việt Nam`);
    console.log('══════════════════════════════════════════════════════════════');

    // Kiểm tra config
    console.log(`[Config] GEMINI: ${GEMINI_API_KEY ? '✅ Có' : '❌ Thiếu'}`);
    console.log(`[Config] TELEGRAM: ${TELEGRAM_BOT_TOKEN ? '✅ Có' : '❌ Thiếu'}`);
    console.log(`[Config] SHEET WEBHOOK: ${GOOGLE_SHEET_WEBHOOK_URL ? '✅ Có' : '❌ Thiếu'}`);

    // Thu thập tin tức từ tất cả kênh
    const allFetches = await Promise.all(RSS_FEEDS.map(f => fetchFeed(f)));
    const allItems = allFetches.flat();
    console.log(`[Scanner] Tổng tin thu thập: ${allItems.length} bài từ ${RSS_FEEDS.length} nguồn`);

    if (allItems.length === 0) {
        console.log('[Scanner] Không có tin mới. Kết thúc chu kỳ.');
        await sendTelegramHeartbeat();
        return;
    }

    // Xử lý tối đa 2 tin HOT nhất trong mỗi lần chạy (tránh spam)
    const topItems = allItems.slice(0, 2);
    let synced = 0;

    for (const item of topItems) {
        console.log(`\n[Processing] 📰 "${item.title.substring(0, 70)}..."`);
        console.log(`            📍 Nguồn: ${item.sourceName}`);

        // Phân tích AI
        const ai = await analyzeWithGemini(item);
        if (ai) {
            console.log(`[Gemini AI] ✅ Heat: ${ai.heat} | Cap Rate: ${ai.cap_rate}`);
        }

        // Song song: Sync sheet + Gửi Telegram
        await Promise.all([
            syncToGoogleSheet(item, ai),
            sendTelegram(item, ai)
        ]);

        synced++;
    }

    console.log(`\n[Scanner] ✅ HOÀN TẤT — Đã xử lý ${synced}/${topItems.length} tin BĐS.`);
    console.log(`[Scanner] 📊 Google Sheet: ${GOOGLE_SHEET_WEBHOOK_URL ? 'Đã đồng bộ' : 'Bỏ qua (thiếu URL)'}`);
    console.log(`[Scanner] 📲 Telegram: ${TELEGRAM_BOT_TOKEN ? 'Đã gửi' : 'Bỏ qua (thiếu token)'}`);
}

// Heartbeat khi không có tin mới — cho biết cron vẫn đang chạy
async function sendTelegramHeartbeat() {
    if (!TELEGRAM_BOT_TOKEN) return;
    const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: `✅ <b>[Hệ Thống Nguyệt Land — Heartbeat]</b>\n• Cron 10 phút đang chạy ổn định\n• Thời gian: ${timeStr}\n• Trạng thái: Không có tin BĐS mới trong chu kỳ này\n• Portal: <a href="https://bds.breaths.live">bds.breaths.live</a>`,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            }),
            signal: AbortSignal.timeout(5000)
        });
    } catch (_) {}
}

main().catch(e => {
    console.error('[Scanner Fatal Error]', e);
    process.exit(1);
});
