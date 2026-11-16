/**
 * CropSense AI – Dashboard Page
 * Real-time farm overview, quick actions, weather glance, and health status.
 */

import { api } from '../api.js';
import { t } from '../i18n.js';

export function renderDashboard(container, { navigateTo }) {
  const session = JSON.parse(localStorage.getItem('cropsense_session') || '{}');
  const farmerName = session.name || 'Farmer';
  const village = session.village ? ` (${session.village})` : '';

  container.innerHTML = `
    <div class="dashboard">
      <!-- Welcome Card -->
      <div class="dashboard__welcome">
        <h2>${t('portal.dashboard')}: Welcome, ${farmerName}${village}! 🌱</h2>
        <p>AI Advisory is active. Farm data synchronized for your region.</p>
      </div>

      <!-- Stat Cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card__value">88%</div>
          <div class="stat-card__label">Farm Health Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">27°C</div>
          <div class="stat-card__label">Today's Weather (Partly Cloudy)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">₹2,400</div>
          <div class="stat-card__label">Top Crop Price (Rice/Qtl)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value" style="color: #2E7D32;">Low</div>
          <div class="stat-card__label">Pest &amp; Disease Risk Level</div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <h3 style="margin-top: 24px; margin-bottom: 12px; font-size: 1.25rem;">Quick Advisory Services</h3>
      <div class="dashboard__quick">
        <div class="quick-card ripple" data-nav="crop">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E8F5E9"/><path d="M24 10 C20 18 16 22 16 28 C16 34 20 38 24 38 C28 38 32 34 32 28 C32 22 28 18 24 10Z" fill="#2E7D32"/></svg>
          <span>Crop Advice</span>
        </div>
        <div class="quick-card ripple" data-nav="yield">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E8F5E9"/><rect x="12" y="30" width="6" height="10" fill="#66BB6A"/><rect x="21" y="22" width="6" height="18" fill="#4CAF50"/><rect x="30" y="14" width="6" height="26" fill="#2E7D32"/></svg>
          <span>Yield Prediction</span>
        </div>
        <div class="quick-card ripple" data-nav="irrigation">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F2FD"/><path d="M24 12 Q20 20 20 26 Q20 32 24 34 Q28 32 28 26 Q28 20 24 12Z" fill="#42A5F5"/></svg>
          <span>Irrigation</span>
        </div>
        <div class="quick-card ripple" data-nav="fertilizer">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#FFF3E0"/><rect x="18" y="16" width="12" height="20" rx="3" fill="#FF9800"/><text x="24" y="30" text-anchor="middle" fill="white" font-size="8" font-weight="bold">NPK</text></svg>
          <span>Fertilizer Guide</span>
        </div>
        <div class="quick-card ripple" data-nav="risk">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#FFEBEE"/><path d="M24 10 L40 38 L8 38Z" fill="none" stroke="#EF5350" stroke-width="2.5"/><text x="24" y="33" text-anchor="middle" fill="#EF5350" font-size="16" font-weight="bold">!</text></svg>
          <span>Risk Alerts</span>
        </div>
        <div class="quick-card ripple" data-nav="weather">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E3F2FD"/><circle cx="20" cy="22" r="8" fill="#FFC107"/><path d="M18 28 Q12 28 10 24 Q8 18 14 16 Q16 12 22 12 Q24 10 28 12 Q34 12 36 18 Q38 22 34 26 Q30 30 24 28Z" fill="white"/></svg>
          <span>Weather</span>
        </div>
        <div class="quick-card ripple" data-nav="market">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#E8F5E9"/><text x="24" y="30" text-anchor="middle" fill="#2E7D32" font-size="20" font-weight="bold">₹</text></svg>
          <span>Market Prices</span>
        </div>
        <div class="quick-card ripple" data-nav="calendar">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#F3E5F5"/><rect x="14" y="16" width="20" height="20" rx="3" fill="none" stroke="#7B1FA2" stroke-width="2"/><circle cx="21" cy="28" r="2" fill="#7B1FA2"/></svg>
          <span>Smart Calendar</span>
        </div>
      </div>
    </div>
  `;

  // Bind quick action clicks
  const quickCards = container.querySelectorAll('.quick-card');
  quickCards.forEach((c) => {
    c.addEventListener('click', () => {
      const target = c.getAttribute('data-nav');
      if (navigateTo) navigateTo(target);
    });
  });
}
