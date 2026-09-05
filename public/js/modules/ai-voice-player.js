/**
 * js/modules/ai-voice-player.js — AI Voice Reader (Web Speech API Engine)
 * Nguyệt Land BĐS Dòng Tiền Đà Nẵng 2026 (SaaS Modular Component)
 */

(function() {
    'use strict';

    let currentUtterance = null;
    let isSpeaking = false;
    let currentAudioSpeed = 1.0;
    let currentSpeechText = '';

    function cleanTextForSpeech(raw) {
        if (!raw) return '';
        if (typeof raw === 'object') return raw.summary || JSON.stringify(raw);
        let str = String(raw).trim();
        if (str.startsWith('{') || str.includes('"article"')) {
            try {
                const parsed = JSON.parse(str);
                return parsed.article?.summary || parsed.summary || str;
            } catch (_) {}
        }
        return str.replace(/<[^>]*>?/gm, '').replace(/[\r\n]+/g, ' ');
    }

    window.playAiVoice = function(title, summary) {
        if (!('speechSynthesis' in window)) {
            alert('Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản Web Speech.');
            return;
        }
        window.speechSynthesis.cancel();

        const cleanT = (title || '').replace(/[^\p{L}\p{N}\s,.-]/gu, '');
        const cleanS = cleanTextForSpeech(summary).replace(/[^\p{L}\p{N}\s,.-]/gu, '');
        const fullTextToRead = `Bản tin bất động sản Nguyệt Land. ${cleanT}. Tóm tắt phân tích: ${cleanS}. Quý nhà đầu tư cần thẩm định dòng tiền thực tế, vui lòng liên hệ hotline: 0935.509.168.`;
        currentSpeechText = fullTextToRead;

        const utterance = new SpeechSynthesisUtterance(fullTextToRead);
        utterance.lang = 'vi-VN';
        utterance.rate = currentAudioSpeed;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
        if (viVoice) utterance.voice = viVoice;

        utterance.onstart = () => {
            isSpeaking = true;
            document.getElementById('ai-audio-bar')?.classList.remove('hidden');
            const audioTitle = document.getElementById('audio-title');
            if (audioTitle) audioTitle.innerText = title;
            const audioIcon = document.getElementById('audio-play-icon');
            if (audioIcon) audioIcon.className = 'fa-solid fa-pause';
        };

        utterance.onend = () => {
            isSpeaking = false;
            const audioIcon = document.getElementById('audio-play-icon');
            if (audioIcon) audioIcon.className = 'fa-solid fa-play';
        };

        utterance.onerror = () => {
            isSpeaking = false;
            const audioIcon = document.getElementById('audio-play-icon');
            if (audioIcon) audioIcon.className = 'fa-solid fa-play';
        };

        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    };

    window.toggleAudioPlay = function() {
        if (!window.speechSynthesis) return;
        const icon = document.getElementById('audio-play-icon');
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            if (icon) icon.className = 'fa-solid fa-pause';
        } else if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            if (icon) icon.className = 'fa-solid fa-play';
        } else if (currentSpeechText) {
            const titleEl = document.getElementById('audio-title');
            window.playAiVoice(titleEl ? titleEl.innerText : 'Bản tin BĐS', currentSpeechText);
        }
    };

    window.stopAudio = function() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        document.getElementById('ai-audio-bar')?.classList.add('hidden');
        isSpeaking = false;
    };

    window.toggleAudioSpeed = function() {
        const speeds = [1.0, 1.25, 1.5];
        let nextIdx = (speeds.indexOf(currentAudioSpeed) + 1) % speeds.length;
        currentAudioSpeed = speeds[nextIdx];
        const btn = document.getElementById('btn-audio-speed');
        if (btn) btn.innerText = currentAudioSpeed.toFixed(2).replace('.00', '.0') + 'x';
        if (isSpeaking && currentSpeechText) {
            const titleEl = document.getElementById('audio-title');
            window.playAiVoice(titleEl ? titleEl.innerText : 'Bản tin BĐS', currentSpeechText);
        }
    };
})();
