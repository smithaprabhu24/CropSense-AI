/**
 * CropSense AI – Client-Side Fallback Engines
 * Ensures full standalone offline functionality when the backend is unreachable.
 * Implements identical agronomic rules and prediction heuristics in JavaScript.
 */

export const CROPS_DATA = [
  { name: "Rice", n: [60, 120], p: [20, 60], k: [20, 60], temp: [22, 35], hum: [60, 90], ph: [5.5, 7.0], rain: [150, 300], season: "Kharif", days: 120, profit: 3, tips: "Ensure proper water management with alternate wetting and drying to save water." },
  { name: "Wheat", n: [80, 140], p: [30, 70], k: [20, 50], temp: [15, 25], hum: [40, 70], ph: [6.0, 7.5], rain: [50, 120], season: "Rabi", days: 130, profit: 3, tips: "Apply first irrigation at crown root initiation stage (21 days after sowing)." },
  { name: "Maize", n: [60, 120], p: [30, 60], k: [20, 50], temp: [20, 32], hum: [50, 80], ph: [5.5, 7.5], rain: [60, 150], season: "Kharif", days: 100, profit: 3, tips: "Use raised-bed planting for better drainage and higher yields." },
  { name: "Cotton", n: [80, 140], p: [30, 60], k: [20, 50], temp: [25, 38], hum: [40, 70], ph: [6.0, 8.0], rain: [50, 120], season: "Kharif", days: 165, profit: 4, tips: "Space plants 60-90cm apart for optimal boll development." },
  { name: "Sugarcane", n: [100, 200], p: [40, 80], k: [40, 80], temp: [25, 38], hum: [60, 85], ph: [5.5, 7.5], rain: [100, 250], season: "Kharif", days: 300, profit: 4, tips: "Use sett treatment with fungicide before planting to prevent diseases." },
  { name: "Jowar (Sorghum)", n: [40, 80], p: [20, 50], k: [15, 40], temp: [25, 38], hum: [30, 65], ph: [5.5, 8.0], rain: [40, 100], season: "Kharif", days: 110, profit: 2, tips: "Ideal dryland crop — minimal irrigation needed after establishment." },
  { name: "Bajra (Pearl Millet)", n: [30, 70], p: [15, 40], k: [15, 35], temp: [25, 40], hum: [25, 60], ph: [5.5, 8.0], rain: [25, 80], season: "Kharif", days: 90, profit: 2, tips: "Performs well in sandy soils with low rainfall conditions." },
  { name: "Ragi (Finger Millet)", n: [30, 60], p: [15, 35], k: [15, 35], temp: [20, 32], hum: [50, 80], ph: [5.0, 7.5], rain: [60, 120], season: "Kharif", days: 115, profit: 2, tips: "Rich in calcium — excellent for intercropping with pulses." },
  { name: "Groundnut", n: [10, 40], p: [30, 60], k: [20, 50], temp: [24, 35], hum: [50, 75], ph: [5.5, 7.0], rain: [50, 130], season: "Kharif", days: 120, profit: 4, tips: "Inoculate seeds with Rhizobium for better nitrogen fixation." },
  { name: "Soybean", n: [10, 40], p: [30, 70], k: [20, 50], temp: [22, 32], hum: [50, 80], ph: [6.0, 7.5], rain: [60, 150], season: "Kharif", days: 100, profit: 3, tips: "Avoid waterlogging — ensure proper field drainage." },
  { name: "Sunflower", n: [40, 80], p: [30, 60], k: [20, 40], temp: [20, 30], hum: [40, 70], ph: [6.0, 7.5], rain: [50, 100], season: "Rabi", days: 95, profit: 3, tips: "Face rows north-south for maximum sunlight interception." },
  { name: "Tur (Pigeon Pea)", n: [10, 30], p: [30, 60], k: [10, 30], temp: [25, 35], hum: [40, 70], ph: [5.5, 7.5], rain: [60, 150], season: "Kharif", days: 160, profit: 4, tips: "Excellent green manure crop — fixes atmospheric nitrogen." },
  { name: "Moong (Green Gram)", n: [10, 25], p: [20, 50], k: [10, 30], temp: [25, 35], hum: [50, 80], ph: [6.0, 7.5], rain: [40, 100], season: "Kharif", days: 65, profit: 3, tips: "Short-duration crop ideal for summer season as a catch crop." },
  { name: "Urad (Black Gram)", n: [10, 25], p: [20, 50], k: [10, 30], temp: [25, 35], hum: [50, 85], ph: [6.0, 7.5], rain: [60, 120], season: "Kharif", days: 75, profit: 3, tips: "Apply phosphorus at sowing for better root nodulation." },
  { name: "Chana (Chickpea)", n: [10, 30], p: [30, 60], k: [10, 30], temp: [15, 28], hum: [30, 60], ph: [6.0, 8.0], rain: [30, 80], season: "Rabi", days: 110, profit: 4, tips: "Avoid excessive nitrogen — it reduces nodulation." },
  { name: "Mustard", n: [40, 80], p: [20, 50], k: [10, 30], temp: [15, 25], hum: [30, 60], ph: [5.5, 7.5], rain: [30, 80], season: "Rabi", days: 120, profit: 3, tips: "Apply sulphur @ 20 kg/ha for better oil content." },
  { name: "Sesame", n: [20, 50], p: [15, 40], k: [10, 30], temp: [25, 38], hum: [40, 70], ph: [5.5, 7.5], rain: [30, 80], season: "Kharif", days: 90, profit: 3, tips: "Drought-tolerant crop suitable for rainfed conditions." },
  { name: "Coconut", n: [50, 120], p: [20, 60], k: [80, 180], temp: [25, 35], hum: [60, 90], ph: [5.5, 7.0], rain: [150, 300], season: "Perennial", days: 365, profit: 5, tips: "Maintain basin around tree for effective irrigation and manuring." },
  { name: "Arecanut", n: [60, 120], p: [20, 50], k: [60, 140], temp: [24, 34], hum: [60, 90], ph: [5.0, 6.5], rain: [150, 300], season: "Perennial", days: 365, profit: 5, tips: "Provide partial shade during early growth phase." },
  { name: "Turmeric", n: [60, 120], p: [20, 50], k: [80, 150], temp: [25, 35], hum: [60, 85], ph: [5.5, 7.0], rain: [100, 250], season: "Kharif", days: 240, profit: 4, tips: "Mulch beds with green leaves to conserve moisture and suppress weeds." }
];

function scoreRange(val, low, high) {
  if (val >= low && val <= high) return 1.0;
  const mid = (low + high) / 2;
  const span = (high - low) / 2;
  const dist = Math.abs(val - mid) - span;
  return Math.max(0.0, 1.0 - (dist / (span + 1)));
}

export function fallbackRecommendCrops(req) {
  const n = parseFloat(req.nitrogen) || 50;
  const p = parseFloat(req.phosphorus) || 50;
  const k = parseFloat(req.potassium) || 50;
  const temp = parseFloat(req.temperature) || 26;
  const hum = parseFloat(req.humidity) || 65;
  const ph = parseFloat(req.ph) || 6.5;
  const rain = parseFloat(req.rainfall) || 100;

  const results = CROPS_DATA.map((crop) => {
    const nScore = scoreRange(n, crop.n[0], crop.n[1]);
    const pScore = scoreRange(p, crop.p[0], crop.p[1]);
    const kScore = scoreRange(k, crop.k[0], crop.k[1]);
    const tScore = scoreRange(temp, crop.temp[0], crop.temp[1]);
    const hScore = scoreRange(hum, crop.hum[0], crop.hum[1]);
    const phScore = scoreRange(ph, crop.ph[0], crop.ph[1]);
    const rScore = scoreRange(rain, crop.rain[0], crop.rain[1]);

    const total =
      ((nScore + pScore + kScore) * 0.25) / 3 +
      tScore * 0.2 +
      hScore * 0.15 +
      phScore * 0.2 +
      rScore * 0.2;

    return {
      name: crop.name,
      score: Math.round(total * 1000) / 10,
      suitable_season: crop.season,
      duration_days: crop.days,
      profit_rating: crop.profit,
      tips: crop.tips,
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

export function fallbackPredictYield(req) {
  const crop = req.crop || 'Rice';
  const area = parseFloat(req.area) || 1.0;
  const season = req.season || 'Kharif';
  const soil = req.soil_type || 'Loam';

  const baseTable = {
    Rice: 3.5, Wheat: 3.8, Maize: 3.2, Cotton: 2.0, Sugarcane: 65.0,
    Groundnut: 1.8, Soybean: 2.0, Turmeric: 6.0, Ragi: 2.2, Coconut: 12.0
  };

  const soilMult = { Clay: 0.95, Loam: 1.1, Sandy: 0.8, Black: 1.05, Red: 0.95 };
  const baseYield = baseTable[crop] || 2.5;
  const mult = soilMult[soil] || 1.0;

  const estimated = Math.round(baseYield * area * mult * (0.95 + Math.random() * 0.1) * 100) / 100;
  const confidence = Math.round(78 + Math.random() * 12);

  return {
    crop,
    area,
    season,
    estimated_yield: estimated,
    unit: 'tonnes',
    confidence,
    factors: [
      `Soil suitability: ${soil} provides ${mult >= 1.0 ? 'optimal' : 'moderate'} root support.`,
      `Seasonal alignment: Good match for ${season} growth cycle.`,
      `Climate conditions: Assumed average seasonal rainfall and solar radiation.`,
    ],
    recommendations: [
      'Maintain balanced NPK top dressing at 30 and 60 days after sowing.',
      'Adopt micro-irrigation to conserve soil moisture and prevent leaching.',
      'Apply neem oil spray as a preventive measure against sucking pests.',
      'Harvest when 80-85% of panicles or grains turn golden yellow.',
    ],
  };
}

export function fallbackScheduleIrrigation(req) {
  const crop = req.crop || 'Rice';
  const area = parseFloat(req.area) || 1.0;
  const soil = req.soil_type || 'Loam';
  const method = req.irrigation_method || 'drip';

  const waterRates = { Rice: 12000, Wheat: 5000, Maize: 5500, Cotton: 7000, Sugarcane: 15000, Groundnut: 4500 };
  const baseLiters = (waterRates[crop] || 6000) * area * 10;
  const methodEff = { drip: 0.9, sprinkler: 0.75, flood: 0.5, furrow: 0.6 };
  const eff = methodEff[method] || 0.8;
  const adjustedWater = Math.round(baseLiters / eff);

  return {
    crop,
    soil_type: soil,
    area,
    method,
    water_needed_liters: adjustedWater,
    frequency_days: method === 'drip' ? 2 : 5,
    duration_hours: method === 'drip' ? 2.5 : 4.0,
    schedule: [
      { week: 'Week 1-2 (Vegetative)', action: 'Frequent shallow watering for root establishment', amount: `${Math.round(adjustedWater * 0.2)} Liters` },
      { week: 'Week 3-6 (Growth)', action: 'Regular irrigation matching crop transpiration', amount: `${Math.round(adjustedWater * 0.35)} Liters` },
      { week: 'Week 7-10 (Flowering)', action: 'Critical watering stage — avoid any moisture stress', amount: `${Math.round(adjustedWater * 0.35)} Liters` },
      { week: 'Week 11-12 (Maturity)', action: 'Taper off watering to allow uniform grain drying', amount: `${Math.round(adjustedWater * 0.1)} Liters` },
    ],
    tips: [
      'Water during early mornings or evenings to minimize evaporative loss.',
      'Mulch soil using crop residues to retain ground moisture.',
      'Use tensiometers or soil feel tests before every irrigation cycle.',
    ],
  };
}

export function fallbackRecommendFertilizer(req) {
  const crop = req.crop || 'Rice';
  const soil = req.soil_type || 'Loam';
  const n = parseFloat(req.nitrogen) || 60;
  const p = parseFloat(req.phosphorus) || 40;
  const k = parseFloat(req.potassium) || 40;

  const urea = Math.max(0, Math.round((120 - n) * 2.17));
  const dap = Math.max(0, Math.round((60 - p) * 2.17));
  const mop = Math.max(0, Math.round((60 - k) * 1.67));

  return {
    crop,
    soil_type: soil,
    recommendations: [
      { fertilizer: 'Urea (46% N)', quantity_kg: urea || 45, timing: 'Split: 50% Basal, 25% Tillering, 25% Panicle', method: 'Soil broadcast followed by light irrigation' },
      { fertilizer: 'DAP (18% N, 46% P)', quantity_kg: dap || 35, timing: '100% Basal at sowing time', method: 'Deep placement near root zone' },
      { fertilizer: 'MOP (Muriate of Potash, 60% K)', quantity_kg: mop || 25, timing: '50% Basal, 50% Flowering stage', method: 'Broadcast and incorporation' },
    ],
    organic: {
      type: 'Farm Yard Manure (FYM) or Vermicompost',
      quantity: '5 - 8 tonnes per hectare applied 2-3 weeks before sowing',
    },
    schedule: [
      { stage: 'Basal (At Sowing)', details: 'Full DAP, 50% Urea, 50% Potash incorporated into topsoil' },
      { stage: 'Vegetative Growth (30 DAS)', details: '25% Urea top dressed' },
      { stage: 'Panicle / Bloom (55 DAS)', details: 'Remaining 25% Urea + 50% Potash' },
    ],
    tips: [
      'Never apply nitrogenous fertilizer to waterlogged fields.',
      'Mix zinc sulphate @ 25 kg/ha if deficiency symptoms appear.',
      'Incorporate organic manure to enhance micronutrient retention.',
    ],
    warnings: [
      'Do not mix DAP directly with lime or alkaline fertilizers.',
      'Avoid high doses of nitrogen during cloudy weather to prevent blast disease.',
    ],
  };
}

export function fallbackPredictRisk(req) {
  const crop = req.crop || 'Rice';
  const state = req.state || 'Karnataka';

  return {
    crop,
    overall_risk_level: 'Medium',
    insurance_recommendation: 'Recommended under Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    risks: [
      {
        type: 'pest',
        name: `${crop} Stem Borer & Leaf Folder`,
        severity: 'medium',
        probability: 45,
        description: 'Larvae bore into central shoots causing dead hearts and white heads.',
        mitigation: ['Install pheromone traps @ 12/ha', 'Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L'],
        preventive_measures: ['Clip seedling tips before transplanting', 'Avoid excessive urea application'],
      },
      {
        type: 'disease',
        name: 'Bacterial Leaf Blight & Sheath Rot',
        severity: 'low',
        probability: 25,
        description: 'Water-soaked lesions on leaf margins turning grayish white.',
        mitigation: ['Spray Copper Oxychloride 50 WP @ 2.5 g/L', 'Drain stagnant water from the field'],
        preventive_measures: ['Use certified disease-free seeds', 'Apply balanced potash doses'],
      },
      {
        type: 'weather',
        name: 'Dry Spell / Untimely Rainfall',
        severity: 'medium',
        probability: 35,
        description: 'Possible erratic rainfall pattern during panicle initiation.',
        mitigation: ['Ensure field drainage channels are clear', 'Prepare rainwater harvesting basins'],
        preventive_measures: ['Follow district agro-meteorological advisories'],
      },
    ],
  };
}

export function fallbackGetWeather(state = 'Karnataka', district = 'Bangalore') {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const forecast = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    forecast.push({
      date: d.toISOString().split('T')[0],
      day: days[d.getDay()],
      temp_high: 28 + (i % 3),
      temp_low: 19 + (i % 2),
      humidity: 62 + (i * 2) % 15,
      rainfall_chance: (i % 2 === 0 ? 10 : 35),
      condition: i % 3 === 0 ? 'Sunny' : i % 3 === 1 ? 'Partly Cloudy' : 'Light Rain',
    });
  }

  return {
    current: {
      location: `${district}, ${state}`,
      temp: 27,
      humidity: 65,
      wind_speed: '12 km/h',
      condition: 'Partly Cloudy',
      description: 'Pleasant farming conditions. Good humidity for vegetative crop growth.',
    },
    forecast,
    advisory: 'Suitable conditions for foliar nutrient sprays and irrigation over the next 48 hours. Light rains expected later in the week.',
  };
}

export function fallbackGetMarketPrices(commodity = 'Rice', state = 'Karnataka') {
  const catalog = [
    { commodity: 'Rice', market: 'Bangalore APMC', modal_price: 2400, min_price: 2200, max_price: 2650, trend: 'up' },
    { commodity: 'Wheat', market: 'Hubli APMC', modal_price: 2350, min_price: 2150, max_price: 2500, trend: 'stable' },
    { commodity: 'Maize', market: 'Davangere APMC', modal_price: 1850, min_price: 1700, max_price: 1980, trend: 'up' },
    { commodity: 'Cotton', market: 'Guntur APMC', modal_price: 6800, min_price: 6200, max_price: 7400, trend: 'down' },
    { commodity: 'Groundnut', market: 'Anantapur APMC', modal_price: 5400, min_price: 4900, max_price: 5800, trend: 'up' },
    { commodity: 'Turmeric', market: 'Erode APMC', modal_price: 9200, min_price: 8400, max_price: 10500, trend: 'up' },
    { commodity: 'Tomato', market: 'Kolar APMC', modal_price: 1600, min_price: 1100, max_price: 2200, trend: 'down' },
    { commodity: 'Onion', market: 'Nashik APMC', modal_price: 2100, min_price: 1600, max_price: 2700, trend: 'stable' },
  ];

  const filtered = catalog.filter((c) =>
    commodity ? c.commodity.toLowerCase() === commodity.toLowerCase() : true
  );

  return filtered.length > 0 ? filtered : catalog;
}
