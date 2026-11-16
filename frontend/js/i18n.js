/**
 * CropSense AI – Multilingual Internationalization (i18n) Engine
 * Supports English (en), Kannada (kn), Telugu (te), Hindi (hi), Tamil (ta).
 * Instant in-place DOM updates without page refresh.
 */

import T from './translations.js';

const STORAGE_KEY = 'cropsense_lang';
const SUPPORTED_LANGS = ['en', 'kn', 'te', 'hi', 'ta'];
let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

if (!SUPPORTED_LANGS.includes(currentLang)) {
  currentLang = 'en';
}

export function getLanguage() {
  return currentLang;
}

export function t(key, fallback = '') {
  if (T[key] && T[key][currentLang]) {
    return T[key][currentLang];
  }
  if (T[key] && T[key]['en']) {
    return T[key]['en'];
  }
  return fallback || key;
}

export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;

  // Set font class on body for regional script styling
  document.body.classList.remove('lang-en', 'lang-kn', 'lang-te', 'lang-hi', 'lang-ta');
  document.body.classList.add(`lang-${lang}`);

  updateDOMTranslations();

  // Dispatch custom event for modules that need to re-render dynamic content
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

export function updateDOMTranslations(root = document) {
  // Elements with data-i18n
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated) {
      el.textContent = translated;
    }
  });

  // Elements with data-i18n-placeholder
  const placeholders = root.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated) {
      el.placeholder = translated;
    }
  });

  // Elements with data-i18n-title
  const titled = root.querySelectorAll('[data-i18n-title]');
  titled.forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    const translated = t(key);
    if (translated) {
      el.title = translated;
    }
  });

  // Sync any select dropdowns
  const langSelects = document.querySelectorAll('#lang-selector, #drawer-lang-selector, #portal-lang');
  langSelects.forEach((sel) => {
    if (sel && sel.value !== currentLang) {
      sel.value = currentLang;
    }
  });
}

// Auto-initialize when loaded
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLang;
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add(`lang-${currentLang}`);
    updateDOMTranslations();

    // Bind all language selectors
    const selectors = ['lang-selector', 'drawer-lang-selector', 'portal-lang'];
    selectors.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = currentLang;
        el.addEventListener('change', (e) => setLanguage(e.target.value));
      }
    });
  });
}
