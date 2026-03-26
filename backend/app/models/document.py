import enum

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class DocumentStatus(enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    analyzed = "analyzed"
    failed = "failed"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    status = Column(
        Enum(DocumentStatus), default=DocumentStatus.uploaded, nullable=False
    )
    error_message = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="documents")
    project = relationship("Project", back_populates="documents")
    nos_units = relationship(
        "NOSUnit", back_populates="document", cascade="all, delete-orphan"
    )
    questions = relationship(
        "MCQuestion", back_populates="document", cascade="all, delete-orphan"
    )
    generation_jobs = relationship(
        "MCQGenerationJob", back_populates="document", cascade="all, delete-orphan"
    )
