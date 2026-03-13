from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Syllabus-IQ"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/syllabus_iq"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_PROVIDER: str = "gemini"  # "anthropic" or "gemini"
    UPLOAD_DIR: str = "./uploads"
    EXPORT_DIR: str = "./exports"
    MAX_FILE_SIZE_MB: int = 20
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
