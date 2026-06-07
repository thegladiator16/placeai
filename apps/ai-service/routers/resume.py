"""Resume parsing router."""
import httpx
import os
from fastapi import APIRouter, Header, HTTPException

from models.resume import ParseResumeRequest, ParsedResume
from services.parser import extract_text, count_words, detect_page_count

router = APIRouter()


def _verify_secret(x_service_secret: str | None) -> None:
    expected = os.environ.get("AI_SERVICE_SECRET", "")
    if not expected or x_service_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid service secret")


@router.post("/parse", response_model=ParsedResume)
async def parse_resume(
    request: ParseResumeRequest,
    x_service_secret: str | None = Header(default=None),
) -> ParsedResume:
    _verify_secret(x_service_secret)

    # Download file from R2/S3
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(request.file_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download resume file")
        content = resp.content

    raw_text = extract_text(content, request.file_name)
    word_count = count_words(raw_text)
    page_count = detect_page_count(content, request.file_name)

    # For Phase 1, return structured output from raw text parsing
    # Phase 2 will add spaCy NER for deeper extraction
    return ParsedResume(
        resume_id=request.resume_id,
        personal_info={},
        summary=None,
        education=[],
        experience=[],
        projects=[],
        skills={},
        certifications=[],
        achievements=[],
        raw_text=raw_text,
        word_count=word_count,
        page_count=page_count,
        extracted_skills=_extract_skills_simple(raw_text),
    )


# Simple keyword-based skill extraction (Phase 1)
TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#",
    "React", "Next.js", "Vue", "Angular", "Node.js", "Django", "FastAPI", "Spring Boot",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
    "REST APIs", "GraphQL", "Kafka", "RabbitMQ",
    "Git", "CI/CD", "GitHub Actions", "Jenkins",
    "Machine Learning", "TensorFlow", "PyTorch", "scikit-learn",
    "System Design", "Microservices", "Distributed Systems",
]


def _extract_skills_simple(text: str) -> list[str]:
    text_lower = text.lower()
    return [skill for skill in TECH_SKILLS if skill.lower() in text_lower]
