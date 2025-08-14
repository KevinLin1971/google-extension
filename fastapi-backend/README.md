# Chrome Extension Backend API

## 專案架構

重構後的 FastAPI 後端採用分層架構設計，支援版本控制和功能分離：

```
fastapi-backend/
├── main.py                 # 應用程式入口點
├── requirements.txt        # Python 依賴套件
├── app/
│   ├── __init__.py
│   ├── core/              # 核心功能模組
│   │   ├── config.py      # 應用程式配置
│   │   ├── security.py    # 安全性功能 (JWT, 密碼處理)
│   │   └── dependencies.py # 依賴注入 (認證檢查等)
│   ├── models/            # 資料模型
│   │   └── schemas.py     # Pydantic 模型定義
│   ├── api/              # API 路由
│   │   └── v1/           # v1.0 版本 API
│   │       ├── api.py    # v1 路由聚合器
│   │       └── endpoints/
│   │           ├── auth.py   # 認證相關端點
│   │           └── items.py  # 項目管理端點
│   └── database/         # 資料庫相關
│       └── fake_db.py    # 模擬資料庫
```

## API 端點

### 版本前綴
所有 API 都會有版本前綴：`/api/v1`

### 認證端點 (`/api/v1/auth`)
- `POST /api/v1/auth/login` - 用戶登入
- `POST /api/v1/auth/token` - OAuth2 相容的 token 端點
- `GET /api/v1/auth/verify-token` - 驗證 token 有效性

### 項目管理端點 (`/api/v1/items`)
- `POST /api/v1/items/` - 建立新項目
- `GET /api/v1/items/` - 取得所有項目
- `GET /api/v1/items/{item_id}` - 取得特定項目
- `PUT /api/v1/items/{item_id}` - 更新項目
- `DELETE /api/v1/items/{item_id}` - 刪除項目

### 系統端點
- `GET /` - 根路徑，顯示 API 資訊
- `GET /health` - 健康檢查端點

## 環境變數設定

在專案根目錄創建 `.env` 檔案：

```env
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEMO_USERNAME=admin
DEMO_PASSWORD=123456
ALLOWED_ORIGINS=*
```

## 執行應用程式

```bash
cd fastapi-backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 新增 API 版本

要新增新版本 (例如 v2)：

1. 創建 `app/api/v2/` 目錄
2. 複製 v1 的結構並修改
3. 在 `main.py` 中加入新的路由：
   ```python
   from app.api.v2.api import api_router as api_v2_router
   app.include_router(api_v2_router, prefix="/api/v2")
   ```

## 新增功能模組

要新增新的功能模組 (例如 users)：

1. 在 `app/api/v1/endpoints/` 創建 `users.py`
2. 在 `app/api/v1/api.py` 中加入路由：
   ```python
   from app.api.v1.endpoints import users
   api_router.include_router(users.router, prefix="/users", tags=["用戶管理"])
   ```

## 架構優點

- **版本控制**: 支援 API 版本管理，向後相容
- **功能分離**: 每個功能模組獨立，易於維護
- **可擴展性**: 容易新增新功能和版本
- **標準化**: 遵循 FastAPI 最佳實踐
- **類型安全**: 使用 Pydantic 模型確保資料驗證
