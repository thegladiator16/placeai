"""ATS analysis engine."""
from models.ats import ATSAnalysisResult, ATSAnalyzeRequest
from prompts.ats_system import ATS_SYSTEM_PROMPT, build_ats_user_prompt
from services.llm import call_llm_json


async def analyze_resume_ats(request: ATSAnalyzeRequest, user_tier: str = "free") -> ATSAnalysisResult:
    user_prompt = build_ats_user_prompt(
        resume_text=request.resume_text,
        job_description=request.job_description,
        job_title=request.job_title,
        company_name=request.company_name,
        college_name=request.college_name,
        graduation_year=request.graduation_year,
        years_of_experience=request.years_of_experience,
    )

    raw = await call_llm_json(
        system=ATS_SYSTEM_PROMPT,
        user=user_prompt,
        feature="ats_analysis",
        user_tier=user_tier,
        max_tokens=3000,
    )

    return ATSAnalysisResult(**raw)
