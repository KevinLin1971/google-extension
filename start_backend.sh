#!/bin/bash

echo "🚀 啟動 FastAPI 後端服務..."

# 獲取腳本所在目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 切換到後端目錄
cd "$SCRIPT_DIR/fastapi-backend"

echo "📍 當前工作目錄: $(pwd)"
echo "📁 目錄內容:"
ls -la

# 檢查是否已進入虛擬環境
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  未偵測到虛擬環境，嘗試啟動 venv..."
    if [ -f "venv/bin/activate" ]; then
        echo "🔧 啟動虛擬環境..."
        source venv/bin/activate
        echo "✅ 已進入虛擬環境: $VIRTUAL_ENV"
    else
        echo "❌ 找不到 venv 資料夾，請先建立虛擬環境:"
        echo "   python3 -m venv venv"
        echo "   source venv/bin/activate"
        exit 1
    fi
else
    echo "✅ 已在虛擬環境中: $VIRTUAL_ENV"
fi

# 檢查是否已安裝 uvicorn
if ! command -v uvicorn &> /dev/null; then
    echo "⚠️  Uvicorn 未安裝，正在安裝..."
    pip install uvicorn
fi

# 安裝必要的依賴
# echo "📦 安裝依賴套件..."
# pip install -r requirements.txt

# 啟動服務
echo "✅ 啟動中... API 將在 http://localhost:8000 提供服務"
echo "📋 API 文件: http://localhost:8000/docs"
echo "🔑 測試帳號: admin / 123456"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000
