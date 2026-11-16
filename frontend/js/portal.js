/**
 * CropSense AI – Farmer Portal Master Controller
 * Coordinates single-page navigation, sidebar/bottom nav sync, AI Assistant widget,
 * Simple Farmer Mode, and page modular rendering.
 */

import { setLanguage, getLanguage, updateDOMTranslations } from './i18n.js';
import { api } from './api.js';
import { speakText, startListening, isSpeechSupported } from './voice.js';
import { showToast } from './toast.js';
import { SimpleFarmerMode } from './simple-mode.js';

// Page modules
import { renderDashboard } from './pages/dashboard.js';
import { renderCrop } from './pages/crop.js';
import { renderYield } from './pages/yield.js';
import { renderIrrigation } from './pages/irrigation.js';
import { renderFertilizer } from './pages/fertilizer.js';
import { renderRisk } from './pages/risk.js';
import { renderWeather } from './pages/weather.js';
import { renderMarket } from './pages/market.js';
import { renderHealth } from './pages/health.js';
import { renderCalendar } from './pages/calendar.js';
import { renderProfile } from './pages/profile.js';

const PAGES = {
  dashboard: renderDashboard,
  crop: renderCrop,
  yield: renderYield,
  irrigation: renderIrrigation,
  fertilizer: renderFertilizer,
  risk: renderRisk,
  weather: renderWeather,
  market: renderMarket,
  health: renderHealth,
  calendar: renderCalendar,
  profile: renderProfile,
};

const PAGE_TITLES = {
  dashboard: 'Farm Dashboard',
  crop: 'Crop Recommendation',
  yield: 'Yield Prediction',
  irrigation: 'Irrigation Planner',
  fertilizer: 'Fertilizer Guide',
  risk: 'Crop Risk Alerts',
  weather: 'Weather Forecast',
  market: 'Market Prices',
  health: 'Farm Health Diagnostics',
  calendar: 'Smart Farm Calendar',
  profile: 'Farmer Profile',
};

let currentPage = 'dashboard';
let simpleModeInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initTopBar();
  initNavigation();
  initChatWidget();
  initSimpleMode();

  // Route based on URL query or sessionStorage
  const params = new URLSearchParams(window.location.search);
  const targetPage = params.get('page') || sessionStorage.getItem('cropsense_target_page') || 'dashboard';
  sessionStorage.removeItem('cropsense_target_page');

  navigateTo(targetPage);
});

/* ── 1. Authentication Check ─────────────────────────────────────── */
function checkAuth() {
  const sessionStr = localStorage.getItem('cropsense_session');
  if (!sessionStr) {
    // If not logged in, redirect to login page
    window.location.href = 'login.html';
    return;
  }

  const session = JSON.parse(sessionStr);
  const avatarLetter = document.getElementById('avatar-letter');
  if (avatarLetter && session.name) {
    avatarLetter.textContent = session.name.charAt(0).toUpperCase();
  }

  // If user selected Simple Mode as default, open it automatically
  if (localStorage.getItem('cropsense_simple_mode') === 'true' && !sessionStorage.getItem('simple_mode_closed')) {
    setTimeout(() => {
      if (simpleModeInstance) simpleModeInstance.show();
    }, 200);
  }
}

/* ── 2. Topbar Controls ──────────────────────────────────────────── */
function initTopBar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const avatar = document.getElementById('user-avatar');
  const helpBtn = document.getElementById('help-btn');
  const modeSwitch = document.getElementById('mode-switch');
  const langSelect = document.getElementById('portal-lang');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
    });
  }

  if (avatar) {
    avatar.addEventListener('click', () => navigateTo('profile'));
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      showToast('CropSense AI Help: Use the AI Assistant at the bottom right for instant farming answers.', 'info', 5000);
    });
  }

  if (modeSwitch) {
    modeSwitch.addEventListener('click', () => {
      if (simpleModeInstance) simpleModeInstance.show();
    });
  }

  if (langSelect) {
    langSelect.value = getLanguage();
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
}

/* ── 3. Page Router & Navigation ─────────────────────────────────── */
function initNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar__link[data-page]');
  const bottomNavItems = document.querySelectorAll('.bottom-nav__item[data-page]');

  sidebarLinks.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');
      navigateTo(page);

      // Close mobile sidebar if open
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('is-open');
    });
  });

  bottomNavItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');
      navigateTo(page);
    });
  });
}

export function navigateTo(pageKey) {
  if (!PAGES[pageKey]) pageKey = 'dashboard';
  currentPage = pageKey;

  // Update topbar title
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = PAGE_TITLES[pageKey] || 'CropSense AI';
  }

  // Update active states on sidebar
  const sidebarLinks = document.querySelectorAll('.sidebar__link[data-page]');
  sidebarLinks.forEach((l) => {
    if (l.getAttribute('data-page') === pageKey) l.classList.add('is-active');
    else l.classList.remove('is-active');
  });

  // Update active states on bottom nav
  const bottomNavItems = document.querySelectorAll('.bottom-nav__item[data-page]');
  bottomNavItems.forEach((b) => {
    if (b.getAttribute('data-page') === pageKey) b.classList.add('is-active');
    else b.classList.remove('is-active');
  });

  // Render page container
  const pageContainer = document.getElementById('page-content');
  if (pageContainer) {
    pageContainer.innerHTML = '';
    pageContainer.className = 'portal-page is-active';
    PAGES[pageKey](pageContainer, { navigateTo });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ── 4. Simple Farmer Mode Setup ─────────────────────────────────── */
function initSimpleMode() {
  const container = document.getElementById('simple-mode-container');
  if (!container) return;

  simpleModeInstance = new SimpleFarmerMode(container, {
    onExit: () => {
      sessionStorage.setItem('simple_mode_closed', 'true');
    },
    onOpenChat: () => {
      openChatWidget();
    },
  });
}

/* ── 5. AI Assistant Floating Chat Widget ─────────────────────────── */
function initChatWidget() {
  const chatBtn = document.getElementById('chat-btn');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const voiceBtn = document.getElementById('chat-voice-btn');
  const messagesBox = document.getElementById('chat-messages');
  const suggestionsBox = document.getElementById('chat-suggestions');

  if (!chatBtn || !chatWindow) return;

  chatBtn.addEventListener('click', () => {
    const isHidden = chatWindow.style.display === 'none';
    chatWindow.style.display = isHidden ? 'flex' : 'none';
    if (isHidden && input) input.focus();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });
  }

  const sendMessage = async (text) => {
    const msg = (text || (input ? input.value : '')).trim();
    if (!msg) return;

    if (input) input.value = '';

    // Append user message
    appendChatMessage(messagesBox, msg, 'user');

    // Bot typing placeholder
    const typingId = appendTypingIndicator(messagesBox);

    const res = await api.chatAssistant(msg, getLanguage());
    removeTypingIndicator(typingId);

    if (res && res.reply) {
      appendChatMessage(messagesBox, res.reply, 'bot', true);
      if (res.suggestions && suggestionsBox) {
        renderSuggestionChips(suggestionsBox, res.suggestions, (chipText) => {
          sendMessage(chipText);
        });
      }
    }
  };

  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage());
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Voice input for chat
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      voiceBtn.classList.add('is-listening');
      startListening({
        onResult: (transcript) => {
          if (input) input.value = transcript;
          sendMessage(transcript);
        },
        onEnd: () => {
          voiceBtn.classList.remove('is-listening');
        },
      });
    });
  }

  // Initial chips click
  if (suggestionsBox) {
    const chips = suggestionsBox.querySelectorAll('.chip');
    chips.forEach((c) => {
      c.addEventListener('click', () => {
        sendMessage(c.textContent.trim());
      });
    });
  }
}

function openChatWidget() {
  const chatWindow = document.getElementById('chat-window');
  if (chatWindow) {
    chatWindow.style.display = 'flex';
    const input = document.getElementById('chat-input');
    if (input) input.focus();
  }
}

function appendChatMessage(container, text, type = 'bot', showActions = false) {
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg chat-msg--${type}`;

  const p = document.createElement('p');
  p.textContent = text;
  msgDiv.appendChild(p);

  if (showActions && type === 'bot') {
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.marginTop = '8px';

    const speakBtn = document.createElement('button');
    speakBtn.className = 'btn btn--icon btn--sm';
    speakBtn.style.padding = '4px 8px';
    speakBtn.style.fontSize = '0.75rem';
    speakBtn.textContent = '🔊 Listen';
    speakBtn.addEventListener('click', () => speakText(text));

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn--icon btn--sm';
    copyBtn.style.padding = '4px 8px';
    copyBtn.style.fontSize = '0.75rem';
    copyBtn.textContent = '📋 Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text);
      showToast('Answer copied to clipboard!', 'info', 1500);
    });

    actions.appendChild(speakBtn);
    actions.appendChild(copyBtn);
    msgDiv.appendChild(actions);
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator(container) {
  const id = `typing-${Date.now()}`;
  const el = document.createElement('div');
  el.id = id;
  el.className = 'chat-msg chat-msg--bot';
  el.innerHTML = '<span style="opacity: 0.6;">CropSense AI is thinking...</span>';
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function renderSuggestionChips(container, suggestions, onSelect) {
  container.innerHTML = '';
  suggestions.forEach((text) => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = text;
    btn.addEventListener('click', () => onSelect(text));
    container.appendChild(btn);
  });
}
