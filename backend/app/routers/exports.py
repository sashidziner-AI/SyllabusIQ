import logging
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.export_job import ExportJob
from app.schemas.export import ExportCreate, ExportJobResponse
from app.services.excel_exporter import create_export

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/exports", tags=["exports"])


@router.post("", response_model=ExportJobResponse, status_code=status.HTTP_201_CREATED)
async def create_export_job(
    req: ExportCreate,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ExportJobResponse:
    job = create_export(
        db=db,
        user_id=user.id,
        filter_criteria={
            "document_ids": req.document_ids,
            "difficulty_levels": req.difficulty_levels,
            "nos_unit_ids": req.nos_unit_ids,
        },
    )
    logger.info("Export created: %d by user %d", job.id, user.id)
    return ExportJobResponse.model_validate(job)


@router.get("", response_model=list[ExportJobResponse])
async def list_exports(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[ExportJobResponse]:
    exports = db.query(ExportJob).filter(
        ExportJob.user_id == user.id
    ).order_by(ExportJob.created_at.desc()).all()
    return [ExportJobResponse.model_validate(e) for e in exports]


@router.get("/{export_id}/download")
async def download_export(
    export_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FileResponse:
    job = db.query(ExportJob).filter(
        ExportJob.id == export_id, ExportJob.user_id == user.id
    ).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export not found")
    if not job.file_path or not os.path.exists(job.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export file not found")
    return FileResponse(
        path=job.file_path,
        filename=job.filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.delete("/{export_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_export(
    export_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    job = db.query(ExportJob).filter(
        ExportJob.id == export_id, ExportJob.user_id == user.id
    ).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export not found")
    if job.file_path and os.path.exists(job.file_path):
        os.remove(job.file_path)
    db.delete(job)
    db.commit()
