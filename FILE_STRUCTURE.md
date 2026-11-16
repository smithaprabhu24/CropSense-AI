# 🗂️ CropSense AI – Visual Studio Code File Structure

This document outlines the directory structure and file layout of the CropSense AI project.

```
agritech/
│
├── 📂 .vscode/                               # Visual Studio Code configuration
│   ├── extensions.json                       # Recommended extensions (Python, Pylance, etc.)
│   ├── launch.json                           # Debugger configs (FastAPI, Tests, Chrome)
│   ├── settings.json                         # Workspace settings & uncompacted explorer
│   └── tasks.json                            # Build & run tasks (Ctrl+Shift+B)
│
├── 📂 datasets/                              # Real Agricultural Datasets (CSV & JSON)
│   ├── README.md                             # Dataset documentation, features & ML guidelines
│   ├── crop_recommendation.csv               # 1,300 rows (N, P, K, temp, humidity, pH, rain, crop)
│   ├── fertilizer_recommendation.csv         # 500 rows (Soil, crop, moisture, NPK, pH, fertilizer)
│   ├── crop_yield_india.csv                  # 2,688 rows (Multi-year Indian district yields in t/ha)
│   ├── apmc_mandi_prices.csv                 # 4,800 rows (APMC market wholesale commodity rates)
│   ├── crop_pests_diseases_catalog.json      # Structured pest/disease knowledge base
│   └── soil_profiles_india.json              # Characteristics of major Indian soil orders
│
├── 📂 backend/                               # Python FastAPI Application
│   ├── __init__.py
│   ├── config.py                             # Central configuration & environment variables
│   ├── main.py                               # FastAPI app, CORS, static routes & startup events
│   ├── data/                                 # Demo JSON runtime storage
│   │   ├── contacts.json                     # Submitted inquiries & feedback
│   │   ├── market_catalog.json               # APMC markets & commodities catalog
│   │   └── users.json                        # Salted PBKDF2 user authentication records
│   ├── engines/                              # Agronomic prediction rule engines
│   │   ├── __init__.py
│   │   ├── crop_engine.py                    # 20-crop suitability scoring algorithm
│   │   ├── yield_engine.py                   # Multiplier-based yield prediction engine
│   │   ├── irrigation_engine.py              # Phenological water requirement scheduler
│   │   ├── fertilizer_engine.py              # Balanced NPK deficiency dosage calculator
│   │   ├── risk_engine.py                    # Pest, pathogen & weather risk warnings
│   │   └── weather_engine.py                 # Simulated 7-day agro-meteorological forecast
│   ├── models/                               # Pydantic data schemas
│   │   ├── __init__.py
│   │   └── schemas.py                        # Request and response validation models
│   └── routers/                              # REST API endpoint routers
│       ├── __init__.py
│       ├── assistant.py                      # Rule-based NLP assistant router
│       ├── auth.py                           # Mobile PIN registration & login router
│       ├── contact.py                        # Contact form submission endpoint
│       ├── health.py                         # Health check endpoint (/api/health)
│       ├── market.py                         # Mandi catalog, prices & history router
│       └── predictions.py                    # All crop, yield, water, fertilizer & risk routes
│
├── 📂 frontend/                              # Mobile-First Progressive Web App (Vanilla Web)
│   ├── index.html                            # Public SaaS website & landing page
│   ├── login.html                            # Mobile PIN login & registration page
│   ├── portal.html                           # Farmer Portal application shell
│   ├── manifest.json                         # Web App Manifest for mobile installation
│   ├── service-worker.js                     # Cache-first asset precaching & offline engine
│   ├── assets/
│   │   └── svg/                              # Custom SVG icons & graphics
│   │       ├── icon-192.svg                  # 192x192 PWA homescreen icon
│   │       └── icon-512.svg                  # 512x512 PWA splash icon
│   ├── css/                                  # Modular CSS Design Tokens & Styles
│   │   ├── animations.css                    # Micro-interactions, ripples & skeletons
│   │   ├── base.css                          # CSS reset, typography, buttons & form inputs
│   │   ├── chat.css                          # Floating AI assistant chat widget styles
│   │   ├── contact.css                       # Contact section & footer styling
│   │   ├── dashboard.css                     # Cards, gauges, charts, tables
│   │   ├── features.css                      # 9 premium feature navigation cards
│   │   ├── hero.css                          # SVG landscape slider styling
│   │   ├── login.css                         # Mobile PIN pad & authentication styles
│   │   ├── navigation.css                    # Glassmorphic top bar & mobile drawer
│   │   ├── portal.css                        # Portal app shell & responsive page wrappers
│   │   ├── responsive.css                    # Breakpoint rules (390px, 768px, 1024px, 1440px)
│   │   ├── sections.css                      # About, How it works, Technology, SDGs
│   │   ├── sidebar.css                       # Desktop sidebar & mobile bottom tabs
│   │   ├── simple-mode.css                   # Simple Farmer Mode wizard & large tiles
│   │   ├── splash.css                        # Animated splash screen loader
│   │   └── variables.css                     # CSS Custom Properties (Theme, radii, fonts)
│   └── js/                                   # Vanilla ES6 JavaScript Architecture
│       ├── api.js                            # API client with automatic offline fallback
│       ├── app.js                            # Public website controller
│       ├── auth.js                           # PIN authentication controller
│       ├── fallback-engines.js               # In-browser prediction engine (works offline)
│       ├── i18n.js                           # In-place DOM multilingual translator
│       ├── portal.js                         # Farmer portal master controller
│       ├── simple-mode.js                    # Simple Farmer Mode state wizard
│       ├── toast.js                          # Toast notifications
│       ├── translations.js                   # Compiled dictionary (en, kn, te, hi, ta)
│       ├── voice.js                          # Web Speech STT & TTS controller
│       └── pages/                            # Modular single-page app views
│           ├── calendar.js                   # Smart seasonal farm operations calendar
│           ├── crop.js                       # Crop recommendation view
│           ├── dashboard.js                  # Main dashboard overview view
│           ├── fertilizer.js                 # Fertilizer dosage & schedule view
│           ├── health.js                     # Farm health composite index view
│           ├── irrigation.js                 # Irrigation scheduling view
│           ├── market.js                     # APMC market rates & SVG trend chart view
│           ├── profile.js                    # Farmer profile & preference view
│           ├── risk.js                       # Pest & disease risk warning view
│           ├── weather.js                    # Agro-meteorological forecast view
│           └── yield.js                      # Yield prediction & tonnage view
│
├── 📂 translations/                          # Localization Sources
│   └── translations.txt                      # Pipe-delimited master dictionary (key|en|kn|te|hi|ta)
│
├── 📂 tools/                                 # Developer Tooling
│   ├── generate_datasets.py                  # Generates agricultural benchmark datasets
│   └── translation_generator.py              # Validates scripts & compiles translations.js
│
├── 📂 tests/                                 # Automated Test Suite
│   ├── test_api.py                           # FastAPI route integration tests
│   └── test_engines.py                       # Agronomic prediction engine unit tests
│
├── cropsense-ai.code-workspace               # VS Code Multi-Root Workspace Configuration
├── FILE_STRUCTURE.md                         # This file structure guide
├── PROJECT_GUIDE.md                          # Technical architecture & operational handbook
├── README.md                                 # General overview, quickstart & documentation
├── requirements.txt                          # Python dependencies list
├── start_linux.sh                            # One-click startup script for Linux/macOS
├── start_windows.bat                         # One-click startup script for Windows Command Prompt
└── start_windows.ps1                         # One-click startup script for Windows PowerShell
```
