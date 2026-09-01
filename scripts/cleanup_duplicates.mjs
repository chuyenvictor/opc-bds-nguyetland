import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, checkpointDb } from '../routes/api-content-db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_P = path.join(__dirname, 'public', 'p');
const ROOT_P = path.join(__dirname, 'p');

const db = getDb();

console.log('=== 1. XÓA BÀI RÁC NON-BĐS (thời tiết, bóng đá, đại học) ===');
const deletedJunk = db.prepare(`
    DELETE FROM articles 
    WHERE title IN ('thời tiết huế', 'kết quả bóng đá la liga', 'đại học') 
       OR slug LIKE '%thoi-tiet%' 
       OR slug LIKE '%bong-da%' 
       OR slug LIKE '%dai-hoc%'
`).run();
console.log(`Đã xóa ${deletedJunk.changes} bài viết rác trong SQLite.`);

console.log('\n=== 2. TÌM VÀ DỌN DẸP BÀI VIẾT TRÙNG LẶP TRONG SQLITE ===');
const articles = db.prepare('SELECT id, slug, title, source_url, publish_at FROM articles ORDER BY id DESC').all();
const seenTitles = new Map();
const toDeleteDbIds = [];

for (const a of articles) {
    const normTitle = a.title.trim().toLowerCase();
    if (seenTitles.has(normTitle)) {
        toDeleteDbIds.push(a.id);
        console.log(`Phát hiện bản ghi trùng: ID ${a.id} - "${a.title.substring(0, 50)}..."`);
    } else {
        seenTitles.set(normTitle, a.slug);
    }
}

if (toDeleteDbIds.length > 0) {
    const placeholders = toDeleteDbIds.map(() => '?').join(',');
    const delRes = db.prepare(`DELETE FROM articles WHERE id IN (${placeholders})`).run(...toDeleteDbIds);
    console.log(`Đã xóa ${delRes.changes} bản ghi trùng lặp trong SQLite.`);
} else {
    console.log('Không có bản ghi trùng lặp trong SQLite.');
}

console.log('\n=== 3. DỌN DẸP FILE HTML TRÙNG LẶP TRÊN DISK (public/p & p) ===');
// Xóa các file duplicate đã phát hiện:
const dupPatterns = [
    'mtfjadnp-mtfjadnp-3.html',
    'mtfjadnc-mtfjadnc-1.html',
    'mtfjadmw-mtfjadmw-0.html',
    'mtfjadnk-mtfjadnk-2.html',
    'mtfjadnw-mtfjadnw-4.html'
];

let filesDeleted = 0;
for (const dir of [PUBLIC_P, ROOT_P]) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (dupPatterns.some(pat => f.includes(pat))) {
            const fp = path.join(dir, f);
            fs.unlinkSync(fp);
            filesDeleted++;
            console.log(`Đã xóa file trùng: ${f}`);
        }
    }
}
console.log(`Tổng số file HTML trùng lặp đã xóa: ${filesDeleted}`);

checkpointDb();
console.log('\n✅ Hoàn tất dọn dẹp cơ sở dữ liệu và file tĩnh.');
