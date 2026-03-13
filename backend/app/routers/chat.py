import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.qa_chat import answer_question, get_document_content

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/ask", response_model=ChatMessageResponse)
async def ask_question(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> ChatMessageResponse:
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
        answer = answer_question(combined_content.strip(), req.message)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )

    doc_names = [d.original_filename for d in documents]
    logger.info("QA chat: user=%d docs=%s question=%s", user.id, req.document_ids, req.message[:50])

    return ChatMessageResponse(
        answer=answer,
        document_ids=[d.id for d in documents],
        document_names=doc_names,
    )


@router.get("/documents")
async def list_chat_documents(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> list[dict]:
    """List user's documents available for QA chat (uploaded or analyzed)."""
    documents = db.query(Document).filter(
        Document.user_id == user.id,
        Document.status.in_([DocumentStatus.uploaded, DocumentStatus.analyzed]),
    ).order_by(Document.uploaded_at.desc()).all()

    return [
        {
            "id": doc.id,
            "filename": doc.original_filename,
            "file_type": doc.file_type,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        }
        for doc in documents
    ]
