import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.exceptions import AppException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.EXPORT_DIR, exist_ok=True)
    logger.info("Syllabus-IQ started — upload/export directories ready")
    yield
    logger.info("Syllabus-IQ shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-powered MCQ generation from syllabus documents",
    lifespan=lifespan,
)

app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code},
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded", "code": "RATE_LIMITED"},
    )


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "healthy", "app": settings.APP_NAME}


from app.routers import auth, documents, generate, questions, exports, dashboard, chat, question_gen

app.include_router(auth.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(generate.router, prefix="/api/v1")
app.include_router(questions.router, prefix="/api/v1")
app.include_router(exports.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(question_gen.router, prefix="/api/v1")
