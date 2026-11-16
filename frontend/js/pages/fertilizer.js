/**
 * CropSense AI – Fertilizer Recommendation Page
 * Delivers precise NPK dosage, split application timings, and organic manure advice.
 */

import { api } from '../api.js';
import { speakText } from '../voice.js';
import { initVoiceInputs } from '../voice.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderFertilizer(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.fertilizer')}</h2>
      <p class="page-header__desc">Calculate balanced chemical and organic fertilizer dosages based on soil nutrient deficiencies.</p>
    </div>

    <div class="form-card">
      <h3 class="form-card__title">Soil Test &amp; Crop Information</h3>
      <form id="fertilizer-form">
        <div class="form-card__grid">
          <div class="form-group">
            <label class="form-label" for="fert-crop">Crop</label>
            <select id="fert-crop" name="crop" class="form-input form-select" required>
              <option value="Rice" selected>Rice (Paddy)</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Cotton">Cotton</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Soybean">Soybean</option>
              <option value="Turmeric">Turmeric</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="fert-soil">Soil Type</label>
            <select id="fert-soil" name="soil_type" class="form-input form-select">
              <option value="Loam" selected>Loam</option>
              <option value="Clay">Clay</option>
              <option value="Black">Black Cotton Soil</option>
              <option value="Red">Red Soil</option>
              <option value="Sandy">Sandy Loam</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="fert-n">Current Soil N (kg/ha)</label>
            <div class="input-with-voice">
              <input type="number" id="fert-n" name="nitrogen" class="form-input" min="0" max="300" value="70" required>
              <button type="button" class="voice-input-btn" data-target="fert-n" title="Voice Input">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="fert-p">Current Soil P (kg/ha)</label>
            <div class="input-with-voice">
              <input type="number" id="fert-p" name="phosphorus" class="form-input" min="0" max="300" value="35" required>
              <button type="button" class="voice-input-btn" data-target="fert-p" title="Voice Input">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="fert-k">Current Soil K (kg/ha)</label>
            <div class="input-with-voice">
              <input type="number" id="fert-k" name="potassium" class="form-input" min="0" max="300" value="40" required>
              <button type="button" class="voice-input-btn" data-target="fert-k" title="Voice Input">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="fert-ph">Soil pH</label>
            <input type="number" step="0.1" id="fert-ph" name="ph" class="form-input" min="0" max="14" value="6.8" required>
          </div>
        </div>

        <div class="form-card__actions">
          <button type="submit" class="btn btn--primary">
            <span>🧪 Calculate Fertilizer Dosage</span>
          </button>
          <button type="reset" class="btn btn--secondary">Reset</button>
        </div>
      </form>
    </div>

    <div id="fert-results" style="margin-top: 24px;"></div>
  `;

  initVoiceInputs(container);

  const form = container.querySelector('#fertilizer-form');
  const resultsArea = container.querySelector('#fert-results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    resultsArea.innerHTML = `
      <div class="result-card">
        <div class="skeleton" style="height: 30px; width: 40%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    `;

    const payload = {
      crop: form.crop.value,
      soil_type: form.soil_type.value,
      nitrogen: parseFloat(form.nitrogen.value),
      phosphorus: parseFloat(form.phosphorus.value),
      potassium: parseFloat(form.potassium.value),
      ph: parseFloat(form.ph.value),
    };

    const res = await api.recommendFertilizer(payload);
    displayFertilizerResults(resultsArea, res);
  });
}

function displayFertilizerResults(container, data) {
  if (!data) return;

  const recCards = (data.recommendations || []).map((r) => `
    <div style="background: #F4F8F2; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 600; font-size: 1.05rem; color: #2E7D32;">${r.fertilizer}</span>
        <span style="font-weight: 700; font-size: 1.1rem; color: #1B5E20;">${r.quantity_kg} kg/ha</span>
      </div>
      <p style="font-size: 0.85rem; color: #555; margin-bottom: 4px;"><strong>Timing:</strong> ${r.timing}</p>
      <p style="font-size: 0.85rem; color: #777;"><strong>Application:</strong> ${r.method}</p>
    </div>
  `).join('');

  const scheduleHtml = (data.schedule || []).map((s) => `
    <li style="margin-bottom: 6px;"><strong>${s.stage}:</strong> ${s.details}</li>
  `).join('');

  const warningsHtml = (data.warnings || []).map((w) => `
    <div style="background: #FFF3E0; border-left: 4px solid #F57C00; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; margin-bottom: 6px;">
      ⚠️ ${w}
    </div>
  `).join('');

  container.innerHTML = `
    <div class="result-card">
      <div class="result-card__header">
        <h3 class="result-card__title">Fertilizer Advisory &amp; Schedule</h3>
        <div class="result-card__actions">
          <button class="btn btn--secondary btn--sm" id="btn-fert-listen">🔊 Listen</button>
          <button class="btn btn--secondary btn--sm" id="btn-fert-print">🖨️ Print</button>
        </div>
      </div>

      <h4 style="margin-bottom: 12px;">Required Commercial Fertilizers:</h4>
      ${recCards}

      <div style="background: #E8F5E9; border-radius: 12px; padding: 14px; margin: 16px 0;">
        <h4 style="color: #2E7D32; margin-bottom: 6px;">🌿 Organic Enrichment:</h4>
        <p style="font-size: 0.9rem;"><strong>${data.organic.type}:</strong> ${data.organic.quantity}</p>
      </div>

      <h4 style="margin-bottom: 8px;">Application Timetable:</h4>
      <ul style="padding-left: 20px; line-height: 1.6; color: #444; margin-bottom: 16px;">
        ${scheduleHtml}
      </ul>

      ${warningsHtml ? `<h4 style="margin-bottom: 8px;">Important Agronomic Warnings:</h4>${warningsHtml}` : ''}
    </div>
  `;

  container.querySelector('#btn-fert-listen')?.addEventListener('click', () => {
    const speech = `Fertilizer recommendation for ${data.crop}: Apply ${data.recommendations.map((r) => `${r.quantity_kg} kg of ${r.fertilizer}`).join(', ')}. Plus ${data.organic.quantity} of organic manure.`;
    speakText(speech);
  });

  container.querySelector('#btn-fert-print')?.addEventListener('click', () => {
    window.print();
  });
}
