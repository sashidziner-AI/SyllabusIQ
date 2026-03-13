from datetime import datetime

from pydantic import BaseModel


class GenerateRequest(BaseModel):
    criteria_ids: list[int] | None = None


class GenerationJobResponse(BaseModel):
    id: int
    document_id: int
    status: str
    total_criteria: int
    processed_criteria: int
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MCQuestionResponse(BaseModel):
    id: int
    document_id: int
    nos_unit_id: int | None
    criterion_id: int | None
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: str
    source_page_reference: str | None
    difficulty_level: str
    is_duplicate: bool
    created_at: datetime

    model_config = {"from_attributes": True}
