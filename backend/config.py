"""
CropSense AI – Application Configuration
Centralizes all configuration using environment variables with sensible defaults.
"""
import os
from pathlib import Path

APP_NAME = "CropSense AI"
VERSION = "1.0.0"
HOST = os.getenv("CROPSENSE_HOST", "0.0.0.0")
PORT = int(os.getenv("CROPSENSE_PORT", "8000"))

CORS_ORIGINS = ["*"]

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIR = BASE_DIR.parent / "frontend"

AGMARKNET_API_KEY = os.getenv("AGMARKNET_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

SECRET_KEY = os.getenv("CROPSENSE_SECRET_KEY", "cropsense-dev-secret-key-change-in-production")
PIN_HASH_ALGORITHM = "sha256"
PIN_HASH_ITERATIONS = 100_000
