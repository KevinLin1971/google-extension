"""
Chrome Extension Backend API
重構後的主要應用程式入口點
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router

# FastAPI 應用程式
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS 中介軟體設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含 API 路由
app.include_router(api_router, prefix=settings.API_V1_STR)

# 根路徑
@app.get("/")
async def root():
    return {"message": "Chrome Extension Backend API", "version": "v1.0"}

# 健康檢查端點
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
