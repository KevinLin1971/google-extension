// chat.js
// 聊天室的 JavaScript 邏輯

// 後端 API 設定
const API_BASE_URL = 'http://localhost:8000';

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
    console.log('Chat room initialized');
    
    // 獲取 DOM 元素
    chatMessages = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');
    sendButton = document.getElementById('sendButton');
    backButton = document.getElementById('backButton');
    typingIndicator = document.getElementById('typingIndicator');
    chatStatus = document.getElementById('chatStatus');
    
    // 檢查登入狀態
    checkAuthStatus();
    
    // 綁定事件監聽器
    bindEventListeners();
    
    // 自動調整輸入框高度
    setupAutoResizeInput();
    
    // 載入歷史聊天記錄（如果有的話）
    loadChatHistory();
});

// 檢查認證狀態
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('請先登入再使用聊天功能');
        goBackToMain();
        return;
    }
    
    // 更新狀態為已連接
    updateChatStatus('已連線', 'success');
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
    if (!chatInput || isTyping) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
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
        // 模擬 API 調用（等 UI/UX 設計完成後再串接實際 API）
        const response = await simulateAIResponse(message);
        
        // 隱藏打字指示器
        hideTypingIndicator();
        
        // 添加 AI 回應到聊天記錄
        addMessage(response, 'assistant');
        
        // 更新狀態
        updateChatStatus('準備就緒', 'ready');
        
        // 儲存聊天記錄
        saveChatHistory();
        
    } catch (error) {
        console.error('Send message error:', error);
        hideTypingIndicator();
        addMessage('抱歉，目前無法處理您的訊息，請稍後再試。', 'assistant', true);
        updateChatStatus('發生錯誤', 'error');
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
    
    // 插入到歡迎訊息之後，打字指示器之前
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage && welcomeMessage.nextSibling) {
        chatMessages.insertBefore(messageDiv, welcomeMessage.nextSibling);
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
        case 'error':
            chatStatus.style.background = 'rgba(220, 53, 69, 0.2)';
            break;
        default:
            chatStatus.style.background = 'rgba(255, 255, 255, 0.1)';
    }
}

// 模擬 AI 回應（等 UI/UX 設計完成後替換為實際 API）
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

// 帶有 token 驗證的 API 請求函數（為將來的 API 串接準備）
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        // Token 過期，重導向到登入頁
        alert('登入已過期，請重新登入');
        goBackToMain();
        throw new Error('Authentication failed');
    }

    return response;
}

// 導出函數供外部使用（如果需要的話）
window.chatRoom = {
    clearHistory: clearChatHistory,
    goBack: goBackToMain
};
