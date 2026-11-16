"""
CropSense AI - Crop Risk Prediction Engine
============================================
Assesses pest, disease, weather, and market risks for a given crop based
on season, state, and soil conditions.  Provides mitigation strategies
and insurance recommendations.
"""

from __future__ import annotations

import random
from typing import Any


# ═══════════════════════════════════════════════════════════════════════════
# RISK DATABASES — real pest/disease/weather risks for Indian agriculture
# ═══════════════════════════════════════════════════════════════════════════

PEST_RISKS: dict[str, list[dict[str, Any]]] = {
    "rice": [
        {"name": "Brown Plant Hopper (BPH)", "severity": "high", "base_prob": 35,
         "description": "Sucks phloem sap causing 'hopper burn' — yellowing and drying of plants",
         "mitigation": ["Apply Imidacloprid 17.8 SL @ 3ml/10L", "Drain standing water to break breeding cycle", "Release Lycosa spider as biocontrol"],
         "preventive_measures": ["Avoid excess nitrogen", "Use resistant varieties like Swarnadhan", "Install light traps"]},
        {"name": "Stem Borer", "severity": "medium", "base_prob": 30,
         "description": "Larvae bore into stems causing 'dead hearts' in vegetative and 'white ears' in reproductive stage",
         "mitigation": ["Apply Cartap Hydrochloride 4G in leaf whorl", "Remove and destroy affected tillers"],
         "preventive_measures": ["Use Trichogramma egg parasitoids", "Clip leaf tips during transplanting", "Early planting reduces infestation"]},
    ],
    "wheat": [
        {"name": "Aphids", "severity": "medium", "base_prob": 25,
         "description": "Colony-forming insects that suck sap from leaves and ears, reducing grain filling",
         "mitigation": ["Spray Dimethoate 30 EC @ 1ml/L", "Release ladybird beetles"],
         "preventive_measures": ["Timely sowing by mid-November", "Avoid excess nitrogen", "Monitor from ear-head stage"]},
        {"name": "Termites", "severity": "medium", "base_prob": 20,
         "description": "Damage roots and basal stem in dry conditions, causing plant wilting",
         "mitigation": ["Apply Chlorpyriphos 20 EC @ 4L/ha with irrigation", "Flood irrigation reduces infestation"],
         "preventive_measures": ["Seed treatment with Imidacloprid", "Ensure proper soil moisture", "Remove crop stubble"]},
    ],
    "cotton": [
        {"name": "American Bollworm (Helicoverpa)", "severity": "critical", "base_prob": 40,
         "description": "Feeds on squares, flowers, and bolls causing severe yield loss up to 50%",
         "mitigation": ["Spray HaNPV @ 250 LE/ha", "Use Emamectin Benzoate 5 SG", "Hand-pick grown larvae"],
         "preventive_measures": ["Install pheromone traps @ 5/ha", "Grow trap crops (marigold, castor)", "Use Bt cotton varieties"]},
        {"name": "Whitefly", "severity": "high", "base_prob": 35,
         "description": "Transmits leaf curl virus; causes sticky honeydew leading to sooty mould",
         "mitigation": ["Spray neem oil @ 5ml/L", "Apply Diafenthiuron 50 WP"],
         "preventive_measures": ["Remove alternate weed hosts", "Install yellow sticky traps", "Avoid late sowing"]},
    ],
    "maize": [
        {"name": "Fall Armyworm", "severity": "high", "base_prob": 45,
         "description": "Devastating pest that feeds on leaves and ears, spreading rapidly across fields",
         "mitigation": ["Spray Spinetoram 11.7 SC @ 0.5ml/L", "Apply Emamectin Benzoate 5 SG @ 0.4g/L"],
         "preventive_measures": ["Early detection by monitoring whorl damage", "Install pheromone traps", "Inter-crop with legumes"]},
    ],
    "sugarcane": [
        {"name": "Internode Borer", "severity": "high", "base_prob": 30,
         "description": "Larvae bore into internodes causing dead hearts and reduced cane weight",
         "mitigation": ["Release Trichogramma chilonis @ 50,000/ha", "Remove and destroy affected canes"],
         "preventive_measures": ["Treat setts with Chlorantraniliprole", "Detrash at 150 and 210 days", "Avoid ratooning infested fields"]},
    ],
    "groundnut": [
        {"name": "Leaf Miner", "severity": "medium", "base_prob": 25,
         "description": "Creates blister-like mines on leaves reducing photosynthetic area",
         "mitigation": ["Spray Profenophos 50 EC @ 2ml/L", "Remove heavily mined leaves"],
         "preventive_measures": ["Seed treatment with Thiamethoxam", "Maintain field hygiene"]},
    ],
    "tomato": [
        {"name": "Fruit Borer (Helicoverpa)", "severity": "high", "base_prob": 40,
         "description": "Larvae bore into fruits causing direct yield loss and secondary infections",
         "mitigation": ["Spray HaNPV @ 250 LE/ha", "Use Spinosad 45 SC @ 0.3ml/L"],
         "preventive_measures": ["Install pheromone traps", "Grow marigold as trap crop", "Timely harvest of mature fruits"]},
    ],
}

DISEASE_RISKS: dict[str, list[dict[str, Any]]] = {
    "rice": [
        {"name": "Blast (Magnaporthe oryzae)", "severity": "high", "base_prob": 30,
         "description": "Fungal disease causing diamond-shaped lesions on leaves, neck rot, and panicle blast",
         "mitigation": ["Spray Tricyclazole 75 WP @ 0.6g/L", "Apply Isoprothiolane 40 EC"],
         "preventive_measures": ["Use resistant varieties", "Avoid excess nitrogen", "Maintain proper spacing"]},
    ],
    "wheat": [
        {"name": "Yellow Rust (Puccinia striiformis)", "severity": "high", "base_prob": 25,
         "description": "Orange-yellow pustules on leaves reducing grain filling; thrives in cool, moist weather",
         "mitigation": ["Spray Propiconazole 25 EC @ 1ml/L", "Two sprays at 15-day interval"],
         "preventive_measures": ["Grow resistant varieties (HD-3086)", "Timely sowing", "Balanced fertilization"]},
    ],
    "cotton": [
        {"name": "Bacterial Blight", "severity": "medium", "base_prob": 20,
         "description": "Angular leaf spots, boll rot, and black arm on stems",
         "mitigation": ["Spray Streptomycin sulphate + Copper oxychloride", "Remove infected plant debris"],
         "preventive_measures": ["Use acid-delinted certified seeds", "Seed treatment with Carboxin", "Crop rotation"]},
    ],
    "groundnut": [
        {"name": "Tikka Disease (Cercospora)", "severity": "medium", "base_prob": 30,
         "description": "Dark brown leaf spots causing premature defoliation",
         "mitigation": ["Spray Mancozeb 75 WP @ 2.5g/L", "Apply Chlorothalonil"],
         "preventive_measures": ["Use disease-free seeds", "Crop rotation with cereals", "Avoid water stress"]},
    ],
    "tomato": [
        {"name": "Late Blight (Phytophthora)", "severity": "critical", "base_prob": 35,
         "description": "Water-soaked lesions on leaves and fruits; spreads rapidly in cool, wet conditions",
         "mitigation": ["Spray Metalaxyl + Mancozeb @ 2.5g/L", "Remove infected plants immediately"],
         "preventive_measures": ["Use resistant varieties", "Avoid overhead irrigation", "Ensure good air circulation"]},
    ],
    "potato": [
        {"name": "Late Blight (Phytophthora infestans)", "severity": "critical", "base_prob": 40,
         "description": "Devastating disease causing rapid foliage death and tuber rot",
         "mitigation": ["Spray Cymoxanil + Mancozeb @ 3g/L", "Destroy infected haulms before harvest"],
         "preventive_measures": ["Use disease-free seed tubers", "Mancozeb prophylactic spray", "Avoid dense planting"]},
    ],
}

WEATHER_RISKS: dict[str, list[dict[str, Any]]] = {
    "kharif": [
        {"name": "Floods / Excess Rainfall", "severity": "high", "base_prob": 25,
         "description": "Prolonged waterlogging destroys crops, especially in low-lying areas",
         "mitigation": ["Arrange emergency drainage", "Apply potash after flood water recedes", "Re-sow with short-duration varieties"],
         "preventive_measures": ["Choose flood-tolerant varieties (Swarna Sub-1)", "Construct field bunds", "Crop insurance"]},
        {"name": "Drought / Dry Spell", "severity": "medium", "base_prob": 20,
         "description": "Monsoon breaks of 2+ weeks cause moisture stress during critical growth stages",
         "mitigation": ["Life-saving irrigation", "Spray KCl 1% solution", "Mulching"],
         "preventive_measures": ["Rainwater harvesting", "Drought-tolerant varieties", "Conservation tillage"]},
    ],
    "rabi": [
        {"name": "Frost / Cold Wave", "severity": "high", "base_prob": 20,
         "description": "Night temperatures below 2°C damage tender crops, especially in Dec-Jan",
         "mitigation": ["Light irrigation in the evening", "Smoke screening", "Cover nurseries with polythene"],
         "preventive_measures": ["Timely sowing", "Avoid low-lying frost pockets", "Grow frost-tolerant varieties"]},
        {"name": "Unseasonal Rain / Hailstorm", "severity": "medium", "base_prob": 15,
         "description": "Late February–March rains and hail can damage standing rabi crops at maturity",
         "mitigation": ["Harvest mature crop immediately", "Dry harvested produce quickly to prevent sprouting"],
         "preventive_measures": ["Crop insurance", "Early-maturing varieties", "Staggered sowing"]},
    ],
    "zaid": [
        {"name": "Heat Wave", "severity": "high", "base_prob": 30,
         "description": "Temperatures above 42°C cause flower drop, fruit scorching, and wilting",
         "mitigation": ["Frequent light irrigation", "Spray Kaolin 5% as heat reflectant", "Mulching"],
         "preventive_measures": ["Use shade nets", "Heat-tolerant varieties", "Irrigate early morning"]},
    ],
}

MARKET_RISKS: dict[str, list[dict[str, Any]]] = {
    "default": [
        {"name": "Price Crash at Harvest", "severity": "medium", "base_prob": 25,
         "description": "Market glut during peak harvest season depresses prices below MSP",
         "mitigation": ["Store in warehouses and sell later", "Process into value-added products", "Sell through FPOs"],
         "preventive_measures": ["Stagger harvesting", "Pre-season price contracts", "Grow crops with stable demand"]},
        {"name": "Supply Chain Disruption", "severity": "low", "base_prob": 10,
         "description": "Transport strikes, road closures, or cold-chain failures cause post-harvest losses",
         "mitigation": ["Sell to local market", "Primary processing at farm gate", "Contact district agricultural officer"],
         "preventive_measures": ["Diversify buyer contacts", "Join FPO for collective bargaining", "Invest in on-farm storage"]},
    ],
    "onion": [
        {"name": "Extreme Price Volatility", "severity": "high", "base_prob": 40,
         "description": "Onion prices can swing 200-300% within weeks due to supply-demand mismatch",
         "mitigation": ["Use cold storage facilities", "Sell in phased manner", "Contract farming"],
         "preventive_measures": ["Government price stabilization schemes", "Grow Rabi onion for better shelf life", "Post-harvest curing"]},
    ],
    "tomato": [
        {"name": "Perishability Loss", "severity": "high", "base_prob": 35,
         "description": "Tomato prices crash when arrivals peak; 30-40% post-harvest loss is common",
         "mitigation": ["Process into paste/puree", "Zero-energy cool chamber storage", "Sell to processors"],
         "preventive_measures": ["Stagger planting dates", "Grow processing varieties", "Pre-harvest buyer contracts"]},
    ],
}

# ── State-based probability adjustments ──────────────────────────────────
STATE_RISK_ADJUSTMENTS: dict[str, float] = {
    "karnataka": 1.0, "andhra pradesh": 1.05, "telangana": 1.05,
    "tamil nadu": 1.10, "maharashtra": 1.0, "madhya pradesh": 0.95,
    "uttar pradesh": 0.95, "rajasthan": 1.15, "gujarat": 1.05,
    "punjab": 0.90, "haryana": 0.90, "west bengal": 1.10,
}


def predict(request) -> dict:
    """Assess risks for the given crop, season, and region."""

    crop_key = request.crop.strip().lower()
    season_key = request.season.strip().lower() if request.season else "kharif"
    state_key = request.state.strip().lower() if request.state else ""

    state_adj = STATE_RISK_ADJUSTMENTS.get(state_key, 1.0)

    risks: list[dict[str, Any]] = []

    # ── Pest risks ──────────────────────────────────────────────────────
    pest_list = PEST_RISKS.get(crop_key, [])
    if not pest_list:
        # Generic pest risk
        pest_list = [
            {"name": "General Insect Pest Complex", "severity": "medium", "base_prob": 20,
             "description": "Common insect pests that affect most crops during the growing season",
             "mitigation": ["Integrated Pest Management (IPM)", "Consult local agricultural officer"],
             "preventive_measures": ["Regular field scouting", "Maintain field hygiene", "Use certified seeds"]},
        ]

    for pest in pest_list:
        prob = min(95, pest["base_prob"] * state_adj + random.uniform(-5, 5))
        risks.append({
            "type": "pest",
            "name": pest["name"],
            "severity": pest["severity"],
            "probability": round(prob, 1),
            "description": pest["description"],
            "mitigation": pest["mitigation"],
            "preventive_measures": pest["preventive_measures"],
        })

    # ── Disease risks ───────────────────────────────────────────────────
    disease_list = DISEASE_RISKS.get(crop_key, [])
    if not disease_list:
        disease_list = [
            {"name": "Fungal / Bacterial Complex", "severity": "medium", "base_prob": 20,
             "description": "Common fungal and bacterial infections during humid conditions",
             "mitigation": ["Apply broad-spectrum fungicide", "Remove infected plant parts"],
             "preventive_measures": ["Crop rotation", "Resistant varieties", "Proper drainage"]},
        ]

    for disease in disease_list:
        prob = min(95, disease["base_prob"] * state_adj + random.uniform(-5, 5))
        risks.append({
            "type": "disease",
            "name": disease["name"],
            "severity": disease["severity"],
            "probability": round(prob, 1),
            "description": disease["description"],
            "mitigation": disease["mitigation"],
            "preventive_measures": disease["preventive_measures"],
        })

    # ── Weather risks ───────────────────────────────────────────────────
    weather_list = WEATHER_RISKS.get(season_key, WEATHER_RISKS.get("kharif", []))
    for wx in weather_list:
        prob = min(95, wx["base_prob"] * state_adj + random.uniform(-5, 5))
        risks.append({
            "type": "weather",
            "name": wx["name"],
            "severity": wx["severity"],
            "probability": round(prob, 1),
            "description": wx["description"],
            "mitigation": wx["mitigation"],
            "preventive_measures": wx["preventive_measures"],
        })

    # ── Market risks ────────────────────────────────────────────────────
    market_list = MARKET_RISKS.get(crop_key, MARKET_RISKS["default"])
    for mk in market_list:
        prob = min(95, mk["base_prob"] + random.uniform(-5, 5))
        risks.append({
            "type": "market",
            "name": mk["name"],
            "severity": mk["severity"],
            "probability": round(prob, 1),
            "description": mk["description"],
            "mitigation": mk["mitigation"],
            "preventive_measures": mk["preventive_measures"],
        })

    # ── Overall risk level ──────────────────────────────────────────────
    if not risks:
        overall = "low"
    else:
        severity_scores = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        avg_severity = sum(severity_scores.get(r["severity"], 2) for r in risks) / len(risks)
        max_prob = max(r["probability"] for r in risks)

        if avg_severity >= 3.0 or max_prob >= 60:
            overall = "high"
        elif avg_severity >= 2.0 or max_prob >= 40:
            overall = "moderate"
        else:
            overall = "low"

    # ── Insurance recommendation ────────────────────────────────────────
    if overall == "high":
        insurance = (
            "Strongly recommended. Enroll in Pradhan Mantri Fasal Bima Yojana (PMFBY) "
            "for comprehensive crop insurance. Premium is subsidised up to 50% by the government."
        )
    elif overall == "moderate":
        insurance = (
            "Recommended. Consider PMFBY or state-level crop insurance schemes. "
            "Covers yield losses due to natural calamities, pests, and diseases."
        )
    else:
        insurance = (
            "Optional but advisable. Basic crop insurance provides peace of mind. "
            "Check with your local bank or agricultural office for available schemes."
        )

    return {
        "crop": request.crop,
        "risks": risks,
        "overall_risk_level": overall,
        "insurance_recommendation": insurance,
    }
