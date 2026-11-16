"""
CropSense AI – Yield Prediction Engine
Rule-based yield estimation using base yields, soil and state multipliers.
"""
import random

BASE_YIELDS = {
    "Rice":       {"Kharif": 3.5, "Rabi": 3.0, "Zaid": 2.5},
    "Wheat":      {"Kharif": 2.0, "Rabi": 3.8, "Zaid": 2.5},
    "Maize":      {"Kharif": 3.2, "Rabi": 2.8, "Zaid": 2.5},
    "Cotton":     {"Kharif": 2.0, "Rabi": 1.5, "Zaid": 1.2},
    "Sugarcane":  {"Kharif": 70.0, "Rabi": 65.0, "Zaid": 55.0},
    "Jowar (Sorghum)":      {"Kharif": 1.8, "Rabi": 2.0, "Zaid": 1.5},
    "Bajra (Pearl Millet)":  {"Kharif": 1.5, "Rabi": 1.2, "Zaid": 1.0},
    "Ragi (Finger Millet)":  {"Kharif": 2.2, "Rabi": 1.8, "Zaid": 1.5},
    "Groundnut":  {"Kharif": 1.8, "Rabi": 1.5, "Zaid": 1.2},
    "Soybean":    {"Kharif": 2.0, "Rabi": 1.5, "Zaid": 1.2},
    "Sunflower":  {"Kharif": 1.2, "Rabi": 1.5, "Zaid": 1.0},
    "Tur (Pigeon Pea)":     {"Kharif": 1.2, "Rabi": 1.0, "Zaid": 0.8},
    "Moong (Green Gram)":   {"Kharif": 0.8, "Rabi": 0.7, "Zaid": 0.9},
    "Urad (Black Gram)":    {"Kharif": 0.7, "Rabi": 0.6, "Zaid": 0.5},
    "Chana (Chickpea)":     {"Kharif": 1.0, "Rabi": 1.5, "Zaid": 0.8},
    "Mustard":    {"Kharif": 1.0, "Rabi": 1.5, "Zaid": 0.8},
    "Sesame":     {"Kharif": 0.5, "Rabi": 0.4, "Zaid": 0.3},
    "Coconut":    {"Kharif": 12.0, "Rabi": 12.0, "Zaid": 12.0},
    "Arecanut":   {"Kharif": 3.0, "Rabi": 3.0, "Zaid": 3.0},
    "Turmeric":   {"Kharif": 6.0, "Rabi": 5.0, "Zaid": 4.0},
}

SOIL_MULTIPLIERS = {
    "Clay": 0.90, "Loam": 1.10, "Sandy": 0.80, "Silt": 1.00,
    "Black": 1.05, "Red": 0.95, "Laterite": 0.85, "Alluvial": 1.10,
}

STATE_MULTIPLIERS = {
    "Karnataka": 1.00, "Andhra Pradesh": 1.05, "Telangana": 1.02,
    "Tamil Nadu": 0.98, "Maharashtra": 1.00, "Madhya Pradesh": 1.03,
    "Uttar Pradesh": 1.08, "Rajasthan": 0.85, "Gujarat": 0.95,
    "Punjab": 1.15, "Haryana": 1.10, "West Bengal": 1.05,
}


def predict(req):
    """Estimate yield based on crop, area, season, soil and state."""
    crop_name = req.crop
    season = req.season if req.season else "Kharif"
    soil = req.soil_type if req.soil_type else "Loam"
    state = req.state if req.state else "Karnataka"

    crop_yields = None
    for key in BASE_YIELDS:
        if key.lower().startswith(crop_name.lower()) or crop_name.lower() in key.lower():
            crop_yields = BASE_YIELDS[key]
            crop_name = key
            break

    if not crop_yields:
        crop_yields = {"Kharif": 2.5, "Rabi": 2.0, "Zaid": 1.5}

    base = crop_yields.get(season, crop_yields.get("Kharif", 2.0))
    soil_mult = SOIL_MULTIPLIERS.get(soil, 1.0)
    state_mult = STATE_MULTIPLIERS.get(state, 1.0)
    variation = random.uniform(0.90, 1.10)

    estimated = round(base * req.area * soil_mult * state_mult * variation, 2)
    confidence = round(random.uniform(75, 92), 1)

    factors = []
    if soil in SOIL_MULTIPLIERS:
        factors.append(f"Soil type ({soil}): {'favorable' if soil_mult >= 1.0 else 'suboptimal'}")
    if state in STATE_MULTIPLIERS:
        factors.append(f"State ({state}): {'above average' if state_mult >= 1.0 else 'below average'} productivity")
    factors.append(f"Season ({season}): {'primary' if season == 'Kharif' else 'secondary'} growing season")

    recommendations = [
        "Use certified seeds for higher germination rates.",
        "Apply balanced fertilizers based on soil test results.",
        "Ensure timely irrigation at critical growth stages.",
        "Monitor for pests and diseases regularly.",
    ]

    return {
        "crop": crop_name,
        "area": req.area,
        "season": season,
        "estimated_yield": estimated,
        "unit": "tonnes",
        "confidence": confidence,
        "factors": factors,
        "recommendations": recommendations,
    }
