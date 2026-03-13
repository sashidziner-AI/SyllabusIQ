import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.generation_job import MCQGenerationJob, JobStatus
from app.models.question import MCQuestion
from app.schemas.generate import GenerateRequest, GenerationJobResponse, MCQuestionResponse
from app.services.mcq_generator import generate_mcqs_for_document

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post("/{document_id}", response_model=GenerationJobResponse, status_code=status.HTTP_201_CREATED)
async def start_generation(
    document_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> GenerationJobResponse:
    doc = db.query(Document).filter(
        Document.id == document_id, Document.user_id == user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.status != DocumentStatus.analyzed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document must be analyzed first")

    job = generate_mcqs_for_document(db, document_id, user.id)
    logger.info("Generation started: job %d for document %d", job.id, document_id)
    return GenerationJobResponse.model_validate(job)


@router.get("/{job_id}/status", response_model=GenerationJobResponse)
async def get_job_status(
    job_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> GenerationJobResponse:
    job = db.query(MCQGenerationJob).filter(
        MCQGenerationJob.id == job_id, MCQGenerationJob.user_id == user.id
    ).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return GenerationJobResponse.model_validate(job)


@router.post("/{document_id}/criteria", response_model=GenerationJobResponse, status_code=status.HTTP_201_CREATED)
async def generate_for_criteria(
    document_id: int,
    req: GenerateRequest,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> GenerationJobResponse:
    doc = db.query(Document).filter(
        Document.id == document_id, Document.user_id == user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.status != DocumentStatus.analyzed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document must be analyzed first")

    job = generate_mcqs_for_document(db, document_id, user.id, criteria_ids=req.criteria_ids)
    return GenerationJobResponse.model_validate(job)


@router.get("/{job_id}/results", response_model=list[MCQuestionResponse])
async def get_job_results(
    job_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[MCQuestionResponse]:
    job = db.query(MCQGenerationJob).filter(
        MCQGenerationJob.id == job_id, MCQGenerationJob.user_id == user.id
    ).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    questions = db.query(MCQuestion).filter(MCQuestion.generation_job_id == job_id).all()
    return [MCQuestionResponse.model_validate(q) for q in questions]
