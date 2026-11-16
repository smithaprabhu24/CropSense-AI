/**
 * CropSense AI – Voice Interface (STT & TTS)
 * Powered by Web Speech API with multilingual support for:
 * English (en-IN), Kannada (kn-IN), Telugu (te-IN), Hindi (hi-IN), Tamil (ta-IN).
 * Handles voice form input, audio reading of advisories, and voice command parsing.
 */

import { getLanguage } from './i18n.js';
import { showToast } from './toast.js';

const SPEECH_LANG_MAP = {
  en: 'en-IN',
  kn: 'kn-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const synth = window.speechSynthesis || null;

export function isSpeechSupported() {
  return SpeechRecognition !== null;
}

export function isTtsSupported() {
  return synth !== null;
}

/**
 * Text to speech (TTS) – Reads aloud given text in selected language
 */
export function speakText(text, lang = null) {
  if (!isTtsSupported() || !text) {
    showToast('Text-to-speech not supported in this browser', 'warning');
    return;
  }

  // Cancel any ongoing speech
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const targetLang = SPEECH_LANG_MAP[lang || getLanguage()] || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = 0.95; // Slightly slower for clear rural understanding
  utterance.pitch = 1.0;

  // Attempt to pick a matching regional voice if available
  const voices = synth.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
  };

  synth.speak(utterance);
}

export function stopSpeaking() {
  if (synth) {
    synth.cancel();
  }
}

/**
 * Voice input recognition for a specific input field or callback
 */
export function startListening({ onResult, onError, onStart, onEnd, lang = null }) {
  if (!isSpeechSupported()) {
    showToast('Voice input is not supported in this browser. Please use Chrome/Edge.', 'warning');
    if (onError) onError('unsupported');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = SPEECH_LANG_MAP[lang || getLanguage()] || 'en-IN';

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript.trim();
      if (onResult) onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    let errorMsg = 'Voice recognition error';
    if (event.error === 'not-allowed') {
      errorMsg = 'Microphone permission was denied. Please allow microphone access.';
    } else if (event.error === 'no-speech') {
      errorMsg = 'No speech was detected. Please try again.';
    } else if (event.error === 'network') {
      errorMsg = 'Network error during voice recognition.';
    }
    showToast(errorMsg, 'warning');
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    if (onError) onError(err);
    return null;
  }
}

/**
 * Binds all elements with .voice-input-btn to their target inputs
 */
export function initVoiceInputs(root = document) {
  const buttons = root.querySelectorAll('.voice-input-btn');
  buttons.forEach((btn) => {
    // Avoid double binding
    if (btn._voiceBound) return;
    btn._voiceBound = true;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      btn.classList.add('is-listening');
      const originalTitle = btn.getAttribute('title') || '';
      btn.setAttribute('title', 'Listening...');

      startListening({
        onStart: () => {
          targetInput.placeholder = 'Listening... Speak now';
        },
        onResult: (transcript) => {
          targetInput.value = transcript;
          // Trigger change and input events
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
          showToast(`Heard: "${transcript}"`, 'info', 2000);
        },
        onError: () => {
          btn.classList.remove('is-listening');
          btn.setAttribute('title', originalTitle);
        },
        onEnd: () => {
          btn.classList.remove('is-listening');
          btn.setAttribute('title', originalTitle);
        },
      });
    });
  });
}

/**
 * Parses spoken compound commands like "Nitrogen 60 phosphorus 40 rainfall 120"
 * Returns an object with extracted numerical values.
 */
export function parseFarmingVoiceCommand(transcript) {
  const text = transcript.toLowerCase();
  const parsed = {};

  const patterns = [
    { key: 'nitrogen', regex: /(?:nitrogen|n|ನೈಟ್ರೋಜನ್|నైట్రోజన్|नाइट्रोजन|நைட்ரஜன்)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
    { key: 'phosphorus', regex: /(?:phosphorus|p|ಫಾಸ್ಫರಸ್|భాస్వరం|फास्फोरस|பாஸ்பரஸ்)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
    { key: 'potassium', regex: /(?:potassium|k|ಪೊಟ್ಯಾಸಿಯಮ್|పొటాషియం|पोटेशियम|பொட்டாசியம்)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
    { key: 'ph', regex: /(?:ph|ಪಿಎಚ್|పిహెచ్|पीएच)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
    { key: 'rainfall', regex: /(?:rainfall|rain|ಮಳೆ|వర్షం|बारिश|மழை)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
    { key: 'temperature', regex: /(?:temp|temperature|ತಾಪಮಾನ|ఉష్ణోగ్రత|तापमान|வெப்பநிலை)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
    { key: 'humidity', regex: /(?:humidity|moisture|ತೇವಾಂಶ|తేమ|नमी|ஈரப்பதம்)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
    { key: 'area', regex: /(?:area|acre|acres|hectare|ಎಕರೆ|ఎకరాలు|एकड़|ஏக்கர்)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)/i },
  ];

  patterns.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (match && match[1]) {
      parsed[key] = parseFloat(match[1]);
    }
  });

  return parsed;
}
