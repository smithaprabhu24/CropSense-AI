"""
CropSense AI – Agronomic Engine Unit Tests
Tests rule-based scoring algorithms, yield multipliers, and recommendation accuracy.
"""

import unittest
from backend.engines import crop_engine, yield_engine, irrigation_engine, fertilizer_engine, risk_engine, weather_engine
from backend.models.schemas import CropRecommendRequest, YieldPredictRequest, IrrigationRequest, FertilizerRequest, RiskRequest


class TestAgronomicEngines(unittest.TestCase):

    def test_crop_recommendation(self):
        req = CropRecommendRequest(
            nitrogen=90, phosphorus=40, potassium=40,
            temperature=28, humidity=80, ph=6.5, rainfall=200,
            state="Karnataka"
        )
        crops = crop_engine.recommend(req)
        self.assertIsInstance(crops, list)
        self.assertGreater(len(crops), 0)
        top_crop = crops[0]
        self.assertIn("name", top_crop)
        self.assertIn("score", top_crop)
        self.assertGreaterEqual(top_crop["score"], 0)
        self.assertLessEqual(top_crop["score"], 100)

    def test_yield_prediction(self):
        req = YieldPredictRequest(
            crop="Rice", area=2.0, season="Kharif",
            state="Karnataka", soil_type="Loam"
        )
        res = yield_engine.predict(req)
        self.assertIsInstance(res, dict)
        self.assertEqual(res["crop"], "Rice")
        self.assertGreater(res["estimated_yield"], 0)
        self.assertGreater(res["confidence"], 50)

    def test_irrigation_schedule(self):
        req = IrrigationRequest(
            crop="Wheat", soil_type="Loam", area=1.5,
            season="Rabi", irrigation_method="drip"
        )
        res = irrigation_engine.schedule(req)
        self.assertIsInstance(res, dict)
        self.assertGreater(res["water_needed_liters"], 0)
        self.assertGreater(res["frequency_days"], 0)
        self.assertGreater(len(res["schedule"]), 0)

    def test_fertilizer_recommendation(self):
        req = FertilizerRequest(
            crop="Maize", soil_type="Loam",
            nitrogen=60, phosphorus=30, potassium=30,
            ph=6.8, organic_carbon=0.6
        )
        res = fertilizer_engine.recommend(req)
        self.assertIsInstance(res, dict)
        self.assertIn("recommendations", res)
        self.assertIn("organic", res)

    def test_risk_prediction(self):
        req = RiskRequest(
            crop="Cotton", state="Karnataka", season="Kharif"
        )
        res = risk_engine.predict(req)
        self.assertIsInstance(res, dict)
        self.assertIn("risks", res)
        self.assertGreater(len(res["risks"]), 0)
        self.assertIn("overall_risk_level", res)

    def test_weather_engine(self):
        res = weather_engine.generate_weather("Karnataka", "Bangalore")
        self.assertIn("current", res)
        self.assertIn("forecast", res)
        self.assertEqual(len(res["forecast"]), 7)


if __name__ == "__main__":
    unittest.main()
