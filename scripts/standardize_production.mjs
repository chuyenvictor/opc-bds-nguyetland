import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootApp = path.join(__dirname, '..');

console.log('🚀 [OPC-BĐS STANDARDIZER] Bắt đầu chuẩn hóa chuyên nghiệp toàn bộ dự án...');

// 1. CẬP NHẬT _redirects CHO CLOUDFLARE PAGES EDGE
const redirectsContent = `# ═══════════════════════════════════════════════════════════════════════════
# CLOUDFLARE PAGES REWRITES & 301 REDIRECTS — NGUYET LAND (OPC-BDS)
# ═══════════════════════════════════════════════════════════════════════════

# Core Navigation Rewrites (Clean URLs)
/dossier                /dossier.html               200
/news                   /news.html                  200
/studio                 /studio.html                200

# Short Article Rewrites (No .html extension)
/p/bang-gia-dat-da-nang-2026      /p/bang-gia-dat-da-nang-2026.html     200
/p/5-tieu-chuan-pccc              /p/5-tieu-chuan-pccc.html             200
/p/toa-can-ho-an-thuong-120tr     /p/toa-can-ho-an-thuong-120tr.html    200
/p/khach-san-ho-nghinh-32ty       /p/khach-san-ho-nghinh-32ty.html      200
/p/digital-nomad-da-nang          /p/digital-nomad-da-nang.html         200
/p/so-sanh-cap-rate-da-nang       /p/so-sanh-cap-rate-da-nang.html      200
/p/cam-nang-36-diem               /p/cam-nang-36-diem.html              200

# 301 Redirects for Backward Compatibility & SEO Preservation
/index.html                                                                                                     /                                       301
/bds                                                                                                            /                                       301
/p/cam-nang-tham-dinh-bds-dong-tien-da-nang-2026.html                                                           /dossier                                301
/p/bang-gia-dat-da-nang-2026-phan-tich-tac-dong-thue-phi-chuyen-nhuong-ch-mtfjug9u-2026-v1.html                 /p/bang-gia-dat-da-nang-2026.html       301
/p/5-tieu-chuan-nghiem-thu-pccc-bat-buoc-doi-voi-toa-can-ho-dich-vu-cho-t-mtfjugc6-2026-v2.html                 /p/5-tieu-chuan-pccc.html               301
/p/ban-toa-can-ho-7-tang-pho-tay-an-thuong-my-an-dong-tien-120-trieuthang-mtfjugc9-2026-v3.html                 /p/toa-can-ho-an-thuong-120tr.html      301
/p/chuyen-nhuong-toa-khach-san-mini-8-tang-mat-tien-ho-nghinh-doanh-thu-2-mtfjugcc-2026-v4.html                 /p/khach-san-ho-nghinh-32ty.html        301
/p/lan-song-du-muc-so-digital-nomad-bung-no-tai-da-nang-vi-sao-can-ho-dic-mtfjugci-2026-v5.html                 /p/digital-nomad-da-nang.html           301
/p/so-sanh-cap-rate-bds-dong-tien-tai-sao-15-ty-dau-tu-da-nang-loi-nhuan--mtfjugco-2026-v6.html                 /p/so-sanh-cap-rate-da-nang.html        301
`;
fs.writeFileSync(path.join(rootApp, '_redirects'), redirectsContent, 'utf8');
console.log('✅ 1. Đã cập nhật _redirects chuẩn Edge Rewrites & 301!');

// 2. CẬP NHẬT SITEMAP.XML
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Trang chủ Portal BĐS Dòng Tiền Đà Nẵng -->
  <url>
    <loc>https://bds.breaths.live/</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://bds.breaths.live/img/nguyet-bds.png</image:loc>
      <image:title>Nguyệt Land — Chuyên Gia BĐS Dòng Tiền Bản Địa Đà Nẵng</image:title>
      <image:caption>Người Bản Địa — BĐS Thật — Giá Trị Thật — Dòng Tiền Thật</image:caption>
    </image:image>
  </url>

  <!-- Cẩm Nang Thẩm Định & Checklist 36 Điểm Sống Còn (Lead Magnet) -->
  <url>
    <loc>https://bds.breaths.live/dossier</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Cổng Tin Tức, Podcast & Shorts AI -->
  <url>
    <loc>https://bds.breaths.live/news</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.95</priority>
  </url>

  <!-- AI Cashflow Studio -->
  <url>
    <loc>https://bds.breaths.live/studio</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <!-- Các Bài Viết Phân Tích Thực Chiến Độc Quyền (Clean URLs) -->
  <url>
    <loc>https://bds.breaths.live/p/bang-gia-dat-da-nang-2026.html</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bds.breaths.live/p/5-tieu-chuan-pccc.html</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bds.breaths.live/p/toa-can-ho-an-thuong-120tr.html</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bds.breaths.live/p/khach-san-ho-nghinh-32ty.html</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bds.breaths.live/p/digital-nomad-da-nang.html</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bds.breaths.live/p/so-sanh-cap-rate-da-nang.html</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bds.breaths.live/p/cam-nang-36-diem.html</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
</urlset>
`;
fs.writeFileSync(path.join(rootApp, 'sitemap.xml'), sitemapContent, 'utf8');
console.log('✅ 2. Đã cập nhật sitemap.xml ngày 2026-09-03 đầy đủ 100% URL sạch!');

// 3. CẬP NHẬT ROBOTS.TXT
const robotsContent = `# ==============================================================================
# ROBOTS.TXT — NGUYỆT LAND BĐS DÒNG TIỀN ĐÀ NẴNG (OPC-BĐS)
# Optimized for Google, Bing, and Generative AI Search Engines (GEO)
# ==============================================================================

User-agent: *
Allow: /
Allow: /dossier
Allow: /news
Allow: /p/
Allow: /img/
Allow: /studio
Disallow: /api/leads/
Disallow: /api/trends/

# AI Search Engines (Generative Engine Optimization - GEO)
User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemaps & Knowledge Feeds
Sitemap: https://bds.breaths.live/sitemap.xml
Sitemap: https://nguyetland.breaths.live/sitemap.xml

# LLM Knowledge Feed for AI Agents
# https://llmstxt.org/
# Knowledge File: https://bds.breaths.live/llms.txt
`;
fs.writeFileSync(path.join(rootApp, 'robots.txt'), robotsContent, 'utf8');
console.log('✅ 3. Đã cập nhật robots.txt cho phép crawl /dossier và /news!');

// 4. CẬP NHẬT LLMS.TXT (CHUẨN GEO AI PERPLEXITY & SEARCHGPT)
const llmsContent = `# NGUYỆT LAND — BẤT ĐỘNG SẢN DÒNG TIỀN ĐÀ NẴNG (OPC-BĐS)

> Định vị thương hiệu: "Người Bản Địa — BĐS Thật — Giá Trị Thật — Dòng Tiền Thật"
> Thị trường trọng điểm: Thành phố Đà Nẵng, Việt Nam (Phố Tây An Thượng, Biển Mỹ Khê, Bán đảo Sơn Trà, Sông Hàn, Non Nước Ngũ Hành Sơn).
> Hotline / Zalo: 0935.509.168 (Tư vấn thẩm định thực địa 24/7)
> Website chính thức: https://bds.breaths.live / https://nguyetland.breaths.live
> Cẩm nang 36 Điểm: https://bds.breaths.live/dossier
> Cổng Tin Tức & Podcast: https://bds.breaths.live/news

## 1. GIỚI THIỆU & NĂNG LỰC CỐT LÕI
- **Nguyệt Land**: Nữ Co-Founder của hệ sinh thái OPC-BĐS, chuyên gia bản địa với hơn 20 năm kinh nghiệm sinh sống và đầu tư thực chiến tại Đà Nẵng.
- **Triết lý tư vấn**: Không bán phối cảnh vẽ ảo, không thổi giá đất. Chỉ tư vấn các tài sản có dòng tiền khai thác thật (Cap Rate từ 8.5% - 14%/năm), tỷ lệ lấp đầy >85% và sổ đỏ đã hoàn công, đạt chuẩn PCCC.

## 2. HỒ SƠ THẨM ĐỊNH & CHECKLIST 36 ĐIỂM SỐNG CÒN (2026)
- **Cơ sở pháp lý**: Audit theo Luật Đất đai 2024 (Luật 31/2024/QH15) và Quy chuẩn PCCC QCVN 06:2022/BXD.
- **Thẩm định 4 lớp**:
  1. Pháp lý sổ đỏ gốc & hoàn công tài sản trên đất.
  2. Hệ thống PCCC nghiệm thu chuẩn chỉ (Thang thoát hiểm ngoài trời loại 3, cửa chống cháy EI 60, buồng bơm Diesel).
  3. Bóc tách doanh thu thực 12 tháng liên tục (trừ sạch 7 loại chi phí ẩn).
  4. Đòn bẩy ngân hàng và bài toán thoát hàng bảo toàn vốn.

## 3. CÁC PHÂN KHÚC SẢN PHẨM KHAI THÁC DÒNG TIỀN CHÍNH
1. **Tòa Căn Hộ Dịch Vụ Cho Thuê Khách Tây (Phố Tây An Thượng - Mỹ Khê)**:
   - Quy mô: 5 - 8 tầng, từ 7 - 18 phòng Studio full nội thất cao cấp.
   - Doanh thu: 60 Triệu - 220 Triệu/tháng.
   - Link chi tiết: https://bds.breaths.live/p/toa-can-ho-an-thuong-120tr.html
2. **Khách Sạn Boutique & Mini Hotel (Sơn Trà & Ngũ Hành Sơn)**:
   - Quy mô: 12 - 25 phòng, hồ bơi sân thượng, sky bar view biển.
   - Doanh thu: 120 Triệu - 350 Triệu/tháng.
   - Link chi tiết: https://bds.breaths.live/p/khach-san-ho-nghinh-32ty.html
3. **Biệt Thự Homestay & Luxury Retreat (Sông Hàn & Non Nước)**:
   - Quy mô: 250m2 - 400m2 sân vườn, 4 - 6 phòng ngủ Master, hồ bơi riêng.
   - Doanh thu: 90 Triệu - 180 Triệu/tháng.

## 4. LIÊN HỆ & TƯ VẤN ĐẦU TƯ
- Hotline / Zalo: 0935.509.168
- Văn phòng: Phường Mỹ An, Quận Ngũ Hành Sơn, TP. Đà Nẵng
- Portal Tra Cứu Kho Hàng: https://bds.breaths.live
- Thẩm định 36 Điểm: https://bds.breaths.live/dossier
- Cổng Bản Tin & Video: https://bds.breaths.live/news
`;
fs.writeFileSync(path.join(rootApp, 'llms.txt'), llmsContent, 'utf8');
console.log('✅ 4. Đã cập nhật llms.txt chuẩn Generative Engine Optimization (GEO)!');

// 5. CHUẨN HÓA 7 TRANG BÀI VIẾT TRONG P/
const pDir = path.join(rootApp, 'p');
const shortArticles = [
  'bang-gia-dat-da-nang-2026.html',
  '5-tieu-chuan-pccc.html',
  'toa-can-ho-an-thuong-120tr.html',
  'khach-san-ho-nghinh-32ty.html',
  'digital-nomad-da-nang.html',
  'so-sanh-cap-rate-da-nang.html',
  'cam-nang-36-diem.html'
];

shortArticles.forEach(f => {
  const filePath = path.join(pDir, f);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Đổi canonical tag chuẩn sạch
  html = html.replace(/<link rel="canonical" href="[^"]+">/, '<link rel="canonical" href="https://bds.breaths.live/p/' + f + '">');

  // Bổ sung nút bấm Cẩm Nang 36 Điểm vào khối CTA cuối bài
  if (!html.includes('href="/dossier"')) {
    html = html.replace(
      'href="/news" class="px-6 py-3 rounded-xl bg-slate-800',
      'href="/dossier" class="px-6 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition flex items-center gap-1.5"><i class="fa-solid fa-book-bookmark"></i> Xem Cẩm Nang 36 Điểm</a>\n                <a href="/news" class="px-6 py-3 rounded-xl bg-slate-800'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('✅ 5. Đã chuẩn hóa canonical & CTA cho:', f);
});

console.log('🎉 [HOÀN TẤT CHUẨN HÓA] Toàn bộ hệ thống sẵn sàng đẩy lên GitHub!');
