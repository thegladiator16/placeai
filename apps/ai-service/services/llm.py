"""LLM client with caching and model routing."""
import hashlib
import json
import os
from typing import Any

import anthropic

_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")
        _client = anthropic.AsyncAnthropic(api_key=api_key)
    return _client


async def close_llm_clients() -> None:
    global _client
    if _client:
        await _client.close()
        _client = None


def make_cache_key(feature: str, inputs: dict[str, Any]) -> str:
    payload = f"{feature}:{json.dumps(inputs, sort_keys=True, default=str)}"
    return hashlib.sha256(payload.encode()).hexdigest()


# Cache TTLs per feature (seconds)
CACHE_TTLS: dict[str, int] = {
    "interview_questions": 86400 * 7,
    "ats_keyword_extraction": 86400,
    "cover_letter": 3600 * 4,
    "bullet_rewrite": 3600 * 6,
    "job_description_parse": 86400 * 3,
    "ats_analysis": 3600 * 6,
}

# Model selection per feature and tier
def select_model(feature: str, user_tier: str = "free") -> str:
    quality_critical = {"cover_letter", "bullet_rewrite", "outreach_message", "interview_feedback"}
    if feature in quality_critical and user_tier in ("pro", "elite"):
        return "claude-sonnet-4-6"
    return "claude-haiku-4-5"


async def call_llm(
    system: str,
    user: str,
    feature: str,
    user_tier: str = "free",
    max_tokens: int = 2048,
    temperature: float = 0.3,
) -> str:
    """Call Claude with the selected model. Returns raw text."""
    model = select_model(feature, user_tier)
    client = get_client()

    message = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system,
        messages=[{"role": "user", "content": user}],
    )

    content = message.content[0]
    if content.type != "text":
        raise ValueError(f"Unexpected response type: {content.type}")
    return content.text


async def call_llm_json(
    system: str,
    user: str,
    feature: str,
    user_tier: str = "free",
    max_tokens: int = 3000,
    retries: int = 2,
) -> dict[str, Any]:
    """Call LLM and parse JSON response, with retry on parse failure."""
    for attempt in range(retries + 1):
        text = await call_llm(system, user, feature, user_tier, max_tokens)
        try:
            # Strip markdown code fences if present
            clean = text.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            return json.loads(clean)
        except json.JSONDecodeError:
            if attempt == retries:
                raise ValueError(f"LLM returned non-JSON after {retries + 1} attempts: {text[:200]}")
    raise RuntimeError("unreachable")
