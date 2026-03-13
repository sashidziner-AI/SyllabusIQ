from datetime import datetime

from pydantic import BaseModel


class ExportCreate(BaseModel):
    document_ids: list[int] | None = None
    difficulty_levels: list[str] | None = None
    nos_unit_ids: list[int] | None = None


class ExportJobResponse(BaseModel):
    id: int
    filename: str
    format: str
    status: str
    row_count: int
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}
