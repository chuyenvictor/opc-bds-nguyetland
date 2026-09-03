# 👑 NGUYỆT LAND — NỀN TẢNG BẤT ĐỘNG SẢN DÒNG TIỀN ĐÀ NẴNG (OPC-BĐS 2026)

[![Production Status](https://img.shields.io/badge/Production-Live%20Online-22c55e?style=for-the-badge&logo=cloudflare&logoColor=white)](https://bds.breaths.live)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages%20Edge-f38020?style=for-the-badge&logo=cloudflare)](https://bds.breaths.live)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20App-3b82f6?style=for-the-badge&logo=pwa)](https://bds.breaths.live)
[![Legal Framework](https://img.shields.io/badge/Legal-Luật%20Đất%20Đai%202024%20%26%20QCVN%2006%3A2022-amber?style=for-the-badge)](https://bds.breaths.live/dossier)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Tuyên ngôn định vị cốt lõi:** *"Người Bản Địa — BĐS Thật — Giá Trị Thật — Dòng Tiền Thật"*  
> **Thị trường mục tiêu:** TP. Đà Nẵng (Phố Tây An Thượng, Biển Mỹ Khê, Sơn Trà, Bắc Mỹ An, Sông Hàn, Non Nước).  
> **Tầm vốn nhà đầu tư VIP:** 5 Tỷ — 50 Tỷ VND.  
> **Hotline / Zalo tư vấn 24/7:** `0935.509.168` | **Website chính thức:** [https://bds.breaths.live](https://bds.breaths.live)

---

## 🌐 1. DANH MỤC TRUY CẬP TRỰC TUYẾN (PRODUCTION LIVE URLS)

| Kênh Dịch Vụ | Đường Dẫn Trực Tiếp | Mô Tả Chức Năng |
| :--- | :--- | :--- |
| 🏠 **Trang Chủ Portal** | [https://bds.breaths.live/](https://bds.breaths.live/) | Bản đồ nhiệt dòng tiền Hologram, 12 Tòa Căn Hộ/Khách Sạn & Bộ Tính Đòn Bẩy |
| 👑 **Cẩm Nang 36 Điểm** | [https://bds.breaths.live/dossier](https://bds.breaths.live/dossier) | Checklist tương tác chấm điểm an toàn, thẩm định 4 lớp & In PDF bìa cứng |
| 📰 **Cổng Tình Báo & Bản Tin** | [https://bds.breaths.live/news](https://bds.breaths.live/news) | 9 Bài viết thực chiến, 6 Tập Podcast chuyên sâu, Video Shorts & Live Ticker |
| 🎨 **AI Cashflow Studio** | [https://bds.breaths.live/studio](https://bds.breaths.live/studio) | Studio phân tích tài chính Cap Rate, NOI & đòn bẩy tự động bằng AI |

---

## 🏛️ 2. TỔNG QUAN KIẾN TRÚC KỸ THUẬT DỰ ÁN

```text
E:\OPC-BĐS\apps\nguyet-land-bds\
├── index.html                           # Portal chính (Bản đồ nhiệt, Kho BĐS, Bộ tính đòn bẩy)
├── dossier.html                         # Cẩm Nang Thẩm Định & Checklist 36 Điểm Sống Còn 2026
├── news.html                            # Cổng Bản Tin BĐS, Podcast AI & Shorts 60s
├── studio.html                          # AI Cashflow Studio (Gemini 2.0 API Generator)
├── sw.js                                # Service Worker PWA (Offline caching cho di động)
├── manifest.webmanifest                 # W3C App Manifest (Cài đặt app 1-chạm)
├── _redirects                           # Cấu hình Edge Rewrites Clean URLs & 301 Redirects
├── _headers                             # OWASP Security Headers & Caching Strategy
├── sitemap.xml                          # XML Sitemap chuẩn SEO Google (Cập nhật 2026-09-03)
├── robots.txt                           # Robots directive cho Googlebot, Bingbot & AI Crawlers
├── llms.txt                             # Dữ liệu tri thức nạp AI Search (GEO: Perplexity, SearchGPT)
├── serve_local.mjs                      # Local Node.js Multi-Service Server (Port 8088)
├── js/
│   ├── live-social-proof-notifications.js  # Hệ thống chào mừng & thông báo 3 cấp độ ưu tiên
│   ├── ai-concierge-dossier-engine.js      # Trợ lý AI Concierge & Engine xuất bản PDF
│   └── pwa-install-engine.js               # Động cơ bắt sự kiện cài đặt App PWA
├── p/                                   # Thư mục chứa bài viết chuyên sâu rút gọn chuẩn SEO
│   ├── bang-gia-dat-da-nang-2026.html   # Phân tích bảng giá đất theo Luật Đất Đai 2024
│   ├── 5-tieu-chuan-pccc.html           # 5 Tiêu chuẩn nghiệm thu PCCC bắt buộc
│   ├── toa-can-ho-an-thuong-120tr.html  # Case study bóc tách dòng tiền 120 Tr/tháng
│   ├── khach-san-ho-nghinh-32ty.html    # Chuyển nhượng khách sạn 8 tầng bao tiêu vận hành
│   ├── digital-nomad-da-nang.html       # Làn sóng du mục số lưu trú dài hạn
│   ├── so-sanh-cap-rate-da-nang.html    # So sánh Cap Rate Đà Nẵng vs Hà Nội / Sài Gòn
│   └── cam-nang-36-diem.html            # Bản sao lưu bài viết Cẩm Nang 36 Điểm
├── routes/                              # Bộ định tuyến API Serverless / Backend
│   ├── api-auth.mjs                     # Xác thực hội viên VIP, CRM Lead & Email Drip
│   ├── api-bds-leads.mjs                # Xử lý form thu lead (Chống mất lead 3 lớp)
│   ├── api-news-pipeline.mjs            # Autonomous RSS Ingestion & Content Generator
│   ├── api-youtube-feed.mjs             # YouTube Facade Cache Engine
│   └── api-scheduler.mjs                # Bộ lập lịch tự động cào tin và gửi email
└── img/                                 # Tài nguyên hình ảnh thương hiệu
    ├── nguyet-bds.png                   # Chân dung Co-Founder Hải Nguyệt (Bản địa 20 năm)
    └── victor-bds.png                   # Chân dung Co-Founder Victor AI (CTO & Architect)
```

---

## ⚡ 3. CÁC TÍNH NĂNG VẬN HÀNH ĐỘT PHÁ

### 1. 🛡️ Hệ Thống Chống Mất Lead 3 Lớp (Zero-Lost Lead Redundancy)
- Khi nhà đầu tư gửi thông tin thẩm định:
  - **Lớp 1:** Lưu ngay vào cơ sở dữ liệu SQLite (`data/opc_bds.db`) với cơ chế WAL Checkpoint.
  - **Lớp 2:** Bắn thông báo chuông khẩn cấp về **Telegram Bot** của Ban Lãnh Đạo trong 0.5s.
  - **Lớp 3:** Tự động đồng bộ lên **Google Sheets** của đội ngũ Chăm sóc khách hàng và kích hoạt chuỗi **Email Drip Nurturing 30 ngày**.

### 2. 📊 Cẩm Nang & Checklist 36 Điểm Sống Còn (`/dossier`)
- Cập nhật sát sườn **Luật Đất đai 2024 (Luật 31/2024/QH15)** và **QCVN 06:2022/BXD** về PCCC cho nhà trên 5 tầng.
- Tích hợp **Checklist tương tác tính điểm an toàn** ($0 - 36$ điểm) với 3 cấp độ kết luận tự động: *Siêu An Toàn (Buy Now)*, *Rủi Ro Trung Bình*, *Tử Huyệt (Không Mua)*.
- Hỗ trợ **In & Tải PDF A4 bìa cứng 1-chạm** có watermark thương hiệu sang trọng.

### 3. 👑 Hệ Thống Live Social Proof 3 Cấp Độ Ưu Tiên
- **Ưu tiên 1:** Banner kính mờ chào mừng cá nhân hóa theo buổi (Sáng/Chiều/Tối) + Thống kê 150+ nhà đầu tư trực tuyến.
- **Ưu tiên 2:** Toast thông báo luân phiên các nhà đầu tư vừa nhận hồ sơ (ẩn số điện thoại uy tín) + Hiệu ứng VIP Celebration khi khách đăng ký.
- **Ưu tiên 3:** Thông báo các giao dịch thực tế pipeline đã hoàn tất công chứng cọc hoặc nghiệm thu PCCC.
- Đồng bộ trực tiếp vào dải chạy chữ truyền hình **Top Live Ticker**.

### 4. 🚀 Tối Ưu Tốc Độ & SEO Chuẩn Quốc Tế
- **Clean URLs:** Cắt gọt toàn bộ đuôi dài kỹ thuật, đường dẫn ngắn gọn, chuẩn thẩm mỹ.
- **YouTube Facade Lazy-Load:** Tiết kiệm 1.5MB dung lượng tải trang ban đầu, chỉ nạp iframe video khi người dùng click xem.
- **Generative Engine Optimization (GEO):** Tối ưu tệp `llms.txt` và Schema JSON-LD phục vụ các công cụ tìm kiếm AI (SearchGPT, Perplexity, Gemini).

---

## 💻 4. HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI

### Chạy Môi Trường Phát Triển (Local Development):
```bash
# Di chuyển vào thư mục dự án
cd E:\OPC-BĐS\apps\nguyet-land-bds

# Khởi chạy Master Server (Port 8088)
node serve_local.mjs
```
*Truy cập trình duyệt tại:* `http://localhost:8088`

### Triển Khai Lên Cloudflare Pages:
Dự án được cấu hình tự động triển khai (CI/CD) thông qua GitHub:
```bash
git add .
git commit -m "feat: deploy production updates"
git push origin main
```
*Cloudflare Pages sẽ tự động kích hoạt tiến trình Build & Deploy toàn cầu tới `https://bds.breaths.live` trong 30 giây.*

---

## 📞 LIÊN HỆ ĐIỀU HÀNH & BẢN QUYỀN
- **Chủ đầu tư & Phát triển:** Nguyệt Land & Victor Chuyên AI.
- **Hotline điều hành:** `0935.509.168` | **Email:** `bds@breaths.live`
- **Bản quyền:** © 2026 NGUYỆT LAND — Bảo lưu mọi quyền.
