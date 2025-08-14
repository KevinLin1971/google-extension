"""
認證相關的 API 端點
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.models.schemas import LoginRequest, Token, TokenVerifyResponse, MessageResponse

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_api(login_data: LoginRequest):
    """登入 API - 驗證帳密並回傳 JWT token"""
    if (login_data.username == settings.DEMO_USERNAME and 
        login_data.password == settings.DEMO_PASSWORD):
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=login_data.username, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="帳號或密碼錯誤"
        )


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 相容的 token 端點"""
    if (form_data.username != settings.DEMO_USERNAME or 
        form_data.password != settings.DEMO_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=form_data.username, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/verify-token", response_model=TokenVerifyResponse)
async def verify_token(current_user: dict = Depends(get_current_user)):
    """驗證 token 是否有效"""
    return {
        "valid": True, 
        "user": current_user["username"]
    }
