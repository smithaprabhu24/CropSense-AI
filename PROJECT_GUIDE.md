# 📖 CropSense AI – Technical Project Guide

This guide provides an in-depth breakdown of the architecture, subsystems, extensibility points, and operational details of CropSense AI.

---

## 1. Architecture Overview

CropSense AI operates on a **modular client-server model** designed to function seamlessly in connectivity-constrained rural environments.

```
┌────────────────────────────────────────────────────────┐
│                   Browser Client (PWA)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │
│  │ Public Landing │  │ Farmer Portal  │  │Simple Mode│ │
│  └───────┬────────┘  └───────┬────────┘  └─────┬─────┘ │
│          │                   │                 │       │
│          └─────────────┬─────┴─────────────────┘       │
│                        │                               │
│           ┌────────────▼────────────┐                  │
│           │       API Client        │                  │
│           └────┬───────────────┬────┘                  │
│                │ Online        │ Offline/Fallback      │
└────────────────┼───────────────┼───────────────────────┘
                 │               │
                 ▼               ▼
      ┌────────────────────┐   ┌─────────────────────────┐
      │  FastAPI Backend   │   │ Browser Fallback Engine │
      │  - REST Endpoints  │   │ - Client JS Engines     │
      │  - PBKDF2 Auth     │   │ - LocalStorage DB       │
      │  - Rule Engines    │   │ - Service Worker Cache  │
      │  - JSON Database   │   └─────────────────────────┘
      └────────────────────┘
```

---

## 2. Progressive Web App (PWA) Implementation

### 2.1 Manifest Configuration
`frontend/manifest.json` specifies `display: standalone` and `orientation: portrait`, allowing the web application to run without browser address bars, looking and behaving like a native mobile app.

### 2.2 Service Worker Strategy (`service-worker.js`)
- **Static Assets:** Cache-first strategy. HTML, CSS, JavaScript modules, fonts, and SVG icons are precached on service worker installation.
- **API Network Calls:** Network-first strategy with seamless fallback to client-side heuristic engines.
- **Offline Fallback:** If network requests fail, the application continues to operate without error modals or broken views.

---

## 3. Multilingual System (5 Languages)

CropSense AI supports five languages:
- English (`en`)
- Kannada (`kn` – ಕನ್ನಡ)
- Telugu (`te` – తెలుగు)
- Hindi (`hi` – हिन्दी)
- Tamil (`ta` – தமிழ்)

### 3.1 Translation Workflow
1. All translations originate in `translations/translations.txt` formatted as:
   ```
   key|en|kn|te|hi|ta
   ```
2. The Python compiler tool (`tools/translation_generator.py`) verifies:
   - **No empty fields:** Ensures all five languages have values.
   - **Script verification:** Uses Unicode code-point boundaries to ensure Kannada (`0x0C80–0x0CFF`), Telugu (`0x0C00–0x0C7F`), Devanagari (`0x0900–0x097F`), and Tamil (`0x0B80–0x0BFF`) are not mixed up.
   - **No duplicate keys:** Prevents accidental overrides.
3. Automatically writes the compiled JavaScript module `frontend/js/translations.js`.

### 3.2 Dynamic In-Place Translation
`frontend/js/i18n.js` updates DOM elements using `data-i18n`, `data-i18n-placeholder`, and `data-i18n-title` attributes without requiring full page reloads, remembering farmer preferences in `localStorage`.

---

## 4. Voice Interaction Subsystem

`frontend/js/voice.js` bridges the **Web Speech API**:
- **Speech-to-Text (STT):** Configures `webkitSpeechRecognition` or `SpeechRecognition` with regional Indian locales:
  - English: `en-IN`
  - Kannada: `kn-IN`
  - Telugu: `te-IN`
  - Hindi: `hi-IN`
  - Tamil: `ta-IN`
- **Voice Parsing:** Extracts agronomic numbers from compound spoken sentences (e.g., *"Nitrogen 80, phosphorus 40, rainfall 150"*).
- **Text-to-Speech (TTS):** Uses `SpeechSynthesis` to read crop recommendations, irrigation schedules, and weather warnings aloud for low-literacy farmers.

---

## 5. Simple Farmer Mode

Built specifically for farmers seeking quick answers without navigating complex data forms:
- 8 large picture tiles:
  1. *What should I grow?*
  2. *Water today?*
  3. *Fertilizer*
  4. *Crop Safety*
  5. *Harvest*
  6. *Weather*
  7. *Market*
  8. *AI Helper*
- Presents **one question at a time** with large option buttons and voice read-aloud.
- Translates qualitative choices (e.g. *"Abundant canal water"* vs *"Rainfed"*) into quantitative agronomic inputs for the recommendation engine.

---

## 6. Backend Agronomic Engines

All engines in `backend/engines/` are designed for easy drop-in replacement with trained Machine Learning models (e.g., Random Forest, XGBoost, or Neural Networks):

### 6.1 `crop_engine.py`
Scored across 7 physiological dimensions with agronomic tolerances for 20 crops:
$$\text{Score} = w_N \cdot S_N + w_P \cdot S_P + w_K \cdot S_K + w_T \cdot S_T + w_H \cdot S_H + w_{\text{pH}} \cdot S_{\text{pH}} + w_R \cdot S_R$$

### 6.2 `yield_engine.py`
Calculates estimated tonnage based on baseline regional yields, crop season, area, and soil texture multipliers.

### 6.3 `irrigation_engine.py`
Determines water volumes (liters) adjusted for irrigation system efficiency:
- Drip: 90% efficiency
- Sprinkler: 75% efficiency
- Furrow: 60% efficiency
- Flood: 50% efficiency

### 6.4 `fertilizer_engine.py`
Calculates N-P-K nutrient deficits and converts them into commercial bag units (Urea, DAP, MOP) alongside split top-dressing schedules.

### 6.5 `risk_engine.py`
Evaluates regional threat matrices for stem borers, fungal blights, and erratic rainfall, outputting preventive cultural practices and approved chemical mitigations.

---

## 7. Security and Authentication

- User PINs are hashed using **PBKDF2-HMAC-SHA256** with 100,000 iterations and 16-byte cryptographically random salts (`os.urandom(16)`).
- Raw PINs are never stored in plain text.
- Fallback authentication in `frontend/js/api.js` enables demo and guest mode sessions when working entirely disconnected from the server.
