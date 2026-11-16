"""
CropSense AI - Fertilizer Recommendation Engine
=================================================
Calculates nutrient deficits, converts them to commercial fertilizer
quantities (Urea, DAP, MOP), and generates a phased application schedule
with organic amendments.
"""

from __future__ import annotations

import math
from typing import Any


# ═══════════════════════════════════════════════════════════════════════════
# CROP NUTRIENT NEEDS — recommended N, P₂O₅, K₂O in kg/ha
# ═══════════════════════════════════════════════════════════════════════════

CROP_NUTRIENT_NEEDS: dict[str, dict[str, float]] = {
    "rice":          {"N": 120, "P": 60,  "K": 60},
    "wheat":         {"N": 120, "P": 60,  "K": 40},
    "maize":         {"N": 120, "P": 60,  "K": 40},
    "cotton":        {"N": 120, "P": 60,  "K": 60},
    "sugarcane":     {"N": 250, "P": 100, "K": 120},
    "jowar":         {"N": 80,  "P": 40,  "K": 40},
    "sorghum":       {"N": 80,  "P": 40,  "K": 40},
    "bajra":         {"N": 80,  "P": 40,  "K": 40},
    "pearl millet":  {"N": 80,  "P": 40,  "K": 40},
    "ragi":          {"N": 60,  "P": 40,  "K": 30},
    "finger millet": {"N": 60,  "P": 40,  "K": 30},
    "groundnut":     {"N": 25,  "P": 50,  "K": 45},
    "soybean":       {"N": 30,  "P": 60,  "K": 40},
    "sunflower":     {"N": 90,  "P": 60,  "K": 40},
    "tur":           {"N": 25,  "P": 50,  "K": 30},
    "pigeon pea":    {"N": 25,  "P": 50,  "K": 30},
    "moong":         {"N": 20,  "P": 40,  "K": 20},
    "green gram":    {"N": 20,  "P": 40,  "K": 20},
    "urad":          {"N": 20,  "P": 40,  "K": 20},
    "black gram":    {"N": 20,  "P": 40,  "K": 20},
    "chana":         {"N": 20,  "P": 50,  "K": 30},
    "chickpea":      {"N": 20,  "P": 50,  "K": 30},
    "mustard":       {"N": 80,  "P": 40,  "K": 30},
    "sesame":        {"N": 50,  "P": 30,  "K": 25},
    "coconut":       {"N": 100, "P": 50,  "K": 150},
    "arecanut":      {"N": 100, "P": 40,  "K": 140},
    "turmeric":      {"N": 100, "P": 50,  "K": 80},
    "onion":         {"N": 100, "P": 50,  "K": 50},
    "tomato":        {"N": 120, "P": 80,  "K": 60},
    "potato":        {"N": 150, "P": 80,  "K": 100},
    "chilli":        {"N": 100, "P": 50,  "K": 50},
}

# ── Fertilizer nutrient content ─────────────────────────────────────────
# Urea  → 46 % N
# DAP   → 18 % N + 46 % P₂O₅
# MOP   → 60 % K₂O
# SSP   → 16 % P₂O₅
UREA_N_FRACTION   = 0.46
DAP_N_FRACTION    = 0.18
DAP_P_FRACTION    = 0.46
MOP_K_FRACTION    = 0.60


def recommend(request) -> dict:
    """Generate a fertilizer recommendation plan."""

    crop_key = request.crop.strip().lower()
    needs = CROP_NUTRIENT_NEEDS.get(crop_key)

    if needs is None:
        # Fuzzy match
        for key in CROP_NUTRIENT_NEEDS:
            if key in crop_key or crop_key in key:
                needs = CROP_NUTRIENT_NEEDS[key]
                break
    if needs is None:
        needs = {"N": 100, "P": 50, "K": 50}

    # ── Deficit calculation ─────────────────────────────────────────────
    n_deficit = max(0.0, needs["N"] - request.nitrogen)
    p_deficit = max(0.0, needs["P"] - request.phosphorus)
    k_deficit = max(0.0, needs["K"] - request.potassium)

    # ── Convert to fertilizer quantities ────────────────────────────────
    # Use DAP first (provides both N and P)
    dap_kg = round(p_deficit / DAP_P_FRACTION, 1) if p_deficit > 0 else 0.0
    n_from_dap = dap_kg * DAP_N_FRACTION
    remaining_n = max(0.0, n_deficit - n_from_dap)
    urea_kg = round(remaining_n / UREA_N_FRACTION, 1) if remaining_n > 0 else 0.0
    mop_kg = round(k_deficit / MOP_K_FRACTION, 1) if k_deficit > 0 else 0.0

    recommendations: list[dict[str, Any]] = []

    if dap_kg > 0:
        recommendations.append({
            "fertilizer": "DAP (Di-Ammonium Phosphate)",
            "quantity_kg": dap_kg,
            "timing": "Basal application – at sowing/transplanting",
            "method": "Broadcast and incorporate into soil before sowing",
        })

    if urea_kg > 0:
        # Split urea: 50 % basal (or first top dress), 25 % second, 25 % third
        split1 = round(urea_kg * 0.50, 1)
        split2 = round(urea_kg * 0.25, 1)
        split3 = round(urea_kg * 0.25, 1)
        recommendations.append({
            "fertilizer": "Urea (46-0-0)",
            "quantity_kg": split1,
            "timing": "First top dressing – 21-25 days after sowing",
            "method": "Side dressing in moist soil, followed by light irrigation",
        })
        recommendations.append({
            "fertilizer": "Urea (46-0-0)",
            "quantity_kg": split2,
            "timing": "Second top dressing – 45-50 days after sowing",
            "method": "Band placement near root zone",
        })
        if split3 > 1:
            recommendations.append({
                "fertilizer": "Urea (46-0-0)",
                "quantity_kg": split3,
                "timing": "Third top dressing – 70-75 days (if needed)",
                "method": "Foliar spray (2% urea solution) or side dress",
            })

    if mop_kg > 0:
        recommendations.append({
            "fertilizer": "MOP (Muriate of Potash, 0-0-60)",
            "quantity_kg": mop_kg,
            "timing": "Basal application – at sowing/transplanting",
            "method": "Mix with DAP and broadcast before sowing",
        })

    # ── pH adjustments ──────────────────────────────────────────────────
    warnings: list[str] = []
    if request.ph < 5.5:
        lime_kg = round((5.5 - request.ph) * 500, 0)
        recommendations.append({
            "fertilizer": "Agricultural Lime (CaCO₃)",
            "quantity_kg": lime_kg,
            "timing": "Apply 2-3 weeks before sowing",
            "method": "Broadcast uniformly and plough in",
        })
        warnings.append(f"Soil is acidic (pH {request.ph}). Lime application recommended.")
    elif request.ph > 8.0:
        gypsum_kg = round((request.ph - 8.0) * 400, 0)
        recommendations.append({
            "fertilizer": "Gypsum (CaSO₄·2H₂O)",
            "quantity_kg": gypsum_kg,
            "timing": "Apply before ploughing",
            "method": "Broadcast and incorporate with tillage",
        })
        warnings.append(f"Soil is alkaline (pH {request.ph}). Gypsum application recommended.")

    # ── Organic amendments ──────────────────────────────────────────────
    organic: dict[str, str] = {}
    if request.organic_carbon < 0.3:
        organic = {
            "type": "Well-decomposed FYM (Farmyard Manure)",
            "quantity": "10-12 tonnes/ha – apply 2 weeks before sowing",
        }
        warnings.append("Organic carbon is very low. Heavy organic manure application is critical.")
    elif request.organic_carbon < 0.5:
        organic = {
            "type": "FYM or Vermicompost",
            "quantity": "5-8 tonnes/ha – apply at land preparation",
        }
    else:
        organic = {
            "type": "Vermicompost or Green Manure",
            "quantity": "2-3 tonnes/ha – for maintenance",
        }

    # ── Application schedule ────────────────────────────────────────────
    schedule: list[str] = [
        "Week 0 (Land preparation): Apply DAP + MOP + organic manure basally",
        "Week 3-4: First urea top dressing after weeding",
        "Week 6-7: Second urea top dressing at tillering/branching",
        "Week 10-11: Third urea top dressing at panicle initiation (if required)",
    ]

    # ── Tips ────────────────────────────────────────────────────────────
    tips: list[str] = [
        "Always apply fertilizers in moist soil – never on dry soil",
        "Avoid broadcasting urea on standing water in paddy fields",
        "Neem-coated urea reduces nitrogen losses by 15-20%",
        "Get soil tested every 2 years for precise recommendations",
    ]

    soil_key = request.soil_type.strip().lower() if request.soil_type else ""
    if soil_key == "sandy":
        tips.append("Sandy soils lose nutrients quickly – split N doses into 3-4 applications")
    elif soil_key == "clay" or soil_key == "black":
        tips.append("Heavy soils retain nutrients well – fewer splits may suffice")

    return {
        "crop": request.crop,
        "soil_type": request.soil_type,
        "recommendations": recommendations,
        "organic": organic if organic else None,
        "schedule": schedule,
        "tips": tips,
        "warnings": warnings,
    }
