import logging

from app.config import settings
from app.services.document_parser import parse_document

logger = logging.getLogger(__name__)

MAX_CONTEXT_CHARS = 80_000

SYSTEM_PROMPT = (
    "You are a helpful assistant that answers questions strictly based on "
    "the provided syllabus document content. If the answer is not found in "
    "the document, clearly state that the information is not available in "
    "the uploaded document. Do not make up information. Be concise and accurate."
)


def answer_question(document_content: str, question: str) -> str:
    """Send document content and user question to AI, return answer."""
    truncated = document_content[:MAX_CONTEXT_CHARS]
    user_message = f"Document content:\n\n{truncated}\n\n---\n\nQuestion: {question}"

    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        try:
            return _answer_with_gemini(user_message)
        except RuntimeError:
            if settings.ANTHROPIC_API_KEY:
                logger.warning("Gemini failed, falling back to Anthropic")
                return _answer_with_anthropic(user_message)
            raise
    elif provider == "anthropic" and settings.ANTHROPIC_API_KEY:
        try:
            return _answer_with_anthropic(user_message)
        except RuntimeError:
            if settings.GEMINI_API_KEY:
                logger.warning("Anthropic failed, falling back to Gemini")
                return _answer_with_gemini(user_message)
            raise
    elif settings.GEMINI_API_KEY:
        try:
            return _answer_with_gemini(user_message)
        except RuntimeError:
            if settings.ANTHROPIC_API_KEY:
                logger.warning("Gemini failed, falling back to Anthropic")
                return _answer_with_anthropic(user_message)
            raise
    elif settings.ANTHROPIC_API_KEY:
        return _answer_with_anthropic(user_message)
    else:
        raise RuntimeError("No AI API key configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY in .env")


def _answer_with_gemini(user_message: str) -> str:
    """Use Google Gemini API."""
    try:
        from google import genai

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{SYSTEM_PROMPT}\n\n{user_message}",
        )

        return response.text or "No response generated."

    except Exception as e:
        logger.error("Gemini API error: %s", str(e))
        raise RuntimeError(f"Failed to get answer from AI: {str(e)}")


def _answer_with_anthropic(user_message: str) -> str:
    """Use Anthropic Claude API."""
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )

        return message.content[0].text

    except Exception as e:
        logger.error("Claude API error: %s", str(e))
        raise RuntimeError(f"Failed to get answer from AI: {str(e)}")


def get_document_content(file_path: str, file_type: str) -> str:
    """Extract text content from a document file."""
    return parse_document(file_path, file_type)
