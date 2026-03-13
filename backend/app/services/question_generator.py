import json
import logging

from app.config import settings
from app.services.document_parser import parse_document

logger = logging.getLogger(__name__)

MAX_CONTEXT_CHARS = 40_000

QUESTION_GEN_PROMPT = """Generate exactly {number_of_questions} MCQs from this document. Rules:
- Use ONLY document content, no external knowledge
- Each MCQ: 4 options (A/B/C/D), one correct, test conceptual understanding
- Check if NOS (National Occupational Standards) modules exist in document
- If NOS found: set has_nos=true, include nos_code/nos_name per question
- If no NOS: set has_nos=false, set nos_code/nos_name to null
- Include performance_criteria, explanation, page_reference for each question

Return ONLY this JSON:
{{"has_nos":true/false,"questions":[{{"nos_code":"code or null","nos_name":"name or null","performance_criteria":"PC text","question":"Q","option_a":"A","option_b":"B","option_c":"C","option_d":"D","correct_answer":"A/B/C/D","explanation":"why correct","page_reference":"Page X"}}]}}

Document:
{document_content}"""


def generate_questions(document_content: str, number_of_questions: int = 10) -> dict:
    """Generate MCQs from document content using AI."""
    truncated = document_content[:MAX_CONTEXT_CHARS]
    prompt = QUESTION_GEN_PROMPT.format(
        number_of_questions=number_of_questions,
        document_content=truncated,
    )

    provider = settings.AI_PROVIDER.lower()
    raw = None

    # Try primary provider first, fallback to the other on failure
    if provider == "gemini" and settings.GEMINI_API_KEY:
        try:
            raw = _generate_with_gemini(prompt)
        except RuntimeError:
            if settings.ANTHROPIC_API_KEY:
                logger.warning("Gemini failed, falling back to Anthropic")
                raw = _generate_with_anthropic(prompt)
            else:
                raise
    elif provider == "anthropic" and settings.ANTHROPIC_API_KEY:
        try:
            raw = _generate_with_anthropic(prompt)
        except RuntimeError:
            if settings.GEMINI_API_KEY:
                logger.warning("Anthropic failed, falling back to Gemini")
                raw = _generate_with_gemini(prompt)
            else:
                raise
    elif settings.GEMINI_API_KEY:
        try:
            raw = _generate_with_gemini(prompt)
        except RuntimeError:
            if settings.ANTHROPIC_API_KEY:
                logger.warning("Gemini failed, falling back to Anthropic")
                raw = _generate_with_anthropic(prompt)
            else:
                raise
    elif settings.ANTHROPIC_API_KEY:
        raw = _generate_with_anthropic(prompt)
    else:
        raise RuntimeError("No AI API key configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY in .env")

    return _parse_response(raw)


def _generate_with_gemini(prompt: str) -> str:
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=0),
                temperature=0.3,
            ),
        )
        return response.text or ""
    except Exception as e:
        logger.error("Gemini API error: %s", str(e))
        raise RuntimeError(f"Failed to generate questions: {str(e)}")


def _generate_with_anthropic(prompt: str) -> str:
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except Exception as e:
        logger.error("Claude API error: %s", str(e))
        raise RuntimeError(f"Failed to generate questions: {str(e)}")


def _parse_response(raw: str) -> dict:
    """Parse AI response JSON, stripping code fences if present."""
    text = raw.strip()
    if text.startswith("```"):
        first_newline = text.index("\n")
        text = text[first_newline + 1:]
    if text.endswith("```"):
        text = text[:-3].strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.error("Failed to parse question generation response: %s", raw[:500])
        raise RuntimeError("Failed to parse AI response as JSON")

    if "questions" not in data or not isinstance(data["questions"], list):
        raise RuntimeError("Invalid response format from AI")

    return data


def get_document_content(file_path: str, file_type: str) -> str:
    """Extract text content from a document file."""
    return parse_document(file_path, file_type)
