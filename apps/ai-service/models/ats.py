from pydantic import BaseModel, Field
from typing import Literal


class ATSAnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=100, max_length=8000)
    job_description: str = Field(..., min_length=50, max_length=6000)
    job_title: str | None = None
    company_name: str | None = None
    college_name: str | None = None
    graduation_year: int | None = None
    years_of_experience: int = 0


class KeywordMatch(BaseModel):
    keyword: str
    count: int
    importance: Literal["high", "medium", "low"]


class FormatIssue(BaseModel):
    issue: str
    severity: Literal["critical", "warning", "info"]
    fix: str


class BulletSuggestion(BaseModel):
    original: str
    rewritten: str
    reason: str


class SectionScores(BaseModel):
    experience: int = Field(ge=0, le=100)
    skills: int = Field(ge=0, le=100)
    education: int = Field(ge=0, le=100)
    projects: int = Field(ge=0, le=100)


class ATSCompatibility(BaseModel):
    score: int = Field(ge=0, le=100)
    detected_ats: str
    notes: str


class ATSAnalysisResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    keyword_score: int = Field(ge=0, le=100)
    format_score: int = Field(ge=0, le=100)
    section_score: int = Field(ge=0, le=100)
    matched_keywords: list[KeywordMatch]
    missing_keywords: list[KeywordMatch]
    keyword_density: dict[str, int]
    format_issues: list[FormatIssue]
    bullet_suggestions: list[BulletSuggestion]
    section_scores: SectionScores
    ats_compatibility: ATSCompatibility
    overall_feedback: str
    top_3_actions: list[str]
