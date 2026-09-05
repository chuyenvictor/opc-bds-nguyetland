/**
 * js/modules/mortgage-calculator.js — Financial & Leverage Stress-Test Simulator
 * Nguyệt Land BĐS Dòng Tiền Đà Nẵng 2026 (SaaS Modular Component)
 */

(function() {
    'use strict';

    let currentSeasonMode = 'avg';

    window.setSeasonMode = function(mode) {
        currentSeasonMode = mode;

        const btnHigh = document.getElementById('btn-season-high');
        const btnAvg = document.getElementById('btn-season-avg');
        const btnLow = document.getElementById('btn-season-low');
        const badge = document.getElementById('season-badge');

        [btnHigh, btnAvg, btnLow].forEach(btn => {
            if (btn) btn.className = 'py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-between transition';
        });

        if (mode === 'high') {
            if (btnHigh) btnHigh.className = 'py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border border-amber-400 flex items-center justify-between transition shadow-md font-black';
            if (badge) {
                badge.className = 'px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 text-center';
                badge.innerText = '☀️ Mùa Cao Điểm (Lấp Đầy 95% + Doanh Thu Tăng 15%)';
            }
        } else if (mode === 'low') {
            if (btnLow) btnLow.className = 'py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 border border-sky-400 flex items-center justify-between transition shadow-md font-black';
            if (badge) {
                badge.className = 'px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/40 text-center';
                badge.innerText = '🌧️ Mùa Thấp Điểm (Stress-Test Lấp Đầy 70%)';
            }
        } else {
            if (btnAvg) btnAvg.className = 'py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border border-amber-400 flex items-center justify-between transition shadow-md font-black';
            if (badge) {
                badge.className = 'px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 text-center';
                badge.innerText = '✓ Lấp Đầy 85% (Bình Quân Năm Chuẩn)';
            }
        }

        updateMortgageCalc();
    };

    window.updateMortgageCalc = function() {
        try {
            const priceEl = document.getElementById('slider-price');
            const loanPctEl = document.getElementById('slider-loan-pct');
            const revEl = document.getElementById('slider-rev');
            const yearsEl = document.getElementById('select-loan-years');
            const interestEl = document.getElementById('input-interest');

            if (!priceEl || !loanPctEl || !revEl) return;

            const price = parseFloat(priceEl.value) || 18.5;
            const loanPct = parseFloat(loanPctEl.value) || 40;
            let baseGrossRev = parseFloat(revEl.value) || 110;
            const years = parseInt(yearsEl?.value) || 15;
            const interestRate = parseFloat(interestEl?.value) || 8.5;

            let seasonMultiplier = 1.0;
            if (currentSeasonMode === 'high') seasonMultiplier = 1.15;
            else if (currentSeasonMode === 'low') seasonMultiplier = 0.75;

            const effectiveGrossRev = baseGrossRev * seasonMultiplier;
            const loanAmountBillion = (price * loanPct) / 100;
            const equityBillion = price - loanAmountBillion;

            document.getElementById('calc-val-price').innerText = price.toFixed(1) + ' Tỷ';
            document.getElementById('calc-val-loan-pct').innerText = `${loanPct}% Vay (${loanAmountBillion.toFixed(2)} Tỷ)`;
            document.getElementById('calc-val-rev').innerText = `${baseGrossRev} Triệu / Tháng ${seasonMultiplier !== 1 ? `(Thực tế: ${effectiveGrossRev.toFixed(1)} Tr)` : ''}`;

            let monthlyDebtMillion = 0;
            if (loanAmountBillion > 0 && interestRate > 0 && years > 0) {
                const loanAmountVnd = loanAmountBillion * 1000000000;
                const monthlyRate = (interestRate / 100) / 12;
                const numMonths = years * 12;
                const pmt = loanAmountVnd * (monthlyRate * Math.pow(1 + monthlyRate, numMonths)) / (Math.pow(1 + monthlyRate, numMonths) - 1);
                monthlyDebtMillion = pmt / 1000000;
            }

            const noiMillion = effectiveGrossRev * 0.8;
            const netPocketMillion = noiMillion - monthlyDebtMillion;

            let cocPct = 0;
            if (equityBillion > 0) {
                cocPct = ((netPocketMillion * 12) / (equityBillion * 1000)) * 100;
            } else if (price > 0) {
                cocPct = ((noiMillion * 12) / (price * 1000)) * 100;
            }

            document.getElementById('res-equity').innerText = equityBillion.toFixed(2) + ' Tỷ VNĐ';
            document.getElementById('res-noi').innerText = noiMillion.toFixed(1) + ' Tr / Tháng';
            document.getElementById('res-debt').innerText = (monthlyDebtMillion > 0 ? '- ' : '') + monthlyDebtMillion.toFixed(1) + ' Tr / Tháng';

            const netPocketEl = document.getElementById('res-net-pocket');
            const cocEl = document.getElementById('res-coc');

            if (netPocketMillion >= 0) {
                netPocketEl.className = 'text-2xl lg:text-3xl font-black text-emerald-400 font-serif mt-1';
                netPocketEl.innerText = `+ ${netPocketMillion.toFixed(1)} Triệu / Tháng`;
                cocEl.className = 'text-lg font-black text-amber-300';
                cocEl.innerText = `${cocPct.toFixed(1)}% / Năm`;
            } else {
                netPocketEl.className = 'text-2xl lg:text-3xl font-black text-rose-400 font-serif mt-1';
                netPocketEl.innerText = `${netPocketMillion.toFixed(1)} Triệu / Tháng`;
                cocEl.className = 'text-lg font-black text-rose-400';
                cocEl.innerText = `${cocPct.toFixed(1)}% / Năm (Âm dòng tiền)`;
            }
        } catch (err) {
            console.error('[Mortgage Calc Error]', err);
        }
    };
})();
