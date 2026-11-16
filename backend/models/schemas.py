"""
CropSense AI – Pydantic Schemas
All request and response models for the API endpoints.
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


# ── Authentication ──────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    village: str = ""
    mobile: str = Field(..., min_length=10, max_length=10)
    pin: str = Field(..., min_length=4, max_length=4)
    language: str = "en"

    @field_validator("mobile")
    @classmethod
    def mobile_must_be_digits(cls, v):
        if not v.isdigit():
            raise ValueError("Mobile number must contain only digits")
        return v

    @field_validator("pin")
    @classmethod
    def pin_must_be_digits(cls, v):
        if not v.isdigit():
            raise ValueError("PIN must contain only digits")
        return v


class UserLogin(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=10)
    pin: str = Field(..., min_length=4, max_length=4)


class UserProfile(BaseModel):
    name: str
    village: str = ""
    mobile: str
    language: str = "en"


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserProfile] = None
    token: Optional[str] = None


# ── Crop Recommendation ────────────────────────────────────────────
class CropRecommendRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=300)
    phosphorus: float = Field(..., ge=0, le=300)
    potassium: float = Field(..., ge=0, le=300)
    temperature: float = Field(..., ge=0, le=50)
    humidity: float = Field(..., ge=0, le=100)
    ph: float = Field(..., ge=0, le=14)
    rainfall: float = Field(..., ge=0, le=500)
    state: str = ""
    district: str = ""


class CropResult(BaseModel):
    name: str
    score: float
    suitable_season: str
    duration_days: int
    profit_rating: int
    tips: str


# ── Yield Prediction ───────────────────────────────────────────────
class YieldPredictRequest(BaseModel):
    crop: str = Field(..., min_length=1)
    area: float = Field(..., gt=0)
    season: str = "Kharif"
    state: str = ""
    soil_type: str = ""


class YieldResult(BaseModel):
    crop: str
    area: float
    season: str
    estimated_yield: float
    unit: str = "tonnes"
    confidence: float
    factors: List[str]
    recommendations: List[str]


# ── Irrigation ──────────────────────────────────────────────────────
class IrrigationRequest(BaseModel):
    crop: str = Field(..., min_length=1)
    soil_type: str = "Loam"
    area: float = Field(..., gt=0)
    season: str = ""
    irrigation_method: str = "drip"


class IrrigationResult(BaseModel):
    crop: str
    soil_type: str
    area: float
    method: str
    water_needed_liters: float
    frequency_days: int
    duration_hours: float
    schedule: List[dict]
    tips: List[str]


# ── Fertilizer ──────────────────────────────────────────────────────
class FertilizerRequest(BaseModel):
    crop: str = Field(..., min_length=1)
    soil_type: str = "Loam"
    nitrogen: float = Field(..., ge=0, le=300)
    phosphorus: float = Field(..., ge=0, le=300)
    potassium: float = Field(..., ge=0, le=300)
    ph: float = Field(7.0, ge=0, le=14)
    organic_carbon: float = Field(0.5, ge=0, le=5)


class FertilizerResult(BaseModel):
    crop: str
    soil_type: str
    recommendations: List[dict]
    organic: dict
    schedule: List[dict]
    tips: List[str]
    warnings: List[str]


# ── Risk Prediction ────────────────────────────────────────────────
class RiskRequest(BaseModel):
    crop: str = Field(..., min_length=1)
    state: str = ""
    season: str = ""
    soil_type: str = ""


class RiskItem(BaseModel):
    type: str
    name: str
    severity: str
    probability: float
    description: str
    mitigation: List[str]
    preventive_measures: List[str]


class RiskResult(BaseModel):
    crop: str
    risks: List[RiskItem]
    overall_risk_level: str
    insurance_recommendation: str


# ── Chat / Assistant ────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    language: str = "en"
    context: str = ""


class ChatResponse(BaseModel):
    success: bool
    reply: str
    language: str
    suggestions: List[str]


# ── Contact ─────────────────────────────────────────────────────────
class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    subject: str = Field(..., min_length=2)
    message: str = Field(..., min_length=5)

    @field_validator("email")
    @classmethod
    def email_must_be_valid(cls, v):
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email address")
        return v


# ── Market ──────────────────────────────────────────────────────────
class MarketPriceItem(BaseModel):
    commodity: str
    market: str
    state: str
    district: str
    min_price: float
    max_price: float
    modal_price: float
    date: str
    trend: str
    unit: str = "Quintal"
