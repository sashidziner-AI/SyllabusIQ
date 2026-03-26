from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    color: str = "#22c55e"


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    color: str
    document_count: int = 0
    question_count: int = 0
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
