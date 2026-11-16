"""
CropSense AI – Contact Router
Handles contact form submissions and stores them in JSON.
"""
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend.models.schemas import ContactRequest
from backend.config import DATA_DIR

router = APIRouter(prefix="/api", tags=["contact"])


def _load_contacts():
    path = DATA_DIR / "contacts.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_contacts(data):
    path = DATA_DIR / "contacts.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@router.post("/contact")
async def submit_contact(req: ContactRequest):
    try:
        contacts = _load_contacts()
        contacts.append({
            "name": req.name,
            "email": req.email,
            "subject": req.subject,
            "message": req.message,
            "timestamp": datetime.now().isoformat(),
        })
        _save_contacts(contacts)
        return {"success": True, "message": "Thank you for your message. We will get back to you soon."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
