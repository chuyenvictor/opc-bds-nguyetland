/**
 * scripts/sanitize_articles.mjs
 * Làm sạch toàn bộ dữ liệu articles trong SQLite: loại bỏ raw JSON, đảm bảo summary và content là tiếng Việt chuẩn.
 */
import { getDb } from '../routes/api-content-db.mjs';

const db = getDb();
const articles = db.prepare('SELECT id, title, summary, content FROM articles').all();

console.log(`Đang kiểm tra & làm sạch ${articles.length} bài viết...`);

for (const a of articles) {
    let cleanSummary = a.summary || '';
    let cleanContent = a.content || '';

    // Fix summary nếu là JSON
    if (cleanSummary.startsWith('{') || cleanSummary.includes('"article"')) {
        try {
            const parsed = JSON.parse(cleanSummary);
            if (parsed.article && parsed.article.summary) {
                cleanSummary = parsed.article.summary;
            } else if (parsed.summary) {
                cleanSummary = parsed.summary;
            }
        } catch (_) {
            const m = cleanSummary.match(/"summary":\s*"([^"]+)"/);
            if (m) cleanSummary = m[1];
        }
    }

    // Fix content nếu là JSON
    if (cleanContent.startsWith('{') || cleanContent.includes('"article"')) {
        try {
            const parsed = JSON.parse(cleanContent);
            if (parsed.article && parsed.article.content) {
                cleanContent = parsed.article.content;
            } else if (parsed.content) {
                cleanContent = parsed.content;
            }
        } catch (_) {
            const m = cleanContent.match(/"content":\s*"([^"]+)"/);
            if (m) cleanContent = m[1];
        }
    }

    // Format clean plain text summary
    cleanSummary = cleanSummary.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanSummary.startsWith('{')) {
        cleanSummary = 'Phân tích chi tiết về dòng tiền, tỷ suất sinh lời Cap Rate và pháp lý quy hoạch tại thị trường BĐS Đà Nẵng năm 2026.';
    }

    db.prepare('UPDATE articles SET summary = ?, content = ? WHERE id = ?').run(cleanSummary, cleanContent, a.id);
    console.log(`✅ Bài #${a.id}: ${cleanSummary.substring(0, 70)}...`);
}

console.log('🎉 Hoàn tất làm sạch database!');
