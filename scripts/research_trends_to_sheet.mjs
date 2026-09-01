/**
 * scripts/research_trends_to_sheet.mjs — 1-Click CLI Script
 * Nghiên cứu xu hướng (Tavily/Google Trends) & nạp hàng chờ vào Google Sheets
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeTrendResearchAndQueue } from '../routes/api-trends-research.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const envPath = path.join(__dirname, '..', '.env');
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

const args = process.argv.slice(2);
let query = 'bất động sản đà nẵng dòng tiền căn hộ 2026';
let limit = 5;

for (const arg of args) {
    if (arg.startsWith('--q=')) query = arg.split('=')[1];
    if (arg.startsWith('--limit=')) limit = parseInt(arg.split('=')[1], 10);
}

async function run() {
    console.log(`======================================================`);
    console.log(`📊 OPC-BĐS NGUYỆT LAND — TREND RESEARCH TO GOOGLE SHEET`);
    console.log(`🔍 Từ khóa: "${query}" | Giới hạn: ${limit} chủ đề`);
    console.log(`======================================================`);

    const results = await executeTrendResearchAndQueue({ query, limit });
    console.log(`\n🎉 Hoàn thành! Đã nạp ${results.length} chủ đề vào hàng chờ Google Sheets (Tab 06_OPC_BDS_Tasks_AI).`);
    process.exit(0);
}

run().catch(err => {
    console.error('Lỗi thực thi:', err);
    process.exit(1);
});
