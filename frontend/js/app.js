/**
 * CropSense AI – Public Website Controller
 * Manages splash screen, PWA lifecycle, hero slider, navigation, animations, and contact form.
 */

import { setLanguage, getLanguage, updateDOMTranslations } from './i18n.js';
import { api } from './api.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen();
  initServiceWorker();
  initPwaInstall();
  initTextSizeToggle();
  initNavigation();
  initHeroSlider();
  initFeatureCards();
  initContactForm();
  initScrollReveal();
});

/* ── 1. Splash Screen ────────────────────────────────────────────── */
function initSplashScreen() {
  const splash = document.getElementById('splash-screen');
  const app = document.getElementById('app-container');
  if (!splash) return;

  // Let splash animate for 900ms, then smoothly fade in the app
  setTimeout(() => {
    splash.classList.add('is-hidden');
    if (app) {
      app.style.opacity = '1';
      app.style.transition = 'opacity 0.5s ease-in-out';
    }
  }, 950);
}

/* ── 2. PWA Service Worker ───────────────────────────────────────── */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('CropSense AI Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
    });
  }
}

/* ── 3. PWA Install Prompt Banner ────────────────────────────────── */
let deferredPrompt = null;
function initPwaInstall() {
  const banner = document.getElementById('install-banner');
  const installBtn = document.getElementById('install-btn');
  const dismissBtn = document.getElementById('install-dismiss');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (banner && !sessionStorage.getItem('pwa_dismissed')) {
      banner.style.display = 'flex';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install: ${outcome}`);
        deferredPrompt = null;
      }
      if (banner) banner.style.display = 'none';
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      if (banner) banner.style.display = 'none';
      sessionStorage.setItem('pwa_dismissed', 'true');
    });
  }
}

/* ── 4. Large Text Accessibility Toggle ───────────────────────────── */
function initTextSizeToggle() {
  const toggleBtn = document.getElementById('text-size-toggle');
  const isLarge = localStorage.getItem('cropsense_largetext') === 'true';

  if (isLarge) {
    document.documentElement.classList.add('large-text');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.classList.toggle('large-text');
      localStorage.setItem('cropsense_largetext', active);
      showToast(active ? 'Large Text Mode Activated' : 'Standard Text Mode', 'info', 1500);
    });
  }
}

/* ── 5. Navigation & Mobile Drawer ────────────────────────────────── */
function initNavigation() {
  const nav = document.getElementById('main-nav');
  const burger = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = drawer ? drawer.querySelector('.drawer__close') : null;
  const overlay = drawer ? drawer.querySelector('.drawer__overlay') : null;
  const drawerLinks = drawer ? drawer.querySelectorAll('.drawer__link') : [];

  // Scroll effect on nav
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  });

  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (burger) burger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
  drawerLinks.forEach((link) => link.addEventListener('click', closeDrawer));
}

/* ── 6. Hero Slider ──────────────────────────────────────────────── */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');
  const prevBtn = document.querySelector('.hero__prev');
  const nextBtn = document.querySelector('.hero__next');
  if (slides.length === 0) return;

  let currentSlide = 0;
  let timer = null;

  const showSlide = (idx) => {
    slides.forEach((s) => s.classList.remove('is-active'));
    dots.forEach((d) => d.classList.remove('is-active'));

    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('is-active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('is-active');
  };

  const nextSlide = () => showSlide(currentSlide + 1);
  const prevSlide = () => showSlide(currentSlide - 1);

  const startAutoSlide = () => {
    timer = setInterval(nextSlide, 5500);
  };

  const resetTimer = () => {
    clearInterval(timer);
    startAutoSlide();
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetTimer();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(idx);
      resetTimer();
    });
  });

  // Touch Swipe on mobile
  const slider = document.querySelector('.hero');
  if (slider) {
    let startX = 0;
    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
        resetTimer();
      }
    }, { passive: true });
  }

  startAutoSlide();
}

/* ── 7. Feature Cards Click Navigation ────────────────────────────── */
function initFeatureCards() {
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const feature = card.getAttribute('data-feature');
      sessionStorage.setItem('cropsense_target_page', feature);

      // Check if logged in
      const session = localStorage.getItem('cropsense_session');
      if (session) {
        window.location.href = `portal.html?page=${feature}`;
      } else {
        window.location.href = 'login.html';
      }
    });

    // Enter key support for accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/* ── 8. Contact Form ──────────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    let valid = true;
    const validateField = (input, cond) => {
      const group = input.closest('.form-group');
      if (!cond) {
        group.classList.add('is-error');
        valid = false;
      } else {
        group.classList.remove('is-error');
      }
    };

    validateField(form.name, name.length >= 2);
    validateField(form.email, email.includes('@') && email.includes('.'));
    validateField(form.subject, subject.length >= 2);
    validateField(form.message, message.length >= 5);

    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const res = await api.submitContact({ name, email, subject, message });
    submitBtn.disabled = false;
    submitBtn.textContent = origText;

    if (res && res.success) {
      showToast(res.message || 'Message sent successfully!', 'success');
      form.reset();
    } else {
      showToast('Could not send message. Saved offline.', 'warning');
      form.reset();
    }
  });
}

/* ── 9. Scroll Reveal Animations ──────────────────────────────────── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((el) => observer.observe(el));
}
