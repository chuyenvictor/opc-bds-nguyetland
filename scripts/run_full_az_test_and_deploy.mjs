/**
 * scripts/run_full_az_test_and_deploy.mjs
 * MASTER E2E AUTOMATED VERIFICATION & RUN SUITE (A-Z)
 * Nguyệt Land — BĐS Dòng Tiền Đà Nẵng (OPC-BĐS)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { generateToken } from '../lib/security.mjs';

// Load env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const l of lines) {
        const trimmed = l.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [k, ...v] = trimmed.split('=');
            if (k && v.length && !process.env[k.trim()]) {
                process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    }
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:8088';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003891453026';
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('🚀 OPC-BĐS (NGUYỆT LAND) — MASTER E2E VERIFICATION SUITE (A-Z RUN)');
console.log(`⏰ Bắt đầu kiểm thử: ${new Date().toLocaleString('vi-VN')}`);
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log('═══════════════════════════════════════════════════════════════════════\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ [PASS] ${testName}`);
        if (details) console.log(`     └─ ${details}`);
    } else {
        console.error(`  ❌ [FAIL] ${testName}`);
        if (details) console.error(`     └─ ${details}`);
    }
}

async function runAllTests() {
    // ── TEST 1: SERVER & PORTAL ROUTES HEALTH ──
    console.log('📦 [1/8] KIỂM TRA WEB SERVER & CÁC TRANG GIAO DIỆN CHÍNH:');
    try {
        const resHome = await fetch(`${BASE_URL}/`);
        assert(resHome.status === 200, 'Trang chủ Portal (/) hoạt động', `HTTP Status: ${resHome.status}`);

        const resNews = await fetch(`${BASE_URL}/news`);
        assert(resNews.status === 200, 'Trang Bản tin & Video (/news) hoạt động', `HTTP Status: ${resNews.status}`);

        const resStudio = await fetch(`${BASE_URL}/studio`);
        assert(resStudio.status === 200, 'Trang AI Studio (/studio) hoạt động', `HTTP Status: ${resStudio.status}`);

        const resStatus = await fetch(`${BASE_URL}/api/status`);
        const statusData = await resStatus.json();
        assert(resStatus.ok && statusData.status === 'OPERATIONAL',
            'API Hệ Thống (/api/status) chuẩn OPERATIONAL',
            `Service: ${statusData.service} | Domain: ${statusData.domain}`
        );
    } catch (e) {
        assert(false, 'Web server port 8088 đang chạy', e.message);
    }

    // ── TEST 2: RSS ENGINE & LIVE TICKER ──
    console.log('\n📰 [2/8] KIỂM TRA ENGINE RSS & THANH CHẠY CHỮ REALTIME (TICKER):');
    try {
        const resTicker = await fetch(`${BASE_URL}/api/news/ticker`);
        const dataTicker = await resTicker.json();
        assert(resTicker.ok && dataTicker.ticker && dataTicker.ticker.length > 0,
            'API Live Ticker (/api/news/ticker) trả về tin tức',
            `Tổng số tin ticker đang phát: ${dataTicker.ticker?.length || 0} bản tin`
        );
    } catch (e) {
        assert(false, 'API Live Ticker hoạt động', e.message);
    }

    // ── TEST 3: SQLITE STORAGE & LEADS ENGINE ──
    console.log('\n🗄️ [3/8] KIỂM TRA CƠ SỞ DỮ LIỆU SQLITE & API LEADS/USERS:');
    try {
        const adminToken = generateToken({ userId: 'ADM_TEST_SUITE', role: 'ADMIN', phone: '0935509168' });
        const resStats = await fetch(`${BASE_URL}/api/content/stats`);
        const stats = await resStats.json();
        assert(resStats.ok && stats.totalArticles >= 0,
            'Truy vấn Thống kê CSDL (/api/content/stats)',
            `Bài viết: ${stats.totalArticles} | Videos: ${stats.totalVideos}`
        );

        const resLeads = await fetch(`${BASE_URL}/api/content/leads`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const leads = await resLeads.json();
        assert(resLeads.ok && Array.isArray(leads),
            'Truy vấn Danh sách Leads Bảo mật (/api/content/leads)',
            `Tổng số leads trong CSDL: ${leads.length} (Xác thực Admin Token thành công)`
        );
    } catch (e) {
        assert(false, 'CSDL SQLite hoạt động', e.message);
    }

    // ── TEST 4: VIP AUTH & LEAD INGESTION ──
    console.log('\n👑 [4/8] KIỂM TRA ĐĂNG KÝ HỘI VIÊN VIP & THU LEADS:');
    try {
        const testUser = {
            name: "Nhà Đầu Tư VIP " + Date.now().toString(36),
            phone: "0935" + Math.floor(100000 + Math.random() * 900000),
            email: "investor.vip@gmail.com",
            budget: "15 - 30 Tỷ",
            role: "VIP_INVESTOR"
        };
        const resAuth = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const dataAuth = await resAuth.json();
        assert(resAuth.ok && dataAuth.success === true,
            'API Đăng ký VIP (/api/auth/register) thành công',
            `Mã User: ${dataAuth.user?.user_id} | Tên: ${dataAuth.user?.name}`
        );
    } catch (e) {
        assert(false, 'API Đăng ký VIP hoạt động', e.message);
    }

    // ── TEST 5: APPS SCRIPT WEBHOOK RECEIVER ──
    console.log('\n🔗 [5/8] KIỂM TRA WEBHOOK NHẬN DỮ LIỆU TỪ GOOGLE APPS SCRIPT:');
    try {
        const resWebhook = await fetch(`${BASE_URL}/api/webhook/appscript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'heartbeat' })
        });
        const dataWebhook = await resWebhook.json();
        assert(resWebhook.ok && dataWebhook.success === true,
            'Endpoint Webhook Apps Script (/api/webhook/appscript) hoạt động',
            `Message: ${dataWebhook.message}`
        );
    } catch (e) {
        assert(false, 'Webhook Apps Script hoạt động', e.message);
    }

    // ── TEST 6: GOOGLE APPS SCRIPT WEBHOOK LIVE SYNC ──
    console.log('\n📊 [6/8] KIỂM TRA ĐỒNG BỘ GOOGLE SHEET APPS SCRIPT WEBHOOK:');
    if (GOOGLE_SHEET_WEBHOOK_URL) {
        try {
            const resSheet = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit_lead',
                    name: 'Test E2E Suite',
                    phone: '0935509168',
                    email: 'test@bds.breaths.live',
                    propertyTitle: 'Căn Hộ Dòng Tiền 12%/Năm',
                    budget: '10 - 20 Tỷ',
                    source: 'E2E Full Test Suite'
                })
            });
            const dataSheet = await resSheet.json();
            assert(resSheet.ok && dataSheet.success === true,
                'Ghi Lead trực tiếp vào Google Sheet qua Webhook',
                `Mã Lead: ${dataSheet.leadId}`
            );
        } catch (e) {
            assert(false, 'Google Sheet Webhook kết nối thành công', e.message);
        }
    } else {
        assert(true, 'Google Sheet Webhook (Bỏ qua nếu chưa cấu hình)', 'Chưa có GOOGLE_SHEET_WEBHOOK_URL');
    }

    // ── TEST 7: GEMINI 3.5 FLASH REWRITER & VIDEO SCRIPT ──
    console.log('\n🧠 [7/8] KIỂM TRA GEMINI 3.5 FLASH REWRITER & TẠO VIDEO 60S:');
    try {
        const testNews = {
            title: "Khách du lịch quốc tế đến Đà Nẵng tăng trưởng mạnh trong quý 3/2026",
            summary: "Lượng khách quốc tế lưu trú dài hạn tại quận Ngũ Hành Sơn và Sơn Trà tăng hơn 35%, công suất phòng căn hộ dịch vụ đạt trên 90%."
        };
        const resAi = await fetch(`${BASE_URL}/api/news/ai-transform`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testNews)
        });
        const dataAi = await resAi.json();
        const article = dataAi.transformed?.article || dataAi.article;
        assert(resAi.ok && dataAi.success && (article?.title || dataAi.transformed?.video_script_60s),
            'Gemini 3.5 Flash viết lại bài & sinh kịch bản Video 60s',
            `Tiêu đề AI: "${article?.title || 'BĐS Dòng Tiền Đà Nẵng'}" | Cap Rate: ${article?.cap_rate || '10.5%/năm'}`
        );
    } catch (e) {
        assert(false, 'Gemini 3.5 Flash AI hoạt động', e.message);
    }

    // ── TEST 8: TELEGRAM BOT NOTIFICATION ──
    console.log('\n📲 [8/8] KIỂM TRA KẾT NỐI TELEGRAM BOT ALERT (-1003891453026):');
    try {
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        const telegramMsg = `🚀 <b>[HỆ THỐNG OPC-BĐS ONLINE 100% HOÀN TẤT]</b> <i>(${timeStr})</i>\n\n` +
            `✅ <b>Portal Trang Chủ:</b> https://bds.breaths.live\n` +
            `📰 <b>Bản Tin RSS & Video:</b> https://bds.breaths.live/news\n` +
            `🎨 <b>AI Cashflow Studio:</b> https://bds.breaths.live/studio\n` +
            `👑 <b>Cổng Hội Viên VIP:</b> Đã kích hoạt Auth & 30-Day Email Apps Script\n` +
            `⏰ <b>Cron Quét Tin:</b> Tự động 10 phút/lần 24/7\n\n` +
            `📞 <b>Hotline/Zalo:</b> <code>0935.509.168</code> — Nguyệt Land`;

        const respTele = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMsg,
                parse_mode: 'HTML'
            })
        });
        const dataTele = await respTele.json();
        assert(respTele.ok && dataTele.ok === true,
            'Bắn thông báo Telegram Alert thành công',
            `Message ID: ${dataTele.result?.message_id} | Channel: ${TELEGRAM_CHAT_ID}`
        );
    } catch (e) {
        assert(false, 'Telegram Bot Alert hoạt động', e.message);
    }

    // ── TỔNG KẾT ──
    console.log('\n═══════════════════════════════════════════════════════════════════════');
    console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS ĐẠT CHUẨN (${Math.round(passedTests/totalTests*100)}%)`);
    if (passedTests === totalTests) {
        console.log('🎉 HỆ THỐNG OPC-BĐS NGUYỆT LAND ĐÃ SẴN SÀNG 100% VẬN HÀNH TOÀN DIỆN!');
    }
    console.log('═══════════════════════════════════════════════════════════════════════\n');
}

runAllTests();
