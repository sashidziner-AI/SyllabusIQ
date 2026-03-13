import json
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.models.generation_job import MCQGenerationJob, JobStatus
from app.models.question import MCQuestion, DifficultyLevel
from app.models.nos_unit import NOSUnit
from app.models.criterion import PerformanceCriterion
from app.services.duplicate_detector import check_duplicate

logger = logging.getLogger(__name__)


def generate_mcqs_for_document(
    db: Session,
    document_id: int,
    user_id: int,
    criteria_ids: list[int] | None = None,
) -> MCQGenerationJob:
    """Create a generation job and generate MCQs for document criteria."""
    if criteria_ids:
        criteria = db.query(PerformanceCriterion).filter(
            PerformanceCriterion.id.in_(criteria_ids)
        ).all()
    else:
        unit_ids = [
            u.id for u in db.query(NOSUnit).filter(NOSUnit.document_id == document_id).all()
        ]
        criteria = db.query(PerformanceCriterion).filter(
            PerformanceCriterion.nos_unit_id.in_(unit_ids)
        ).all() if unit_ids else []

    job = MCQGenerationJob(
        document_id=document_id,
        user_id=user_id,
        status=JobStatus.generating,
        total_criteria=len(criteria),
        processed_criteria=0,
        started_at=datetime.now(timezone.utc),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    existing_questions = [
        q.question_text
        for q in db.query(MCQuestion).filter(MCQuestion.user_id == user_id).all()
    ]

    try:
        for criterion in criteria:
            nos_unit = db.query(NOSUnit).filter(NOSUnit.id == criterion.nos_unit_id).first()
            context = f"NOS Unit: {nos_unit.unit_code} - {nos_unit.unit_title}\n" if nos_unit else ""
            context += f"Criterion: {criterion.criterion_code} - {criterion.criterion_text}"

            mcq_data = generate_mcq_for_criterion(criterion, context)

            if mcq_data:
                is_dup, dup_id = check_duplicate(mcq_data["question_text"], existing_questions)

                question = MCQuestion(
                    generation_job_id=job.id,
                    document_id=document_id,
                    nos_unit_id=criterion.nos_unit_id,
                    criterion_id=criterion.id,
                    user_id=user_id,
                    question_text=mcq_data["question_text"],
                    option_a=mcq_data["option_a"],
                    option_b=mcq_data["option_b"],
                    option_c=mcq_data["option_c"],
                    option_d=mcq_data["option_d"],
                    correct_option=mcq_data["correct_option"],
                    explanation=mcq_data["explanation"],
                    source_page_reference=criterion.page_reference,
                    difficulty_level=mcq_data.get("difficulty_level", DifficultyLevel.medium),
                    is_duplicate=is_dup,
                )
                db.add(question)
                existing_questions.append(mcq_data["question_text"])

            job.processed_criteria += 1
            db.commit()

        job.status = JobStatus.completed
        job.completed_at = datetime.now(timezone.utc)
    except Exception as e:
        job.status = JobStatus.failed
        job.error_message = str(e)
        logger.error("MCQ generation failed for job %d: %s", job.id, str(e))

    db.commit()
    db.refresh(job)
    return job


MCQ_PROMPT_TEMPLATE = """Generate a multiple choice question based on the following educational content.

{context}

Requirements:
1. The question should test understanding of the performance criterion
2. Provide exactly 4 options (A, B, C, D)
3. Only one option should be correct
4. Include a clear explanation of why the correct answer is right
5. Assign a difficulty level (easy, medium, or hard)

Respond in JSON format:
{{
    "question_text": "The question here?",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_option": "A",
    "explanation": "Explanation of why the correct answer is right",
    "difficulty_level": "medium"
}}

Return ONLY the JSON, no other text."""


def generate_mcq_for_criterion(
    criterion: PerformanceCriterion, context: str
) -> dict | None:
    """Generate a single MCQ using the configured AI provider."""
    prompt = MCQ_PROMPT_TEMPLATE.format(context=context)

    provider = settings.AI_PROVIDER.lower()
    response_text = None
    if provider == "gemini" and settings.GEMINI_API_KEY:
        response_text = _call_gemini(prompt)
        if response_text is None and settings.ANTHROPIC_API_KEY:
            logger.warning("Gemini failed, falling back to Anthropic")
            response_text = _call_anthropic(prompt)
    elif provider == "anthropic" and settings.ANTHROPIC_API_KEY:
        response_text = _call_anthropic(prompt)
        if response_text is None and settings.GEMINI_API_KEY:
            logger.warning("Anthropic failed, falling back to Gemini")
            response_text = _call_gemini(prompt)
    elif settings.GEMINI_API_KEY:
        response_text = _call_gemini(prompt)
        if response_text is None and settings.ANTHROPIC_API_KEY:
            logger.warning("Gemini failed, falling back to Anthropic")
            response_text = _call_anthropic(prompt)
    elif settings.ANTHROPIC_API_KEY:
        response_text = _call_anthropic(prompt)
    else:
        logger.error("No AI API key configured")
        return None

    if not response_text:
        return None

    try:
        # Strip markdown code fences if present
        clean = response_text.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            clean = clean.rsplit("```", 1)[0]
        mcq_data = json.loads(clean)

        difficulty = mcq_data.get("difficulty_level", "medium")
        if difficulty in ("easy", "medium", "hard"):
            mcq_data["difficulty_level"] = DifficultyLevel(difficulty)
        else:
            mcq_data["difficulty_level"] = DifficultyLevel.medium

        return mcq_data
    except (json.JSONDecodeError, KeyError) as e:
        logger.error("Failed to parse MCQ response: %s", str(e))
        return None


def _call_gemini(prompt: str) -> str | None:
    try:
        from google import genai

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        logger.error("Gemini API error: %s", str(e))
        return None


def _call_anthropic(prompt: str) -> str | None:
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except Exception as e:
        logger.error("Claude API error: %s", str(e))
        return None
