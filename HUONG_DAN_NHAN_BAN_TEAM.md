# 📦 HƯỚNG DẪN NHÂN BẢN & VẬN HÀNH DỰ ÁN CHO TEAM (OPC-BĐS 2026)

Tài liệu này dành cho các thành viên trong Team khi sao chép toàn bộ thư mục `E:\OPC-BĐS` sang máy tính mới hoặc triển khai môi trường làm việc mới.

---

## ⚡ 1. KHỞI ĐỘNG 1-CHẠM (QUICK START)

1. **Yêu cầu môi trường**:
   - Đã cài đặt **Node.js v18** trở lên (Tải tại [https://nodejs.org/](https://nodejs.org/)).
   - Trình duyệt Chrome / Cốc Cốc / Edge / Safari.

2. **Cách chạy**:
   - Nhấp đúp chuột vào file:
     👉 **`1-CLICK_RUN_OPC_BDS.bat`** (ngay tại thư mục gốc `E:\OPC-BĐS\`)
   - Hệ thống sẽ:
     - Tự động kiểm tra file `.env` (nếu chưa có sẽ tự tạo từ `.env.example`).
     - Tự động cài đặt thư viện (`npm install` nếu chưa có `node_modules`).
     - Tự động mở trình duyệt tại địa chỉ `http://localhost:8088/`.
     - Chạy server Node.js backend.

3. **Kiểm tra trạng thái & Health check**:
   - Nhấp đúp chuột vào file:
     👉 **`1-CLICK_STATUS_CHECK.bat`** để chạy bộ kiểm thử tự động PWA & Heatmap.

---

## 📂 2. CẤU TRÚC THƯ MỤC CHUẨN HÓA

```
E:\OPC-BĐS/
├── 1-CLICK_RUN_OPC_BDS.bat        # [Quan trọng] File chạy 1-chạm toàn bộ hệ thống
├── 1-CLICK_STATUS_CHECK.bat       # File kiểm tra sức khỏe hệ thống & PWA
├── HUONG_DAN_NHAN_BAN_TEAM.md     # Tài liệu này (Hướng dẫn nhân bản cho team)
├── SESSION_HANDOVER_2026.md       # Báo cáo bàn giao chi tiết phiên làm việc
├── .env.example                   # Template biến môi trường mẫu
│
├── apps/
│   └── nguyet-land-bds/           # [CORE APP] Mã nguồn chính của dự án (Git Repo)
│       ├── index.html             # Trang chủ Portal + Heatmap Dòng Tiền + Bảng Tính Đòn Bẩy
│       ├── news.html              # Trung tâm Bản Tin BĐS, Podcast 5 phút, Shorts 60s
│       ├── studio.html            # AI Cashflow Studio (Sinh kịch bản & bài viết tự động)
│       ├── manifest.webmanifest   # Cấu hình PWA (Biến Web thành App điện thoại)
│       ├── sw.js                  # Service Worker hỗ trợ xem offline & caching
│       ├── serve_local.mjs        # Backend HTTP Server Node.js (Port 8088)
│       ├── functions/api/         # Cloudflare Pages Edge Functions (Serverless APIs)
│       │   ├── auth/              # Login, Register VIP Edge APIs
│       │   ├── leads/             # Submit survey, 1-1 tour booking APIs
│       │   └── bds/               # General appraisal lead APIs
│       ├── js/                    # Client engines (Auth, PWA, Audio, CRM)
│       ├── data/                  # SQLite Database (opc_bds.db)
│       ├── p/ & public/p/         # 22 trang bài viết phân tích chuẩn SEO
│       └── scripts/               # Bộ test tự động (test_runner, verify_pwa_heatmap)
│
├── WIKI_OBSIDIAN_BĐS/             # Tri thức bộ não thứ 2 (Obsidian Vault tài liệu BĐS)
├── 0_NEWS_TREND/                  # Dữ liệu tin tức & API keys Firecrawl
└── credentials/                   # Khóa bảo mật đối tác & API credentials
```

---

## 🌐 3. CÁC ĐƯỜNG DẪN TRUY CẬP HỆ THỐNG

| Môi Trường | URL Truy Cập | Mục Đích Sử Dụng |
|:---|:---|:---|
| **Local Portal** | `http://localhost:8088/` | Trang chủ mua bán, thẩm định BĐS & Bản đồ nhiệt |
| **Local Bản Tin** | `http://localhost:8088/news` | Bản tin RSS 7 tòa báo, Podcast AI 3 miền |
| **Local AI Studio** | `http://localhost:8088/studio` | AI tạo kịch bản video TikTok & bài đăng mạng xã hội |
| **PWA Manifest** | `http://localhost:8088/manifest.webmanifest` | File cấu hình ứng dụng điện thoại |
| **Production Web** | `https://bds.breaths.live/` | Website chính thức đang phát hành trực tuyến |
| **GitHub Repo** | `https://github.com/chuyenvictor/opc-bds-nguyetland.git` | Kho mã nguồn Git chính thức (nhánh `main`) |

---

## ⚙️ 4. CẤU HÌNH BIẾN MÔI TRƯỜNG (.env)

Khi nhân bản cho máy mới, chỉnh sửa file `.env` bên trong thư mục `apps\nguyet-land-bds\.env`:
- `PORT`: Cổng chạy local (mặc định `8088`).
- `GEMINI_API_KEY`: Khóa Google AI Studio dùng cho AI Studio & Bot tự động.
- `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`: Bắn thông báo Lead mới về nhóm Telegram (`-1003891453026`).
- `GOOGLE_SHEET_WEBHOOK_URL`: Đồng bộ dữ liệu nhà đầu tư về Google Sheets thời gian thực.

---

## 🚀 5. QUY TRÌNH ĐẨY CODE LÊN GITHUB DEPLOY
Mỗi khi team chỉnh sửa code xong, mở PowerShell tại `apps\nguyet-land-bds` và chạy:
```powershell
git add -A
git commit -m "feat: mô_tả_tính_năng_mới"
git push origin main
```
Cloudflare Pages sẽ tự động nhận diện và cập nhật lên `https://bds.breaths.live/` trong vòng 1-2 phút!
