/**
 * js/modules/cashflow-heatmap.js — Interactive Da Nang Cashflow Heatmap Component
 * Nguyệt Land BĐS Dòng Tiền Đà Nẵng 2026 (SaaS Modular Component)
 */

(function() {
    'use strict';

    const HEATMAP_ZONE_DATA = {
        anthuong: {
            title: '🏖️ Phố Tây An Thượng (Ngũ Hành Sơn)',
            badge: '🔥 PHÂN KHU SÔI ĐỘNG NHẤT',
            desc: 'Thủ phủ Digital Nomad & du khách quốc tế lưu trú dài hạn. Nhu cầu thuê phòng quanh năm duy trì mức cực đại, dòng tiền thu về ổn định vượt trội.',
            capRate: '11.5% - 13.8%',
            occupancy: '92.8%',
            rent: '10 - 15 Tr/Th',
            tenant: '78% Digital Nomad',
            propertyCount: 4,
            filterKey: 'anthuong'
        },
        mykhe: {
            title: '🌊 Biển Mỹ Khê & Tuyến Đường Võ Nguyên Giáp',
            badge: '💎 VIEW BIỂN TOP ĐẦU VIỆT NAM',
            desc: 'Vị trí đắt giá cách biển 100-300m, tập trung các tòa khách sạn mini và căn hộ cao cấp phục vụ du khách gia đình và khách đoàn quốc tế.',
            capRate: '10.2% - 12.5%',
            occupancy: '89.5%',
            rent: '12 - 18 Tr/Th',
            tenant: '85% Du Khách & Gia Đình',
            propertyCount: 3,
            filterKey: 'mykhe'
        },
        bacmyan: {
            title: '🌴 Khu Dân Cư Bắc Mỹ An & Ven Sông Hàn',
            badge: '🟢 SINH THÁI & ỔN ĐỊNH BỀN VỮNG',
            desc: 'Khu vực yên tĩnh, liền kề các trường đại học và khu nghỉ dưỡng 5 sao. Tỷ lệ khách thuê là chuyên gia trong nước và kỹ sư công nghệ ký hợp đồng 1-3 năm.',
            capRate: '9.8% - 11.2%',
            occupancy: '88.0%',
            rent: '7 - 10 Tr/Th',
            tenant: '65% Chuyên Gia & Kỹ Sư',
            propertyCount: 2,
            filterKey: 'all'
        },
        sontra: {
            title: '🏙️ Bán Đảo Sơn Trà & Trục Phạm Văn Đồng',
            badge: '📈 DƯ ĐỊA TĂNG LÃI VỐN CAO',
            desc: 'Cửa ngõ du lịch đón trọn luồng khách quốc tế từ cầu Thuận Phước và bãi biển Mân Thái. Tỷ suất khai thác song hành cùng tiềm năng tăng giá đất ven bán đảo.',
            capRate: '10.0% - 11.8%',
            occupancy: '87.5%',
            rent: '8 - 12 Tr/Th',
            tenant: '70% Khách Châu Á & Hàn Quốc',
            propertyCount: 3,
            filterKey: 'sontra'
        },
        haichau: {
            title: '🌉 Trung Tâm Hải Châu — Sông Hàn & Cầu Rồng',
            badge: '👑 LÕI TRUNG TÂM TÀI CHÍNH',
            desc: 'Trái tim kinh tế của Đà Nẵng, thanh khoản cực cao, vừa khai thác văn phòng/căn hộ dịch vụ vừa là tài sản tích sản gia tăng giá trị theo thời gian.',
            capRate: '8.5% - 10.0%',
            occupancy: '85.0%',
            rent: '9 - 14 Tr/Th',
            tenant: '80% Doanh Nhân & Chuyên Gia',
            propertyCount: 2,
            filterKey: 'haichau'
        }
    };

    window.switchHeatmapZone = function(zoneKey) {
        const data = HEATMAP_ZONE_DATA[zoneKey];
        if (!data) return;

        document.querySelectorAll('.heatmap-zone-btn').forEach(btn => {
            if (btn.dataset.zone === zoneKey) {
                btn.className = 'px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 heatmap-zone-btn shadow-md flex-shrink-0 font-bold transition';
            } else {
                btn.className = 'px-3.5 py-2 rounded-xl glass text-slate-300 hover:text-amber-300 heatmap-zone-btn flex-shrink-0 font-bold transition';
            }
        });

        const card = document.getElementById('heatmap-dossier-card');
        if (card) {
            document.getElementById('hm-zone-badge').innerText = data.badge;
            document.getElementById('hm-zone-title').innerText = data.title;
            document.getElementById('hm-zone-desc').innerText = data.desc;
            document.getElementById('hm-kpi-caprate').innerText = data.capRate;
            document.getElementById('hm-kpi-occupancy').innerText = data.occupancy;
            document.getElementById('hm-kpi-rent').innerText = data.rent;
            document.getElementById('hm-kpi-tenant').innerText = data.tenant;
            
            const btnAction = document.getElementById('hm-btn-filter-action');
            if (btnAction) {
                btnAction.innerHTML = `<i class="fa-solid fa-filter"></i> <span>Xem ${data.propertyCount} Tòa Đang Bán Tại Đây</span>`;
                btnAction.setAttribute('onclick', `filterPropertiesFromHeatmap('${data.filterKey}')`);
            }
        }
    };

    window.filterPropertiesFromHeatmap = function(zoneKey) {
        const propSec = document.getElementById('properties-section');
        if (propSec) {
            propSec.scrollIntoView({ behavior: 'smooth' });
        }
        if (typeof filterZone === 'function') {
            filterZone(zoneKey);
        }
    };
})();
