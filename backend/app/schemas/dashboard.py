from pydantic import BaseModel


class RecentActivityItem(BaseModel):
    type: str
    description: str
    timestamp: str


class DashboardStatsResponse(BaseModel):
    total_documents: int
    total_questions: int
    total_exports: int
    questions_by_difficulty: dict[str, int]
    recent_documents: list[dict]
