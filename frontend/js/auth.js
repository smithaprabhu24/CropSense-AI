/**
 * CropSense AI – Authentication Controller
 * Handles user login, registration, guest access, 4-digit PIN inputs,
 * voice field filling, and session persistence.
 */

import { setLanguage, getLanguage, updateDOMTranslations } from './i18n.js';
import { api } from './api.js';
import { initVoiceInputs } from './voice.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  initLanguageButtons();
  initTabs();
  initPinInputs('login-pin-group', 'login-pin');
  initPinInputs('register-pin-group', 'reg-pin');
  initVoiceInputs();
  initLoginForm();
  initRegisterForm();
  initGuestMode();
});

/* ── 1. Language Buttons Switcher ─────────────────────────────────── */
function initLanguageButtons() {
  const buttons = document.querySelectorAll('.lang-btn');
  const current = getLanguage();

  buttons.forEach((btn) => {
    const lang = btn.getAttribute('data-lang');
    if (lang === current) btn.classList.add('is-active');
    else btn.classList.remove('is-active');

    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      setLanguage(lang);
    });
  });
}

/* ── 2. Login / Register Tabs ─────────────────────────────────────── */
function initTabs() {
  const tabs = document.querySelectorAll('.login__tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const target = tab.getAttribute('data-tab');
      if (target === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
      }
    });
  });
}

/* ── 3. 4-Digit PIN Input Group ──────────────────────────────────── */
function initPinInputs(groupId, hiddenInputId) {
  const group = document.getElementById(groupId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!group || !hiddenInput) return;

  const boxes = group.querySelectorAll('.pin-box');

  const updateHidden = () => {
    let pin = '';
    boxes.forEach((b) => {
      pin += b.value;
    });
    hiddenInput.value = pin;
    return pin;
  };

  boxes.forEach((box, idx) => {
    box.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      box.value = val ? val[0] : '';
      updateHidden();

      if (val && idx < boxes.length - 1) {
        boxes[idx + 1].focus();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && idx > 0) {
        boxes[idx - 1].focus();
      }
    });

    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      if (!pasted) return;
      for (let i = 0; i < boxes.length; i++) {
        boxes[i].value = pasted[i] || '';
      }
      updateHidden();
      const lastFilled = Math.min(pasted.length, boxes.length) - 1;
      if (lastFilled >= 0) boxes[lastFilled].focus();
    });
  });
}

/* ── 4. Login Form Handler ────────────────────────────────────────── */
function initLoginForm() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.textContent = '';

    const mobile = form.mobile.value.trim();
    const pin = document.getElementById('login-pin').value.trim();

    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      showFieldError('login-mobile-error', 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      showFieldError('login-pin-error', 'Please enter your 4-digit PIN');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    const res = await api.login(mobile, pin);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';

    if (res && res.success) {
      saveSession(res.user, res.token);
      showToast('Welcome back, Farmer!', 'success');
      redirectAfterAuth();
    } else {
      if (errorEl) {
        errorEl.textContent = res ? res.message : 'Invalid Mobile Number or PIN';
      }
      showToast('Invalid credentials. Check mobile and PIN.', 'error');
    }
  });
}

/* ── 5. Register Form Handler ─────────────────────────────────────── */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  const errorEl = document.getElementById('register-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.textContent = '';

    const name = form.name.value.trim();
    const village = form.village.value.trim();
    const mobile = form.mobile.value.trim();
    const pin = document.getElementById('reg-pin').value.trim();
    const simpleMode = document.getElementById('simple-mode-checkbox').checked;

    if (name.length < 2) {
      showToast('Please enter your full name', 'warning');
      return;
    }
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      showToast('Please set a 4-digit PIN', 'warning');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const res = await api.register({
      name,
      village,
      mobile,
      pin,
      language: getLanguage(),
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';

    if (res && res.success) {
      if (simpleMode) {
        localStorage.setItem('cropsense_simple_mode', 'true');
      }
      saveSession(res.user, btoa(`${mobile}:${Date.now()}`));
      showToast('Account created successfully!', 'success');
      redirectAfterAuth();
    } else {
      if (errorEl) {
        errorEl.textContent = res ? res.message : 'Could not create account';
      }
      showToast(res ? res.message : 'Registration failed', 'error');
    }
  });
}

/* ── 6. Guest Mode ────────────────────────────────────────────────── */
function initGuestMode() {
  const guestBtn = document.getElementById('guest-mode-btn');
  if (!guestBtn) return;

  guestBtn.addEventListener('click', () => {
    const guestUser = {
      name: 'Guest Farmer',
      village: 'Demo Village',
      mobile: '9876543210',
      language: getLanguage(),
      isGuest: true,
    };
    saveSession(guestUser, btoa(`guest:${Date.now()}`));
    showToast('Continuing as Guest', 'info');
    redirectAfterAuth();
  });
}

/* ── Helper utilities ─────────────────────────────────────────────── */
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.add('is-visible');
    setTimeout(() => el.classList.remove('is-visible'), 4000);
  }
}

function saveSession(user, token) {
  localStorage.setItem('cropsense_session', JSON.stringify(user));
  localStorage.setItem('cropsense_token', token || '');
  if (user && user.language) {
    setLanguage(user.language);
  }
}

function redirectAfterAuth() {
  const target = sessionStorage.getItem('cropsense_target_page');
  sessionStorage.removeItem('cropsense_target_page');
  const url = target ? `portal.html?page=${target}` : 'portal.html';
  setTimeout(() => {
    window.location.href = url;
  }, 350);
}
