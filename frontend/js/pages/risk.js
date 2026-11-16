/**
 * CropSense AI – Crop Risk Prediction Page
 * Early warning detection for pests, plant pathologies, and climate risks.
 */

import { api } from '../api.js';
import { speakText } from '../voice.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderRisk(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.risk')}</h2>
      <p class="page-header__desc">AI early-warning system identifying pest outbreaks, fungal blights, and seasonal climate risks.</p>
    </div>

    <div class="form-card">
      <h3 class="form-card__title">Risk Assessment Criteria</h3>
      <form id="risk-form">
        <div class="form-card__grid">
          <div class="form-group">
            <label class="form-label" for="risk-crop">Standing Crop</label>
            <select id="risk-crop" name="crop" class="form-input form-select" required>
              <option value="Rice" selected>Rice (Paddy)</option>
              <option value="Wheat">Wheat</option>
              <option value="Cotton">Cotton</option>
              <option value="Maize">Maize</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Tomato">Tomato</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="risk-state">State</label>
            <select id="risk-state" name="state" class="form-input form-select">
              <option value="Karnataka" selected>Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="risk-season">Current Season</label>
            <select id="risk-season" name="season" class="form-input form-select">
              <option value="Kharif" selected>Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
          </div>
        </div>

        <div class="form-card__actions">
          <button type="submit" class="btn btn--primary">
            <span>🛡️ Run AI Risk Analysis</span>
          </button>
          <button type="reset" class="btn btn--secondary">Reset</button>
        </div>
      </form>
    </div>

    <div id="risk-results" style="margin-top: 24px;"></div>
  `;

  const form = container.querySelector('#risk-form');
  const resultsArea = container.querySelector('#risk-results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    resultsArea.innerHTML = `
      <div class="result-card">
        <div class="skeleton" style="height: 28px; width: 40%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    `;

    const payload = {
      crop: form.crop.value,
      state: form.state.value,
      season: form.season.value,
    };

    const res = await api.predictRisk(payload);
    displayRiskResults(resultsArea, res);
  });
}

function displayRiskResults(container, data) {
  if (!data || !data.risks) return;

  const riskCards = data.risks.map((r) => {
    const badgeClass = `badge--${r.severity.toLowerCase()}`;
    const mitigations = (r.mitigation || []).map((m) => `<li>${m}</li>`).join('');
    const preventive = (r.preventive_measures || []).map((p) => `<li>${p}</li>`).join('');

    return `
      <div style="border: 1px solid #E0E0E0; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span class="badge ${badgeClass}" style="margin-right: 8px;">${r.severity.toUpperCase()} RISK</span>
            <span style="font-weight: 700; font-size: 1.1rem;">${r.name}</span>
          </div>
          <span style="font-weight: 700; color: #D32F2F;">${r.probability}% Probability</span>
        </div>
        <p style="color: #555; font-size: 0.9rem; margin-bottom: 12px;">${r.description}</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; font-size: 0.85rem;">
          <div style="background: #FFEBEE; padding: 10px; border-radius: 8px;">
            <strong style="color: #C62828;">Immediate Mitigation:</strong>
            <ul style="padding-left: 18px; margin-top: 4px; color: #333;">
              ${mitigations}
            </ul>
          </div>
          <div style="background: #E8F5E9; padding: 10px; border-radius: 8px;">
            <strong style="color: #2E7D32;">Preventive Measures:</strong>
            <ul style="padding-left: 18px; margin-top: 4px; color: #333;">
              ${preventive}
            </ul>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="result-card">
      <div class="result-card__header">
        <h3 class="result-card__title">Risk Diagnostic &amp; Threat Forecast</h3>
        <div class="result-card__actions">
          <button class="btn btn--secondary btn--sm" id="btn-risk-listen">🔊 Listen</button>
          <button class="btn btn--secondary btn--sm" id="btn-risk-print">🖨️ Print</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; background: #F4F8F2; padding: 12px 18px; border-radius: 10px; margin-bottom: 20px;">
        <span>Overall Threat Level for <strong>${data.crop}</strong>:</span>
        <span class="badge badge--${data.overall_risk_level.toLowerCase()}" style="font-size: 0.9rem;">${data.overall_risk_level}</span>
      </div>

      ${riskCards}

      <div style="background: #E3F2FD; border-left: 4px solid #1976D2; padding: 12px 16px; border-radius: 4px; font-size: 0.9rem; margin-top: 16px;">
        🛡️ <strong>Crop Insurance:</strong> ${data.insurance_recommendation}
      </div>
    </div>
  `;

  container.querySelector('#btn-risk-listen')?.addEventListener('click', () => {
    speakText(`Overall risk level for ${data.crop} is ${data.overall_risk_level}. Top risk is ${data.risks[0]?.name} with a probability of ${data.risks[0]?.probability} percent.`);
  });

  container.querySelector('#btn-risk-print')?.addEventListener('click', () => {
    window.print();
  });
}
