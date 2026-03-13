import enum

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Enum, DateTime,
    ForeignKey, Index, Table,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from app.models.base import TimestampMixin


class DifficultyLevel(enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


question_tag_mapping = Table(
    "question_tag_mappings",
    Base.metadata,
    Column(
        "question_id",
        Integer,
        ForeignKey("mc_questions.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        Integer,
        ForeignKey("question_tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class MCQuestion(Base, TimestampMixin):
    __tablename__ = "mc_questions"

    id = Column(Integer, primary_key=True, index=True)
    generation_job_id = Column(
        Integer, ForeignKey("mcq_generation_jobs.id", ondelete="CASCADE"), nullable=False
    )
    document_id = Column(
        Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    nos_unit_id = Column(
        Integer, ForeignKey("nos_units.id", ondelete="SET NULL"), nullable=True
    )
    criterion_id = Column(
        Integer, ForeignKey("performance_criteria.id", ondelete="SET NULL"), nullable=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)
    explanation = Column(Text, nullable=False)
    source_page_reference = Column(String(50), nullable=True)
    difficulty_level = Column(
        Enum(DifficultyLevel), default=DifficultyLevel.medium, nullable=False
    )
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(
        Integer, ForeignKey("mc_questions.id", ondelete="SET NULL"), nullable=True
    )

    generation_job = relationship("MCQGenerationJob", back_populates="questions")
    document = relationship("Document", back_populates="questions")
    nos_unit = relationship("NOSUnit", back_populates="questions")
    criterion = relationship("PerformanceCriterion", back_populates="questions")
    user = relationship("User", back_populates="questions")
    tags = relationship("QuestionTag", secondary=question_tag_mapping, back_populates="questions")

    __table_args__ = (
        Index("ix_mc_questions_document_nos", "document_id", "nos_unit_id"),
        Index("ix_mc_questions_user_difficulty", "user_id", "difficulty_level"),
    )


class QuestionTag(Base):
    __tablename__ = "question_tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    questions = relationship(
        "MCQuestion", secondary=question_tag_mapping, back_populates="tags"
    )
