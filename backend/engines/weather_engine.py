"""
CropSense AI - Weather Simulation Engine
==========================================
Generates realistic weather data for Indian states and districts for demo
purposes.  Uses seasonal baselines and adds realistic stochastic variation.
"""

from __future__ import annotations

import math
import random
from datetime import datetime, timedelta
from typing import Any


# ═══════════════════════════════════════════════════════════════════════════
# SEASONAL BASELINES — (temp_min, temp_max, humidity, rainfall_mm/month)
# keyed by month-range buckets
# ═══════════════════════════════════════════════════════════════════════════

# Region clusters for India
REGION_PROFILES: dict[str, dict[str, Any]] = {
    "south_plateau": {
        # Karnataka, Telangana, northern TN, northern AP
        "states": ["karnataka", "telangana"],
        "monthly": {
            1:  {"temp_low": 16, "temp_high": 30, "humidity": 50, "rain": 5,  "condition": "Sunny"},
            2:  {"temp_low": 18, "temp_high": 33, "humidity": 45, "rain": 3,  "condition": "Sunny"},
            3:  {"temp_low": 21, "temp_high": 36, "humidity": 40, "rain": 5,  "condition": "Partly Cloudy"},
            4:  {"temp_low": 24, "temp_high": 38, "humidity": 45, "rain": 20, "condition": "Partly Cloudy"},
            5:  {"temp_low": 24, "temp_high": 39, "humidity": 50, "rain": 40, "condition": "Partly Cloudy"},
            6:  {"temp_low": 22, "temp_high": 33, "humidity": 70, "rain": 100,"condition": "Light Rain"},
            7:  {"temp_low": 21, "temp_high": 30, "humidity": 80, "rain": 150,"condition": "Heavy Rain"},
            8:  {"temp_low": 21, "temp_high": 30, "humidity": 80, "rain": 140,"condition": "Heavy Rain"},
            9:  {"temp_low": 21, "temp_high": 31, "humidity": 75, "rain": 130,"condition": "Light Rain"},
            10: {"temp_low": 20, "temp_high": 31, "humidity": 70, "rain": 100,"condition": "Light Rain"},
            11: {"temp_low": 18, "temp_high": 30, "humidity": 60, "rain": 30, "condition": "Partly Cloudy"},
            12: {"temp_low": 16, "temp_high": 29, "humidity": 55, "rain": 10, "condition": "Sunny"},
        },
    },
    "south_coastal": {
        "states": ["tamil nadu", "andhra pradesh"],
        "monthly": {
            1:  {"temp_low": 20, "temp_high": 30, "humidity": 65, "rain": 20, "condition": "Partly Cloudy"},
            2:  {"temp_low": 21, "temp_high": 32, "humidity": 60, "rain": 10, "condition": "Sunny"},
            3:  {"temp_low": 23, "temp_high": 34, "humidity": 55, "rain": 8,  "condition": "Sunny"},
            4:  {"temp_low": 26, "temp_high": 36, "humidity": 60, "rain": 15, "condition": "Partly Cloudy"},
            5:  {"temp_low": 27, "temp_high": 38, "humidity": 55, "rain": 30, "condition": "Partly Cloudy"},
            6:  {"temp_low": 26, "temp_high": 36, "humidity": 60, "rain": 45, "condition": "Light Rain"},
            7:  {"temp_low": 25, "temp_high": 35, "humidity": 65, "rain": 60, "condition": "Light Rain"},
            8:  {"temp_low": 25, "temp_high": 34, "humidity": 70, "rain": 80, "condition": "Light Rain"},
            9:  {"temp_low": 24, "temp_high": 34, "humidity": 75, "rain": 120,"condition": "Heavy Rain"},
            10: {"temp_low": 23, "temp_high": 32, "humidity": 80, "rain": 180,"condition": "Heavy Rain"},
            11: {"temp_low": 22, "temp_high": 30, "humidity": 80, "rain": 200,"condition": "Heavy Rain"},
            12: {"temp_low": 20, "temp_high": 29, "humidity": 70, "rain": 80, "condition": "Light Rain"},
        },
    },
    "west_central": {
        "states": ["maharashtra", "madhya pradesh", "gujarat"],
        "monthly": {
            1:  {"temp_low": 12, "temp_high": 30, "humidity": 40, "rain": 3,  "condition": "Sunny"},
            2:  {"temp_low": 14, "temp_high": 33, "humidity": 35, "rain": 2,  "condition": "Sunny"},
            3:  {"temp_low": 18, "temp_high": 37, "humidity": 30, "rain": 3,  "condition": "Sunny"},
            4:  {"temp_low": 23, "temp_high": 40, "humidity": 30, "rain": 5,  "condition": "Sunny"},
            5:  {"temp_low": 26, "temp_high": 42, "humidity": 35, "rain": 10, "condition": "Partly Cloudy"},
            6:  {"temp_low": 24, "temp_high": 36, "humidity": 65, "rain": 150,"condition": "Heavy Rain"},
            7:  {"temp_low": 23, "temp_high": 32, "humidity": 80, "rain": 250,"condition": "Heavy Rain"},
            8:  {"temp_low": 23, "temp_high": 31, "humidity": 82, "rain": 200,"condition": "Heavy Rain"},
            9:  {"temp_low": 22, "temp_high": 33, "humidity": 75, "rain": 130,"condition": "Light Rain"},
            10: {"temp_low": 19, "temp_high": 34, "humidity": 55, "rain": 40, "condition": "Partly Cloudy"},
            11: {"temp_low": 15, "temp_high": 32, "humidity": 45, "rain": 10, "condition": "Sunny"},
            12: {"temp_low": 12, "temp_high": 30, "humidity": 40, "rain": 5,  "condition": "Sunny"},
        },
    },
    "north_plains": {
        "states": ["uttar pradesh", "punjab", "haryana", "rajasthan"],
        "monthly": {
            1:  {"temp_low": 4,  "temp_high": 20, "humidity": 60, "rain": 15, "condition": "Cloudy"},
            2:  {"temp_low": 7,  "temp_high": 23, "humidity": 55, "rain": 18, "condition": "Partly Cloudy"},
            3:  {"temp_low": 12, "temp_high": 30, "humidity": 40, "rain": 10, "condition": "Sunny"},
            4:  {"temp_low": 18, "temp_high": 37, "humidity": 30, "rain": 5,  "condition": "Sunny"},
            5:  {"temp_low": 24, "temp_high": 42, "humidity": 25, "rain": 10, "condition": "Sunny"},
            6:  {"temp_low": 26, "temp_high": 40, "humidity": 45, "rain": 60, "condition": "Partly Cloudy"},
            7:  {"temp_low": 26, "temp_high": 35, "humidity": 75, "rain": 200,"condition": "Heavy Rain"},
            8:  {"temp_low": 25, "temp_high": 34, "humidity": 78, "rain": 220,"condition": "Heavy Rain"},
            9:  {"temp_low": 23, "temp_high": 34, "humidity": 65, "rain": 100,"condition": "Light Rain"},
            10: {"temp_low": 16, "temp_high": 33, "humidity": 50, "rain": 15, "condition": "Sunny"},
            11: {"temp_low": 9,  "temp_high": 28, "humidity": 50, "rain": 5,  "condition": "Sunny"},
            12: {"temp_low": 5,  "temp_high": 22, "humidity": 60, "rain": 8,  "condition": "Cloudy"},
        },
    },
}

# Default profile
DEFAULT_PROFILE = "south_plateau"

CONDITIONS_DESCRIPTIONS: dict[str, str] = {
    "Sunny": "Clear skies with bright sunshine",
    "Partly Cloudy": "Mix of sun and clouds, pleasant conditions",
    "Cloudy": "Overcast skies, cool and grey",
    "Light Rain": "Intermittent showers expected, carry umbrella",
    "Heavy Rain": "Continuous rain expected, possible waterlogging",
    "Thunderstorm": "Thunder, lightning, and heavy downpour expected",
}


def _get_profile(state: str) -> dict:
    """Get the weather profile for a given state."""
    state_lower = state.strip().lower() if state else ""
    for _key, profile in REGION_PROFILES.items():
        if state_lower in profile["states"]:
            return profile
    return REGION_PROFILES[DEFAULT_PROFILE]


def generate_weather(state: str = "", district: str = "") -> dict:
    """Generate current weather and 7-day forecast for a location."""

    profile = _get_profile(state)
    now = datetime.now()
    month = now.month
    monthly = profile["monthly"].get(month, profile["monthly"][1])

    # ── Current weather (with slight randomness) ────────────────────────
    current_temp = round(
        random.uniform(monthly["temp_low"] + 2, monthly["temp_high"] - 2), 1
    )
    current_humidity = min(100, max(10, monthly["humidity"] + random.randint(-10, 10)))
    wind_speed = round(random.uniform(5, 25), 1)

    # Adjust condition based on rain probability
    rain_mm = monthly["rain"]
    if rain_mm > 150:
        conditions = ["Heavy Rain", "Thunderstorm", "Light Rain"]
    elif rain_mm > 50:
        conditions = ["Light Rain", "Partly Cloudy", "Cloudy"]
    elif rain_mm > 15:
        conditions = ["Partly Cloudy", "Sunny", "Cloudy"]
    else:
        conditions = ["Sunny", "Partly Cloudy", "Sunny"]

    current_condition = random.choice(conditions)

    current = {
        "temp": current_temp,
        "humidity": current_humidity,
        "wind_speed": wind_speed,
        "condition": current_condition,
        "description": CONDITIONS_DESCRIPTIONS.get(
            current_condition, "Variable weather conditions"
        ),
    }

    # ── 7-day forecast ──────────────────────────────────────────────────
    forecast: list[dict[str, Any]] = []
    for day_offset in range(1, 8):
        forecast_date = now + timedelta(days=day_offset)
        forecast_month = forecast_date.month
        fm = profile["monthly"].get(forecast_month, monthly)

        temp_high = round(fm["temp_high"] + random.uniform(-2, 2), 1)
        temp_low = round(fm["temp_low"] + random.uniform(-2, 2), 1)
        humidity = min(100, max(10, fm["humidity"] + random.randint(-10, 10)))

        rain_chance = min(95, max(5, int(fm["rain"] / 3 + random.randint(-10, 15))))

        if rain_chance > 60:
            day_cond = random.choice(["Heavy Rain", "Thunderstorm", "Light Rain"])
        elif rain_chance > 30:
            day_cond = random.choice(["Light Rain", "Partly Cloudy", "Cloudy"])
        else:
            day_cond = random.choice(["Sunny", "Partly Cloudy"])

        forecast.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "temp_high": temp_high,
            "temp_low": temp_low,
            "humidity": humidity,
            "rainfall_chance": rain_chance,
            "condition": day_cond,
        })

    # ── Advisory ────────────────────────────────────────────────────────
    advisories: list[str] = []
    if rain_mm > 150:
        advisories.append("Heavy monsoon rains expected. Ensure field drainage is clear.")
        advisories.append("Avoid spraying pesticides during heavy rain – they will wash off.")
        advisories.append("Postpone fertilizer application until rain subsides.")
    elif rain_mm > 50:
        advisories.append("Moderate rainfall expected. Good conditions for sowing kharif crops.")
        advisories.append("Monitor soil moisture – supplemental irrigation may not be needed.")
    elif current_temp > 38:
        advisories.append("Heat wave conditions. Irrigate crops early morning or late evening.")
        advisories.append("Use mulching to conserve soil moisture and reduce heat stress.")
        advisories.append("Provide shade for nurseries and young transplants.")
    elif current_temp < 10:
        advisories.append("Cold wave alert. Protect tender crops from frost damage.")
        advisories.append("Light irrigation in the evening can prevent frost injury.")
    else:
        advisories.append("Favourable weather conditions for field operations.")
        advisories.append("Good time for sowing, transplanting, and fertilizer application.")

    advisory = " | ".join(advisories)

    return {
        "current": current,
        "forecast": forecast,
        "advisory": advisory,
    }
