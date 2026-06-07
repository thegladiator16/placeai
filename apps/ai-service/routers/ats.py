"""ATS analysis router."""
import time
from fastapi import APIRouter, Header, HTTPException
import os

from models.ats import ATSAnalyzeRequest, ATSAnalysisResult
from services.ats_engine import analyze_resume_ats

router = APIRouter()


def _verify_secret(x_service_secret: str | None) -> None:
    expected = os.environ.get("AI_SERVICE_SECRET", "")
    if not expected or x_service_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid service secret")


@router.post("/analyze", response_model=ATSAnalysisResult)
async def ats_analyze(
    request: ATSAnalyzeRequest,
    x_service_secret: str | None = Header(default=None),
    x_user_tier: str = Header(default="free"),
) -> ATSAnalysisResult:
    _verify_secret(x_service_secret)
    start = time.monotonic()

    result = await analyze_resume_ats(request, user_tier=x_user_tier)

    elapsed_ms = int((time.monotonic() - start) * 1000)
    _ = elapsed_ms  # would log to telemetry in production

    return result
