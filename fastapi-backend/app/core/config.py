"""
應用程式配置設定
"""
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()


class Settings:
    """應用程式設定"""
    
    # JWT 設定
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # 示範用戶設定
    DEMO_USERNAME: str = os.getenv("DEMO_USERNAME", "admin")
    DEMO_PASSWORD: str = os.getenv("DEMO_PASSWORD", "123456")
    
    # CORS 設定
    ALLOWED_ORIGINS: list = (
        os.getenv("ALLOWED_ORIGINS", "*").split(",") 
        if os.getenv("ALLOWED_ORIGINS") != "*" 
        else ["*"]
    )
    
    # API 設定
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Chrome Extension Backend API"


settings = Settings()
