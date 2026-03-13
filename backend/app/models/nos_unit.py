from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class NOSUnit(Base):
    __tablename__ = "nos_units"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(
        Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_code = Column(String(50), nullable=False)
    unit_title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="nos_units")
    criteria = relationship(
        "PerformanceCriterion", back_populates="nos_unit", cascade="all, delete-orphan"
    )
    questions = relationship("MCQuestion", back_populates="nos_unit")
