"""
CropSense AI – Crop Recommendation Engine
Rule-based engine using real agronomic data for 20 Indian crops.
Scores crops based on soil nutrients, weather conditions and pH.
"""
import random
import csv
from pathlib import Path

DATASET_CSV = Path(__file__).resolve().parent.parent.parent / "datasets" / "crop_recommendation.csv"

CROPS = [
    {"name": "Rice", "n": (60, 120), "p": (20, 60), "k": (20, 60), "temp": (22, 35), "hum": (60, 90), "ph": (5.5, 7.0), "rain": (150, 300), "season": "Kharif", "days": 120, "profit": 3},
    {"name": "Wheat", "n": (80, 140), "p": (30, 70), "k": (20, 50), "temp": (15, 25), "hum": (40, 70), "ph": (6.0, 7.5), "rain": (50, 120), "season": "Rabi", "days": 130, "profit": 3},
    {"name": "Maize", "n": (60, 120), "p": (30, 60), "k": (20, 50), "temp": (20, 32), "hum": (50, 80), "ph": (5.5, 7.5), "rain": (60, 150), "season": "Kharif", "days": 100, "profit": 3},
    {"name": "Cotton", "n": (80, 140), "p": (30, 60), "k": (20, 50), "temp": (25, 38), "hum": (40, 70), "ph": (6.0, 8.0), "rain": (50, 120), "season": "Kharif", "days": 165, "profit": 4},
    {"name": "Sugarcane", "n": (100, 200), "p": (40, 80), "k": (40, 80), "temp": (25, 38), "hum": (60, 85), "ph": (5.5, 7.5), "rain": (100, 250), "season": "Kharif", "days": 300, "profit": 4},
    {"name": "Jowar (Sorghum)", "n": (40, 80), "p": (20, 50), "k": (15, 40), "temp": (25, 38), "hum": (30, 65), "ph": (5.5, 8.0), "rain": (40, 100), "season": "Kharif", "days": 110, "profit": 2},
    {"name": "Bajra (Pearl Millet)", "n": (30, 70), "p": (15, 40), "k": (15, 35), "temp": (25, 40), "hum": (25, 60), "ph": (5.5, 8.0), "rain": (25, 80), "season": "Kharif", "days": 90, "profit": 2},
    {"name": "Ragi (Finger Millet)", "n": (30, 60), "p": (15, 35), "k": (15, 35), "temp": (20, 32), "hum": (50, 80), "ph": (5.0, 7.5), "rain": (60, 120), "season": "Kharif", "days": 115, "profit": 2},
    {"name": "Groundnut", "n": (10, 40), "p": (30, 60), "k": (20, 50), "temp": (24, 35), "hum": (50, 75), "ph": (5.5, 7.0), "rain": (50, 130), "season": "Kharif", "days": 120, "profit": 4},
    {"name": "Soybean", "n": (10, 40), "p": (30, 70), "k": (20, 50), "temp": (22, 32), "hum": (50, 80), "ph": (6.0, 7.5), "rain": (60, 150), "season": "Kharif", "days": 100, "profit": 3},
    {"name": "Sunflower", "n": (40, 80), "p": (30, 60), "k": (20, 40), "temp": (20, 30), "hum": (40, 70), "ph": (6.0, 7.5), "rain": (50, 100), "season": "Rabi", "days": 95, "profit": 3},
    {"name": "Tur (Pigeon Pea)", "n": (10, 30), "p": (30, 60), "k": (10, 30), "temp": (25, 35), "hum": (40, 70), "ph": (5.5, 7.5), "rain": (60, 150), "season": "Kharif", "days": 160, "profit": 4},
    {"name": "Moong (Green Gram)", "n": (10, 25), "p": (20, 50), "k": (10, 30), "temp": (25, 35), "hum": (50, 80), "ph": (6.0, 7.5), "rain": (40, 100), "season": "Kharif", "days": 65, "profit": 3},
    {"name": "Urad (Black Gram)", "n": (10, 25), "p": (20, 50), "k": (10, 30), "temp": (25, 35), "hum": (50, 85), "ph": (6.0, 7.5), "rain": (60, 120), "season": "Kharif", "days": 75, "profit": 3},
    {"name": "Chana (Chickpea)", "n": (10, 30), "p": (30, 60), "k": (10, 30), "temp": (15, 28), "hum": (30, 60), "ph": (6.0, 8.0), "rain": (30, 80), "season": "Rabi", "days": 110, "profit": 4},
    {"name": "Mustard", "n": (40, 80), "p": (20, 50), "k": (10, 30), "temp": (15, 25), "hum": (30, 60), "ph": (5.5, 7.5), "rain": (30, 80), "season": "Rabi", "days": 120, "profit": 3},
    {"name": "Sesame", "n": (20, 50), "p": (15, 40), "k": (10, 30), "temp": (25, 38), "hum": (40, 70), "ph": (5.5, 7.5), "rain": (30, 80), "season": "Kharif", "days": 90, "profit": 3},
    {"name": "Coconut", "n": (50, 120), "p": (20, 60), "k": (80, 180), "temp": (25, 35), "hum": (60, 90), "ph": (5.5, 7.0), "rain": (150, 300), "season": "Perennial", "days": 365, "profit": 5},
    {"name": "Arecanut", "n": (60, 120), "p": (20, 50), "k": (60, 140), "temp": (24, 34), "hum": (60, 90), "ph": (5.0, 6.5), "rain": (150, 300), "season": "Perennial", "days": 365, "profit": 5},
    {"name": "Turmeric", "n": (60, 120), "p": (20, 50), "k": (80, 150), "temp": (25, 35), "hum": (60, 85), "ph": (5.5, 7.0), "rain": (100, 250), "season": "Kharif", "days": 240, "profit": 4},
]

TIPS = {
    "Rice": "Ensure proper water management with alternate wetting and drying to save water.",
    "Wheat": "Apply first irrigation at crown root initiation stage (21 days after sowing).",
    "Maize": "Use raised-bed planting for better drainage and higher yields.",
    "Cotton": "Space plants 60-90cm apart for optimal boll development.",
    "Sugarcane": "Use sett treatment with fungicide before planting to prevent diseases.",
    "Jowar (Sorghum)": "Ideal dryland crop — minimal irrigation needed after establishment.",
    "Bajra (Pearl Millet)": "Performs well in sandy soils with low rainfall conditions.",
    "Ragi (Finger Millet)": "Rich in calcium — excellent for intercropping with pulses.",
    "Groundnut": "Inoculate seeds with Rhizobium for better nitrogen fixation.",
    "Soybean": "Avoid waterlogging — ensure proper field drainage.",
    "Sunflower": "Face rows north-south for maximum sunlight interception.",
    "Tur (Pigeon Pea)": "Excellent green manure crop — fixes atmospheric nitrogen.",
    "Moong (Green Gram)": "Short-duration crop ideal for summer season as a catch crop.",
    "Urad (Black Gram)": "Apply phosphorus at sowing for better root nodulation.",
    "Chana (Chickpea)": "Avoid excessive nitrogen — it reduces nodulation.",
    "Mustard": "Apply sulphur @ 20 kg/ha for better oil content.",
    "Sesame": "Drought-tolerant crop suitable for rainfed conditions.",
    "Coconut": "Maintain basin around tree for effective irrigation and manuring.",
    "Arecanut": "Provide partial shade during early growth phase.",
    "Turmeric": "Mulch beds with green leaves to conserve moisture and suppress weeds.",
}


def _score_range(value, low, high):
    """Score how well a value fits within an ideal range (0.0 to 1.0)."""
    if low <= value <= high:
        return 1.0
    mid = (low + high) / 2
    span = (high - low) / 2
    distance = abs(value - mid) - span
    return max(0.0, 1.0 - (distance / (span + 1)))


def recommend(req):
    """Score every crop against input parameters and return top 5 matches."""
    results = []
    for crop in CROPS:
        n_score = _score_range(req.nitrogen, *crop["n"])
        p_score = _score_range(req.phosphorus, *crop["p"])
        k_score = _score_range(req.potassium, *crop["k"])
        t_score = _score_range(req.temperature, *crop["temp"])
        h_score = _score_range(req.humidity, *crop["hum"])
        ph_score = _score_range(req.ph, *crop["ph"])
        r_score = _score_range(req.rainfall, *crop["rain"])

        total = (
            (n_score + p_score + k_score) * 0.25 / 3
            + t_score * 0.20
            + h_score * 0.15
            + ph_score * 0.20
            + r_score * 0.20
        )
        score = round(total * 100, 1)

        results.append({
            "name": crop["name"],
            "score": score,
            "suitable_season": crop["season"],
            "duration_days": crop["days"],
            "profit_rating": crop["profit"],
            "tips": TIPS.get(crop["name"], "Follow standard agronomic practices."),
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:5]
