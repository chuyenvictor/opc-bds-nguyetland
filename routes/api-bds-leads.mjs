import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { escapeHtml, upsertLeadDb } from './api-content-db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleBdsLeadSubmit(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 20000) {
            res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: 'Payload quá lớn' }));
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const lead = JSON.parse(body || '{}');
            const timestamp = new Date().toISOString();
            const rawPhone = (lead.phone || '').trim();
            const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

            if (!lead.name || cleanPhone.length < 10) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ success: false, message: 'Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại hợp lệ (10 số).' }));
            }

            console.log(`[VIP BDS LEAD] Investor: ${lead.name} | Phone: ${lead.phone} | Budget: ${lead.budget} | Property: ${lead.propertyTitle}`);

            const budgetValue = parseFloat((lead.budget || '0').replace(/[^0-9.]/g, '')) || 0;
            const leadScore = budgetValue >= 20 ? 'HOT' : budgetValue >= 10 ? 'WARM' : 'COLD';
            const leadId = 'LEAD_' + Date.now().toString(36).toUpperCase();

            // 1. Lưu Lead vào SQLite Database
            try {
                upsertLeadDb({
                    lead_id: leadId,
                    name: lead.name,
                    phone: rawPhone,
                    email: lead.email || '',
                    property: lead.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng',
                    budget: lead.budget || '5 - 15 Tỷ',
                    heat: leadScore,
                    source: 'OPC-BDS Portal Lead Form',
                    note: lead.note || 'Yêu cầu thẩm định dòng tiền & sổ đỏ',
                    email_step: 1,
                    status: 'NEW'
                });
                console.log(`[SQLite Lead] ✅ Saved lead ${leadId} to SQLite`);
            } catch (dbErr) {
                console.warn('[SQLite Lead Save Error]', dbErr.message);
            }

            // 2. Send Telegram Alert to Chairman & Nguyet Land
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID || '-1003891453026';

            const teleMsg = `🔥 <b>[VIP NHÀ ĐẦU TƯ BĐS DÒNG TIỀN MỚI]</b>\n` +
                `👤 <b>Nhà đầu tư:</b> ${escapeHtml(lead.name || 'Khách VIP')}\n` +
                `📞 <b>Số điện thoại:</b> <code>${escapeHtml(lead.phone || 'N/A')}</code>\n` +
                `💰 <b>Ngân sách đầu tư:</b> ${escapeHtml(lead.budget || '5 - 15 Tỷ')}\n` +
                `🏡 <b>Tài sản quan tâm:</b> ${escapeHtml(lead.propertyTitle || 'BĐS Dòng Tiền Đà Nẵng')}\n` +
                `📝 <b>Ghi chú:</b> ${escapeHtml(lead.note || 'Yêu cầu thẩm định dòng tiền & sổ đỏ')}\n` +
                `⏱️ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;

            if (botToken) {
                fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: teleMsg,
                        parse_mode: 'HTML'
                    })
                }).catch(tErr => console.warn('[Telegram Alert Warning]', tErr.message));
            }

            // 3. Save Lead Note into Obsidian Vault asynchronously
            try {
                const vaultDir = path.resolve(__dirname, '..', '..', '..', 'WIKI_OBSIDIAN_BĐS', '11_CRM_KHACH_HANG');
                if (fsSync.existsSync(vaultDir)) {
                    const notePath = path.join(vaultDir, `LEAD_${cleanPhone}_${Date.now()}.md`);
                    const noteContent = `---
title: LEAD NHÀ ĐẦU TƯ: ${lead.name}
phone: ${lead.phone}
budget: ${lead.budget}
property: ${lead.propertyTitle}
created: ${timestamp}
tags: [lead, vip-investor, da-nang, cashflow]
---
# 👤 Thông Tin Nhà Đầu Tư: ${lead.name}
- **SĐT / Zalo:** ${lead.phone}
- **Tài sản quan tâm:** ${lead.propertyTitle}
- **Tầm tài chính:** ${lead.budget}
- **Ghi chú tư vấn:** ${lead.note}
`;
                    await fs.writeFile(notePath, noteContent, 'utf8');
                    console.log(`[CRM Obsidian] Saved lead note async: ${notePath}`);
                }
            } catch (vErr) {
                console.warn('[Vault Sync Warning]', vErr.message);
            }

            // 3. n8n Lead Nurturing Webhook — Phân loại HOT/WARM/COLD & Auto-Follow-Up
            try {
                const n8nWebhookUrl = process.env.N8N_BDS_LEAD_WEBHOOK || 'http://localhost:5678/webhook/bds-lead-capture';
                const budgetValue = parseFloat((lead.budget || '0').replace(/[^0-9.]/g, '')) || 0;
                const leadScore = budgetValue >= 20 ? 'HOT' : budgetValue >= 10 ? 'WARM' : 'COLD';

                fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: 'OPC-BDS Portal',
                        score: leadScore,
                        name: lead.name,
                        phone: lead.phone,
                        budget: lead.budget,
                        propertyTitle: lead.propertyTitle,
                        timestamp,
                        assignTo: 'Nguyệt Land (0935509168)'
                    })
                }).catch(n8nErr => console.warn('[n8n Webhook Warning] Non-critical:', n8nErr.message));
            } catch (_) {}

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                message: 'Đã tiếp nhận yêu cầu tư vấn. Nguyệt Land sẽ liên hệ lại trong vòng 15 phút!'
            }));
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, message: e.message }));
        }
    });
}
