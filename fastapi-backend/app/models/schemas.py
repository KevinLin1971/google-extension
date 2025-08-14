"""
Pydantic 模型定義
"""
from pydantic import BaseModel
from typing import Optional


# 認證相關模型
class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(BaseModel):
    username: str


class UserInDB(User):
    hashed_password: str


# 項目相關模型
class ItemBase(BaseModel):
    name: str
    description: str


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True


# 通用回應模型
class MessageResponse(BaseModel):
    message: str


class TokenVerifyResponse(BaseModel):
    valid: bool
    user: str
