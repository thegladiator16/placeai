"""AI generation router — cover letters, outreach, interview Q&A."""
import os
from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse

from models.generate import (
    CoverLetterRequest,
    ReferralMessageRequest,
    OutreachSequenceRequest,
    InterviewQuestionsRequest,
    InterviewAnswerFeedbackRequest,
)
from services.llm import call_llm, call_llm_json, select_model
from prompts.generate_system import (
    COVER_LETTER_SYSTEM,
    REFERRAL_SYSTEM,
    OUTREACH_SYSTEM,
    INTERVIEW_QUESTIONS_SYSTEM,
    INTERVIEW_FEEDBACK_SYSTEM,
)

router = APIRouter()


def _verify_secret(x_service_secret: str | None) -> None:
    expected = os.environ.get("AI_SERVICE_SECRET", "")
    if not expected or x_service_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid service secret")


@router.post("/cover-letter")
async def generate_cover_letter(
    request: CoverLetterRequest,
    x_service_secret: str | None = Header(default=None),
    x_user_tier: str = Header(default="free"),
) -> dict[str, str]:
    _verify_secret(x_service_secret)

    user_prompt = f"""Write a {request.tone} cover letter.

RESUME SUMMARY:
{request.resume_text[:2000]}

JOB DESCRIPTION:
{request.job_description[:1500]}

ROLE: {request.job_title or "Not specified"}
COMPANY: {request.company_name or "Not specified"}
APPLICANT NAME: {request.user_name or "Applicant"}
CUSTOM POINTS TO INCLUDE: {request.custom_points or "None"}"""

    content = await call_llm(
        system=COVER_LETTER_SYSTEM,
        user=user_prompt,
        feature="cover_letter",
        user_tier=x_user_tier,
        max_tokens=1000,
        temperature=0.7,
    )
    return {"content": content}


@router.post("/referral-message")
async def generate_referral_message(
    request: ReferralMessageRequest,
    x_service_secret: str | None = Header(default=None),
    x_user_tier: str = Header(default="free"),
) -> dict:
    _verify_secret(x_service_secret)

    user_prompt = f"""Generate a personalized referral request message.

USER: {request.user_name}, {request.college_name} {request.graduation_year}
TARGET ROLE: {request.job_title} at {request.company_name}
KEY STRENGTHS: {', '.join(request.top_strengths)}

CONTACT: {request.contact_name}, {request.contact_role} at {request.company_name}
CONNECTION: {request.connection_type}
Same college: {request.same_college} | Same branch: {request.same_branch}

CHANNEL: {request.channel}
LinkedIn message: max 300 chars for connection request
Follow-up: max 500 chars"""

    result = await call_llm_json(
        system=REFERRAL_SYSTEM,
        user=user_prompt,
        feature="outreach_gen",
        user_tier=x_user_tier,
    )
    return result


@router.post("/outreach-sequence")
async def generate_outreach_sequence(
    request: OutreachSequenceRequest,
    x_service_secret: str | None = Header(default=None),
    x_user_tier: str = Header(default="free"),
) -> dict:
    _verify_secret(x_service_secret)

    user_prompt = f"""Generate a 3-step {request.type} sequence.

SENDER: {request.user_name}
TARGET COMPANY: {request.target_company}
TARGET ROLE: {request.target_role or "Open role"}
TARGET CONTACT: {request.target_name or "Recruiter/Hiring Manager"}
RESUME SUMMARY: {request.resume_summary or "Not provided"}"""

    result = await call_llm_json(
        system=OUTREACH_SYSTEM,
        user=user_prompt,
        feature="outreach_gen",
        user_tier=x_user_tier,
    )
    return result


@router.post("/interview-questions")
async def generate_interview_questions(
    request: InterviewQuestionsRequest,
    x_service_secret: str | None = Header(default=None),
    x_user_tier: str = Header(default="free"),
) -> dict:
    _verify_secret(x_service_secret)

    user_prompt = f"""Generate {request.question_count} interview questions.

ROLE: {request.job_title}
COMPANY: {request.company_name or "Not specified"}
SESSION TYPE: {request.session_type}
DIFFICULTY: {request.difficulty}"""

    result = await call_llm_json(
        system=INTERVIEW_QUESTIONS_SYSTEM,
        user=user_prompt,
        feature="interview_question_gen",
        user_tier=x_user_tier,
    )
    return result


@router.post("/interview-feedback")
async def generate_interview_feedback(
    request: InterviewAnswerFeedbackRequest,
    x_service_secret: str | None = Header(default=None),
    x_user_tier: str = Header(default="free"),
) -> dict:
    _verify_secret(x_service_secret)

    user_prompt = f"""Evaluate this interview answer.

QUESTION ({request.question_type}): {request.question}
CANDIDATE ANSWER: {request.answer}
ROLE: {request.job_title}
COMPANY: {request.company_name or "Not specified"}"""

    result = await call_llm_json(
        system=INTERVIEW_FEEDBACK_SYSTEM,
        user=user_prompt,
        feature="interview_question_gen",
        user_tier=x_user_tier,
        max_tokens=1500,
    )
    return result
