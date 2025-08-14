"""
API v1 路由聚合
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, items

api_router = APIRouter()

# 認證相關路由
api_router.include_router(auth.router, prefix="/auth", tags=["認證"])

# 項目管理路由
api_router.include_router(items.router, prefix="/items", tags=["項目管理"])
