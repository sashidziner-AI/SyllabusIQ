from datetime import datetime

from pydantic import BaseModel


class CriterionResponse(BaseModel):
    id: int
    nos_unit_id: int
    criterion_code: str
    criterion_text: str
    page_reference: str | None
    order_index: int

    model_config = {"from_attributes": True}


class NOSUnitResponse(BaseModel):
    id: int
    document_id: int
    unit_code: str
    unit_title: str
    description: str | None
    order_index: int
    criteria: list[CriterionResponse] = []

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    error_message: str | None
    uploaded_at: datetime
    processed_at: datetime | None

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
    page: int
    per_page: int
