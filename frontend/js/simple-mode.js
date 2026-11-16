/**
 * CropSense AI – Simple Farmer Mode
 * Extremely simplified wizard UI designed specifically for rural farmers.
 * Features 8 large picture tiles, single-question steps, large touch targets, and voice assistance.
 */

import { speakText, startListening, isSpeechSupported } from './voice.js';
import { api } from './api.js';
import { showToast } from './toast.js';
import { t } from './i18n.js';

export class SimpleFarmerMode {
  constructor(container, { onExit, onOpenChat }) {
    this.container = container;
    this.onExit = onExit;
    this.onOpenChat = onOpenChat;
    this.currentWizard = null;
    this.wizardStep = 0;
    this.wizardData = {};
  }

  show() {
    this.container.style.display = 'flex';
    this.renderHome();
  }

  hide() {
    this.container.style.display = 'none';
    if (this.onExit) this.onExit();
  }

  renderHome() {
    this.container.innerHTML = `
      <div class="simple-mode__header">
        <span style="font-size: 1.25rem; font-weight: 700; color: #2E7D32;">🌱 CropSense AI</span>
        <button class="simple-mode__exit" id="btn-simple-exit">Exit Simple Mode ✕</button>
      </div>

      <div class="simple-mode__body">
        <h2 style="font-size: 1.4rem; margin-bottom: 20px; text-align: center;">What would you like to check today?</h2>

        <div class="simple-tiles">
          <div class="simple-tile" data-action="crop">
            <div class="simple-tile__icon">🌾</div>
            <div class="simple-tile__label">${t('simple.what_to_grow')}</div>
          </div>
          <div class="simple-tile" data-action="water">
            <div class="simple-tile__icon">💧</div>
            <div class="simple-tile__label">${t('simple.water_today')}</div>
          </div>
          <div class="simple-tile" data-action="fertilizer">
            <div class="simple-tile__icon">🧪</div>
            <div class="simple-tile__label">${t('simple.fertilizer')}</div>
          </div>
          <div class="simple-tile" data-action="risk">
            <div class="simple-tile__icon">🛡️</div>
            <div class="simple-tile__label">${t('simple.crop_safety')}</div>
          </div>
          <div class="simple-tile" data-action="harvest">
            <div class="simple-tile__icon">🚜</div>
            <div class="simple-tile__label">${t('simple.harvest')}</div>
          </div>
          <div class="simple-tile" data-action="weather">
            <div class="simple-tile__icon">⛅</div>
            <div class="simple-tile__label">${t('simple.weather')}</div>
          </div>
          <div class="simple-tile" data-action="market">
            <div class="simple-tile__icon">💰</div>
            <div class="simple-tile__label">${t('simple.market')}</div>
          </div>
          <div class="simple-tile" data-action="ai">
            <div class="simple-tile__icon">🤖</div>
            <div class="simple-tile__label">${t('simple.ai_helper')}</div>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-simple-exit')?.addEventListener('click', () => this.hide());

    const tiles = this.container.querySelectorAll('.simple-tile');
    tiles.forEach((t) => {
      t.addEventListener('click', () => {
        const action = t.getAttribute('data-action');
        this.startWizard(action);
      });
    });
  }

  startWizard(action) {
    this.currentWizard = action;
    this.wizardStep = 0;
    this.wizardData = {};

    if (action === 'ai') {
      this.hide();
      if (this.onOpenChat) this.onOpenChat();
      return;
    }

    if (action === 'weather') {
      this.renderWeatherQuick();
      return;
    }

    if (action === 'crop') {
      this.renderCropWizard();
    } else if (action === 'water') {
      this.renderWaterWizard();
    } else if (action === 'fertilizer') {
      this.renderFertilizerWizard();
    } else if (action === 'risk') {
      this.renderRiskWizard();
    } else if (action === 'harvest') {
      this.renderHarvestWizard();
    } else if (action === 'market') {
      this.renderMarketWizard();
    }
  }

  // 1. Crop Recommendation Wizard
  renderCropWizard() {
    const questions = [
      {
        question: 'What type of soil do you have in your field?',
        options: ['Red Soil', 'Black Soil', 'Loamy / Garden Soil', 'Sandy Soil'],
        key: 'soil',
      },
      {
        question: 'What is the current season?',
        options: ['Monsoon (Kharif)', 'Winter (Rabi)', 'Summer (Zaid)'],
        key: 'season',
      },
      {
        question: 'How is your water availability?',
        options: ['Abundant Water / Canal', 'Borewell / Medium', 'Rainfed / Low Water'],
        key: 'water',
      },
    ];

    this.runQuestionSequence(questions, async (answers) => {
      // Convert farmer answers to agronomic values
      const soilMap = { 'Red Soil': 6.5, 'Black Soil': 7.5, 'Loamy / Garden Soil': 6.8, 'Sandy Soil': 6.0 };
      const rainMap = { 'Abundant Water / Canal': 220, 'Borewell / Medium': 120, 'Rainfed / Low Water': 50 };

      const crops = await api.recommendCrop({
        nitrogen: 85,
        phosphorus: 45,
        potassium: 45,
        temperature: 27,
        humidity: 70,
        ph: soilMap[answers.soil] || 6.5,
        rainfall: rainMap[answers.water] || 120,
      });

      const topCrop = crops[0] || { name: 'Rice', score: 92, tips: 'Ideal for your water and soil profile.' };
      this.renderSimpleResult(
        '🌾 Best Crop To Grow',
        topCrop.name,
        `Based on your ${answers.soil} and ${answers.water}, we strongly recommend planting ${topCrop.name} this season! It offers high yield potential and strong market demand.`,
        topCrop.tips
      );
    });
  }

  // 2. Water Wizard
  renderWaterWizard() {
    const questions = [
      {
        question: 'What crop are you currently growing?',
        options: ['Rice / Paddy', 'Wheat', 'Maize', 'Cotton', 'Vegetables'],
        key: 'crop',
      },
      {
        question: 'When did you last irrigate your field?',
        options: ['Today / Yesterday', '2 - 3 Days Ago', '4 - 6 Days Ago', 'More than a week ago'],
        key: 'last_water',
      },
    ];

    this.runQuestionSequence(questions, (answers) => {
      let advice = '';
      if (answers.last_water === 'Today / Yesterday') {
        advice = 'No irrigation needed today! Soil retains adequate root moisture.';
      } else if (answers.last_water === '2 - 3 Days Ago') {
        advice = answers.crop === 'Rice / Paddy'
          ? 'Check field water depth. If hairline cracks appear, give a light watering.'
          : 'Soil moisture is optimal. Next watering scheduled in 2 days.';
      } else {
        advice = '💧 Water your crop today! Plants are approaching moisture stress.';
      }

      this.renderSimpleResult(
        '💧 Water Decision Today',
        answers.last_water === 'Today / Yesterday' ? 'DO NOT WATER' : 'WATER TODAY',
        advice,
        'Always irrigate during the morning or late afternoon to save water.'
      );
    });
  }

  // 3. Fertilizer Wizard
  renderFertilizerWizard() {
    const questions = [
      {
        question: 'Which crop are you fertilizing?',
        options: ['Rice (Paddy)', 'Wheat', 'Cotton', 'Maize'],
        key: 'crop',
      },
      {
        question: 'What is the current growth stage?',
        options: ['Just Sowing / Initial', 'Vegetative / Growing', 'Flowering / Panicle'],
        key: 'stage',
      },
    ];

    this.runQuestionSequence(questions, (answers) => {
      let rec = '';
      if (answers.stage === 'Just Sowing / Initial') {
        rec = 'Apply 50 kg DAP and 25 kg Potash per acre directly into the soil at sowing.';
      } else if (answers.stage === 'Vegetative / Growing') {
        rec = 'Top dress 25 kg Urea per acre followed by a light watering.';
      } else {
        rec = 'Apply 20 kg Urea and 15 kg Potash per acre to support robust grain filling.';
      }

      this.renderSimpleResult(
        '🧪 Fertilizer Guide',
        `${answers.crop} (${answers.stage})`,
        rec,
        'Do not apply chemical fertilizers during heavy rain or cloudy days.'
      );
    });
  }

  // 4. Crop Safety Wizard
  renderRiskWizard() {
    const questions = [
      {
        question: 'What symptom do you observe on your crop?',
        options: ['Yellowing or drying leaves', 'Insects / Caterpillars visible', 'Spots on stems or leaves', 'Healthy crop / Prevention'],
        key: 'symptom',
      },
    ];

    this.runQuestionSequence(questions, (answers) => {
      let advice = '';
      if (answers.symptom === 'Insects / Caterpillars visible') {
        advice = 'Spray 5% Neem Seed Kernel Extract (NSKE) or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.';
      } else if (answers.symptom === 'Spots on stems or leaves') {
        advice = 'Fungal leaf spot detected. Spray Mancozeb @ 2 g/L and ensure proper water drainage.';
      } else if (answers.symptom === 'Yellowing or drying leaves') {
        advice = 'Likely Nitrogen deficiency or root waterlogging. Verify soil drainage and apply light urea top dressing.';
      } else {
        advice = 'Your crop is protected! Maintain periodic inspections every 3-4 days.';
      }

      this.renderSimpleResult(
        '🛡️ Crop Protection',
        'Treatment Advice',
        advice,
        'Always wear gloves and a protective mask when applying crop sprays.'
      );
    });
  }

  // 5. Harvest Wizard
  renderHarvestWizard() {
    const questions = [
      {
        question: 'What crop are you harvesting?',
        options: ['Rice (Paddy)', 'Wheat', 'Cotton', 'Maize'],
        key: 'crop',
      },
      {
        question: 'How many acres of land?',
        options: ['1 Acre', '2 Acres', '5 Acres', '10 Acres'],
        key: 'acres',
      },
    ];

    this.runQuestionSequence(questions, (answers) => {
      const acres = parseInt(answers.acres, 10) || 1;
      const expectedBags = acres * 25; // standard bag yield
      this.renderSimpleResult(
        '🚜 Harvest Output Estimation',
        `Approx. ${expectedBags} Bags (${expectedBags * 75} kg)`,
        `For ${answers.acres} of ${answers.crop}, expected harvest is around ${expectedBags} bags under standard care.`,
        'Harvest when grains become hard and straw turns golden.'
      );
    });
  }

  // 6. Market Wizard
  renderMarketWizard() {
    const questions = [
      {
        question: 'Which commodity do you want to sell?',
        options: ['Rice', 'Wheat', 'Cotton', 'Maize', 'Tomato', 'Onion'],
        key: 'commodity',
      },
    ];

    this.runQuestionSequence(questions, async (answers) => {
      const prices = await api.getMarketPrices(answers.commodity);
      const top = prices[0] || { modal_price: 2400, market: 'Bangalore APMC' };

      this.renderSimpleResult(
        '💰 Mandi Rate Today',
        `₹${top.modal_price.toLocaleString()} / Quintal`,
        `Current APMC rate at ${top.market} for ${answers.commodity} is ₹${top.modal_price}. Market trend is steady.`,
        'Compare 2 nearby APMC yards before selling your produce.'
      );
    });
  }

  // Quick Weather view
  async renderWeatherQuick() {
    const data = await api.getWeather();
    this.renderSimpleResult(
      '⛅ Today\'s Weather',
      `${data.current.temp}°C – ${data.current.condition}`,
      data.advisory,
      `Humidity: ${data.current.humidity}% • Wind: ${data.current.wind_speed}`
    );
  }

  // Question Runner
  runQuestionSequence(questions, onComplete) {
    const renderCurrentStep = () => {
      const q = questions[this.wizardStep];
      const dotsHtml = questions
        .map((_, i) => `<div class="simple-progress__dot ${i === this.wizardStep ? 'is-active' : i < this.wizardStep ? 'is-done' : ''}"></div>`)
        .join('');

      const optionsHtml = q.options
        .map((opt) => `<button class="simple-option" data-val="${opt}">${opt}</button>`)
        .join('');

      this.container.innerHTML = `
        <div class="simple-mode__header">
          <button class="simple-mode__back" id="btn-wizard-back">← Back</button>
          <button class="simple-mode__exit" id="btn-wizard-exit">Home</button>
        </div>

        <div class="simple-mode__body">
          <div class="simple-progress">${dotsHtml}</div>
          <div class="simple-question">
            <h3 class="simple-question__text">${q.question}</h3>
            <div class="simple-question__options">
              ${optionsHtml}
            </div>
          </div>
        </div>
      `;

      // Speak question
      speakText(q.question);

      this.container.querySelector('#btn-wizard-exit')?.addEventListener('click', () => this.renderHome());
      this.container.querySelector('#btn-wizard-back')?.addEventListener('click', () => {
        if (this.wizardStep > 0) {
          this.wizardStep--;
          renderCurrentStep();
        } else {
          this.renderHome();
        }
      });

      const optionBtns = this.container.querySelectorAll('.simple-option');
      optionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-val');
          this.wizardData[q.key] = val;
          this.wizardStep++;

          if (this.wizardStep < questions.length) {
            renderCurrentStep();
          } else {
            onComplete(this.wizardData);
          }
        });
      });
    };

    renderCurrentStep();
  }

  // Result display
  renderSimpleResult(header, title, text, tip) {
    this.container.innerHTML = `
      <div class="simple-mode__header">
        <button class="simple-mode__back" id="btn-result-back">← New Check</button>
        <button class="simple-mode__exit" id="btn-result-home">Home</button>
      </div>

      <div class="simple-mode__body">
        <div class="simple-result">
          <div class="simple-result__icon">✅</div>
          <h4 style="color: #666; font-size: 0.95rem; text-transform: uppercase; margin-bottom: 8px;">${header}</h4>
          <h2 class="simple-result__title">${title}</h2>
          <p class="simple-result__text">${text}</p>
          <div style="background: #FFF8E1; padding: 12px; border-radius: 10px; font-size: 0.9rem; margin-bottom: 24px; color: #555;">
            💡 <strong>Farmer Tip:</strong> ${tip}
          </div>

          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn--primary btn--lg" id="btn-result-speak">🔊 Read Out</button>
            <button class="btn btn--secondary btn--lg" id="btn-result-done">Done</button>
          </div>
        </div>
      </div>
    `;

    speakText(`${header}: ${title}. ${text}`);

    this.container.querySelector('#btn-result-speak')?.addEventListener('click', () => {
      speakText(`${header}: ${title}. ${text}`);
    });

    this.container.querySelector('#btn-result-done')?.addEventListener('click', () => this.renderHome());
    this.container.querySelector('#btn-result-home')?.addEventListener('click', () => this.renderHome());
    this.container.querySelector('#btn-result-back')?.addEventListener('click', () => this.startWizard(this.currentWizard));
  }
}
