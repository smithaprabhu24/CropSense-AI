# CropSense AI – Windows PowerShell Launch Script
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  CropSense AI - AI Crop Advisory & Risk Prediction System" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[1/3] Verifying Python..." -ForegroundColor Cyan
python --version

Write-Host "[2/3] Compiling translations..." -ForegroundColor Cyan
python tools\translation_generator.py

Write-Host "[3/3] Launching FastAPI backend server on http://localhost:8000 ..." -ForegroundColor Cyan
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
