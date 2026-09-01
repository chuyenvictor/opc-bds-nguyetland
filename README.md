# 👑 NGUYỆT LAND — BẤT ĐỘNG SẢN DÒNG TIỀN ĐÀ NẴNG (OPC-BĐS)

> **Định vị cốt lõi:** *"Người Bản Địa — BĐS Thật — Giá Trị Thật — Dòng Tiền Thật"*  
> **Thị trường:** Đà Nẵng (Phố Tây An Thượng, Biển Mỹ Khê, Sơn Trà, Sông Hàn, Non Nước).  
> **Hotline / Zalo:** `0935.509.168` | **Tên miền:** `https://bds.breaths.live` & `https://nguyetland.breaths.live`

---

## 🏛️ 1. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ 5 SAO

```text
├── index.html                   # Master Portal (12 BĐS Dòng Tiền, Bảng Tính Đòn Bẩy, Tin Nóng Thị Trường)
├── studio.html                  # AI Cashflow Studio (Gemini 2.0 Generator & 1-Click Publisher)
├── sitemap.xml                  # XML Sitemap chuẩn Google & AI Search (Priority & Image Namespace)
├── robots.txt                   # Cho phép Googlebot, Bingbot & AI Crawlers (GPTBot, PerplexityBot, ClaudeBot)
├── llms.txt                     # Chuẩn dữ liệu nạp AI Search Engines (GEO - Generative Engine Optimization)
├── _headers                     # Cấu hình Security & Cache-Control tối ưu cho Cloudflare Pages
├── _redirects                   # Cấu hình Clean 301 Redirects cho Cloudflare Edge
├── wrangler.toml                # Cloudflare Pages / Worker Config
├── serve_local.mjs              # Local Node.js Server (Port 8088)
├── routes/
│   ├── api-ai-studio.mjs        # Kết nối Google AI Studio (Gemini 2.0 API)
│   ├── api-bds-leads.mjs        # Tiếp nhận Lead VIP, gửi Telegram Alert & lưu CRM Obsidian
│   ├── api-trends-bridge.mjs    # Cầu nối lấy dữ liệu thị trường từ 0_NEWS_TREND
│   └── api-publish-article.mjs  # Tự động xuất bản bài viết độc lập /p/[slug].html chuẩn SEO
└── img/
    ├── nguyet-bds.png           # Avatar Co-Founder Nguyệt Land (Chuyên gia bản địa)
    └── victor-bds.png           # Avatar Co-Founder Victor AI (CTO & Solution Architect)
```

---

## 🔍 2. CHUẨN MASTER SEO & GOOGLE + AI INDEXING (GEO)

1. **Schema.org Structured Data (JSON-LD):**
   - `@type: "RealEstateAgent"` & `"LocalBusiness"`
   - `@type: "WebSite"`
   - `@type: "FAQPage"` (Cho Google Featured Snippets & AI Direct Answers)
   - `@type: "RealEstateListing"` trên mọi trang bài viết độc lập `/p/[slug].html`.
2. **Generative Engine Optimization (GEO):**
   - File `llms.txt` định dạng tri thức chuẩn giúp **Perplexity, SearchGPT, Gemini, Claude** trả lời chính xác thông tin về Nguyệt Land khi người dùng hỏi về BĐS Đà Nẵng.
3. **OpenGraph & Twitter Cards:**
   - Thumbnail ảnh chất lượng cao 1200x630, hiển thị sang trọng khi chia sẻ link qua Zalo, Facebook, Telegram.

---

## 🚀 3. HƯỚNG DẪN TRIỂN KHAI CLOUDFLARE PAGES & GITHUB

### Cách 1: Triển khai 1-Click qua Wrangler CLI:
```bash
cd D:\APP\OPC-TNC\OPC-BDS
npx wrangler pages deploy . --project-name=opc-bds-nguyetland
```

### Cách 2: Đẩy lên GitHub & Tự Động Build qua Cloudflare Pages Dashboard:
```bash
git init
git add .
git commit -m "feat: complete OPC-BDS Nguyet Land 5-star web app with Master SEO"
git branch -M main
git remote add origin https://github.com/chuyenvictor/opc-bds-nguyetland.git
git push -u origin main
```
*Trên Cloudflare Pages: Chọn kết nối repo `opc-bds-nguyetland` ➔ Build command: Để trống ➔ Output directory: `.` ➔ Deploy!*

---

## 📞 LIÊN HỆ ĐIỀU HÀNH DỰ ÁN:
- **CEO Victor AI & Nguyệt Land Co-Founder**
- **Hotline / Zalo:** `0935.509.168`
