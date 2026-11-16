# 📊 CropSense AI – Agricultural Datasets

This directory contains standardized, curated agricultural benchmark datasets used by CropSense AI's prediction engines and ML training pipelines.

---

## 📁 Dataset Catalog

### 1. `crop_recommendation.csv`
- **Rows:** 1,300 observations across 26 major Indian crops.
- **Features:**
  - `N`: Ratio of Nitrogen content in soil ($kg/ha$)
  - `P`: Ratio of Phosphorus content in soil ($kg/ha$)
  - `K`: Ratio of Potassium content in soil ($kg/ha$)
  - `temperature`: Ambient temperature in degrees Celsius ($°C$)
  - `humidity`: Relative humidity in percentage ($\%$)
  - `ph`: Soil pH value on standard $0-14$ logarithmic scale
  - `rainfall`: Seasonal precipitation in millimeters ($mm$)
  - `label`: Crop name (target classification class)
- **Use Case:** Multiclass crop classification using Decision Trees, Random Forest, or XGBoost.

---

### 2. `fertilizer_recommendation.csv`
- **Rows:** 500 records.
- **Features:**
  - `Temparature`: Temperature in $°C$
  - `Humidity`: Relative humidity in $\%$
  - `Moisture`: Soil moisture percentage
  - `Soil_Type`: Soil classification (`Sandy`, `Loamy`, `Black`, `Red`, `Clayey`)
  - `Crop_Type`: Target cultivated crop
  - `Nitrogen`, `Potassium`, `Phosphorous`: Current soil nutrient test values ($kg/ha$)
  - `pH`: Soil acidity/alkalinity
  - `Fertilizer_Name`: Commercial fertilizer recommendation (`Urea`, `DAP`, `14-35-14`, `28-28-0`, `17-17-17`, `20-20`, `10-26-26`)
- **Use Case:** Fertilizer prescription modeling.

---

### 3. `crop_yield_india.csv`
- **Rows:** Historical multi-year district crop yields across Indian states.
- **Features:**
  - `State_Name`, `District_Name`: Administrative geo-location
  - `Crop_Year`: Agricultural calendar year ($2018 - 2026$)
  - `Season`: Sowing season (`Kharif`, `Rabi`, `Whole Year`)
  - `Crop`: Commodity name
  - `Area_Hectares`: Land area under active cultivation
  - `Production_Tonnes`: Total gross output
  - `Yield_Tonnes_Per_Hectare`: Output efficiency metric ($t/ha$)
- **Use Case:** Regression modeling for yield prediction.

---

### 4. `apmc_mandi_prices.csv`
- **Rows:** Historical price series across major APMC regulated wholesale markets.
- **Features:**
  - `Date`: Record date ($YYYY-MM-DD$)
  - `State`, `District`, `Market`: APMC mandi jurisdiction
  - `Commodity`, `Variety`: Produce classification
  - `Arrival_Tonnes`: Daily physical arrival volume
  - `Min_Price_INR`, `Max_Price_INR`, `Modal_Price_INR`: Wholesale prices in INR per quintal ($100 kg$)
- **Use Case:** Time-series market forecasting and price anomaly detection.

---

### 5. `crop_pests_diseases_catalog.json`
- **Format:** Structured JSON knowledge graph.
- **Entities:** Crop pathologies, causal biological agents, environmental trigger conditions, organic IPM strategies, and chemical fungicides/insecticides.

---

### 6. `soil_profiles_india.json`
- **Format:** Structured JSON array.
- **Entities:** Soil orders in India (Alluvial, Black Cotton, Red/Yellow, Laterite), pH bounds, macronutrient baseline statuses, and drainage properties.

---

## 🛠️ Data Provenance & References
- **ICAR:** Indian Council of Agricultural Research agronomic package of practices.
- **Agmarknet:** Directorate of Marketing & Inspection, Ministry of Agriculture & Farmers Welfare, Government of India.
- **DES:** Directorate of Economics and Statistics agricultural statistics at a glance.
