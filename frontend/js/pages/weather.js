/**
 * CropSense AI – Weather Forecast Page
 * Hyperlocal agro-meteorological forecasting with 7-day outlook and spraying advisories.
 */

import { api } from '../api.js';
import { speakText } from '../voice.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function renderWeather(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${t('feature.weather')}</h2>
      <p class="page-header__desc">Hyperlocal temperature, humidity, and rainfall predictions tailored for precision farm scheduling.</p>
    </div>

    <!-- Region Selector -->
    <div class="form-card" style="margin-bottom: 20px;">
      <div class="form-card__grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="weather-state">State</label>
          <select id="weather-state" class="form-input form-select">
            <option value="Karnataka" selected>Karnataka</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="weather-dist">District</label>
          <select id="weather-dist" class="form-input form-select">
            <option value="Bangalore Rural" selected>Bangalore Rural</option>
            <option value="Mandya">Mandya</option>
            <option value="Mysore">Mysore</option>
            <option value="Belgaum">Belgaum</option>
            <option value="Davangere">Davangere</option>
          </select>
        </div>
      </div>
    </div>

    <div id="weather-display"></div>
  `;

  const stateSelect = container.querySelector('#weather-state');
  const distSelect = container.querySelector('#weather-dist');
  const displayArea = container.querySelector('#weather-display');

  const updateWeather = async () => {
    displayArea.innerHTML = `
      <div class="skeleton skeleton-card" style="margin-bottom: 16px;"></div>
      <div class="skeleton skeleton-card"></div>
    `;

    const data = await api.getWeather(stateSelect.value, distSelect.value);
    displayWeatherData(displayArea, data);
  };

  stateSelect.addEventListener('change', updateWeather);
  distSelect.addEventListener('change', updateWeather);

  // Initial load
  updateWeather();
}

function displayWeatherData(container, data) {
  if (!data) return;

  const current = data.current;
  const forecastCards = (data.forecast || []).map((f) => `
    <div class="forecast-card">
      <div class="forecast-card__day">${f.day}</div>
      <div style="font-size: 1.8rem; margin: 4px 0;">
        ${f.condition === 'Sunny' ? '☀️' : f.condition === 'Partly Cloudy' ? '⛅' : '🌧️'}
      </div>
      <div class="forecast-card__temp">${f.temp_high}° / ${f.temp_low}°</div>
      <div style="font-size: 0.75rem; color: #555;">${f.condition}</div>
      <div class="forecast-card__rain">💧 ${f.rainfall_chance}% rain</div>
    </div>
  `).join('');

  container.innerHTML = `
    <!-- Current Weather Hero Card -->
    <div class="weather-current">
      <div>
        <div style="font-size: 0.9rem; color: #666; margin-bottom: 4px;">📍 ${current.location}</div>
        <div class="weather-current__temp">${current.temp}°C</div>
        <div class="weather-current__condition">${current.condition}</div>
      </div>
      <div class="weather-current__details" style="flex: 1; border-left: 2px solid rgba(0,0,0,0.06); padding-left: 24px;">
        <p style="margin-bottom: 6px;">💨 Wind Speed: <strong>${current.wind_speed}</strong></p>
        <p style="margin-bottom: 6px;">💧 Relative Humidity: <strong>${current.humidity}%</strong></p>
        <p style="color: #444; font-size: 0.95rem; line-height: 1.5;">${current.description}</p>
      </div>
      <div>
        <button class="btn btn--secondary btn--sm" id="btn-weather-listen">🔊 Read Advisory</button>
      </div>
    </div>

    <!-- 7-Day Forecast Grid -->
    <h3 style="margin-bottom: 12px; font-size: 1.15rem;">7-Day Agricultural Forecast</h3>
    <div class="forecast-grid" style="margin-bottom: 24px;">
      ${forecastCards}
    </div>

    <!-- Agro-Met Advisory -->
    <div class="result-card" style="background: #E8F5E9; border-left: 4px solid #2E7D32;">
      <h4 style="color: #1B5E20; margin-bottom: 6px;">🌾 Field Operations Advisory:</h4>
      <p style="color: #2E7D32; font-size: 0.95rem; line-height: 1.6;">${data.advisory}</p>
    </div>
  `;

  container.querySelector('#btn-weather-listen')?.addEventListener('click', () => {
    speakText(`Weather for ${current.location}: Current temperature is ${current.temp} degrees celsius, ${current.condition}. Advisory: ${data.advisory}`);
  });
}
