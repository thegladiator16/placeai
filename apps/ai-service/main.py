"""PlaceAI AI Service — FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import ats, resume, jobs, generate
from services.llm import close_llm_clients

app = FastAPI(
    title="PlaceAI AI Service",
    description="AI backend for resume parsing, ATS analysis, and content generation",
    version="0.0.1",
    docs_url=None,          # disable public docs
    redoc_url=None,
)

# CORS — only allow internal Next.js calls and AI_SERVICE_SECRET header
allowed_origins = [
    "http://localhost:3000",
    "https://app.placeai.in",
    "https://staging.placeai.in",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-Service-Secret"],
)


@app.on_event("shutdown")
async def shutdown_event():
    await close_llm_clients()


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "service": "ai-service"})


# Mount routers
app.include_router(ats.router, prefix="/ats", tags=["ats"])
app.include_router(resume.router, prefix="/resume", tags=["resume"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])
