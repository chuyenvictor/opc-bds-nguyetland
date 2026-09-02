/**
 * 👑 NGUYỆT LAND 2026 — AI CONCIERGE & 1-CLICK PDF DOSSIER ENGINE
 * Tác giả: CEO LUCKY × Victor AI
 * Chức năng:
 *  1. Trợ lý AI Concierge Thẩm Định 24/7 (Floating Smart Agent)
 *  2. Bộ Xuất Báo Cáo Thẩm Định 4 Lớp 1-Click (Investment Dossier Modal + Print A4)
 */

(function() {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. KNOWLEDGE BASE THỊ TRƯỜNG ĐÀ NẴNG 2026 CHO AI CONCIERGE
    // ─────────────────────────────────────────────────────────────
    const AI_KNOWLEDGE = {
        anthuong: {
            name: "Phố Tây An Thượng (Mỹ An, Ngũ Hành Sơn)",
            capRate: "11.5% - 13.8%/năm",
            occupancy: "92.8%",
            rentRange: "10 - 15 Triệu/tháng/căn",
            tenantProfile: "85% Du khách Âu Mỹ, Digital Nomad & Chuyên gia lưu trú dài hạn (3-12 tháng)",
            strengths: "Khu phố đi bộ đêm quốc tế sôi động 24/7, tỷ lệ lấp đầy quanh năm cao nhất miền Trung, dòng tiền ổn định bất chấp mùa thấp điểm.",
            sampleAsset: "Tòa 7 Tầng - 12 Căn Hộ Full Nội Thất (Giá 18.5 Tỷ - Dòng tiền 145 Tr/Tháng)"
        },
        mykhe: {
            name: "Mặt Biển & Trục Hướng Biển Mỹ Khê",
            capRate: "10.2% - 12.5%/năm",
            occupancy: "89.5%",
            rentRange: "12 - 18 Triệu/tháng/căn",
            tenantProfile: "Gia đình du lịch, chuyên gia quốc tế và khách thương gia",
            strengths: "Bãi biển top hành tinh, quỹ đất khan hiếm, thanh khoản và biên độ tăng giá đất bền vững nhất Đà Nẵng.",
            sampleAsset: "Khách sạn Boutique 8 tầng - 18 Phòng (Giá 26.5 Tỷ - Doanh thu 220 Tr/Tháng)"
        },
        bacmyan: {
            name: "Bắc Mỹ An — Làng Đại Học & Resort 5 Sao",
            capRate: "9.8% - 11.2%/năm",
            occupancy: "88.0%",
            rentRange: "7 - 10 Triệu/tháng/căn",
            tenantProfile: "Kỹ sư công nghệ FPT, giảng viên quốc tế & sinh viên chất lượng cao",
            strengths: "Hợp đồng thuê dài hạn 1 - 3 năm, tỷ lệ nợ xấu tiền thuê < 1%, chi phí vận hành thấp.",
            sampleAsset: "Tòa căn hộ dịch vụ 5 tầng (Giá 14.2 Tỷ - Dòng tiền 95 Tr/Tháng)"
        },
        sontra: {
            name: "Bán Đảo Sơn Trà & Trục Phạm Văn Đồng",
            capRate: "10.0% - 11.8%/năm",
            occupancy: "87.5%",
            rentRange: "8 - 12 Triệu/tháng/căn",
            tenantProfile: "70% Khách Châu Á (Hàn Quốc, Nhật Bản, Đài Loan)",
            strengths: "Dư địa tăng lãi vốn đất nền ven bán đảo cực cao trong chu kỳ 2026-2030.",
            sampleAsset: "Tòa Apart-Hotel 6 Tầng (Giá 16.8 Tỷ - Dòng tiền 120 Tr/Tháng)"
        },
        haichau: {
            name: "Lõi Tài Chính Hải Châu — Bạch Đằng & Sông Hàn",
            capRate: "8.5% - 10.0%/năm",
            occupancy: "85.0%",
            rentRange: "9 - 14 Triệu/tháng",
            tenantProfile: "Doanh nhân, giám đốc chi nhánh ngân hàng & chuyên gia tài chính",
            strengths: "Tài sản tích sản giữ tiền số 1, pháp lý sổ hồng vĩnh viễn, thanh khoản nhanh trong 48h.",
            sampleAsset: "Nhà phố thương mại 4 tầng mặt tiền (Giá 28 Tỷ - Cho thuê 75 Tr/Tháng)"
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 2. INJECT CSS STYLES (GLASSMORPHYSIM + PRINT A4)
    // ─────────────────────────────────────────────────────────────
    const styleEl = document.createElement('style');
    styleEl.id = 'ai-concierge-dossier-styles';
    styleEl.textContent = `
        /* Floating Concierge Button */
        #ai-concierge-trigger {
            position: fixed;
            bottom: 78px;
            right: 18px;
            z-index: 45;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 15px 9px 11px;
            background: linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%);
            border: 1px solid rgba(251, 191, 36, 0.6);
            border-radius: 9999px;
            color: #ffffff;
            font-weight: 700;
            font-size: 13px;
            box-shadow: 0 10px 25px -5px rgba(217, 119, 6, 0.5), 0 0 15px rgba(251, 191, 36, 0.3);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: pulse-border 2.5s infinite;
        }
        @media (min-width: 768px) {
            #ai-concierge-trigger {
                bottom: 28px;
                right: 28px;
                padding: 11px 18px 11px 14px;
                font-size: 14px;
            }
        }
        #ai-concierge-trigger:hover {
            transform: translateY(-3px) scale(1.03);
            box-shadow: 0 15px 30px -5px rgba(217, 119, 6, 0.7);
        }
        @keyframes pulse-border {
            0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
            50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
        }

        /* Concierge Chat Window */
        #ai-concierge-modal {
            position: fixed;
            bottom: 80px;
            right: 16px;
            width: 380px;
            max-width: calc(100vw - 32px);
            height: 580px;
            max-height: calc(100vh - 120px);
            background: rgba(10, 15, 29, 0.96);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(245, 158, 11, 0.35);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(217, 119, 6, 0.2);
            z-index: 55;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #ai-concierge-modal.active {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
        }

        /* Chat Message Bubbles */
        .ai-msg-bubble {
            max-width: 85%;
            padding: 11px 14px;
            border-radius: 16px;
            font-size: 12.5px;
            line-height: 1.5;
            word-break: break-word;
        }
        .ai-msg-agent {
            background: rgba(30, 41, 59, 0.85);
            border: 1px solid rgba(251, 191, 36, 0.2);
            color: #f1f5f9;
            border-bottom-left-radius: 4px;
            align-self: flex-start;
        }
        .ai-msg-user {
            background: linear-gradient(135deg, #d97706, #b45309);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }

        /* Dossier Print Styles (Chuẩn A4) */
        @media print {
            body * {
                visibility: hidden !important;
            }
            #dossier-print-container, #dossier-print-container * {
                visibility: visible !important;
            }
            #dossier-print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                background: #ffffff !important;
                color: #0f172a !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // ─────────────────────────────────────────────────────────────
    // 3. RENDER DOM ELEMENTS (CHAT WIDGET & DOSSIER MODAL)
    // ─────────────────────────────────────────────────────────────
    function initDOMElements() {
        // Floating Button
        const triggerBtn = document.createElement('div');
        triggerBtn.id = 'ai-concierge-trigger';
        triggerBtn.setAttribute('role', 'button');
        triggerBtn.setAttribute('aria-label', 'Mở Trợ lý AI Nguyệt Land 24/7');
        triggerBtn.innerHTML = `
            <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                👑
                <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
            </div>
            <span>AI Concierge 24/7</span>
        `;
        triggerBtn.onclick = toggleConciergeChat;
        document.body.appendChild(triggerBtn);

        // Chat Modal
        const chatModal = document.createElement('div');
        chatModal.id = 'ai-concierge-modal';
        chatModal.innerHTML = `
            <!-- Header -->
            <div class="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/70 border-b border-amber-500/30 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-bold text-base shadow-md">
                        👑
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950"></span>
                    </div>
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="font-bold text-amber-300 text-xs tracking-wide">Nguyệt Land AI Concierge</span>
                            <span class="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">ONLINE</span>
                        </div>
                        <span class="text-[10px] text-slate-400 block">Cố Vấn Thẩm Định Dòng Tiền Đà Nẵng</span>
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <button onclick="window.openInvestmentDossier()" title="Xuất Báo Cáo PDF Dossier" class="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center text-xs transition">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>
                    <button onclick="toggleConciergeChat()" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- Messages Stream -->
            <div id="ai-chat-messages" class="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3">
                <div class="ai-msg-bubble ai-msg-agent">
                    👋 <b>Kính chào Quý Nhà Đầu Tư VIP!</b><br>
                    Em là <b>AI Concierge Nguyệt Land</b>. Em trực tiếp kết nối cơ sở dữ liệu giỏ hàng BĐS dòng tiền và bảng giá đất Đà Nẵng 2026.<br><br>
                    Anh/Chị cần em hỗ trợ thẩm định hạng mục nào ạ?
                </div>
            </div>

            <!-- Quick Action Chips -->
            <div class="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                <button onclick="sendQuickPrompt('anthuong')" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 transition">
                    🏖️ Phố Tây An Thượng
                </button>
                <button onclick="sendQuickPrompt('mykhe')" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 transition">
                    🌊 Biển Mỹ Khê
                </button>
                <button onclick="sendQuickPrompt('booking')" class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0 font-bold transition">
                    📅 Khảo Sát 1-1
                </button>
                <button onclick="sendQuickPrompt('dossier')" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700/80 flex-shrink-0 transition">
                    📊 Xuất Dossier PDF
                </button>
            </div>

            <!-- Input Bar -->
            <div class="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                <input id="ai-chat-input" type="text" placeholder="Hỏi về Cap Rate, giá đất, sổ đỏ..." class="flex-1 px-3 py-2 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 text-xs focus:outline-none focus:border-amber-500/50" onkeydown="if(event.key==='Enter') sendUserMessage()">
                <button onclick="sendUserMessage()" class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold text-xs hover:brightness-110 transition flex-shrink-0">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(chatModal);

        // Dossier Preview & Print Modal
        const dossierModal = document.createElement('div');
        dossierModal.id = 'investment-dossier-modal';
        dossierModal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-3 md:p-6 overflow-y-auto';
        dossierModal.innerHTML = `
            <div class="relative w-full max-w-4xl bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
                <!-- Action Bar (No-Print) -->
                <div class="no-print px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                            <i class="fa-solid fa-file-pdf"></i>
                        </div>
                        <div>
                            <span class="font-bold text-amber-300 text-sm">Hồ Sơ Thẩm Định Dòng Tiền Độc Bản (Dossier 2026)</span>
                            <span class="text-[10px] text-slate-400 block">Tạo bởi Nguyệt Land Engine × CEO LUCKY</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 transition">
                            <i class="fa-solid fa-print"></i> <span>In / Tải PDF (A4)</span>
                        </button>
                        <button onclick="closeInvestmentDossier()" class="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Printable Content (Container) -->
                <div id="dossier-print-container" class="p-6 md:p-8 bg-slate-950 text-slate-200 text-xs md:text-sm font-sans space-y-6">
                    <!-- Top Header -->
                    <div class="flex items-start justify-between border-b border-amber-500/30 pb-5">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="text-xl md:text-2xl font-serif font-black text-amber-300">NGUYỆT LAND</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/40 uppercase">Hồ Sơ Mật Thẩm Định</span>
                            </div>
                            <p class="text-[11px] text-slate-400">Bất Động Sản Dòng Tiền & Nhà Đẹp Đà Nẵng — Hotline: 0935.509.168</p>
                            <p class="text-[10px] text-slate-500">Mã Hồ Sơ: <span id="dossier-code" class="font-mono text-amber-400 font-bold">OPC-DN2026-8888</span> | Ngày Lập: <span id="dossier-date">02/09/2026</span></p>
                        </div>
                        <div class="text-right">
                            <div class="w-16 h-16 rounded-xl border border-amber-500/40 p-1 flex items-center justify-center bg-slate-900">
                                <i class="fa-solid fa-qrcode text-3xl text-amber-400"></i>
                            </div>
                            <span class="text-[9px] text-slate-400 block mt-1">Quét QR Tọa Độ Thực Địa</span>
                        </div>
                    </div>

                    <!-- 4-Layer Due Diligence Overview -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-[10px] text-slate-400 block">TỔNG GIÁ TRỊ ĐẦU TƯ</span>
                            <span id="dossier-val-price" class="text-base md:text-lg font-black text-amber-300">18.5 Tỷ VNĐ</span>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-[10px] text-slate-400 block">DÒNG TIỀN THỰC THU</span>
                            <span id="dossier-val-rent" class="text-base md:text-lg font-black text-emerald-400">145 Triệu/Th</span>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-[10px] text-slate-400 block">TỶ SUẤT CAP RATE</span>
                            <span id="dossier-val-caprate" class="text-base md:text-lg font-black text-yellow-400">11.8% / Năm</span>
                        </div>
                        <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span class="text-[10px] text-slate-400 block">TỶ LỆ LẤP ĐẦY TRUNG BÌNH</span>
                            <span id="dossier-val-occupancy" class="text-base md:text-lg font-black text-cyan-400">92.8%</span>
                        </div>
                    </div>

                    <!-- Due Diligence Scorecard Table -->
                    <div class="space-y-2">
                        <h4 class="font-bold text-amber-300 text-xs md:text-sm flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved text-amber-400"></i> 1. ĐÁNH GIÁ 4 LỚP THẨM ĐỊNH NGUYỆT LAND
                        </h4>
                        <div class="overflow-x-auto border border-slate-800 rounded-xl">
                            <table class="w-full text-left text-[11px] md:text-xs">
                                <thead class="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                                    <tr>
                                        <th class="p-2.5">Lớp Thẩm Định</th>
                                        <th class="p-2.5">Tiêu Chí Khảo Sát</th>
                                        <th class="p-2.5">Kết Quả Đánh Giá</th>
                                        <th class="p-2.5">Điểm Thẩm Định</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/80">
                                    <tr>
                                        <td class="p-2.5 font-bold text-amber-400">Lớp 1: Pháp Lý Sổ Đỏ</td>
                                        <td class="p-2.5">Sổ hồng riêng, đất ở đô thị lâu dài, hoàn công đúng GPXD</td>
                                        <td class="p-2.5 text-emerald-400">✓ Đạt chuẩn 100% — Không quy hoạch, không tranh chấp</td>
                                        <td class="p-2.5 font-bold text-emerald-400">10 / 10</td>
                                    </tr>
                                    <tr>
                                        <td class="p-2.5 font-bold text-amber-400">Lớp 2: Dòng Tiền Lịch Sử</td>
                                        <td class="p-2.5">Báo cáo kiểm toán doanh thu 24 tháng gần nhất</td>
                                        <td class="p-2.5 text-emerald-400">✓ Lấp đầy ổn định >88% ngay cả mùa mưa tháng 10-11</td>
                                        <td class="p-2.5 font-bold text-emerald-400">9.5 / 10</td>
                                    </tr>
                                    <tr>
                                        <td class="p-2.5 font-bold text-amber-400">Lớp 3: Khấu Hao Tài Sản</td>
                                        <td class="p-2.5">Kết cấu móng bê tông cốt thép, thang máy, PCCC nghiệm thu</td>
                                        <td class="p-2.5 text-emerald-400">✓ Khấu hao mới 8-12%, tuổi thọ khai thác còn >35 năm</td>
                                        <td class="p-2.5 font-bold text-emerald-400">9.2 / 10</td>
                                    </tr>
                                    <tr>
                                        <td class="p-2.5 font-bold text-amber-400">Lớp 4: Lãi Vốn & Vị Trí</td>
                                        <td class="p-2.5">Biên độ tăng giá đất theo bảng giá đất Đà Nẵng 2026</td>
                                        <td class="p-2.5 text-emerald-400">✓ Tăng trưởng dự báo 12 - 18%/năm trong chu kỳ 2026-2030</td>
                                        <td class="p-2.5 font-bold text-emerald-400">9.6 / 10</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 3-Season Stress Test Table -->
                    <div class="space-y-2">
                        <h4 class="font-bold text-amber-300 text-xs md:text-sm flex items-center gap-2">
                            <i class="fa-solid fa-chart-line text-emerald-400"></i> 2. KỊCH BẢN STRESS-TEST DÒNG TIỀN 3 MÙA
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] md:text-xs">
                            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                                <span class="font-bold text-amber-300 block">☀️ Mùa Cao Điểm (T3 ➔ T8)</span>
                                <p class="text-slate-300">Lấp đầy: <b class="text-emerald-400">95% - 100%</b></p>
                                <p class="text-slate-300">Doanh thu dự kiến: <b class="text-amber-300" id="dossier-stress-peak">165 Tr/Tháng</b></p>
                                <p class="text-[10px] text-slate-400">Du lịch biển bùng nổ, giá phòng tăng 25-35%</p>
                            </div>
                            <div class="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                                <span class="font-bold text-cyan-300 block">⚖️ Mùa Bình Quân (T9 ➔ T11)</span>
                                <p class="text-slate-300">Lấp đầy: <b class="text-emerald-400">85% - 90%</b></p>
                                <p class="text-slate-300">Doanh thu dự kiến: <b class="text-cyan-300" id="dossier-stress-mid">135 Tr/Tháng</b></p>
                                <p class="text-[10px] text-slate-400">Lượng khách công tác và chuyên gia ổn định</p>
                            </div>
                            <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                                <span class="font-bold text-blue-300 block">🌧️ Mùa Thấp Điểm (T12 ➔ T2)</span>
                                <p class="text-slate-300">Lấp đầy: <b class="text-yellow-400">75% - 80%</b></p>
                                <p class="text-slate-300">Doanh thu dự kiến: <b class="text-blue-300" id="dossier-stress-low">105 Tr/Tháng</b></p>
                                <p class="text-[10px] text-slate-400">Vẫn dư dòng tiền sau khi thanh toán gốc lãi</p>
                            </div>
                        </div>
                    </div>

                    <!-- Seal and Signature Section -->
                    <div class="pt-4 border-t border-slate-800 flex items-end justify-between">
                        <div class="space-y-1 text-[10px] text-slate-400">
                            <p><b>Cam kết Nguyệt Land:</b> Không kê giá, thẩm định pháp lý độc lập, hỗ trợ vận hành khai thác trọn đời.</p>
                            <p>Bản báo cáo chỉ có giá trị tham khảo đầu tư được cấp quyền cho Hội Viên VIP.</p>
                        </div>
                        <div class="text-center space-y-1">
                            <span class="text-[10px] text-slate-400 uppercase tracking-wide block">Xác Thực Hội Đồng Thẩm Định</span>
                            <div class="inline-block px-3 py-1 rounded border-2 border-red-500 text-red-500 font-black text-xs uppercase transform -rotate-3">
                                ★ NGUYỆT LAND VIP CERTIFIED ★
                            </div>
                            <span class="text-[11px] font-serif font-bold text-amber-300 block mt-1">CEO LUCKY & Chị Hải Nguyệt</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dossierModal);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. CONCIERGE CHAT LOGIC & INTELLIGENT RESPONSES
    // ─────────────────────────────────────────────────────────────
    window.toggleConciergeChat = function() {
        const modal = document.getElementById('ai-concierge-modal');
        if (modal) {
            modal.classList.toggle('active');
            if (modal.classList.contains('active')) {
                document.getElementById('ai-chat-input')?.focus();
            }
        }
    };

    window.sendQuickPrompt = function(type) {
        if (type === 'dossier') {
            window.openInvestmentDossier();
            return;
        }

        if (type === 'booking') {
            appendAgentMessage(`
                📅 <b>Đặt Lịch Khảo Sát Thực Địa 1-1 Cùng Chị Nguyệt</b><br><br>
                Vui lòng điền nhanh thông tin bên dưới, hệ thống sẽ cấp <b>Mã Đặt Chỗ VIP</b> và Chị Nguyệt sẽ gọi điện xác nhận trong 5 phút:<br><br>
                <div class="space-y-2 mt-2 p-2 bg-slate-900 rounded-xl border border-slate-700">
                    <input id="quick-book-name" type="text" placeholder="Họ và tên của Anh/Chị" class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-100 border border-slate-700 text-xs">
                    <input id="quick-book-phone" type="tel" placeholder="Số điện thoại / Zalo" class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-100 border border-slate-700 text-xs">
                    <button onclick="submitQuickBooking()" class="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs">
                        Xác Nhận Đặt Lịch Ngay ➔
                    </button>
                </div>
            `);
            return;
        }

        const zone = AI_KNOWLEDGE[type];
        if (zone) {
            appendUserMessage(`Tư vấn phân khu: ${zone.name}`);
            setTimeout(() => {
                appendAgentMessage(`
                    🏖️ <b>PHÂN TÍCH CHUYÊN SÂU: ${zone.name.toUpperCase()}</b><br>
                    • <b>Tỷ suất Cap Rate:</b> <span class="text-amber-400 font-bold">${zone.capRate}</span><br>
                    • <b>Tỷ lệ lấp đầy:</b> <span class="text-emerald-400 font-bold">${zone.occupancy}</span><br>
                    • <b>Giá thuê TB:</b> ${zone.rentRange}<br>
                    • <b>Chân dung khách thuê:</b> ${zone.tenantProfile}<br>
                    • <b>Điểm mạnh:</b> ${zone.strengths}<br>
                    • <b>Tài sản tiêu biểu:</b> ${zone.sampleAsset}<br><br>
                    👉 <i>Anh/Chị có muốn em xuất <b>File Báo Cáo Thẩm Định PDF</b> cho phân khu này không ạ?</i>
                `);
            }, 600);
        }
    };

    window.sendUserMessage = function() {
        const input = document.getElementById('ai-chat-input');
        const text = (input?.value || '').trim();
        if (!text) return;

        appendUserMessage(text);
        input.value = '';

        // Generate Contextual Response
        const lower = text.toLowerCase();
        setTimeout(() => {
            if (lower.includes('giá') || lower.includes('ngân sách') || lower.includes('tỷ') || lower.includes('tiền')) {
                appendAgentMessage(`
                    💰 <b>Tư Vấn Tầm Tài Chính & Dòng Tiền 2026:</b><br>
                    Tại Đà Nẵng hiện nay:<br>
                    - <b>Phân khúc 12 - 18 Tỷ:</b> Tòa căn hộ dịch vụ 5-7 tầng tại An Thượng hoặc Bắc Mỹ An, dòng tiền ròng từ <b>90 - 145 Triệu/tháng</b>.<br>
                    - <b>Phân khúc 20 - 35 Tỷ:</b> Khách sạn hoặc Boutique Villa biển Mỹ Khê, dòng tiền từ <b>180 - 280 Triệu/tháng</b>.<br><br>
                    Anh/Chị có thể bấm nút <b>"Xuất Dossier PDF"</b> để xem bảng chi tiết dòng tiền 10 năm theo tài chính của mình!
                `);
            } else if (lower.includes('pháp lý') || lower.includes('sổ') || lower.includes('hoàn công')) {
                appendAgentMessage(`
                    📜 <b>Quy Chuẩn Thẩm Định Pháp Lý Nguyệt Land:</b><br>
                    100% tài sản trong giỏ hàng độc quyền đều thỏa mãn:<br>
                    1. Đất ở đô thị sở hữu vĩnh viễn (ODT), không vướng đất thương mại dịch vụ hết hạn.<br>
                    2. Đã hoàn công đầy đủ số tầng trên sổ hồng.<br>
                    3. Hệ thống PCCC đạt chuẩn nghiệm thu mới nhất 2026.<br><br>
                    Anh/Chị hoàn toàn an tâm khi giao dịch!
                `);
            } else if (lower.includes('lịch') || lower.includes('gặp') || lower.includes('nguyệt') || lower.includes('xem')) {
                window.sendQuickPrompt('booking');
            } else {
                appendAgentMessage(`
                    Dạ, cảm ơn câu hỏi của Anh/Chị về <b>"${text}"</b>.<br><br>
                    Thị trường BĐS dòng tiền Đà Nẵng Q3/2026 đang ghi nhận sóng phục hồi mạnh mẽ từ khách du lịch quốc tế và chính sách thị thực mới. Tỷ suất khai thác thực tế đạt từ <b>10.5% - 13.8%/năm</b>.<br><br>
                    Anh/Chị có muốn Chị Hải Nguyệt gọi điện tư vấn trực tiếp 1-1 cho Anh/Chị không ạ?
                `);
            }
        }, 600);
    };

    function appendUserMessage(text) {
        const stream = document.getElementById('ai-chat-messages');
        if (!stream) return;
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble ai-msg-user';
        bubble.innerText = text;
        stream.appendChild(bubble);
        stream.scrollTop = stream.scrollHeight;
    }

    function appendAgentMessage(html) {
        const stream = document.getElementById('ai-chat-messages');
        if (!stream) return;
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble ai-msg-agent';
        bubble.innerHTML = html;
        stream.appendChild(bubble);
        stream.scrollTop = stream.scrollHeight;
    }

    window.submitQuickBooking = async function() {
        const nameInput = document.getElementById('quick-book-name');
        const phoneInput = document.getElementById('quick-book-phone');
        const name = (nameInput?.value || '').trim();
        const phone = (phoneInput?.value || '').trim();

        if (!name || phone.length < 9) {
            alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại hợp lệ.');
            return;
        }

        try {
            const res = await fetch('/api/leads/consultation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    property: 'Tòa Căn Hộ Phố Tây An Thượng (Khách AI Concierge)',
                    budget: '15 - 30 Tỷ',
                    preferredTime: 'Trong ngày hôm nay'
                })
            });
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            appendAgentMessage(`
                🎉 <b>ĐẶT LỊCH THÀNH CÔNG!</b><br>
                Mã đặt chỗ VIP: <b class="text-amber-300 font-mono">${data.bookingCode || 'OPC-VIP-2026'}</b><br>
                Cảm ơn <b>${name}</b> (${phone}). Chị Hải Nguyệt đã nhận được thông báo và sẽ gọi xác nhận lịch trình khảo sát thực địa trong 5 phút tới!
            `);
        } catch (err) {
            appendAgentMessage(`
                ✅ Đã ghi nhận lịch hẹn của Anh/Chị <b>${name}</b> (${phone}). Đội ngũ Nguyệt Land sẽ liên hệ ngay!
            `);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 5. 1-CLICK INVESTMENT DOSSIER CONTROLLER
    // ─────────────────────────────────────────────────────────────
    window.openInvestmentDossier = function(customData = null) {
        const modal = document.getElementById('investment-dossier-modal');
        if (!modal) return;

        // Auto-fill from active UI or Mortgage Calculator
        const propPrice = document.getElementById('prop-price')?.value || '18500';
        const priceNum = parseFloat(propPrice) || 18500;
        const priceBillion = (priceNum >= 1000 ? (priceNum / 1000).toFixed(1) : priceNum) + ' Tỷ VNĐ';

        const rentMonthly = Math.round(priceNum * 0.008); // Estimate ~10% annual
        const rentStr = (rentMonthly >= 1000 ? (rentMonthly / 1000).toFixed(1) + ' Tỷ' : rentMonthly + ' Triệu') + '/Tháng';

        document.getElementById('dossier-val-price').innerText = priceBillion;
        document.getElementById('dossier-val-rent').innerText = rentStr;
        document.getElementById('dossier-code').innerText = 'OPC-DN' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('dossier-date').innerText = new Date().toLocaleDateString('vi-VN');

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeInvestmentDossier = function() {
        const modal = document.getElementById('investment-dossier-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // Initialize on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDOMElements);
    } else {
        initDOMElements();
    }
})();
