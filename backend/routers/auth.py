"""
CropSense AI - Authentication Router
======================================
PIN-based authentication for mobile users.  Stores user records in a
JSON file with PBKDF2-hashed PINs and random salts.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from backend.config import DATA_DIR, PIN_HASH_ALGORITHM, PIN_HASH_ITERATIONS
from backend.models.schemas import (
    AuthResponse,
    UserLogin,
    UserProfile,
    UserRegister,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

USERS_FILE: Path = DATA_DIR / "users.json"


# ═══════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

def _ensure_data_dir() -> None:
    """Create the data directory and users file if they don't exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not USERS_FILE.exists():
        USERS_FILE.write_text("{}", encoding="utf-8")


def load_users() -> dict[str, Any]:
    """Load the users dictionary from the JSON file."""
    _ensure_data_dir()
    try:
        text = USERS_FILE.read_text(encoding="utf-8").strip()
        if not text:
            return {}
        return json.loads(text)
    except (json.JSONDecodeError, OSError):
        return {}


def save_users(data: dict[str, Any]) -> None:
    """Persist the users dictionary to the JSON file."""
    _ensure_data_dir()
    USERS_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def hash_pin(pin: str, salt: bytes) -> str:
    """Hash a PIN using PBKDF2-HMAC-SHA256 with the given salt.

    Returns the hex-encoded derived key.
    """
    dk = hashlib.pbkdf2_hmac(
        PIN_HASH_ALGORITHM,
        pin.encode("utf-8"),
        salt,
        PIN_HASH_ITERATIONS,
    )
    return dk.hex()


def verify_pin(pin: str, stored_hash: str, salt_hex: str) -> bool:
    """Verify a PIN against its stored hash and salt."""
    salt = bytes.fromhex(salt_hex)
    return hash_pin(pin, salt) == stored_hash


# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/register", response_model=AuthResponse)
async def register(payload: UserRegister) -> AuthResponse:
    """Register a new user with mobile number and 4-digit PIN."""

    users = load_users()

    # Check if mobile already registered
    if payload.mobile in users:
        return AuthResponse(
            success=False,
            message="Mobile number is already registered. Please login instead.",
        )

    # Generate salt and hash the PIN
    salt = os.urandom(32)
    pin_hash = hash_pin(payload.pin, salt)

    # Store user record
    users[payload.mobile] = {
        "name": payload.name,
        "village": payload.village,
        "mobile": payload.mobile,
        "pin_hash": pin_hash,
        "salt": salt.hex(),
        "language": payload.language,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    save_users(users)

    profile = UserProfile(
        name=payload.name,
        village=payload.village,
        mobile=payload.mobile,
        language=payload.language,
    )

    return AuthResponse(
        success=True,
        message="Registration successful! Welcome to CropSense AI.",
        user=profile,
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin) -> AuthResponse:
    """Authenticate a user by mobile number and PIN."""

    users = load_users()

    user_record = users.get(payload.mobile)
    if user_record is None:
        return AuthResponse(
            success=False,
            message="Mobile number not found. Please register first.",
        )

    # Verify PIN
    if not verify_pin(payload.pin, user_record["pin_hash"], user_record["salt"]):
        return AuthResponse(
            success=False,
            message="Incorrect PIN. Please try again.",
        )

    # Generate a simple token (base64 of mobile:timestamp)
    raw_token = f"{payload.mobile}:{int(time.time())}"
    token = base64.b64encode(raw_token.encode("utf-8")).decode("utf-8")

    profile = UserProfile(
        name=user_record["name"],
        village=user_record.get("village", ""),
        mobile=user_record["mobile"],
        language=user_record.get("language", "en"),
    )

    return AuthResponse(
        success=True,
        message="Login successful!",
        user=profile,
        token=token,
    )
