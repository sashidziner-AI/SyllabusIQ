import enum

from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ExportStatus(enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class ExportJob(Base):
    __tablename__ = "export_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename = Column(String(255), nullable=False)
    format = Column(String(10), default="xlsx", nullable=False)
    filter_criteria = Column(JSON, nullable=True)
    status = Column(Enum(ExportStatus), default=ExportStatus.pending, nullable=False)
    file_path = Column(String(500), nullable=True)
    row_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="export_jobs")
