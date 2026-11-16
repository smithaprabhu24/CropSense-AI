/**
 * CropSense AI – Farm Health Page
 * Comprehensive farm diagnostic index, soil quality gauge, and health enhancement checklist.
 */

import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderHealth(container) {
  const score = 86; // Current composite farm health

  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.health')}</h2>
      <p class="page-header__desc">Holistic farm vitality assessment measuring soil health, moisture retention, and ecological balance.</p>
    </div>

    <!-- Health Score Card -->
    <div class="result-card" style="text-align: center; margin-bottom: 24px;">
      <h3 style="margin-bottom: 20px;">Overall Farm Health Index</h3>
      <div class="health-score" style="--score: ${score};">
        <div class="health-score__value">${score}%</div>
      </div>
      <p style="color: #2E7D32; font-weight: 600; font-size: 1.1rem;">Status: Optimal Growing Ecosystem</p>
      <p style="color: #666; font-size: 0.9rem; max-width: 500px; margin: 8px auto 0;">Your farm exhibits excellent soil vitality with balanced nitrogen retention and low pest pressure.</p>
    </div>

    <!-- Pillar Breakdown -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card__value" style="color: #2E7D32;">90%</div>
        <div class="stat-card__label">Soil Nutrient Status</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value" style="color: #1565C0;">82%</div>
        <div class="stat-card__label">Water Retention Capacity</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value" style="color: #F57C00;">88%</div>
        <div class="stat-card__label">Vegetative Vigour (NDVI)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value" style="color: #2E7D32;">85%</div>
        <div class="stat-card__label">Organic Matter Content</div>
      </div>
    </div>

    <!-- Interactive Checklist -->
    <div class="result-card">
      <h3 class="result-card__title" style="margin-bottom: 16px;">Farm Health Improvement Checklist</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <label class="checkbox-label" style="background: #F4F8F2; padding: 10px 14px; border-radius: 8px;">
          <input type="checkbox" checked>
          <span>Conducted periodic soil testing within the last 6 months (+10 pts)</span>
        </label>
        <label class="checkbox-label" style="background: #F4F8F2; padding: 10px 14px; border-radius: 8px;">
          <input type="checkbox" checked>
          <span>Applied organic FYM / Vermicompost before sowing (+15 pts)</span>
        </label>
        <label class="checkbox-label" style="background: #F4F8F2; padding: 10px 14px; border-radius: 8px;">
          <input type="checkbox" checked>
          <span>Installed drip/sprinkler system for water conservation (+15 pts)</span>
        </label>
        <label class="checkbox-label" style="background: #F4F8F2; padding: 10px 14px; border-radius: 8px;">
          <input type="checkbox">
          <span>Implemented crop rotation with nitrogen-fixing pulses (+10 pts)</span>
        </label>
        <label class="checkbox-label" style="background: #F4F8F2; padding: 10px 14px; border-radius: 8px;">
          <input type="checkbox">
          <span>Installed solar-powered light insect traps around perimeter (+5 pts)</span>
        </label>
      </div>

      <div class="form-card__actions" style="margin-top: 16px;">
        <button class="btn btn--primary btn--sm" id="btn-save-health">Save Health Checklist</button>
      </div>
    </div>
  `;

  container.querySelector('#btn-save-health')?.addEventListener('click', () => {
    showToast('Farm health status saved successfully!', 'success');
  });
}
