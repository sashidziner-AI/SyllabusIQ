import logging
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt import verify_password, hash_password, create_access_token, create_refresh_token, decode_token
from app.auth.dependencies import get_current_active_user
from app.auth.oauth import get_google_tokens, get_google_user
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import Token, RegisterRequest, RefreshRequest, UserResponse, UserUpdate
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )
    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("User registered: %s", user.email)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
async def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not user.hashed_password or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account deactivated"
        )
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    db_token = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(db_token)
    db.commit()
    logger.info("User logged in: %s", user.email)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh(req: RefreshRequest, db: Session = Depends(get_db)) -> Token:
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == req.refresh_token,
        RefreshToken.revoked.is_(False),
    ).first()
    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    db_token.revoked = True
    user_id = payload.get("sub")
    access_token = create_access_token({"sub": user_id})
    new_refresh = create_refresh_token({"sub": user_id})
    db.add(RefreshToken(
        user_id=int(user_id),
        token=new_refresh,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    db.commit()
    return Token(access_token=access_token, refresh_token=new_refresh)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    req: RefreshRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> dict:
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == req.refresh_token,
        RefreshToken.user_id == user.id,
    ).first()
    if db_token:
        db_token.revoked = True
        db.commit()
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_active_user)) -> UserResponse:
    return UserResponse.model_validate(user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    update: UserUpdate,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    if update.full_name is not None:
        user.full_name = update.full_name
    if update.avatar_url is not None:
        user.avatar_url = update.avatar_url
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/google")
async def google_login() -> dict:
    params = urlencode({
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": f"{settings.FRONTEND_URL}/auth/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    })
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{params}"}


@router.get("/google/callback", response_model=Token)
async def google_callback(code: str, db: Session = Depends(get_db)) -> Token:
    tokens = await get_google_tokens(code)
    if "error" in tokens:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OAuth failed")
    google_user = await get_google_user(tokens["access_token"])
    email = google_user.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No email from Google")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=google_user.get("name"),
            avatar_url=google_user.get("picture"),
            oauth_provider="google",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Google OAuth user created: %s", email)
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    db.add(RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    db.commit()
    return Token(access_token=access_token, refresh_token=refresh_token)
