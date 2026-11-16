"""
CropSense AI - Health Check Router
====================================
Provides a lightweight /api/health endpoint for uptime monitoring and
service-status reporting.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from backend.config import VERSION

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    """Return service health status, version, and current timestamp."""
    return {
        "status": "healthy",
        "version": VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": True,
            "engines": True,
        },
    }
