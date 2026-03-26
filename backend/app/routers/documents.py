import logging
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.nos_unit import NOSUnit
from app.models.criterion import PerformanceCriterion
from app.schemas.document import DocumentResponse, DocumentListResponse, NOSUnitResponse, CriterionResponse
from app.services.document_parser import parse_document, extract_nos_units
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"}
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def _get_user_document(db: Session, doc_id: int, user: User) -> Document:
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    project_id: int | None = Query(None),
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File type {ext} not allowed")

    content = await file.read()
    file_size = len(content)
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit")

    file_type = ext.lstrip(".")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        user_id=user.id,
        project_id=project_id,
        filename=unique_name,
        original_filename=file.filename or "unknown",
        file_type=file_type,
        file_size=file_size,
        file_path=file_path,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    logger.info("Document uploaded: %s by user %d", doc.original_filename, user.id)
    return DocumentResponse.model_validate(doc)


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    page: int = 1,
    per_page: int = 10,
    project_id: int | None = Query(None),
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> DocumentListResponse:
    query = db.query(Document).filter(Document.user_id == user.id)
    if project_id is not None:
        query = query.filter(Document.project_id == project_id)
    total = query.count()
    docs = query.order_by(Document.uploaded_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in docs],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    doc = _get_user_document(db, doc_id, user)
    return DocumentResponse.model_validate(doc)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    doc = _get_user_document(db, doc_id, user)
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    db.delete(doc)
    db.commit()
    logger.info("Document deleted: %d by user %d", doc_id, user.id)


@router.post("/{doc_id}/analyze", response_model=DocumentResponse)
async def analyze_document(
    doc_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    doc = _get_user_document(db, doc_id, user)
    if doc.status not in (DocumentStatus.uploaded, DocumentStatus.failed):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document already analyzed or processing")

    doc.status = DocumentStatus.processing
    db.commit()

    try:
        text = parse_document(doc.file_path, doc.file_type)
        nos_data = extract_nos_units(text)

        for i, unit_data in enumerate(nos_data):
            nos_unit = NOSUnit(
                document_id=doc.id,
                unit_code=unit_data["unit_code"],
                unit_title=unit_data["unit_title"],
                description=unit_data.get("description"),
                order_index=i,
            )
            db.add(nos_unit)
            db.flush()
            for j, crit_data in enumerate(unit_data.get("criteria", [])):
                criterion = PerformanceCriterion(
                    nos_unit_id=nos_unit.id,
                    criterion_code=crit_data["criterion_code"],
                    criterion_text=crit_data["criterion_text"],
                    page_reference=crit_data.get("page_reference"),
                    order_index=j,
                )
                db.add(criterion)

        doc.status = DocumentStatus.analyzed
        doc.processed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(doc)
        logger.info("Document analyzed: %d, found %d NOS units", doc_id, len(nos_data))
    except Exception as e:
        doc.status = DocumentStatus.failed
        doc.error_message = str(e)
        db.commit()
        logger.error("Document analysis failed: %d - %s", doc_id, str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Analysis failed")

    return DocumentResponse.model_validate(doc)


@router.get("/{doc_id}/nos-units", response_model=list[NOSUnitResponse])
async def get_nos_units(
    doc_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[NOSUnitResponse]:
    _get_user_document(db, doc_id, user)
    units = db.query(NOSUnit).filter(NOSUnit.document_id == doc_id).order_by(NOSUnit.order_index).all()
    return [NOSUnitResponse.model_validate(u) for u in units]


@router.get("/{doc_id}/criteria", response_model=list[CriterionResponse])
async def get_criteria(
    doc_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[CriterionResponse]:
    _get_user_document(db, doc_id, user)
    unit_ids = [u.id for u in db.query(NOSUnit).filter(NOSUnit.document_id == doc_id).all()]
    if not unit_ids:
        return []
    criteria = db.query(PerformanceCriterion).filter(
        PerformanceCriterion.nos_unit_id.in_(unit_ids)
    ).order_by(PerformanceCriterion.order_index).all()
    return [CriterionResponse.model_validate(c) for c in criteria]
