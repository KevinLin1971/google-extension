# ChromeExtension_sample 專案說明

本專案為一個結合 Chrome Extension 前端與 FastAPI 後端的範例，提供瀏覽器擴充功能與 API 服務。

## 專案結構

```
ChromeExtension_sample/
├── chrome-extension/      # Chrome 擴充功能前端原始碼
├── fastapi-backend/       # FastAPI 後端原始碼
├── start_backend.sh       # 啟動 FastAPI 後端的腳本
└── README.md              # 專案說明文件
```

## 1. Chrome Extension 前端
- 目錄：`chrome-extension/`
- 主要檔案：
  - `manifest.json`：擴充功能設定
  - `background.js`、`content.js`、`side-panel.js` 等：功能腳本
  - `popup/`、`icons/`：彈出視窗與圖示
- 功能：
  - 與後端 API 溝通，實現聊天機器人等互動功能

## 2. FastAPI 後端
- 目錄：`fastapi-backend/`
- 主要檔案：
  - `main.py`：FastAPI 入口
  - `app/`：API、資料庫、驗證、模型等模組
  - `requirements.txt`：Python 依賴套件
  - `.env`：環境變數設定
- 功能：
  - 提供 API 服務（如聊天機器人、驗證、資料查詢等）
  - 支援 JWT 驗證與 CORS 設定

## 3. 啟動方式

### 啟動 FastAPI 後端

```sh
cd fastapi-backend
bash ../start_backend.sh
```

或直接執行：

```sh
uvicorn main:app --reload
```

### 安裝 Python 依賴

```sh
cd fastapi-backend
pip install -r requirements.txt
```

### 安裝 Chrome Extension
1. 打開 Chrome，進入「擴充功能」>「管理擴充功能」
2. 開啟「開發人員模式」
3. 點擊「載入未封裝項目」，選擇 `chrome-extension/` 目錄

## 4. 環境變數說明

請參考 `fastapi-backend/.env`，主要設定如下：
- `SECRET_KEY`、`ALGORITHM`、`ACCESS_TOKEN_EXPIRE_MINUTES`：JWT 設定
- `DEMO_USERNAME`、`DEMO_PASSWORD`：預設帳密
- `ALLOWED_ORIGINS`：CORS 設定
- `CHAT_BOT_AUTH_HEADER`、`CHAT_BOT_URL`：聊天機器人 API 設定

## 5. 其他
- 詳細 API 文件請參考 `fastapi-backend/README.md`
- 測試帳號密碼可於 `.env` 設定

---
如有問題請聯絡專案維護者。
