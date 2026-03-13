from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class PerformanceCriterion(Base):
    __tablename__ = "performance_criteria"

    id = Column(Integer, primary_key=True, index=True)
    nos_unit_id = Column(
        Integer, ForeignKey("nos_units.id", ondelete="CASCADE"), nullable=False, index=True
    )
    criterion_code = Column(String(50), nullable=False)
    criterion_text = Column(Text, nullable=False)
    page_reference = Column(String(50), nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    nos_unit = relationship("NOSUnit", back_populates="criteria")
    questions = relationship("MCQuestion", back_populates="criterion")
