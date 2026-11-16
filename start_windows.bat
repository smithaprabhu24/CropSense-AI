@echo off
title CropSense AI - Starting Application
echo ============================================================
echo   CropSense AI - AI Crop Advisory ^& Risk Prediction System
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo [2/3] Verifying and generating translations...
python tools\translation_generator.py

echo [3/3] Starting FastAPI Server on http://localhost:8000 ...
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

pause
