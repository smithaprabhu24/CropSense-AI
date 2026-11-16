/**
 * CropSense AI – Yield Prediction Page
 * Forecasts harvest yield in tonnes with confidence levels and factor analysis.
 */

import { api } from '../api.js';
import { speakText } from '../voice.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderYield(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.yield')}</h2>
      <p class="page-header__desc">Predict expected harvest tonnage using historical climate data and soil productivity multipliers.</p>
    </div>

    <div class="form-card">
      <h3 class="form-card__title">Farm &amp; Cultivation Parameters</h3>
      <form id="yield-form">
        <div class="form-card__grid">
          <div class="form-group">
            <label class="form-label" for="yield-crop">Selected Crop</label>
            <select id="yield-crop" name="crop" class="form-input form-select" required>
              <option value="Rice" selected>Rice (Paddy)</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Cotton">Cotton</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Soybean">Soybean</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Ragi">Ragi (Finger Millet)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="yield-area">Cultivation Area (Hectares)</label>
            <input type="number" step="0.1" id="yield-area" name="area" class="form-input" min="0.1" max="100" value="2.5" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="yield-season">Sowing Season</label>
            <select id="yield-season" name="season" class="form-input form-select">
              <option value="Kharif" selected>Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="yield-soil">Soil Type</label>
            <select id="yield-soil" name="soil_type" class="form-input form-select">
              <option value="Loam" selected>Loamy Soil</option>
              <option value="Clay">Clay Soil</option>
              <option value="Black">Black Cotton Soil</option>
              <option value="Red">Red Soil</option>
              <option value="Sandy">Sandy Loam</option>
            </select>
          </div>
        </div>

        <div class="form-card__actions">
          <button type="submit" class="btn btn--primary">
            <span>📊 Calculate Estimated Harvest</span>
          </button>
          <button type="reset" class="btn btn--secondary">Reset</button>
        </div>
      </form>
    </div>

    <div id="yield-results" style="margin-top: 24px;"></div>
  `;

  const form = container.querySelector('#yield-form');
  const resultsArea = container.querySelector('#yield-results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    resultsArea.innerHTML = `
      <div class="result-card">
        <div class="skeleton" style="height: 32px; width: 50%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    `;

    const payload = {
      crop: form.crop.value,
      area: parseFloat(form.area.value),
      season: form.season.value,
      soil_type: form.soil_type.value,
    };

    const res = await api.predictYield(payload);
    displayYieldResults(resultsArea, res);
  });
}

function displayYieldResults(container, data) {
  if (!data) return;

  const factorsHtml = (data.factors || []).map((f) => `<li>${f}</li>`).join('');
  const recsHtml = (data.recommendations || []).map((r) => `<li>${r}</li>`).join('');

  container.innerHTML = `
    <div class="result-card">
      <div class="result-card__header">
        <h3 class="result-card__title">Harvest Prediction Report</h3>
        <div class="result-card__actions">
          <button class="btn btn--secondary btn--sm" id="btn-yield-listen">🔊 Listen</button>
          <button class="btn btn--secondary btn--sm" id="btn-yield-print">🖨️ Print</button>
        </div>
      </div>

      <div class="stat-grid" style="margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-card__value">${data.estimated_yield} ${data.unit || 'tonnes'}</div>
          <div class="stat-card__label">Expected Output for ${data.area} Hectares</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value" style="color: #2E7D32;">${data.confidence}%</div>
          <div class="stat-card__label">Prediction Confidence Score</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin-bottom: 8px;">Key Contributing Factors:</h4>
        <ul style="padding-left: 20px; line-height: 1.6; color: #444;">
          ${factorsHtml}
        </ul>
      </div>

      <div>
        <h4 style="margin-bottom: 8px;">Agronomic Recommendations:</h4>
        <ul style="padding-left: 20px; line-height: 1.6; color: #444;">
          ${recsHtml}
        </ul>
      </div>

      <div class="disclaimer">
        ⚠️ <strong>Note:</strong> Yield estimates assume standard irrigation and normal weather conditions. Unforeseen severe weather events may affect final yield.
      </div>
    </div>
  `;

  container.querySelector('#btn-yield-listen')?.addEventListener('click', () => {
    speakText(`Estimated harvest yield for ${data.area} hectares of ${data.crop} is approximately ${data.estimated_yield} tonnes with ${data.confidence} percent confidence.`);
  });

  container.querySelector('#btn-yield-print')?.addEventListener('click', () => {
    window.print();
  });
}
