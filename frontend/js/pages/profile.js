/**
 * CropSense AI – Farmer Profile Page
 * Manages user credentials, language preferences, simple mode toggle, and session logout.
 */

import { setLanguage, getLanguage } from '../i18n.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderProfile(container) {
  const session = JSON.parse(localStorage.getItem('cropsense_session') || '{}');
  const name = session.name || 'Farmer';
  const village = session.village || 'Local Village';
  const mobile = session.mobile || '9876543210';
  const currentLang = getLanguage();
  const isSimple = localStorage.getItem('cropsense_simple_mode') === 'true';

  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('portal.profile')}</h2>
      <p class="page-header__desc">View your registered farmer profile and personalize application settings.</p>
    </div>

    <div class="profile-card">
      <div class="profile-card__avatar">
        ${name.charAt(0).toUpperCase()}
      </div>
      <h3 class="profile-card__name">${name}</h3>
      <p class="profile-card__detail">📍 ${village}</p>
      <p class="profile-card__detail">📱 +91 ${mobile}</p>
      <span class="badge badge--low" style="margin-top: 8px;">Active Farmer Account</span>

      <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 24px 0;">

      <!-- Preferences -->
      <div style="text-align: left; margin-bottom: 20px;">
        <h4 style="margin-bottom: 12px;">App Preferences</h4>

        <div class="form-group">
          <label class="form-label" for="profile-lang-select">Preferred Language</label>
          <select id="profile-lang-select" class="form-input form-select">
            <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
            <option value="kn" ${currentLang === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
            <option value="te" ${currentLang === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
            <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
            <option value="ta" ${currentLang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="profile-simple-toggle" ${isSimple ? 'checked' : ''}>
            <span>Enable Simple Farmer Mode as Default</span>
          </label>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="btn btn--secondary btn--block" id="btn-clear-cache">🗑️ Clear Offline Data Cache</button>
        <button class="btn btn--ghost btn--block" id="btn-logout" style="color: #D32F2F; border-color: #D32F2F;">🚪 Logout</button>
      </div>
    </div>
  `;

  // Language switch
  container.querySelector('#profile-lang-select')?.addEventListener('change', (e) => {
    setLanguage(e.target.value);
    showToast('Language updated!', 'success');
  });

  // Simple mode toggle
  container.querySelector('#profile-simple-toggle')?.addEventListener('change', (e) => {
    localStorage.setItem('cropsense_simple_mode', e.target.checked);
    showToast(e.target.checked ? 'Simple Mode will be active by default.' : 'Standard Mode active.', 'info');
  });

  // Clear offline data
  container.querySelector('#btn-clear-cache')?.addEventListener('click', () => {
    localStorage.removeItem('cropsense_calendar_events');
    showToast('Offline cache cleared.', 'info');
  });

  // Logout
  container.querySelector('#btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('cropsense_session');
    localStorage.removeItem('cropsense_token');
    showToast('Logged out successfully.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  });
}
