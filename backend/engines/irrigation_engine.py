"""
CropSense AI - Irrigation Scheduling Engine
=============================================
Calculates water requirements, irrigation frequency, and a week-by-week
schedule based on crop type, soil drainage, field area, and irrigation
method efficiency.
"""

from __future__ import annotations

import math
from typing import Any


# ═══════════════════════════════════════════════════════════════════════════
# CROP WATER NEEDS — total mm required over the growing season
# ═══════════════════════════════════════════════════════════════════════════

CROP_WATER_NEEDS: dict[str, float] = {
    "rice":          1200,
    "wheat":         450,
    "maize":         600,
    "cotton":        700,
    "sugarcane":     1800,
    "jowar":         400,
    "sorghum":       400,
    "bajra":         350,
    "pearl millet":  350,
    "ragi":          500,
    "finger millet": 500,
    "groundnut":     500,
    "soybean":       450,
    "sunflower":     500,
    "tur":           400,
    "pigeon pea":    400,
    "moong":         300,
    "green gram":    300,
    "urad":          350,
    "black gram":    350,
    "chana":         250,
    "chickpea":      250,
    "mustard":       300,
    "sesame":        350,
    "coconut":       1500,
    "arecanut":      1600,
    "turmeric":      1000,
    "onion":         550,
    "tomato":        600,
    "potato":        500,
    "chilli":        650,
}

# ── Soil drainage factors (higher = drains faster = needs more water) ───
SOIL_DRAINAGE: dict[str, float] = {
    "clay":    0.85,
    "loam":    1.00,
    "sandy":   1.30,
    "silt":    0.95,
    "black":   0.90,
    "red":     1.10,
    "laterite": 1.20,
    "alluvial": 1.00,
}

# ── Method efficiency (fraction of water that reaches the root zone) ────
METHOD_EFFICIENCY: dict[str, float] = {
    "drip":      0.90,
    "sprinkler": 0.75,
    "flood":     0.50,
    "furrow":    0.60,
}

# ── Crop duration in days (for schedule generation) ─────────────────────
CROP_DURATION: dict[str, int] = {
    "rice": 120, "wheat": 135, "maize": 100, "cotton": 180,
    "sugarcane": 360, "jowar": 110, "sorghum": 110, "bajra": 90,
    "pearl millet": 90, "ragi": 120, "finger millet": 120,
    "groundnut": 120, "soybean": 100, "sunflower": 95,
    "tur": 180, "pigeon pea": 180, "moong": 70, "green gram": 70,
    "urad": 80, "black gram": 80, "chana": 110, "chickpea": 110,
    "mustard": 130, "sesame": 90, "coconut": 365, "arecanut": 365,
    "turmeric": 270, "onion": 140, "tomato": 150, "potato": 120,
    "chilli": 180,
}


def schedule(request) -> dict:
    """Build an irrigation schedule for the given crop and field."""

    crop_key = request.crop.strip().lower()
    soil_key = request.soil_type.strip().lower() if request.soil_type else "loam"
    method_key = request.irrigation_method.strip().lower() if request.irrigation_method else "drip"

    # ── Water requirement ───────────────────────────────────────────────
    base_mm = CROP_WATER_NEEDS.get(crop_key, 500)
    drainage = SOIL_DRAINAGE.get(soil_key, 1.0)
    efficiency = METHOD_EFFICIENCY.get(method_key, 0.75)

    effective_mm = base_mm * drainage / efficiency  # mm required accounting for losses
    # 1 mm on 1 ha = 10,000 litres
    water_litres = effective_mm * request.area * 10_000

    # ── Frequency and duration ──────────────────────────────────────────
    duration_days = CROP_DURATION.get(crop_key, 120)
    total_irrigations = max(1, duration_days // 7)  # roughly weekly
    water_per_irrigation = water_litres / total_irrigations

    # Time to deliver (assuming 10 l/s flow rate per hectare for drip)
    flow_rate_ls = {"drip": 10, "sprinkler": 15, "flood": 50, "furrow": 30}
    fr = flow_rate_ls.get(method_key, 10) * request.area
    duration_hours = round(water_per_irrigation / (fr * 3600), 1)
    duration_hours = max(0.5, min(duration_hours, 12))

    frequency_days = max(1, duration_days // total_irrigations)

    # ── Week-by-week schedule ───────────────────────────────────────────
    weeks = min(duration_days // 7, 16)  # cap at 16 weeks for display
    weekly_schedule: list[dict[str, Any]] = []

    stages = [
        (0.20, "Establishment / seedling phase – light irrigation"),
        (0.30, "Vegetative growth – moderate irrigation"),
        (0.35, "Flowering / fruiting – peak water demand"),
        (0.15, "Maturity / ripening – reduce irrigation"),
    ]

    week_idx = 1
    for fraction, stage_label in stages:
        stage_weeks = max(1, round(weeks * fraction))
        stage_litres = water_litres * fraction / stage_weeks
        for _ in range(stage_weeks):
            if week_idx > weeks:
                break
            weekly_schedule.append({
                "week": week_idx,
                "action": stage_label,
                "amount": f"{stage_litres / 1000:.1f} kL ({stage_litres / (request.area * 10_000):.1f} mm)",
            })
            week_idx += 1

    # ── Tips ────────────────────────────────────────────────────────────
    tips: list[str] = [
        f"Total season water requirement: {effective_mm:.0f} mm over {duration_days} days",
        f"Irrigate every {frequency_days} days for approximately {duration_hours} hours per session",
    ]

    if method_key == "drip":
        tips.append("Check drip emitters weekly for clogging; flush lines monthly")
        tips.append("Fertigation through drip saves 30% fertilizer")
    elif method_key == "sprinkler":
        tips.append("Irrigate early morning or late evening to reduce evaporation")
        tips.append("Maintain uniform pressure across sprinkler heads")
    elif method_key == "flood":
        tips.append("Consider switching to drip or sprinkler to save 40-50% water")
        tips.append("Level the field properly to ensure uniform water distribution")
    elif method_key == "furrow":
        tips.append("Use alternate furrow irrigation to save 30% water")
        tips.append("Ensure furrow gradient is 0.1-0.5% for even flow")

    if soil_key == "sandy":
        tips.append("Sandy soil drains fast – irrigate more frequently with less water each time")
    elif soil_key == "clay":
        tips.append("Clay retains water – avoid over-irrigation to prevent waterlogging")

    return {
        "crop": request.crop,
        "soil_type": request.soil_type,
        "area": request.area,
        "method": request.irrigation_method,
        "water_needed_liters": round(water_litres, 0),
        "frequency_days": frequency_days,
        "duration_hours": duration_hours,
        "schedule": weekly_schedule,
        "tips": tips,
    }
