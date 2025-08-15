// chat.js
// 聊天室的 JavaScript 邏輯

// 後端 API 設定
const API_BASE_URL = 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';

// DOM 元素
let chatMessages;
let chatInput;
let sendButton;
let backButton;
let typingIndicator;
let chatStatus;

// 聊天狀態
let isTyping = false;

// 初始化聊天室
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Chat room initializing...');
    
    // 檢查 ApiConfig 是否已載入
    if (!window.ApiConfig) {
        console.error('❌ ApiConfig 未載入，等待載入中...');
        // 延遲重試
        setTimeout(function() {
            if (!window.ApiConfig) {
                console.error('❌ ApiConfig 載入失敗');
                alert('API 配置載入失敗，請重新載入頁面');
                return;
            }
            console.log('✅ ApiConfig 延遲載入成功');
            initializeChat();
        }, 1000);
        return;
    }
    
    console.log('✅ ApiConfig 已載入');
    initializeChat();
});

function initializeChat() {
    console.log('🔧 Initializing chat components...');
    
    // 獲取 DOM 元素
    chatMessages = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');
    sendButton = document.getElementById('sendButton');
    backButton = document.getElementById('backButton');
    typingIndicator = document.getElementById('typingIndicator');
    chatStatus = document.getElementById('chatStatus');
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
        clearButton.addEventListener('click', clearChatHistory);
    }
    
    console.log('🔍 DOM elements found:', {
        chatMessages: !!chatMessages,
        chatInput: !!chatInput,
        sendButton: !!sendButton,
        backButton: !!backButton,
        typingIndicator: !!typingIndicator,
        chatStatus: !!chatStatus
    });
    
    // 檢查登入狀態
    checkAuthStatus();
    
    // 綁定事件監聽器
    bindEventListeners();
    
    // 自動調整輸入框高度
    setupAutoResizeInput();
    
    // 載入歷史聊天記錄（如果有的話）
    loadChatHistory();
    
    console.log('✅ Chat room initialized successfully');
}

// 檢查認證狀態
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('請先登入再使用聊天功能');
        goBackToMain();
        return;
    }
    
    try {
        // 驗證 token 有效性
        await window.ApiConfig.API.auth.verifyToken();
        // 更新狀態為已連接
        updateChatStatus('已連線', 'success');
    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.message.includes('Authentication failed') || error.message.includes('token expired')) {
            console.warn('Token 已過期，返回主頁面重新登入');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            alert('登入已過期，請重新登入');
            goBackToMain();
        } else if (error.message.includes('Network connection failed')) {
            console.warn('無法連接到後端服務器，但允許繼續使用聊天功能');
            updateChatStatus('連線不穩定', 'warning');
        } else {
            updateChatStatus('連線異常', 'error');
        }
    }
}

// 綁定事件監聽器
function bindEventListeners() {
    // 返回按鈕
    if (backButton) {
        backButton.addEventListener('click', goBackToMain);
    }
    
    // 發送按鈕
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // 輸入框 Enter 鍵發送
    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 輸入時的狀態更新
        chatInput.addEventListener('input', function() {
            if (this.value.trim()) {
                updateChatStatus('輸入中...', 'typing');
            } else {
                updateChatStatus('準備就緒', 'ready');
            }
        });
    }
}

// 設置輸入框自動調整高度
function setupAutoResizeInput() {
    if (!chatInput) return;
    
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
}

// 返回主頁面
function goBackToMain() {
    // 如果是在 Chrome 擴展環境中
    if (window.location.href.includes('chat.html')) {
        window.location.href = 'side-panel.html';
    } else {
        // 或者使用 history back
        window.history.back();
    }
}

// 發送訊息
async function sendMessage() {
    if (!chatInput || isTyping) {
        console.log('⚠️ Cannot send message: chatInput missing or typing in progress');
        return;
    }
    
    const message = chatInput.value.trim();
    if (!message) {
        console.log('⚠️ Cannot send empty message');
        return;
    }
    
    console.log('📨 Sending message:', message);
    
    // 清空輸入框並重置高度
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // 添加用戶訊息到聊天記錄
    addMessage(message, 'user');
    
    // 顯示打字指示器
    showTypingIndicator();
    
    // 更新狀態
    updateChatStatus('AI 回應中...', 'processing');
    
    try {
        console.log('🔄 Calling API...');
        // 調用實際的後端 API
        const response = await callChatAPI(message);
        console.log('📥 Received response:', response);
        
        // 隱藏打字指示器
        hideTypingIndicator();
        
        if (response) {
            // 添加 AI 回應到聊天記錄
            addMessage(response, 'assistant');
            console.log('✅ Message sent and response received successfully');
        } else {
            console.error('❌ Received empty response');
            addMessage('抱歉，我沒有收到有效的回應。', 'assistant', true);
        }
        
        // 更新狀態
        updateChatStatus('準備就緒', 'ready');
        
        // 儲存聊天記錄
        saveChatHistory();
        
    } catch (error) {
        console.error('❌ Send message error:', error);
        hideTypingIndicator();
        
        // 如果是認證失敗，不顯示錯誤訊息，因為已經重導向登入頁面了
        if (error.message.includes('Authentication failed') || error.message.includes('token expired')) {
            console.log('🔑 Authentication failed, redirecting...');
            // authenticatedFetch 或 checkAuthStatus 已經處理了重導向
            return;
        }
        
        // 如果是超時錯誤，顯示特定的錯誤訊息
        let errorMessage = '抱歉，目前無法處理您的訊息，請稍後再試。';
        if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
            errorMessage = '連線超時，請檢查網路連線或稍後再試。';
            updateChatStatus('連線超時', 'error');
        } else {
            updateChatStatus('發生錯誤', 'error');
        }
        
        addMessage(errorMessage, 'assistant', true);
    }
}

// 添加訊息到聊天記錄
function addMessage(content, sender, isError = false) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (isError) {
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }
    
    const timestamp = new Date().toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div>${content}</div>
        <span class="message-time">${timestamp}</span>
    `;
    
    // 永遠插入在打字指示器之前，確保訊息順序正確
    const typingIndicatorEl = chatMessages.querySelector('.typing-indicator');
    if (typingIndicatorEl) {
        chatMessages.insertBefore(messageDiv, typingIndicatorEl);
    } else {
        chatMessages.appendChild(messageDiv);
    }
    
    // 滾動到底部
    scrollToBottom();
}

// 顯示打字指示器
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
        isTyping = true;
        if (sendButton) sendButton.disabled = true;
        scrollToBottom();
    }
}

// 隱藏打字指示器
function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
        isTyping = false;
        if (sendButton) sendButton.disabled = false;
    }
}

// 滾動到聊天記錄底部
function scrollToBottom() {
    if (chatMessages) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

// 更新聊天狀態
function updateChatStatus(text, type = 'ready') {
    if (!chatStatus) return;
    
    chatStatus.textContent = text;
    
    // 根據狀態類型設置樣式
    chatStatus.className = 'chat-status';
    switch (type) {
        case 'success':
        case 'ready':
            chatStatus.style.background = 'rgba(40, 167, 69, 0.2)';
            break;
        case 'typing':
        case 'processing':
            chatStatus.style.background = 'rgba(255, 193, 7, 0.2)';
            break;
        case 'warning':
            chatStatus.style.background = 'rgba(255, 152, 0, 0.2)';
            break;
        case 'error':
            chatStatus.style.background = 'rgba(220, 53, 69, 0.2)';
            break;
        default:
            chatStatus.style.background = 'rgba(255, 255, 255, 0.1)';
    }
}

// 調用聊天機器人 API
async function callChatAPI(message) {
    console.log('🚀 Calling Chat API with message:', message);
    
    // 檢查 ApiConfig 是否已載入
    if (!window.ApiConfig) {
        console.error('❌ ApiConfig 未載入');
        throw new Error('API configuration not loaded');
    }
    
    if (!window.ApiConfig.API || !window.ApiConfig.API.chatbot || !window.ApiConfig.API.chatbot.chat) {
        console.error('❌ Chatbot API 未定義');
        throw new Error('Chatbot API not defined');
    }
    
    console.log('✅ ApiConfig 已載入，開始調用 API...');
    
    try {
        // 使用統一的 API 配置
        const data = await window.ApiConfig.API.chatbot.chat(message);
        console.log('📥 API Response received:', data);
        
        if (data && data.status === 'success' && data.response) {
            console.log('✅ API 調用成功，返回回應:', data.response);
            return data.response;
        } else if (data && data.response) {
            // 即使 status 不是 success，但有 response 就使用
            console.log('⚠️ API 狀態異常但有回應:', data);
            return data.response;
        } else {
            console.warn('❌ API 回應格式錯誤:', data);
            throw new Error('Invalid API response format');
        }
    } catch (error) {
        console.error('❌ Chat API error:', error);
        
        // 如果是認證失敗，重新拋出錯誤讓調用者處理
        if (error.message.includes('Authentication failed') || error.message.includes('token expired')) {
            console.log('🔑 認證失敗，重新拋出錯誤');
            throw error;
        }
        
        // 如果是超時錯誤，提供更友好的錯誤信息
        if (error.message.includes('timeout') || error.name === 'AbortError') {
            console.log('⏱️ 請求超時');
            throw new Error('Request timeout - please check your network connection');
        }
        
        // 其他錯誤，使用模擬回應作為備用
        console.log('🔄 API 調用失敗，使用模擬回應作為備用');
        return await simulateAIResponse(message);
    }
}

// 模擬 AI 回應（作為備用方案）
async function simulateAIResponse(userMessage) {
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // 簡單的回應邏輯（示範用）
    const responses = [
        `我收到您的訊息："${userMessage}"。這是一個模擬回應，等待 UI/UX 設計完成後會串接真正的 AI API。`,
        `感謝您的提問！目前我們正在開發中，很快就能為您提供更智能的回應。`,
        `您好！我是智能助手，目前正在測試階段。您的訊息我已經收到了。`,
        `這是一個演示回應。真正的 AI 功能正在開發中，敬請期待！`,
        `我正在學習如何更好地回應您的需求。目前這只是一個佔位符回應。`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// 載入聊天歷史記錄
function loadChatHistory() {
    try {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            const messages = JSON.parse(history);
            messages.forEach(msg => {
                addMessage(msg.content, msg.sender);
            });
        }
    } catch (error) {
        console.error('Load chat history error:', error);
    }
}

// 儲存聊天歷史記錄
function saveChatHistory() {
    try {
        const messages = Array.from(chatMessages.querySelectorAll('.message')).map(msgEl => {
            const content = msgEl.querySelector('div').textContent;
            const sender = msgEl.classList.contains('user') ? 'user' : 'assistant';
            return { content, sender, timestamp: new Date().toISOString() };
        });
        
        // 只保留最近 50 條訊息
        const recentMessages = messages.slice(-50);
        localStorage.setItem('chatHistory', JSON.stringify(recentMessages));
    } catch (error) {
        console.error('Save chat history error:', error);
    }
}

// 清空聊天記錄
function clearChatHistory() {
    if (confirm('確定要清空所有聊天記錄嗎？')) {
        localStorage.removeItem('chatHistory');
        
        // 清空 UI 中的訊息（保留歡迎訊息）
        const messages = chatMessages.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
        
        updateChatStatus('聊天記錄已清空', 'ready');
    }
}

// 導出函數供外部使用（如果需要的話）
window.chatRoom = {
    clearHistory: clearChatHistory,
    goBack: goBackToMain
};
