from pydantic import BaseModel, Field


class QuestionGenRequest(BaseModel):
    document_ids: list[int] = Field(..., min_length=1)
    number_of_questions: int = Field(default=10, ge=1, le=50)


class GeneratedMCQ(BaseModel):
    nos_code: str | None = None
    nos_name: str | None = None
    performance_criteria: str
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    explanation: str
    page_reference: str


class QuestionGenResponse(BaseModel):
    has_nos: bool
    questions: list[GeneratedMCQ]
    document_ids: list[int]
    document_names: list[str]
