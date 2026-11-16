/**
 * CropSense AI – API Client
 * Communicates with FastAPI backend with automatic graceful offline fallback.
 */

import * as fallback from './fallback-engines.js';
import { showToast } from './toast.js';

const BASE_URL = window.location.origin;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Backend call failed for ${endpoint}:`, err.message, 'Using browser fallback engine.');
    return null;
  }
}

export const api = {
  // Auth
  async login(mobile, pin) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, pin }),
    });
    if (res) return res;

    // Fallback: local storage authentication
    const users = JSON.parse(localStorage.getItem('cropsense_users') || '{}');
    if (users[mobile] && users[mobile].pin === pin) {
      return {
        success: true,
        message: 'Logged in (offline mode)',
        user: users[mobile],
        token: btoa(`${mobile}:${Date.now()}`),
      };
    }
    // Demo account fallback: 9876543210 / 1234
    if (mobile === '9876543210' && pin === '1234') {
      return {
        success: true,
        message: 'Logged in as Demo Farmer',
        user: { name: 'Ramesh Patel', village: 'Mandya', mobile: '9876543210', language: 'en' },
        token: btoa(`9876543210:${Date.now()}`),
      };
    }
    return { success: false, message: 'Invalid Mobile Number or PIN (Offline)' };
  },

  async register(data) {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res) return res;

    // Fallback registration in local storage
    const users = JSON.parse(localStorage.getItem('cropsense_users') || '{}');
    if (users[data.mobile]) {
      return { success: false, message: 'Mobile number already registered.' };
    }
    users[data.mobile] = data;
    localStorage.setItem('cropsense_users', JSON.stringify(users));
    return {
      success: true,
      message: 'Account created successfully (offline mode)',
      user: data,
    };
  },

  // Crop recommendation
  async recommendCrop(data) {
    const res = await request('/api/crop/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.crops) return res.crops;
    return fallback.fallbackRecommendCrops(data);
  },

  // Yield prediction
  async predictYield(data) {
    const res = await request('/api/yield/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.prediction) return res.prediction;
    return fallback.fallbackPredictYield(data);
  },

  // Irrigation schedule
  async scheduleIrrigation(data) {
    const res = await request('/api/irrigation/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.schedule) return res.schedule;
    return fallback.fallbackScheduleIrrigation(data);
  },

  // Fertilizer recommendations
  async recommendFertilizer(data) {
    const res = await request('/api/fertilizer/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.recommendation) return res.recommendation;
    return fallback.fallbackRecommendFertilizer(data);
  },

  // Crop risk predictions
  async predictRisk(data) {
    const res = await request('/api/risk/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.result) return res.result;
    return fallback.fallbackPredictRisk(data);
  },

  // Weather
  async getWeather(state, district) {
    // Engine generates realistic forecast
    return fallback.fallbackGetWeather(state, district);
  },

  // Market prices
  async getMarketPrices(commodity, state, district, market) {
    const params = new URLSearchParams({
      commodity: commodity || '',
      state: state || '',
      district: district || '',
      market: market || '',
    });
    const res = await request(`/api/market/prices?${params.toString()}`);
    if (res && res.prices) return res.prices;
    return fallback.fallbackGetMarketPrices(commodity, state);
  },

  async getMarketCatalog() {
    const res = await request('/api/market/catalog');
    if (res && res.commodities) return res;
    return {
      commodities: ['Rice', 'Wheat', 'Maize', 'Cotton', 'Groundnut', 'Turmeric', 'Tomato', 'Onion'],
      states: ['Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Maharashtra'],
      districts: {
        Karnataka: ['Bangalore', 'Belgaum', 'Davangere', 'Dharwad', 'Mandya', 'Mysore'],
        'Andhra Pradesh': ['Anantapur', 'Chittoor', 'Guntur', 'Kurnool'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Erode', 'Salem', 'Thanjavur'],
      },
      markets: {
        Bangalore: ['Bangalore APMC'],
        Davangere: ['Davangere APMC'],
        Guntur: ['Guntur APMC'],
        Erode: ['Erode APMC'],
      },
    };
  },

  // AI Assistant Chat
  async chatAssistant(message, language = 'en') {
    const res = await request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    });
    if (res && res.reply) return res;

    // Fallback NLP reply
    return {
      success: true,
      reply: `[Offline Advisory] Based on your query regarding "${message}": please inspect your crop's root moisture and foliar health. For detailed nitrogen, phosphorus, and potassium diagnostics, check the Crop Advisory and Fertilizer sections.`,
      suggestions: ['Crop recommendation', 'Weather forecast', 'Market prices'],
    };
  },

  // Contact form
  async submitContact(data) {
    const res = await request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.success) return res;

    // Fallback store in local storage
    const messages = JSON.parse(localStorage.getItem('cropsense_contacts') || '[]');
    messages.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('cropsense_contacts', JSON.stringify(messages));
    return {
      success: true,
      message: 'Thank you! Your message has been received (saved locally).',
    };
  },
};
