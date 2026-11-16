/**
 * CropSense AI – Irrigation Planner Page
 * Calculates water requirements and optimal irrigation frequency by crop growth phase.
 */

import { api } from '../api.js';
import { speakText } from '../voice.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderIrrigation(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.irrigation')}</h2>
      <p class="page-header__desc">Calculate water requirements and schedule watering cycles to conserve water and protect root health.</p>
    </div>

    <div class="form-card">
      <h3 class="form-card__title">Irrigation Configuration</h3>
      <form id="irrigation-form">
        <div class="form-card__grid">
          <div class="form-group">
            <label class="form-label" for="irri-crop">Crop</label>
            <select id="irri-crop" name="crop" class="form-input form-select" required>
              <option value="Rice" selected>Rice (Paddy)</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Cotton">Cotton</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Groundnut">Groundnut</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="irri-soil">Soil Texture</label>
            <select id="irri-soil" name="soil_type" class="form-input form-select">
              <option value="Loam" selected>Loam (Balanced)</option>
              <option value="Clay">Clay (High Water Retention)</option>
              <option value="Sandy">Sandy (High Infiltration)</option>
              <option value="Black">Black Cotton Soil</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="irri-area">Cultivated Area (Hectares)</label>
            <input type="number" step="0.1" id="irri-area" name="area" class="form-input" min="0.1" max="100" value="1.0" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="irri-method">Irrigation System</label>
            <select id="irri-method" name="irrigation_method" class="form-input form-select">
              <option value="drip" selected>Drip Irrigation (90% Efficiency)</option>
              <option value="sprinkler">Sprinkler (75% Efficiency)</option>
              <option value="flood">Flood / Basin (50% Efficiency)</option>
              <option value="furrow">Furrow Irrigation (60% Efficiency)</option>
            </select>
          </div>
        </div>

        <div class="form-card__actions">
          <button type="submit" class="btn btn--primary">
            <span>💧 Generate Irrigation Plan</span>
          </button>
          <button type="reset" class="btn btn--secondary">Reset</button>
        </div>
      </form>
    </div>

    <div id="irrigation-results" style="margin-top: 24px;"></div>
  `;

  const form = container.querySelector('#irrigation-form');
  const resultsArea = container.querySelector('#irrigation-results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    resultsArea.innerHTML = `
      <div class="result-card">
        <div class="skeleton" style="height: 28px; width: 45%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    `;

    const payload = {
      crop: form.crop.value,
      soil_type: form.soil_type.value,
      area: parseFloat(form.area.value),
      irrigation_method: form.irrigation_method.value,
    };

    const res = await api.scheduleIrrigation(payload);
    displayIrrigationResults(resultsArea, res);
  });
}

function displayIrrigationResults(container, data) {
  if (!data) return;

  const scheduleRows = (data.schedule || []).map((s) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; font-weight: 500;">${s.week}</td>
      <td style="padding: 10px;">${s.action}</td>
      <td style="padding: 10px; font-weight: 600; color: #1565C0;">${s.amount}</td>
    </tr>
  `).join('');

  const tipsHtml = (data.tips || []).map((t) => `<li>${t}</li>`).join('');

  container.innerHTML = `
    <div class="result-card">
      <div class="result-card__header">
        <h3 class="result-card__title">Custom Water Scheduling Plan</h3>
        <div class="result-card__actions">
          <button class="btn btn--secondary btn--sm" id="btn-irri-listen">🔊 Listen</button>
          <button class="btn btn--secondary btn--sm" id="btn-irri-print">🖨️ Print</button>
        </div>
      </div>

      <div class="stat-grid" style="margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-card__value">${(data.water_needed_liters || 0).toLocaleString()} L</div>
          <div class="stat-card__label">Total Estimated Water Need</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">Every ${data.frequency_days} Days</div>
          <div class="stat-card__label">Recommended Frequency</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">${data.duration_hours} Hours</div>
          <div class="stat-card__label">Run Duration per Cycle</div>
        </div>
      </div>

      <h4 style="margin-bottom: 12px;">Stage-by-Stage Irrigation Schedule:</h4>
      <div style="overflow-x: auto; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: #F4F8F2; border-bottom: 2px solid #E0E0E0;">
              <th style="padding: 10px;">Growth Stage</th>
              <th style="padding: 10px;">Watering Practice</th>
              <th style="padding: 10px;">Target Volume</th>
            </tr>
          </thead>
          <tbody>
            ${scheduleRows}
          </tbody>
        </table>
      </div>

      <h4 style="margin-bottom: 8px;">Water Conservation Recommendations:</h4>
      <ul style="padding-left: 20px; line-height: 1.6; color: #444;">
        ${tipsHtml}
      </ul>
    </div>
  `;

  container.querySelector('#btn-irri-listen')?.addEventListener('click', () => {
    speakText(`Water schedule for ${data.crop}: Run irrigation every ${data.frequency_days} days for ${data.duration_hours} hours. Total season water requirement is ${data.water_needed_liters} liters.`);
  });

  container.querySelector('#btn-irri-print')?.addEventListener('click', () => {
    window.print();
  });
}
