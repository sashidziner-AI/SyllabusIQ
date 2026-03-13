import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.schemas.question_gen import QuestionGenRequest, QuestionGenResponse, GeneratedMCQ
from app.services.question_generator import generate_questions, get_document_content

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/question-gen", tags=["question-generation"])


@router.post("/generate", response_model=QuestionGenResponse)
async def generate_questions_endpoint(
    req: QuestionGenRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> QuestionGenResponse:
    documents = db.query(Document).filter(
        Document.id.in_(req.document_ids),
        Document.user_id == user.id,
    ).all()

    if len(documents) != len(req.document_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more documents not found",
        )

    for doc in documents:
        if doc.status == DocumentStatus.processing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Document '{doc.original_filename}' is still being processed.",
            )
        if doc.status == DocumentStatus.failed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Document '{doc.original_filename}' processing failed.",
            )

    combined_content = ""
    for doc in documents:
        try:
            content = get_document_content(doc.file_path, doc.file_type)
            combined_content += f"\n\n--- Document: {doc.original_filename} ---\n\n{content}"
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to read document: {doc.original_filename}",
            )

    try:
        result = generate_questions(combined_content.strip(), req.number_of_questions)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )

    has_nos = result.get("has_nos", False)
    questions = result.get("questions", [])

    doc_names = [d.original_filename for d in documents]
    logger.info(
        "Question gen: user=%d docs=%s has_nos=%s count=%d",
        user.id, req.document_ids, has_nos, len(questions),
    )

    return QuestionGenResponse(
        has_nos=has_nos,
        questions=[GeneratedMCQ(**q) for q in questions],
        document_ids=[d.id for d in documents],
        document_names=doc_names,
    )
