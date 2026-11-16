"""
CropSense AI – API Integration Tests
Tests all FastAPI endpoints with TestClient.
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app


class TestCropSenseAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "healthy")

    def test_crop_recommendation_api(self):
        payload = {
            "nitrogen": 80,
            "phosphorus": 40,
            "potassium": 40,
            "temperature": 26.0,
            "humidity": 75.0,
            "ph": 6.5,
            "rainfall": 150.0,
            "state": "Karnataka"
        }
        res = self.client.post("/api/crop/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertIsInstance(data.get("crops"), list)

    def test_yield_prediction_api(self):
        payload = {
            "crop": "Wheat",
            "area": 2.0,
            "season": "Rabi",
            "state": "Punjab",
            "soil_type": "Loam"
        }
        res = self.client.post("/api/yield/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))

    def test_market_catalog_and_prices(self):
        cat_res = self.client.get("/api/market/catalog")
        self.assertEqual(cat_res.status_code, 200)

        price_res = self.client.get("/api/market/prices?commodity=Rice&state=Karnataka")
        self.assertEqual(price_res.status_code, 200)
        prices = price_res.json().get("prices", [])
        self.assertGreater(len(prices), 0)

    def test_assistant_chat(self):
        res = self.client.post("/api/assistant/chat", json={"message": "What is the market price for rice?", "language": "en"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertIn("reply", data)

    def test_contact_submission(self):
        payload = {
            "name": "Test Farmer",
            "email": "farmer@example.com",
            "subject": "Inquiry regarding soil test kit",
            "message": "Hello, I want to inquire about soil test kits."
        }
        res = self.client.post("/api/contact", json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json().get("success"))


if __name__ == "__main__":
    unittest.main()
