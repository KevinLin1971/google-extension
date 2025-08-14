// background.js
// 負責處理後端 API 請求和認證邏輯

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// 當點擊擴充功能圖標時，打開側邊面板
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// 儲存 Token 到 Chrome Storage
function saveToken(token) {
  chrome.storage.local.set({ authToken: token }, () => {
    console.log('Token saved');
  });
}

// 從 Chrome Storage 獲取 Token
function getToken(callback) {
  chrome.storage.local.get(['authToken'], (result) => {
    callback(result.authToken);
  });
}

// API 配置
const API_BASE_URL = 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';

// 通用 API 請求函數
function apiRequest(endpoint, method, data, callback) {
  getToken((token) => {
    if (!token) {
      console.error('No token found');
      return;
    }

    // 如果 endpoint 不包含完整 URL，則添加基礎 URL 和版本前綴
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${API_V1_PREFIX}${endpoint}`;

    fetch(fullUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data ? JSON.stringify(data) : null
    })
      .then(response => response.json())
      .then(data => callback(data))
      .catch(error => console.error('API Request Error:', error));
  });
}

// 測試 API 請求
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'testApi') {
    // 使用新的版本化 API 端點
    apiRequest('/items/', 'GET', null, (response) => {
      console.log('API Response:', response);
      sendResponse(response);
    });
    return true; // 表示將使用非同步回應
  }
});
