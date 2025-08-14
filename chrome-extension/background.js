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

// 通用 API 請求函數
function apiRequest(endpoint, method, data, callback) {
  getToken((token) => {
    if (!token) {
      console.error('No token found');
      return;
    }

    fetch(endpoint, {
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
    apiRequest('https://example.com/api/test', 'GET', null, (response) => {
      console.log('API Response:', response);
      sendResponse(response);
    });
    return true; // 表示將使用非同步回應
  }
});
