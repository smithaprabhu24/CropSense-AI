"""
CropSense AI – Predictions Router
Handles all crop advisory prediction endpoints.
"""
from fastapi import APIRouter, HTTPException
from backend.models.schemas import (
    CropRecommendRequest, YieldPredictRequest, IrrigationRequest,
    FertilizerRequest, RiskRequest
)
from backend.engines import crop_engine, yield_engine, irrigation_engine, fertilizer_engine, risk_engine

router = APIRouter(prefix="/api", tags=["predictions"])


@router.post("/crop/recommend")
async def crop_recommend(req: CropRecommendRequest):
    try:
        crops = crop_engine.recommend(req)
        return {"success": True, "crops": crops}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/yield/predict")
async def yield_predict(req: YieldPredictRequest):
    try:
        result = yield_engine.predict(req)
        return {"success": True, "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/irrigation/schedule")
async def irrigation_schedule(req: IrrigationRequest):
    try:
        result = irrigation_engine.schedule(req)
        return {"success": True, "schedule": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fertilizer/recommend")
async def fertilizer_recommend(req: FertilizerRequest):
    try:
        result = fertilizer_engine.recommend(req)
        return {"success": True, "recommendation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/risk/predict")
async def risk_predict(req: RiskRequest):
    try:
        result = risk_engine.predict(req)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
