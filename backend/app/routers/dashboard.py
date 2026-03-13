import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.document import Document
from app.models.question import MCQuestion, DifficultyLevel
from app.models.export_job import ExportJob
from app.schemas.dashboard import DashboardStatsResponse, RecentActivityItem

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> DashboardStatsResponse:
    total_documents = db.query(Document).filter(Document.user_id == user.id).count()
    total_questions = db.query(MCQuestion).filter(MCQuestion.user_id == user.id).count()
    total_exports = db.query(ExportJob).filter(ExportJob.user_id == user.id).count()

    questions_by_difficulty: dict[str, int] = {}
    for level in DifficultyLevel:
        count = db.query(MCQuestion).filter(
            MCQuestion.user_id == user.id,
            MCQuestion.difficulty_level == level,
        ).count()
        questions_by_difficulty[level.value] = count

    recent_docs = db.query(Document).filter(
        Document.user_id == user.id
    ).order_by(Document.uploaded_at.desc()).limit(5).all()

    return DashboardStatsResponse(
        total_documents=total_documents,
        total_questions=total_questions,
        total_exports=total_exports,
        questions_by_difficulty=questions_by_difficulty,
        recent_documents=[
            {"id": d.id, "name": d.original_filename, "status": d.status.value}
            for d in recent_docs
        ],
    )


@router.get("/recent", response_model=list[RecentActivityItem])
async def get_recent_activity(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[RecentActivityItem]:
    activities: list[RecentActivityItem] = []

    recent_docs = db.query(Document).filter(
        Document.user_id == user.id
    ).order_by(Document.uploaded_at.desc()).limit(5).all()
    for doc in recent_docs:
        activities.append(RecentActivityItem(
            type="document",
            description=f"Uploaded {doc.original_filename}",
            timestamp=doc.uploaded_at.isoformat() if doc.uploaded_at else "",
        ))

    recent_exports = db.query(ExportJob).filter(
        ExportJob.user_id == user.id
    ).order_by(ExportJob.created_at.desc()).limit(3).all()
    for export in recent_exports:
        activities.append(RecentActivityItem(
            type="export",
            description=f"Exported {export.filename}",
            timestamp=export.created_at.isoformat() if export.created_at else "",
        ))

    activities.sort(key=lambda a: a.timestamp, reverse=True)
    return activities[:10]
