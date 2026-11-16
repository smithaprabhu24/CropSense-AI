# 🌱 CropSense AI – AI-Based Crop Advisory & Risk Prediction System

CropSense AI is a **mobile Progressive Web App (PWA)** and AgriTech SaaS platform designed to deliver personalized agronomic advisory, crop recommendations, yield estimations, irrigation schedules, fertilizer dosages, risk warnings, and live APMC mandi prices directly to farmers.

Designed with an ultra-premium modern UI inspired by Apple, Linear, and Vercel, the application is **100% dependency-free on the frontend** (pure semantic HTML5, CSS3 Custom Properties, and Vanilla ES6 JavaScript modules), backed by a modular **Python FastAPI** service.

---

## 🌟 Highlights

- **📱 Mobile Application (PWA):** Installs directly to home screens on Android & iOS with custom SVG icons, service worker asset precaching, and native app transitions.
- **🗣️ Multilingual & Voice Enabled:** Fully localized into **English**, **Kannada (ಕನ್ನಡ)**, **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **Tamil (தமிழ்)** with Web Speech API speech-to-text input and text-to-speech advisory playback.
- **👨‍🌾 Simple Farmer Mode:** An ultra-intuitive, large-tile wizard asking one question at a time with big touch targets and plain rural language recommendations.
- **⚡ Dual Engine Architecture:** Connects to FastAPI backend, with an automatic, seamless **client-side fallback engine** if the server is offline or unreachable.
- **📊 Real Agronomic Heuristics:** Real data for 20 Indian staples (Rice, Wheat, Maize, Cotton, Sugarcane, Millets, Pulses, Oilseeds, and Spices) with soil nutrient scoring, stage-by-stage irrigation schedules, and NPK fertilizer calculations.
- **📈 APMC Mandi Market Prices:** Real-time commodity price tracking with trend indicators and 30-day SVG charts rendered in pure JavaScript.

---

## 🚀 Quick Start

### 1. Requirements
- Python 3.10+
- Modern Web Browser (Chrome, Edge, Safari, or Firefox)

### 2. Setup
Clone or navigate to the project directory:
```bash
cd v:\downloads\agritech
pip install -r requirements.txt
```

### 3. Launching the Application
- **Windows (Command Prompt):**
  ```cmd
  start_windows.bat
  ```
- **Windows (PowerShell):**
  ```powershell
  .\start_windows.ps1
  ```
- **Linux / macOS:**
  ```bash
  chmod +x start_linux.sh
  ./start_linux.sh
  ```
- **Direct Python Command:**
  ```bash
  python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
  ```

Open your browser at: **[http://localhost:8000](http://localhost:8000)**

---

## 💻 Running inside Visual Studio Code

CropSense AI includes full VS Code workspace integration:
1. Open the `agritech` folder in Visual Studio Code.
2. Press `Ctrl + Shift + B` (or Run Build Task) to start the server.
3. Press `F5` to start debugging with the **"CropSense AI: FastAPI Server"** configuration.
4. Interactive Swagger API documentation is available at **[http://localhost:8000/api/docs](http://localhost:8000/api/docs)**.

---

## 📁 Project Architecture

```
agritech/
├── backend/                        # Python FastAPI Backend
│   ├── config.py                   # App configuration & environment settings
│   ├── main.py                     # App entry point, CORS, and static file mount
│   ├── models/
│   │   └── schemas.py              # Pydantic data schemas & validators
│   ├── engines/                    # Agronomic prediction engines
│   │   ├── crop_engine.py          # 20-crop rule-based suitability scoring
│   │   ├── yield_engine.py         # Multiplier-based yield prediction
│   │   ├── irrigation_engine.py    # Crop stage-by-stage water scheduling
│   │   ├── fertilizer_engine.py    # Soil NPK deficiency dosage & split schedule
│   │   ├── risk_engine.py          # Pest, pathogen & weather risk warnings
│   │   └── weather_engine.py       # Simulated 7-day agro-meteorological forecast
│   ├── routers/                    # REST API endpoints
│   │   ├── auth.py                 # PIN authentication & PBKDF2 hashing
│   │   ├── predictions.py          # Advisory prediction endpoints
│   │   ├── market.py               # Mandi catalog, prices & history
│   │   ├── assistant.py            # Multilingual AI rule-based assistant
│   │   ├── contact.py              # Inquiries and contact persistence
│   │   └── health.py               # System & engine health check
│   └── data/                       # JSON database files
│       ├── users.json
│       ├── contacts.json
│       └── market_catalog.json
│
├── frontend/                       # Mobile-First PWA (Vanilla Web)
│   ├── index.html                  # Public SaaS website
│   ├── login.html                  # Mobile PIN login & registration
│   ├── portal.html                 # Farmer Portal SPA shell
│   ├── manifest.json               # Web App Manifest for mobile install
│   ├── service-worker.js           # Offline caching & background sync
│   ├── assets/svg/                 # Custom SVG vector icons & artwork
│   ├── css/                        # Modular CSS Architecture
│   │   ├── variables.css           # Design tokens, color palette, typography
│   │   ├── base.css                # Reset, buttons, inputs, utilities
│   │   ├── splash.css              # Animated splash loading screen
│   │   ├── navigation.css          # Glassmorphic top bar & mobile drawer
│   │   ├── hero.css                # SVG landscape slider & controls
│   │   ├── sections.css            # About, How it works, Tech, SDGs
│   │   ├── features.css            # 9 premium feature navigation cards
│   │   ├── contact.css             # Contact form & footer
│   │   ├── login.css               # PIN pad & mobile auth styles
│   │   ├── portal.css              # Portal layout & responsive containers
│   │   ├── sidebar.css             # Desktop sidebar & mobile bottom tabs
│   │   ├── dashboard.css           # Cards, gauges, charts, tables
│   │   ├── simple-mode.css         # Simple Farmer Mode wizard & tiles
│   │   ├── chat.css                # Floating AI assistant widget
│   │   ├── responsive.css          # Breakpoints (390px, 768px, 1024px, 1440px)
│   │   └── animations.css          # Micro-interactions & skeleton loaders
│   └── js/                         # Vanilla ES6 JavaScript Modules
│       ├── app.js                  # Public website controller
│       ├── auth.js                 # Authentication controller & PIN pad
│       ├── portal.js               # Farmer portal master controller
│       ├── simple-mode.js          # Simple Farmer Mode state wizard
│       ├── api.js                  # API client with automatic offline fallback
│       ├── fallback-engines.js     # Full browser client-side prediction engine
│       ├── i18n.js                 # Instant multilingual DOM translation engine
│       ├── translations.js         # Compiled translation dictionary
│       ├── voice.js                # Web Speech STT & TTS controller
│       ├── toast.js                # Toast notification system
│       └── pages/                  # Modular portal page renderers
│           ├── dashboard.js
│           ├── crop.js
│           ├── yield.js
│           ├── irrigation.js
│           ├── fertilizer.js
│           ├── risk.js
│           ├── weather.js
│           ├── market.js
│           ├── health.js
│           ├── calendar.js
│           └── profile.js
│
├── translations/
│   └── translations.txt            # Master translation source (key|en|kn|te|hi|ta)
├── tools/
│   └── translation_generator.py    # Python verification and compiler tool
├── tests/
│   ├── test_engines.py             # Agronomic engine unit tests
│   └── test_api.py                 # FastAPI integration tests
└── .vscode/                        # VS Code debugger, tasks & settings
```

---

## 🎨 Design System & Theme

| Token | Value | Purpose |
| :--- | :--- | :--- |
| **Primary** | `#2E7D32` | Dominant branding, primary actions, positive states |
| **Secondary** | `#66BB6A` | Accents, badges, active indicators |
| **Accent** | `#A5D6A7` | Highlights, card hover borders |
| **Background** | `#FFFFFF` | Default canvas |
| **Section BG** | `#F4F8F2` | Subtle contrast container backgrounds |
| **Text** | `#1A1A1A` | High contrast readable typography |
| **Radius** | `18px` | Soft modern rounded corners |
| **Headings Font**| `Poppins` | Bold, welcoming geometry |
| **Body Font** | `Inter` | Clean, crisp legibility |
| **Regional Fonts**| `Noto Sans` | Native glyph support for Kannada, Telugu, Hindi, Tamil |

---

## 🧪 Testing

Run all unit and integration tests with:
```bash
python -m unittest discover tests
```

To re-verify translation scripts and compile the dictionary:
```bash
python tools/translation_generator.py
```

---

## 📜 License
Developed for Indian and global farmers to support UN Sustainable Development Goals (Zero Hunger, Industry Innovation, Responsible Consumption, and Climate Action).
