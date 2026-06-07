"""Job matching router."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def jobs_health() -> dict[str, str]:
    return {"status": "ok", "service": "jobs"}
