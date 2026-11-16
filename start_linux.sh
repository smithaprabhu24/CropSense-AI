#!/bin/bash
# CropSense AI – Linux / macOS Startup Script
set -e

echo "============================================================"
echo "  CropSense AI - AI Crop Advisory & Risk Prediction System"
echo "============================================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] Checking Python..."
python3 --version || python --version

echo "[2/3] Generating translations..."
python3 tools/translation_generator.py || python tools/translation_generator.py

echo "[3/3] Starting FastAPI server on http://localhost:8000 ..."
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload || python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
