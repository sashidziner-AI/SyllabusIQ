from datetime import datetime

from pydantic import BaseModel


class TagResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class QuestionResponse(BaseModel):
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
    updated_at: datetime | None
    tags: list[TagResponse] = []

    model_config = {"from_attributes": True}


class QuestionListResponse(BaseModel):
    questions: list[QuestionResponse]
    total: int
    page: int
    per_page: int


class QuestionUpdate(BaseModel):
    question_text: str | None = None
    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None
    correct_option: str | None = None
    explanation: str | None = None
    difficulty_level: str | None = None


class TagCreate(BaseModel):
    name: str


class QuestionStatsResponse(BaseModel):
    total: int
    by_difficulty: dict[str, int]
    by_document: dict[str, int]
    duplicates_count: int
