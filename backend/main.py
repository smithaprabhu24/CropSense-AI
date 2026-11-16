"""
CropSense AI – Main FastAPI Application
Entry point that mounts all routers, static files, CORS, and serves the frontend.
"""
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.config import APP_NAME, VERSION, HOST, PORT, CORS_ORIGINS, FRONTEND_DIR, DATA_DIR
from backend.routers import health, auth, predictions, market, assistant, contact

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="AI-Based Crop Advisory & Risk Prediction System",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(market.router)
app.include_router(assistant.router)
app.include_router(contact.router)


@app.on_event("startup")
async def startup():
    """Ensure data directory and initial JSON files exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for fname, default in [("users.json", "{}"), ("contacts.json", "[]")]:
        fpath = DATA_DIR / fname
        if not fpath.exists():
            fpath.write_text(default, encoding="utf-8")


# Serve frontend static files
app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")


@app.get("/manifest.json")
async def manifest():
    return FileResponse(str(FRONTEND_DIR / "manifest.json"))


@app.get("/service-worker.js")
async def service_worker():
    return FileResponse(str(FRONTEND_DIR / "service-worker.js"), media_type="application/javascript")


@app.get("/login")
@app.get("/login.html")
async def login_page():
    return FileResponse(str(FRONTEND_DIR / "login.html"))


@app.get("/portal")
@app.get("/portal.html")
async def portal_page():
    return FileResponse(str(FRONTEND_DIR / "portal.html"))


@app.get("/")
@app.get("/index.html")
async def index_page():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
