/**
 * api-ai-studio.mjs — OPC-BĐS AI Cashflow Studio
 * Gemini 3.7 Flash Engine & Smart Model Cascade — Nguyệt Land BĐS Dòng Tiền Đà Nẵng
 */

const GEMINI_MODELS = [
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGeminiWithCascade(apiKey, systemInstruction, userPrompt) {
    let lastError = null;

    for (const model of GEMINI_MODELS) {
        try {
            const geminiUrl = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2500
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (text) {
                    console.log(`[AI Studio] ✅ Thành công với model: ${model} (${text.length} chars)`);
                    return { text, model };
                }
            } else {
                const errData = await response.json().catch(() => ({}));
                console.warn(`[AI Studio] Model ${model} trả về HTTP ${response.status}:`, errData?.error?.message || 'Lỗi không xác định');
                lastError = new Error(errData?.error?.message || `HTTP ${response.status}`);
            }
        } catch (fetchErr) {
            console.warn(`[AI Studio] Lỗi kết nối model ${model}:`, fetchErr.message);
            lastError = fetchErr;
        }
    }

    throw lastError || new Error('Không thể kết nối tới bất kỳ model Gemini nào');
}

export async function handleAiGenerate(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 50000) { // Limit 50KB
            res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: 'Payload quá lớn (max 50KB)' }));
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const payload = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

            if (!apiKey) {
                res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY trong .env' }));
            }

            const promptType = payload.type || 'article'; // 'article' | 'video' | 'prompt3d'
            const prop = payload.property || {};

            const systemInstruction = `Bạn là Chuyên gia 20 năm thực chiến BĐS Dòng Tiền & Cố Vấn Đầu Tư của Nguyệt Land tại Đà Nẵng. Định vị: "Người Bản Địa — BĐS Thật — Giá Trị Thật — Dòng Tiền Thật". Không nói chung chung, tập trung vào số liệu thực tế: Cap Rate, NOI, Doanh thu khai thác, Tỷ lệ lấp đầy (>85%), Pháp lý rõ ràng.`;

            let userPrompt = '';
            if (promptType === 'article') {
                userPrompt = `Viết bài phân tích chuyên sâu bán BĐS dòng tiền chuẩn SEO:\n- Tên tài sản: ${prop.title || 'Căn hộ dịch vụ homestay Đà Nẵng'}\n- Vị trí: ${prop.location || 'Quận Ngũ Hành Sơn / Sơn Trà, TP. Đà Nẵng'}\n- Giá bán: ${prop.price || '8.5 Tỷ'}\n- Số phòng: ${prop.rooms || '7 phòng full nội thất cao cấp'}\n- Doanh thu dự kiến: ${prop.monthlyRevenue || '65 Triệu/tháng'}\n- Mô hình khai thác: ${prop.model || 'Cho thuê khách du lịch & chuyên gia nước ngoài'}\n- Yêu cầu: Có 3 tiêu đề giật tít, phân tích bài toán tài chính đòn bẩy ngân hàng, lợi thế vị trí người bản địa am hiểu quy hoạch, và Call to Action hẹn khảo sát thực tế cùng Nguyệt Land.`;
            } else if (promptType === 'video') {
                userPrompt = `Viết kịch bản video ngắn 60 giây (TikTok/Facebook Reels/Shorts) review nhà dòng tiền:\n- Tài sản: ${prop.title || 'Tòa Căn Hộ Dòng Tiền'}\n- Doanh thu: ${prop.monthlyRevenue || '65 Tr/tháng'}\n- Giá: ${prop.price || '8.5 Tỷ'}\n- Cấu trúc: [0-5s Hook giật tít đánh vào nỗi đau gửi tiết kiệm] -> [5-45s Body quay 3 điểm đắt giá nhất tạo ra tiền ngay] -> [45-60s CTA bấm vào Bio hoặc liên hệ Nguyệt Land xem sổ đỏ gốc].`;
            } else {
                userPrompt = `Tạo 5 prompt tạo ảnh phối cảnh 3D nội thất / ngoại thất sang trọng (Midjourney/Imagen 3) cho căn nhà dòng tiền tại Đà Nẵng: ${prop.title || 'Tòa căn hộ dịch vụ'}, phong cách Hiện đại Tối giản kết hợp Tropical Oasis.`;
            }

            let resultText = '';
            let usedModel = 'gemini-2.5-flash';
            let usedFallback = false;

            try {
                const aiResult = await callGeminiWithCascade(apiKey, systemInstruction, userPrompt);
                resultText = aiResult.text;
                usedModel = aiResult.model;
            } catch (err) {
                console.warn('[AI Studio] Cascade models failed, fallback sang template:', err.message);
                resultText = generateFallbackResponse(promptType, prop);
                usedModel = 'fallback-template';
                usedFallback = true;
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                type: promptType,
                generatedContent: resultText,
                model: usedModel,
                usedFallback
            }));
        } catch (e) {
            console.error('[AI Studio] Error:', e.message);
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: e.message }));
        }
    });
}

function generateFallbackResponse(type, prop) {
    if (type === 'video') {
        return `🎬 KỊCH BẢN VIDEO REELS 60S — NGUYỆT LAND BĐS DÒNG TIỀN
[00:00 - 00:05] HOOK: "Gửi tiết kiệm 8 tỷ nhận vài chục triệu lãi mất giá? Hãy xem tòa căn hộ này đem về ${prop.monthlyRevenue || '65 triệu/tháng'} ròng ngay tại Đà Nẵng!"
[00:05 - 00:40] BODY:
- 1. Vị trí vàng cách biển Mỹ Khê 500m, luôn kín phòng khách Tây quanh năm.
- 2. ${prop.rooms || '7'} phòng full nội thất cao cấp thông minh, hệ thống Smart Lock tự động check-in 100%.
- 3. Dòng tiền thực tế có sao kê, Cap Rate đạt ~9.2%/năm vượt trội.
[00:40 - 00:60] CTA: "Tôi là Nguyệt Land - Người bản địa Đà Nẵng, tư vấn nhà thật - dòng tiền thật. Nhắn Nguyệt để xem sổ đỏ và số liệu dòng tiền thực tế!"`;
    }
    if (type === 'prompt3d') {
        return `🎨 5 PROMPT PHỐI CẢNH 3D — ${prop.title || 'CĂN HỘ DỊCH VỤ ĐÀ NẴNG'}
1. "Luxury tropical villa interior, Da Nang Vietnam, rattan furniture, ocean view balcony, golden hour lighting, 8K photorealistic, Midjourney v6"
2. "Modern minimalist homestay room, Vietnamese aesthetic, bamboo accents, silk curtains, smart lighting, architectural render, hyperrealistic"
3. "Aerial view luxury apartment complex Da Nang coastline, palm trees, infinity pool, sunset, drone shot, 4K cinematic"
4. "Cozy homestay living room Vietnamese style, wooden furniture, green plants, warm ambient light, instagram-worthy, photorealistic"
5. "Real estate investment property Da Nang, cashflow property exterior, tropical garden, modern architecture, professional photography style"`;
    }
    return `🏡 BÀI PHÂN TÍCH TÀI CHÍNH DÒNG TIỀN — ${prop.title || 'TÒA CĂN HỘ CAO CẤP ĐÀ NẴNG'}

**1. Tổng Quan Tài Sản:**
- Giá đầu tư: ${prop.price || '8.5 Tỷ'}
- Doanh thu khai thác: ${prop.monthlyRevenue || '65 Triệu/tháng'} (780 Triệu/năm)
- Chi phí vận hành (OPEX): ~20%
- Thu nhập thuần (NOI): ~624 Triệu/năm (~8.0% - 9.5% Net Cap Rate)

**2. Đánh Giá Góc Nhìn Bản Địa (Nguyệt Land):**
Khu vực tiềm năng tăng giá vốn 15-20% trong 2 năm tới khi hạ tầng du lịch Đà Nẵng bùng nổ. Tài sản có tính thanh khoản cao, sẵn sàng dòng tiền ngay từ ngày đầu bàn giao.

**3. Đòn Bẩy Ngân Hàng (Leverage 50%):**
- Vốn tự có: ${prop.price ? (parseFloat(prop.price) / 2).toFixed(1) + ' Tỷ' : '4.25 Tỷ'}
- Vay NH (6.5%/năm): Khoảng 4.25 Tỷ → Lãi ~23Tr/tháng
- Cash-on-Cash sau vay: ~(65-23)/4250 = ~11.9%/năm

📞 Liên hệ Nguyệt Land: 0935.509.168 để được tư vấn thẩm định thực tế.`;
}
