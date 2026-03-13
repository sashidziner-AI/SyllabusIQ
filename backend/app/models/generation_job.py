import enum

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class JobStatus(enum.Enum):
    pending = "pending"
    generating = "generating"
    completed = "completed"
    failed = "failed"


class MCQGenerationJob(Base):
    __tablename__ = "mcq_generation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(
        Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status = Column(Enum(JobStatus), default=JobStatus.pending, nullable=False)
    total_criteria = Column(Integer, default=0)
    processed_criteria = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="generation_jobs")
    user = relationship("User", back_populates="generation_jobs")
    questions = relationship(
        "MCQuestion", back_populates="generation_job", cascade="all, delete-orphan"
    )
