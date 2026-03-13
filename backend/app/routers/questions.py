import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.document import Document
from app.models.question import MCQuestion, QuestionTag, DifficultyLevel
from app.schemas.question import (
    QuestionResponse, QuestionListResponse, QuestionUpdate,
    TagCreate, QuestionStatsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/questions", tags=["questions"])


def _get_user_question(db: Session, question_id: int, user: User) -> MCQuestion:
    q = db.query(MCQuestion).filter(
        MCQuestion.id == question_id, MCQuestion.user_id == user.id
    ).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return q


@router.get("/stats", response_model=QuestionStatsResponse)
async def get_stats(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> QuestionStatsResponse:
    base = db.query(MCQuestion).filter(MCQuestion.user_id == user.id)
    total = base.count()
    duplicates_count = base.filter(MCQuestion.is_duplicate.is_(True)).count()

    by_difficulty: dict[str, int] = {}
    for level in DifficultyLevel:
        count = base.filter(MCQuestion.difficulty_level == level).count()
        by_difficulty[level.value] = count

    by_document: dict[str, int] = {}
    docs = db.query(Document).filter(Document.user_id == user.id).all()
    for doc in docs:
        count = base.filter(MCQuestion.document_id == doc.id).count()
        if count > 0:
            by_document[doc.original_filename] = count

    return QuestionStatsResponse(
        total=total,
        by_difficulty=by_difficulty,
        by_document=by_document,
        duplicates_count=duplicates_count,
    )


@router.get("/duplicates", response_model=list[QuestionResponse])
async def get_duplicates(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[QuestionResponse]:
    questions = db.query(MCQuestion).filter(
        MCQuestion.user_id == user.id,
        MCQuestion.is_duplicate.is_(True),
    ).all()
    return [QuestionResponse.model_validate(q) for q in questions]


@router.get("", response_model=QuestionListResponse)
async def list_questions(
    page: int = 1,
    per_page: int = 20,
    q: str | None = None,
    document_id: int | None = None,
    nos_unit_id: int | None = None,
    difficulty: str | None = None,
    is_duplicate: bool | None = None,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> QuestionListResponse:
    query = db.query(MCQuestion).filter(MCQuestion.user_id == user.id)
    if q:
        query = query.filter(MCQuestion.question_text.ilike(f"%{q}%"))
    if document_id:
        query = query.filter(MCQuestion.document_id == document_id)
    if nos_unit_id:
        query = query.filter(MCQuestion.nos_unit_id == nos_unit_id)
    if difficulty:
        query = query.filter(MCQuestion.difficulty_level == difficulty)
    if is_duplicate is not None:
        query = query.filter(MCQuestion.is_duplicate == is_duplicate)

    total = query.count()
    questions = query.order_by(MCQuestion.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return QuestionListResponse(
        questions=[QuestionResponse.model_validate(q) for q in questions],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> QuestionResponse:
    q = _get_user_question(db, question_id, user)
    return QuestionResponse.model_validate(q)


@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    update: QuestionUpdate,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> QuestionResponse:
    q = _get_user_question(db, question_id, user)
    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(q, field, value)
    db.commit()
    db.refresh(q)
    return QuestionResponse.model_validate(q)


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    q = _get_user_question(db, question_id, user)
    db.delete(q)
    db.commit()


@router.post("/{question_id}/tags", response_model=QuestionResponse)
async def add_tags(
    question_id: int,
    tags: list[TagCreate],
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> QuestionResponse:
    q = _get_user_question(db, question_id, user)
    for tag_data in tags:
        tag = db.query(QuestionTag).filter(QuestionTag.name == tag_data.name).first()
        if not tag:
            tag = QuestionTag(name=tag_data.name)
            db.add(tag)
            db.flush()
        if tag not in q.tags:
            q.tags.append(tag)
    db.commit()
    db.refresh(q)
    return QuestionResponse.model_validate(q)
