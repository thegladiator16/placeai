from pydantic import BaseModel, Field
from typing import Literal


class CoverLetterRequest(BaseModel):
    resume_text: str = Field(..., min_length=100, max_length=6000)
    job_description: str = Field(..., min_length=50, max_length=4000)
    job_title: str | None = None
    company_name: str | None = None
    tone: Literal["professional", "enthusiastic", "concise"] = "professional"
    custom_points: str | None = None
    user_name: str | None = None


class ReferralMessageRequest(BaseModel):
    user_name: str
    college_name: str
    graduation_year: int
    job_title: str
    company_name: str
    top_strengths: list[str]
    contact_name: str
    contact_role: str
    connection_type: str
    same_college: bool
    same_branch: bool
    channel: Literal["linkedin", "email"] = "linkedin"


class OutreachSequenceRequest(BaseModel):
    type: Literal["linkedin_dm", "email", "referral_request", "recruiter_cold"]
    target_company: str
    target_role: str | None = None
    target_name: str | None = None
    user_name: str
    resume_summary: str | None = None


class InterviewQuestionsRequest(BaseModel):
    job_title: str
    company_name: str | None = None
    session_type: Literal["behavioral", "technical_coding", "system_design", "hr", "custom"]
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    question_count: int = Field(default=10, ge=3, le=15)


class InterviewAnswerFeedbackRequest(BaseModel):
    question: str
    question_type: Literal["behavioral", "technical", "hr"]
    answer: str
    job_title: str
    company_name: str | None = None
