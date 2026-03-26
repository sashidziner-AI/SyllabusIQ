import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.project import Project
from app.models.document import Document
from app.models.question import MCQuestion
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


def _build_response(db: Session, project: Project) -> ProjectResponse:
    doc_count = db.query(func.count(Document.id)).filter(
        Document.project_id == project.id
    ).scalar() or 0
    question_count = db.query(func.count(MCQuestion.id)).join(
        Document, MCQuestion.document_id == Document.id
    ).filter(
        Document.project_id == project.id
    ).scalar() or 0
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        color=project.color,
        document_count=doc_count,
        question_count=question_count,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


def _get_user_project(db: Session, project_id: int, user: User) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return project


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    req: ProjectCreate,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    project = Project(
        user_id=user.id,
        name=req.name,
        description=req.description,
        color=req.color,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    logger.info("Project created: %s by user %d", project.name, user.id)
    return _build_response(db, project)


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[ProjectResponse]:
    projects = (
        db.query(Project)
        .filter(Project.user_id == user.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return [_build_response(db, p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    project = _get_user_project(db, project_id, user)
    return _build_response(db, project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    req: ProjectUpdate,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    project = _get_user_project(db, project_id, user)
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    logger.info("Project updated: %d by user %d", project_id, user.id)
    return _build_response(db, project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    project = _get_user_project(db, project_id, user)
    db.delete(project)
    db.commit()
    logger.info("Project deleted: %d by user %d", project_id, user.id)
