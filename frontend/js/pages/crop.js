/**
 * CropSense AI – Crop Recommendation Page
 * Matches soil parameters and climate conditions to optimal crops with match scores.
 */

import { api } from '../api.js';
import { speakText } from '../voice.js';
import { initVoiceInputs } from '../voice.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderCrop(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.crop')}</h2>
      <p class="page-header__desc">Enter your soil and weather details to discover the highest-yield crops for your farm.</p>
    </div>

    <!-- Input Form Card -->
    <div class="form-card">
      <h3 class="form-card__title">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#2E7D32"/></svg>
        Soil &amp; Environmental Factors
      </h3>

      <form id="crop-form">
        <div class="form-card__grid">
          <div class="form-group">
            <label class="form-label" for="crop-n">Nitrogen (N) - kg/ha</label>
            <div class="input-with-voice">
              <input type="number" id="crop-n" name="nitrogen" class="form-input" min="0" max="300" value="90" required>
              <button type="button" class="voice-input-btn" data-target="crop-n" title="Voice Input">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="crop-p">Phosphorus (P) - kg/ha</label>
            <div class="input-with-voice">
              <input type="number" id="crop-p" name="phosphorus" class="form-input" min="0" max="300" value="42" required>
              <button type="button" class="voice-input-btn" data-target="crop-p" title="Voice Input">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="crop-k">Potassium (K) - kg/ha</label>
            <div class="input-with-voice">
              <input type="number" id="crop-k" name="potassium" class="form-input" min="0" max="300" value="43" required>
              <button type="button" class="voice-input-btn" data-target="crop-k" title="Voice Input">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="crop-temp">Temperature (°C)</label>
            <input type="number" step="0.1" id="crop-temp" name="temperature" class="form-input" min="0" max="50" value="26.5" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="crop-hum">Humidity (%)</label>
            <input type="number" step="0.1" id="crop-hum" name="humidity" class="form-input" min="0" max="100" value="78" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="crop-ph">Soil pH (0-14)</label>
            <input type="number" step="0.1" id="crop-ph" name="ph" class="form-input" min="0" max="14" value="6.5" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="crop-rain">Rainfall (mm)</label>
            <input type="number" step="0.1" id="crop-rain" name="rainfall" class="form-input" min="0" max="500" value="180" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="crop-state">State / Region</label>
            <select id="crop-state" name="state" class="form-input form-select">
              <option value="Karnataka" selected>Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Punjab">Punjab</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>
        </div>

        <div class="form-card__actions">
          <button type="submit" class="btn btn--primary" id="crop-submit-btn">
            <span>✨ Get AI Recommendations</span>
          </button>
          <button type="reset" class="btn btn--secondary" id="crop-reset-btn">Reset</button>
        </div>
      </form>
    </div>

    <!-- Output Container -->
    <div id="crop-results" class="crop-results-area" style="margin-top: 24px;"></div>
  `;

  initVoiceInputs(container);

  const form = container.querySelector('#crop-form');
  const resultsArea = container.querySelector('#crop-results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Render skeleton
    resultsArea.innerHTML = `
      <div class="result-card">
        <div class="skeleton" style="height: 24px; width: 40%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-card" style="margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-card" style="margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    `;

    const payload = {
      nitrogen: parseFloat(form.nitrogen.value),
      phosphorus: parseFloat(form.phosphorus.value),
      potassium: parseFloat(form.potassium.value),
      temperature: parseFloat(form.temperature.value),
      humidity: parseFloat(form.humidity.value),
      ph: parseFloat(form.ph.value),
      rainfall: parseFloat(form.rainfall.value),
      state: form.state.value,
    };

    const crops = await api.recommendCrop(payload);
    displayCropResults(resultsArea, crops);
  });
}

function displayCropResults(container, crops) {
  if (!crops || crops.length === 0) {
    container.innerHTML = `
      <div class="result-card">
        <p>No matching crops found for the given soil parameters. Please adjust nutrient values.</p>
      </div>
    `;
    return;
  }

  const itemsHtml = crops.map((c, i) => `
    <div class="crop-item">
      <div class="crop-item__rank">#${i + 1}</div>
      <div class="crop-item__info">
        <div class="crop-item__name">${c.name}</div>
        <div class="crop-item__meta">
          Season: <strong>${c.suitable_season}</strong> • Duration: <strong>${c.duration_days} days</strong> • Profit: ${'★'.repeat(c.profit_rating || 3)}
        </div>
        <div class="score-bar">
          <div class="score-bar__fill" style="width: ${c.score}%;"></div>
        </div>
        <p style="font-size: 0.8rem; color: #444; margin-top: 6px;">💡 ${c.tips}</p>
      </div>
      <div class="crop-item__score">${c.score}%</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="result-card">
      <div class="result-card__header">
        <h3 class="result-card__title">Recommended Crops for Your Soil</h3>
        <div class="result-card__actions">
          <button class="btn btn--secondary btn--sm" id="btn-crop-listen">🔊 Listen</button>
          <button class="btn btn--secondary btn--sm" id="btn-crop-print">🖨️ Print</button>
        </div>
      </div>
      <div class="crop-list">
        ${itemsHtml}
      </div>
      <div class="disclaimer">
        ⚠️ <strong>AgriTech Disclaimer:</strong> ${t('common.disclaimer')}
      </div>
    </div>
  `;

  // Bind Listen
  container.querySelector('#btn-crop-listen')?.addEventListener('click', () => {
    const speech = `Your top recommended crop is ${crops[0].name} with a suitability match of ${crops[0].score} percent. ${crops[0].tips}`;
    speakText(speech);
  });

  // Bind Print
  container.querySelector('#btn-crop-print')?.addEventListener('click', () => {
    window.print();
  });
}
