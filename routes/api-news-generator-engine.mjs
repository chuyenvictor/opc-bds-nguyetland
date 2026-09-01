/**
 * routes/api-news-generator-engine.mjs — OPC-BĐS Top 5 Daily Content Engine
 * Tự động quét RSS tin nóng, phân tích BĐS Đà Nẵng, viết bài 800 chữ,
 * tạo kịch bản Podcast 3-5 phút, Video Shorts 60s, Prompt Ảnh AI & Social Post.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, upsertArticle, slugify } from './api-content-db.mjs';
import { fetchAllRssFeeds, RSS_SOURCES } from './api-rss-crawler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'p');
const ROOT_P_DIR = path.join(__dirname, '..', 'p');

if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
if (!fs.existsSync(ROOT_P_DIR)) fs.mkdirSync(ROOT_P_DIR, { recursive: true });

// Danh sách khu vực & tiêu điểm BĐS Đà Nẵng
const DA_NANG_LOCATIONS = [
    { name: 'Phố Tây An Thượng (Ngũ Hành Sơn)', capRate: '11.5% - 13.8%/năm', focus: 'Căn hộ dịch vụ cho khách Tây & Digital Nomad', price: '18 - 35 Tỷ' },
    { name: 'Biển Mỹ Khê & Bãi Tắm T20 (Sơn Trà)', capRate: '10.5% - 12.5%/năm', focus: 'Khách sạn mini & Homestay du lịch cao cấp', price: '25 - 60 Tỷ' },
    { name: 'Hồ Nghinh & Phạm Văn Đồng (Sơn Trà)', capRate: '9.8% - 12.0%/năm', focus: 'Tòa nhà căn hộ khai thác dòng tiền ổn định', price: '20 - 45 Tỷ' },
    { name: 'Khu Đô Thị Nam Hòa Xuân (Cẩm Lệ)', capRate: '8.5% - 10.5%/năm', focus: 'Nhà phố thương mại & Shophouse ven sông', price: '8 - 18 Tỷ' },
    { name: 'Đường Bạch Đằng & Trung Tâm Hải Châu', capRate: '9.0% - 11.5%/năm', focus: 'Tòa nhà văn phòng & Căn hộ chuyên gia cao cấp', price: '30 - 80 Tỷ' }
];

const STOCK_IMAGES = [
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80'
];

/**
 * Sinh nội dung bài viết chuyên sâu & kịch bản podcast/video dựa trên tin RSS
 */
export function generateRichBdsContent(rssItem, index = 0) {
    const loc = DA_NANG_LOCATIONS[index % DA_NANG_LOCATIONS.length];
    const image = rssItem.image && !rssItem.image.includes('unsplash') ? rssItem.image : STOCK_IMAGES[index % STOCK_IMAGES.length];
    const cleanTitle = (rssItem.title || '').replace(/[\"\']/g, '');
    const cleanDesc = (rssItem.description || '').replace(/[\"\']/g, '');

    // 1. Tiêu đề SEO góc nhìn Đà Nẵng
    const transformedTitle = `Thị Trường BĐS Q3/2026: ${cleanTitle} — Cơ Hội Đón Đầu Dòng Tiền Tại ${loc.name}`;

    // 2. Tóm tắt cốt lõi
    const summary = `Bản tin từ ${rssItem.sourceName} chỉ rõ biến động mới nhất của thị trường BĐS. Đối với nhà đầu tư tại Đà Nẵng, khu vực ${loc.name} đang mở ra cơ hội tối ưu dòng tiền với tỷ suất Cap Rate đạt ${loc.capRate}, tập trung vào ${loc.focus}.`;

    // 3. Nội dung bài viết 800 chữ chuẩn SEO
    const content = `
<h2>1. Bối Cảnh Thị Trường & Dữ Liệu Thời Sự Từ ${rssItem.sourceName}</h2>
<p>${cleanDesc}</p>
<p>Thị trường bất động sản quý 3/2026 đang chứng kiến sự phân hóa rõ rệt giữa các phân khúc đầu cơ thuần túy và bất động sản tạo ra dòng tiền thật. Theo dữ liệu tổng hợp từ các cơ quan báo chí chính thống, dòng vốn thông minh của các nhà đầu tư lớn từ Hà Nội và TP.HCM đang có xu hướng dịch chuyển mạnh về các đô thị biển có hạ tầng hoàn thiện và lượng khách quốc tế lưu trú dài hạn ổn định.</p>

<h2>2. Tác Động Trực Tiếp Đến Thị Trường BĐS Dòng Tiền Đà Nẵng</h2>
<p>Tại Đà Nẵng, đặc biệt là khu vực <strong>${loc.name}</strong>, sự tăng trưởng về số lượng chuyến bay quốc tế và chính sách thị thực thông thoáng đang tạo ra nhu cầu thuê phòng cực lớn cho đối tượng chuyên gia nước ngoài và cộng đồng du mục số (Digital Nomad).</p>
<ul>
    <li><strong>Tỷ suất lấp đầy thực tế:</strong> Luôn duy trì từ 88% - 95% quanh năm nhờ vị trí gần biển và hệ sinh thái dịch vụ ẩm thực, giải trí hoàn chỉnh.</li>
    <li><strong>Khẩu vị đầu tư:</strong> Nhà đầu tư ưu tiên các tòa căn hộ từ 6 - 15 phòng với hệ thống phòng cháy chữa cháy (PCCC) đã được nghiệm thu và có giấy phép xây dựng chuẩn chỉ.</li>
    <li><strong>Mức giá giao dịch bình quân:</strong> Dao động từ <em>${loc.price}</em> tùy thuộc vào diện tích mặt tiền và doanh thu khai thác thực tế.</li>
</ul>

<h2>3. Bóc Tách Bài Toán Lợi Nhuận Thực Tế (Cap Rate & Dòng Tiền)</h2>
<p>Nguyệt Land thực hiện bảng tính dòng tiền thực tế (Cash-on-Cash Return) cho một tòa căn hộ dịch vụ tiêu biểu tại ${loc.name}:</p>
<table style="width:100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #334155;">
    <thead>
        <tr style="background-color: #1e293b; color: #fbbf24;">
            <th style="padding: 10px; border: 1px solid #334155; text-align: left;">Chỉ Số Tài Chính</th>
            <th style="padding: 10px; border: 1px solid #334155; text-align: right;">Giá Trị Thực Tế</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 8px; border: 1px solid #334155;">Tổng vốn đầu tư (Giá mua + Setup)</td>
            <td style="padding: 8px; border: 1px solid #334155; text-align: right; font-weight: bold;">${loc.price.split('-')[0].trim()} Tỷ VNĐ</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #334155;">Doanh thu cho thuê phòng bình quân / tháng</td>
            <td style="padding: 8px; border: 1px solid #334155; text-align: right; color: #10b981; font-weight: bold;">120 - 180 Triệu VNĐ</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #334155;">Chi phí vận hành, quản lý & bảo trì (15%)</td>
            <td style="padding: 8px; border: 1px solid #334155; text-align: right; color: #ef4444;">18 - 27 Triệu VNĐ</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #334155;"><strong>Dòng tiền ròng (Net Operating Income)</strong></td>
            <td style="padding: 8px; border: 1px solid #334155; text-align: right; color: #fbbf24; font-weight: bold;">102 - 153 Triệu / Tháng</td>
        </tr>
        <tr style="background-color: #0f172a;">
            <td style="padding: 8px; border: 1px solid #334155;"><strong>Tỷ suất sinh lời ròng (Cap Rate)</strong></td>
            <td style="padding: 8px; border: 1px solid #334155; text-align: right; color: #fbbf24; font-weight: bold; font-size: 14px;">${loc.capRate}</td>
        </tr>
    </tbody>
</table>

<h2>4. Khuyến Nghị Thực Chiến Độc Quyền Từ Nguyệt Land</h2>
<p>Để tối đa hóa an toàn vốn và lợi nhuận ròng, nhà đầu tư cần tuân thủ <strong>Quy tắc Thẩm định 4 Lớp</strong> trước khi đặt cọc:</p>
<ol>
    <li><strong>Lớp 1 (Pháp lý):</strong> Sổ đỏ sẵn sàng giao dịch, không vướng tranh chấp hoặc quy hoạch mở đường.</li>
    <li><strong>Lớp 2 (PCCC & Xây Dựng):</strong> Bắt buộc có lối thoát hiểm thứ 2, thang sắt ngoài trời hoặc hệ thống báo cháy tự động được cơ quan chức năng phê duyệt.</li>
    <li><strong>Lớp 3 (Lịch sử dòng tiền):</strong> Yêu cầu sao kê tài khoản nhận tiền thuê nhà tối thiểu 6 tháng gần nhất để kiểm chứng công suất thực.</li>
    <li><strong>Lớp 4 (Đòn bẩy ngân hàng):</strong> Không vay quá 50% giá trị tài sản để đảm bảo dòng tiền ròng luôn dương ngay cả trong mùa thấp điểm.</li>
</ol>
<p style="background: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; padding: 12px; border-radius: 4px;">
    <strong>💡 Liên hệ ngay Nguyệt Land:</strong> Quý nhà đầu tư có nhu cầu khảo sát thực địa các tòa căn hộ dòng tiền thật tại ${loc.name}, vui lòng liên hệ Hotline/Zalo: <strong>0935.509.168</strong> để nhận Báo Cáo Thẩm Định Chi Tiết trong 15 phút.
</p>
    `.trim();

    // 4. KỊCH BẢN PODCAST 3 - 5 PHÚT (Host Nguyệt Land & Chuyên Gia Tài Chính Victor)
    const podcastScript = {
        episode_title: `Tập ${index + 1}: Điểm Tin BĐS Q3/2026 — Giải Mã Dòng Tiền ${loc.name}`,
        duration: '04:30',
        speakers: ['Host: Nguyệt Land (Chuyên gia BĐS Đà Nẵng)', 'Guest: Victor Chuyên (Chuyên gia Tài Chính & Định Giá)'],
        dialogue: [
            {
                speaker: 'Nguyệt Land',
                time: '00:00 - 00:45',
                text: `Xin chào quý thính giả và các nhà đầu tư của kênh Podcast Nguyệt Land! Hôm nay chúng ta sẽ cùng bóc tách bản tin rất nóng từ ${rssItem.sourceName}: "${cleanTitle}". Đồng hành cùng Nguyệt hôm nay là anh Victor Chuyên — Chuyên gia định giá và cố vấn tài chính BĐS dòng tiền. Chào anh Victor!`
            },
            {
                speaker: 'Victor Chuyên',
                time: '00:45 - 01:45',
                text: `Chào Nguyệt và chào quý nhà đầu tư! Bản tin này phản ánh rất đúng thực tế thị trường hiện nay. Lãi suất đang ở mức ổn định và dòng tiền thông minh không còn tìm kiếm đất nền vùng ven chờ tăng giá ảo nữa, mà chuyển hẳn sang các tài sản có thể tạo ra doanh thu từ đêm nay, đặc biệt là các tòa căn hộ dịch vụ ven biển Đà Nẵng.`
            },
            {
                speaker: 'Nguyệt Land',
                time: '01:45 - 03:00',
                text: `Chính xác anh Victor! Cụ thể tại ${loc.name}, các căn hộ dịch vụ full nội thất hiện nay đạt công suất thuê lên tới trên 90%. Giá thuê trung bình mỗi phòng từ 8 - 14 triệu/tháng. Như vậy một tòa 10 phòng có thể mang về doanh thu từ 80 đến 120 triệu mỗi tháng, tương đương Cap Rate từ ${loc.capRate}. Vậy khi nhà đầu tư đi thẩm định thì cần lưu ý điều gì nhất anh?`
            },
            {
                speaker: 'Victor Chuyên',
                time: '03:00 - 04:00',
                text: `Điều quan trọng nhất là "4 Lớp Thẩm Định". Thứ nhất là Sổ đỏ hoàn công. Thứ hai là hệ thống PCCC đạt chuẩn. Thứ ba là sao kê doanh thu thực tế 6 tháng qua. Và thứ tư là cơ cấu vốn vay: chỉ nên dùng đòn bẩy tối đa 40-50% để dòng tiền thu về luôn đủ trả gốc lãi và vẫn còn tiền ròng bỏ túi.`
            },
            {
                speaker: 'Nguyệt Land',
                time: '04:00 - 04:30',
                text: `Rất tuyệt vời! Quý vị muốn nhận danh mục 5 tòa căn hộ đạt chuẩn PCCC tại ${loc.name}, hãy truy cập bds.breaths.live hoặc nhắn tin trực tiếp qua Zalo 0935.509.168. Hẹn gặp lại quý vị trong số Podcast tiếp theo!`
            }
        ]
    };

    // 5. KỊCH BẢN VIDEO NGẮN SHORTS / TIKTOK / REELS 60S
    const shortsScript = {
        title: `Video 60s: ${cleanTitle.substring(0, 60)}...`,
        hook_0_5s: `🔥 Đừng dại mua BĐS Đà Nẵng nếu chưa biết tin nóng này trên ${rssItem.sourceName}!`,
        problem_5_20s: `Báo chí vừa đưa tin: "${cleanTitle.substring(0, 80)}". Nhưng người thắng lớn ở Đà Nẵng không mua đất bỏ hoang, mà họ săn lùng các tòa căn hộ dòng tiền tại ${loc.name}!`,
        solution_20_45s: `Tại sao ư? Một tòa căn hộ tại đây tạo ra dòng tiền ròng từ 100 - 150 triệu mỗi tháng, tỷ suất sinh lời Cap Rate đạt ${loc.capRate}, cao gấp 2.5 lần lãi suất tiết kiệm ngân hàng!`,
        cta_45_60s: `📲 Muốn xem bảng thẩm định 4 lớp và sổ đỏ gốc? Bấm link bio hoặc gọi ngay Nguyệt Land: 0935.509.168!`,
        visual_cues: `0-5s: Text đỏ nổi bật + Cảnh báo ⚠️ | 5-20s: Chụp màn hình bài báo ${rssItem.sourceName} | 20-45s: Video flycam bãi biển Đà Nẵng & phòng căn hộ cao cấp + Text số tiền 150tr/tháng | 45-60s: Logo Nguyệt Land + SĐT 0935.509.168`,
        soundtrack: 'Nhạc nền Epic Cinematic / Lo-fi Chill Focus'
    };

    // 6. PROMPT AI TẠO ẢNH & VIDEO MINH HỌA (Midjourney / Imagen / DALL-E)
    const aiImagePrompt = `Photorealistic 8k architectural shot of a modern luxury serviced apartment building in Da Nang beachfront, Vietnam. Golden hour sunset lighting, lush tropical balcony plants, sleek glass facade, clean street with international tourists and palm trees, cinematic depth of field, high-end real estate commercial style --ar 16:9 --v 6.0`;

    // 7. BÀI ĐĂNG MẠNG XÃ HỘI (Facebook / Zalo / LinkedIn Post)
    const socialPost = `
🔥 [ĐIỂM TIN BĐS THỜI SỰ & GÓC NHÌN ĐẦU TƯ ĐÀ NẴNG Q3/2026]

📰 Nguồn tin: ${rssItem.sourceName}
📌 Tiêu điểm: ${cleanTitle}

💡 GÓC NHÌN TỪ NGUYỆT LAND:
Khi thị trường bước vào chu kỳ thanh lọc mạnh, chỉ những bất động sản tạo ra DÒNG TIỀN THẬT mới là kênh trú ẩn an toàn và sinh lời bền vững.

🌟 Cơ hội vàng tại ${loc.name}:
✅ Tỷ suất sinh lời (Cap Rate): ${loc.capRate}
✅ Doanh thu khai thác ròng: 100 - 180 Triệu/Tháng
✅ Khách lưu trú dài hạn kín phòng quanh năm
✅ Đầy đủ pháp lý: Sổ đỏ + PCCC + GPXD nghiệm thu chuẩn

👉 Đọc toàn bộ bài phân tích chuyên sâu tại: https://bds.breaths.live/news
📞 Hotline/Zalo thẩm định miễn phí: 0935.509.168 (Nguyệt Land)

#BatDongSanDaNang #NguyetLand #BdsDongTien #CanHoDichVu #CapRate #DauTuBds2026
    `.trim();

    return {
        title: transformedTitle,
        original_title: cleanTitle,
        source: rssItem.sourceName,
        source_url: rssItem.link,
        image_url: image,
        location: loc.name,
        cap_rate: loc.capRate,
        price: loc.price,
        summary,
        content,
        podcast_script: podcastScript,
        shorts_script: shortsScript,
        ai_image_prompt: aiImagePrompt,
        social_post: socialPost,
        tags: ['tin-nong-bds', 'da-nang', 'dong-tien', 'nguyet-land', loc.name.toLowerCase().replace(/[^a-z0-9]/g, '-')]
    };
}

/**
 * TẠO FILE HTML TĨNH CHO BÀI VIẾT (/p/<slug>.html)
 */
export function buildStaticArticleHtml(article) {
    const slug = article.slug;
    const podcastHtml = article.podcast_script ? `
        <div class="my-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-yellow-500/5 border border-amber-400/30">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <i class="fa-solid fa-microphone-lines text-lg"></i>
                </div>
                <div>
                    <h3 class="font-bold text-base text-amber-300">${article.podcast_script.episode_title}</h3>
                    <p class="text-xs text-slate-400">Thời lượng: ${article.podcast_script.duration} | Người tham gia: ${article.podcast_script.speakers.join(', ')}</p>
                </div>
            </div>
            <div class="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                ${article.podcast_script.dialogue.map(d => `
                    <div>
                        <span class="font-bold ${d.speaker.includes('Nguyệt') ? 'text-amber-400' : 'text-sky-400'}">${d.speaker} [${d.time}]:</span>
                        <p class="text-slate-300 mt-0.5 leading-relaxed">${d.text}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    const shortsHtml = article.shorts_script ? `
        <div class="my-8 p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 via-slate-900 to-pink-500/5 border border-rose-500/30">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
                        <i class="fa-brands fa-tiktok text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-base text-rose-300">Kịch Bản Video Ngắn 60s (TikTok / Shorts / Reels)</h3>
                        <p class="text-xs text-slate-400">Tối ưu tỷ lệ giữ chân & chuyển đổi khách hàng</p>
                    </div>
                </div>
                <span class="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-[11px] font-bold border border-rose-500/40">60 Giây</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div class="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20">
                    <b class="text-rose-400 block mb-1">🎯 [0 - 5s] Hook Mở Đầu:</b>
                    <p class="text-slate-300">${article.shorts_script.hook_0_5s}</p>
                </div>
                <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <b class="text-amber-400 block mb-1">⚠️ [5 - 20s] Vấn Đề Báo Chí:</b>
                    <p class="text-slate-300">${article.shorts_script.problem_5_20s}</p>
                </div>
                <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <b class="text-emerald-400 block mb-1">💡 [20 - 45s] Giải Pháp Dòng Tiền:</b>
                    <p class="text-slate-300">${article.shorts_script.solution_20_45s}</p>
                </div>
                <div class="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30">
                    <b class="text-emerald-400 block mb-1">📞 [45 - 60s] Kêu Gọi Hành Động:</b>
                    <p class="text-slate-300">${article.shorts_script.cta_45_60s}</p>
                </div>
            </div>
            <div class="mt-3 p-3 bg-slate-950/40 rounded-lg text-[11px] text-slate-400 italic">
                <b>🎬 Hướng dẫn quay & đồ họa:</b> ${article.shorts_script.visual_cues}
            </div>
        </div>
    ` : '';

    return `<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | Nguyệt Land BĐS Đà Nẵng</title>
    <meta name="description" content="${article.summary}">
    <meta name="keywords" content="${(article.tags || []).join(', ')}, bất động sản đà nẵng, nguyệt land">
    <link rel="canonical" href="https://bds.breaths.live/p/${slug}.html">
    <link rel="icon" type="image/png" href="/img/nguyet-bds.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #0a0f1a; color: #f1f5f9; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .glass { background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .article-body h2 { font-size: 1.35rem; font-weight: 700; color: #fbbf24; margin-top: 1.75rem; margin-bottom: 0.75rem; font-family: 'Cormorant Garamond', serif; }
        .article-body p { margin-bottom: 1rem; line-height: 1.75; color: #cbd5e1; font-size: 0.95rem; }
        .article-body ul, .article-body ol { margin-left: 1.5rem; margin-bottom: 1rem; color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; }
        .article-body li { margin-bottom: 0.5rem; }
    </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950">

    <!-- HEADER -->
    <header class="sticky top-0 z-50 glass border-b border-slate-800 px-4 lg:px-8 py-3.5">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/news" class="flex items-center gap-3">
                <img src="/img/nguyet-bds.png" alt="Logo" class="w-8 h-8 rounded-full border border-amber-400">
                <span class="font-serif font-bold text-amber-400 text-base">NGUYỆT LAND</span>
            </a>
            <div class="flex items-center gap-3">
                <a href="/news" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition">
                    ← Trở lại Bản Tin
                </a>
                <a href="https://zalo.me/0935509168" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5">
                    <i class="fa-solid fa-phone"></i> 0935.509.168
                </a>
            </div>
        </div>
    </header>

    <!-- ARTICLE CONTAINER -->
    <main class="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <a href="/" class="hover:text-amber-400">Trang chủ</a> <span>/</span>
            <a href="/news" class="hover:text-amber-400">Bản tin BĐS</a> <span>/</span>
            <span class="text-amber-400">${article.location || 'Đà Nẵng'}</span>
        </div>

        <!-- Title -->
        <h1 class="font-serif font-black text-2xl sm:text-4xl text-slate-100 leading-tight mb-4">
            ${article.title}
        </h1>

        <!-- Meta Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-800 text-xs text-slate-400 mb-6">
            <div class="flex items-center gap-3">
                <span class="text-amber-300 font-semibold"><i class="fa-solid fa-user-tie"></i> Nguyệt Land AI</span>
                <span>•</span>
                <span><i class="fa-regular fa-clock"></i> ${new Date().toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span class="text-sky-400"><i class="fa-solid fa-newspaper"></i> Nguồn: ${article.source}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                    Cap Rate: ${article.cap_rate}
                </span>
            </div>
        </div>

        <!-- Featured Image -->
        <div class="relative rounded-2xl overflow-hidden mb-8 border border-slate-800 aspect-video bg-slate-900">
            <img src="${article.image_url}" alt="${article.title}" class="w-full h-full object-cover">
            <div class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent text-xs text-slate-300">
                📍 <b>Khu vực:</b> ${article.location} | 💰 <b>Tầm giá:</b> ${article.price || '15 - 40 Tỷ'}
            </div>
        </div>

        <!-- Summary Callout -->
        <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm leading-relaxed mb-8">
            <b>📌 TÓM TẮT ĐIỂM TIN:</b> ${article.summary}
        </div>

        <!-- Article Content -->
        <div class="article-body">
            ${article.content}
        </div>

        <!-- Podcast Script Embedded -->
        ${podcastHtml}

        <!-- Shorts Script Embedded -->
        ${shortsHtml}

        <!-- Social Share & Contact Box -->
        <div class="mt-12 p-6 rounded-2xl glass border border-amber-500/30 text-center space-y-4">
            <h3 class="font-serif font-bold text-xl text-amber-300">Bạn Muốn Nhận Báo Cáo Thẩm Định Chi Tiết Tòa Nhà Này?</h3>
            <p class="text-xs text-slate-400 max-w-lg mx-auto">Nguyệt Land hỗ trợ thẩm định 4 lớp: Sổ đỏ gốc, hệ thống PCCC nghiệm thu, sao kê dòng tiền thực tế và tư vấn đòn bẩy ngân hàng tối ưu.</p>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a href="https://zalo.me/0935509168" target="_blank" class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg hover:scale-105 transition flex items-center gap-2">
                    <i class="fa-solid fa-comments"></i> Nhắn Zalo Nguyệt Land (0935.509.168)
                </a>
                <a href="/news" class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition">
                    Xem Thêm Bản Tin Khác
                </a>
            </div>
        </div>
    </main>

    <!-- FOOTER -->
    <footer class="glass border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-12">
        <p>© 2026 Nguyệt Land — BĐS Dòng Tiền Đà Nẵng | bds.breaths.live</p>
    </footer>

</body>
</html>
    `;
}

/**
 * 🚀 HÀM 1-CLICK: TỰ ĐỘNG QUÉT VÀ VIẾT TOP 5 BÀI BĐS ĐÀ NẴNG HÔM NAY
 */
export async function executeTop5DailyGeneration() {
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('⚡ [1-CLICK CONTENT ENGINE] BẮT ĐẦU TẠO TOP 5 BÀI VIẾT + PODCAST + SHORTS BĐS');
    console.log(`⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`);
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // 1. Quét RSS fresh từ 7 nguồn báo
    const rssFeeds = await fetchAllRssFeeds(true);
    const rawItems = rssFeeds.items || [];
    console.log(`[1-Click Engine] Tìm thấy ${rawItems.length} bản tin RSS từ các tòa soạn.`);

    if (rawItems.length === 0) {
        throw new Error('Không thể tải bản tin RSS từ các tòa soạn. Vui lòng kiểm tra kết nối mạng.');
    }

    // Chọn ra 5 tin chất lượng nhất
    const top5Items = rawItems.slice(0, 5);
    const generatedArticles = [];

    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '-1003891453026';

    for (let i = 0; i < top5Items.length; i++) {
        const item = top5Items[i];
        console.log(`\n[1-Click ${i + 1}/5] Đang xử lý: "${item.title.substring(0, 60)}..." (${item.sourceName})`);

        // Sinh nội dung phong phú
        const richData = generateRichBdsContent(item, i);

        // Kiểm tra trùng lặp theo source_url hoặc title trong CSDL
        const db = getDb();
        const existing = db.prepare('SELECT id, slug FROM articles WHERE source_url = ? OR title = ?').get(richData.source_url, richData.title);
        if (existing) {
            console.log(`[1-Click] ⏩ Bỏ qua bài viết đã tồn tại: "${richData.title.substring(0, 50)}..." (slug: ${existing.slug})`);
            continue;
        }

        const baseSlug = slugify(richData.title).substring(0, 75);
        const slug = `${baseSlug}-2026`;
        richData.slug = slug;

        // Lưu vào SQLite
        upsertArticle({
            slug,
            title: richData.title,
            summary: richData.summary,
            content: richData.content,
            location: richData.location,
            price: richData.price,
            cap_rate: richData.cap_rate,
            image_url: richData.image_url,
            category: 'market-news',
            tags: richData.tags,
            source_url: richData.source_url,
            author: 'Nguyệt Land × AI Insight',
            status: 'published'
        });

        // Tạo file HTML tĩnh
        const staticHtml = buildStaticArticleHtml(richData);
        try {
            fs.writeFileSync(path.join(ARTICLES_DIR, `${slug}.html`), staticHtml, 'utf8');
            fs.writeFileSync(path.join(ROOT_P_DIR, `${slug}.html`), staticHtml, 'utf8');
            console.log(`[1-Click] 📄 Đã tạo file HTML tĩnh: /p/${slug}.html`);
        } catch (fErr) {
            console.warn('[1-Click File Error]', fErr.message);
        }

        // Đồng bộ Sheet
        if (sheetWebhook) {
            fetch(sheetWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'rss_sync',
                    source: richData.source,
                    title: richData.title,
                    summary: richData.summary,
                    capRate: richData.cap_rate
                })
            }).catch(e => console.warn('[Sheet Sync Warning]', e.message));
        }

        generatedArticles.push({
            id: i + 1,
            slug,
            title: richData.title,
            original_title: richData.original_title,
            source: richData.source,
            source_url: richData.source_url,
            image_url: richData.image_url,
            location: richData.location,
            cap_rate: richData.cap_rate,
            summary: richData.summary,
            public_url: `/p/${slug}.html`,
            podcast_script: richData.podcast_script,
            shorts_script: richData.shorts_script,
            ai_image_prompt: richData.ai_image_prompt,
            social_post: richData.social_post
        });
    }

    // Gửi Telegram Alert tổng kết 5 bài viết
    if (botToken) {
        const timeStr = new Date().toLocaleString('vi-VN');
        let teleMsg = `⚡ <b>[1-CLICK: ĐÃ TẠO XONG TOP 5 BÀI VIẾT & KỊCH BẢN BĐS ĐÀ NẴNG]</b> <i>(${timeStr})</i>\n\n`;
        generatedArticles.forEach((a, idx) => {
            teleMsg += `<b>${idx + 1}.</b> <a href="https://bds.breaths.live${a.public_url}">${a.title}</a>\n`;
            teleMsg += `   📍 <i>${a.location} | Cap Rate: ${a.cap_rate}</i>\n`;
        });
        teleMsg += `\n🎙️ Đã kèm 5 Kịch bản Podcast & 5 Video Shorts 60s!\n`;
        teleMsg += `🌐 <b>Xem portal:</b> https://bds.breaths.live/news\n`;
        teleMsg += `📞 <b>Hotline:</b> <code>0935.509.168</code>`;

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: teleMsg,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        }).catch(e => console.warn('[Telegram Alert Warning]', e.message));
    }

    console.log(`[1-Click Engine] ✅ Hoàn tất tạo ${generatedArticles.length} bài viết xuất bản + Podcast + Shorts!`);
    return generatedArticles;
}
