from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

# FastAPI app
app = FastAPI()

# 從環境變數讀取設定
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
DEMO_USERNAME = os.getenv("DEMO_USERNAME", "admin")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "123456")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",") if os.getenv("ALLOWED_ORIGINS") != "*" else ["*"]

# Add CORS middleware to allow chrome extension communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # 使用環境變數設定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret key for JWT - 現已從環境變數讀取
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# In-memory database
fake_db = []

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str
class Item(BaseModel):
    id: int
    name: str
    description: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency to verify token
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

# Routes
@app.get("/verify-token")
def verify_token(user: dict = Depends(get_current_user)):
    """驗證 token 是否有效"""
    return {"valid": True, "user": user.get("sub")}

@app.post("/login")
def login_api(login_data: LoginRequest):
    """登入 API - 驗證帳密並回傳 JWT token"""
    if login_data.username == DEMO_USERNAME and login_data.password == DEMO_PASSWORD:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": login_data.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "message": "登入成功"}
    else:
        raise HTTPException(status_code=401, detail="帳號或密碼錯誤")

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Dummy authentication
    if form_data.username != "user" or form_data.password != "password":
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/items/", response_model=Item)
def create_item(item: Item, user: dict = Depends(get_current_user)):
    fake_db.append(item)
    return item

@app.get("/items/", response_model=List[Item])
def get_items(user: dict = Depends(get_current_user)):
    return fake_db
