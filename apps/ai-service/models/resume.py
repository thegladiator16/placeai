from pydantic import BaseModel


class ParseResumeRequest(BaseModel):
    file_url: str
    file_name: str
    user_id: str
    resume_id: str


class ParsedResume(BaseModel):
    resume_id: str
    personal_info: dict
    summary: str | None
    education: list[dict]
    experience: list[dict]
    projects: list[dict]
    skills: dict
    certifications: list[dict]
    achievements: list[str]
    raw_text: str
    word_count: int
    page_count: int
    extracted_skills: list[str]
