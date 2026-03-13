import enum

from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class UserRole(enum.Enum):
    admin = "admin"
    user = "user"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    oauth_provider = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    documents = relationship(
        "Document", back_populates="user", cascade="all, delete-orphan"
    )
    generation_jobs = relationship(
        "MCQGenerationJob", back_populates="user", cascade="all, delete-orphan"
    )
    questions = relationship(
        "MCQuestion", back_populates="user", cascade="all, delete-orphan"
    )
    export_jobs = relationship(
        "ExportJob", back_populates="user", cascade="all, delete-orphan"
    )
