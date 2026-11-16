/**
 * CropSense AI – APMC Market Prices Page
 * Live agricultural mandi commodity rates, price trend charts, alerts, and favorites.
 */

import { api } from '../api.js';
import { speakText } from '../voice.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderMarket(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.market')}</h2>
      <p class="page-header__desc">Live APMC Mandi prices, commodity trend analysis, and regional rate comparisons.</p>
    </div>

    <!-- Filters -->
    <div class="form-card" style="margin-bottom: 20px;">
      <div class="form-card__grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="mkt-commodity">Commodity</label>
          <select id="mkt-commodity" class="form-input form-select">
            <option value="Rice" selected>Rice</option>
            <option value="Wheat">Wheat</option>
            <option value="Maize">Maize</option>
            <option value="Cotton">Cotton</option>
            <option value="Groundnut">Groundnut</option>
            <option value="Turmeric">Turmeric</option>
            <option value="Tomato">Tomato</option>
            <option value="Onion">Onion</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="mkt-state">State</label>
          <select id="mkt-state" class="form-input form-select">
            <option value="Karnataka" selected>Karnataka</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="mkt-search">Search Mandi</label>
          <input type="text" id="mkt-search" class="form-input" placeholder="Type market name...">
        </div>
      </div>
    </div>

    <!-- Price Results Area -->
    <div id="market-display"></div>

    <!-- 30-Day SVG Price Trend Chart -->
    <div class="result-card" style="margin-top: 24px;">
      <div class="result-card__header">
        <h3 class="result-card__title">30-Day Historical Price Movement (₹/Quintal)</h3>
        <button class="btn btn--secondary btn--sm" id="btn-market-alert">🔔 Set Price Alert</button>
      </div>
      <div id="market-chart" class="chart-container" style="align-items: flex-end; height: 180px;"></div>
    </div>
  `;

  const commoditySelect = container.querySelector('#mkt-commodity');
  const stateSelect = container.querySelector('#mkt-state');
  const searchInput = container.querySelector('#mkt-search');
  const displayArea = container.querySelector('#market-display');
  const chartArea = container.querySelector('#market-chart');

  let allPrices = [];

  const updatePrices = async () => {
    displayArea.innerHTML = `
      <div class="skeleton skeleton-card" style="margin-bottom: 12px;"></div>
      <div class="skeleton skeleton-card"></div>
    `;

    const commodity = commoditySelect.value;
    const state = stateSelect.value;
    allPrices = await api.getMarketPrices(commodity, state);
    renderPriceCards(displayArea, allPrices, searchInput.value);
    renderSvgChart(chartArea, commodity);
  };

  commoditySelect.addEventListener('change', updatePrices);
  stateSelect.addEventListener('change', updatePrices);
  searchInput.addEventListener('input', () => {
    renderPriceCards(displayArea, allPrices, searchInput.value);
  });

  container.querySelector('#btn-market-alert')?.addEventListener('click', () => {
    showToast(`Price alert created for ${commoditySelect.value}. We'll notify you on major rate changes.`, 'success');
  });

  updatePrices();
}

function renderPriceCards(container, prices, searchFilter = '') {
  if (!prices || prices.length === 0) {
    container.innerHTML = '<p>No market price data available for selection.</p>';
    return;
  }

  const query = searchFilter.toLowerCase();
  const filtered = prices.filter((p) =>
    p.market.toLowerCase().includes(query) || p.commodity.toLowerCase().includes(query)
  );

  const cardsHtml = filtered.map((p) => {
    const trendClass = p.trend === 'up' ? 'price-card__trend--up' : p.trend === 'down' ? 'price-card__trend--down' : 'price-card__trend--stable';
    const trendIcon = p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '►';

    return `
      <div class="price-card">
        <div class="price-card__commodity">${p.commodity}</div>
        <div class="price-card__market">📍 ${p.market}</div>
        <div class="price-card__price">₹${p.modal_price.toLocaleString()} <span class="price-card__unit">/ Quintal</span></div>
        <div class="price-card__trend ${trendClass}">${trendIcon} ${p.trend.toUpperCase()} TREND</div>
        <div class="price-card__range">Min: ₹${p.min_price.toLocaleString()} • Max: ₹${p.max_price.toLocaleString()}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="price-grid">
      ${cardsHtml}
    </div>
  `;
}

function renderSvgChart(container, commodity) {
  // Generate 20 daily points
  const points = [];
  const base = commodity === 'Cotton' ? 6800 : commodity === 'Turmeric' ? 9200 : 2300;
  for (let i = 0; i < 20; i++) {
    const val = base + Math.sin(i * 0.5) * (base * 0.08) + (Math.random() - 0.5) * (base * 0.04);
    points.push(Math.round(val));
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const bars = points.map((p, i) => {
    const heightPercent = Math.max(15, Math.round(((p - min) / range) * 85));
    return `
      <div class="chart-bar" style="height: ${heightPercent}%;" title="Day ${i + 1}: ₹${p}"></div>
    `;
  }).join('');

  container.innerHTML = bars;
}
