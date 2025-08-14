"""
Chat Bot API 端點
處理與聊天機器人相關的請求
"""
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.core.dependencies import verify_token

router = APIRouter()


class ChatMessage(BaseModel):
    """聊天訊息模型"""
    message: str


class ChatResponse(BaseModel):
    """聊天回應模型"""
    response: str
    status: str = "success"


@router.post("/chat", response_model=ChatResponse)
async def send_chat_message(
    chat_message: ChatMessage,
    token: dict = Depends(verify_token)
):
    """
    發送訊息到聊天機器人
    
    Args:
        chat_message: 包含用戶訊息的請求體
        token: JWT 驗證令牌
    
    Returns:
        ChatResponse: 聊天機器人的回應
    """
    try:
        # 準備發送到外部聊天機器人 API 的資料
        payload = {
            "message": chat_message.message
        }
        
        # 使用 httpx 發送 HTTP 請求到外部聊天機器人
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                settings.CHAT_BOT_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            # 檢查回應狀態
            if response.status_code == 200:
                bot_response = response.json()
                
                # 根據實際回應格式調整解析邏輯
                if isinstance(bot_response, dict):
                    # 如果回應是字典格式，嘗試提取回應內容
                    message_content = (
                        bot_response.get("response") or 
                        bot_response.get("message") or 
                        bot_response.get("reply") or
                        str(bot_response)
                    )
                else:
                    # 如果是字串格式
                    message_content = str(bot_response)
                
                return ChatResponse(
                    response=message_content,
                    status="success"
                )
            else:
                # 當外部 API 不可用時，返回備用回應而不是拋出異常
                return await _get_fallback_response(chat_message.message)
                
    except httpx.TimeoutException:
        # 超時時使用備用回應
        return await _get_fallback_response(chat_message.message)
    except httpx.RequestError as e:
        # 連接錯誤時使用備用回應
        return await _get_fallback_response(chat_message.message)
    except Exception as e:
        # 其他錯誤時使用備用回應
        return await _get_fallback_response(chat_message.message)


async def _get_fallback_response(user_message: str) -> ChatResponse:
    """
    當外部 AI API 不可用時的備用回應
    """
    import random
    
    # 智能回應模板
    responses = [
        f"我收到您的訊息：「{user_message}」。目前 AI 服務正在維護中，但我會盡力協助您！",
        "感謝您的提問！我是您的智能助手，目前正在學習中。有什麼我可以幫助您的嗎？",
        f"關於「{user_message}」，這是一個很好的問題！雖然我現在處於演示模式，但我很樂意與您聊天。",
        "您好！我是 AI 助手，目前正在測試階段。雖然完整的 AI 功能還在開發中，但我可以陪您聊天！",
        f"我注意到您提到了「{user_message}」。作為您的數位助手，我正在不斷學習以提供更好的服務。"
    ]
    
    # 根據用戶訊息長度和內容選擇合適的回應
    if len(user_message.strip()) > 50:
        selected_response = responses[0]  # 使用包含用戶訊息的回應
    elif any(word in user_message.lower() for word in ['你好', 'hello', 'hi', '安安', '哈囉']):
        selected_response = "您好！很高興見到您！我是您的 AI 助手，雖然目前還在學習階段，但我會盡力幫助您的。"
    elif any(word in user_message.lower() for word in ['謝謝', 'thank', '感謝']):
        selected_response = "不客氣！能為您服務是我的榮幸。如果還有其他問題，請隨時告訴我！"
    elif any(word in user_message.lower() for word in ['再見', 'bye', '掰掰']):
        selected_response = "再見！期待下次與您聊天。祝您有美好的一天！"
    else:
        selected_response = random.choice(responses)
    
    return ChatResponse(
        response=selected_response,
        status="success"
    )


@router.get("/chat/health")
async def chatbot_health_check():
    """
    檢查聊天機器人 API 的健康狀態
    
    Returns:
        dict: 健康狀態資訊
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 發送測試請求
            test_payload = {"message": "health check"}
            response = await client.post(
                settings.CHAT_BOT_URL,
                json=test_payload,
                headers={"Content-Type": "application/json"}
            )
            
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "chatbot_url": settings.CHAT_BOT_URL,
                "response_status": response.status_code,
                "response_time_ms": response.elapsed.total_seconds() * 1000
            }
            
    except Exception as e:
        return {
            "status": "unhealthy",
            "chatbot_url": settings.CHAT_BOT_URL,
            "error": str(e)
        }
