// side-panel.js
// 側邊面板的 JavaScript 邏輯

// 後端 API 設定
const API_BASE_URL = 'http://localhost:8000';

// 添加調試日誌
console.log('Side panel script loaded');

// 檢查 token 有效性的函數
async function verifyToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 401) {
      // Token 過期或無效
      console.log('Token expired or invalid');
      localStorage.removeItem('token');
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    
    // 檢查是否是網路連接問題
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('無法連接到後端服務器，可能是連接問題或 CORS 問題');
      // 在無法連接的情況下，我們暫時保留 token，讓用戶可以繼續操作
      // 但會在實際 API 調用時再次檢查
      return true; // 暫時返回 true，讓用戶界面正常顯示
    }
    
    return false;
  }
}

// 導向登入頁的函數
function redirectToLogin(message = 'Token 已過期，請重新登入') {
  localStorage.removeItem('token');
  const loginSection = document.getElementById('loginSection');
  const mainSection = document.getElementById('mainSection');
  const userAvatarSection = document.getElementById('userAvatarSection');
  
  loginSection.classList.remove('hidden');
  mainSection.classList.add('hidden');
  userAvatarSection.classList.add('hidden');
  
  // 顯示過期提示
  if (message) {
    alert(message);
  }
}

// 帶有 token 驗證的 API 請求函數
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin('請先登入');
    throw new Error('No token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      redirectToLogin('Token 已過期，請重新登入');
      throw new Error('Token expired');
    }

    return response;
  } catch (error) {
    if (error.message === 'Token expired') {
      throw error;
    }
    
    // 處理網路連接錯誤
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('網路連接錯誤:', error);
      alert('無法連接到伺服器，請檢查:\n1. 後端服務是否啟動\n2. 網路連線是否正常\n3. 擴充功能權限是否正確');
      throw new Error('Network connection failed');
    }
    
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

// 初始化頁面
async function initializePage() {
  const loginSection = document.getElementById('loginSection');
  const mainSection = document.getElementById('mainSection');
  const userAvatarSection = document.getElementById('userAvatarSection');

  // 檢查 token 是否存在且有效
  const isValidToken = await verifyToken();
  
  console.log('Token validation result:', isValidToken);

  if (isValidToken) {
    loginSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    userAvatarSection.classList.remove('hidden');
    console.log('Valid token found, showing main section');
  } else {
    loginSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
    userAvatarSection.classList.add('hidden');
    console.log('No valid token found, showing login section');
  }
}

// 頁面載入時初始化
initializePage();

// 登入邏輯 - 串接後端 API
document.getElementById('loginButton').addEventListener('click', async () => {
  console.log('Login button clicked');
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  console.log('Username:', username, 'Password:', password);

  if (!username || !password) {
    console.log('Missing credentials');
    alert('請輸入帳號和密碼');
    return;
  }

  // 顯示載入中狀態
  const loginButton = document.getElementById('loginButton');
  const originalText = loginButton.textContent;
  loginButton.textContent = '登入中...';
  loginButton.disabled = true;

  try {
    console.log('Sending login request to API...');
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();
    console.log('API response:', data);

    if (response.ok) {
      // 登入成功，儲存 token 和用戶名稱
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', username);
      loginSection.classList.add('hidden');
      mainSection.classList.remove('hidden');
      userAvatarSection.classList.remove('hidden');
      console.log('Login successful, UI updated');
      alert(data.message || '登入成功！');
    } else {
      // 登入失敗
      console.log('Login failed:', data.detail);
      alert(data.detail || '登入失敗，請檢查帳號密碼');
    }
  } catch (error) {
    console.error('Login error:', error);
    // 檢查是否為連線錯誤
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      alert('無法連接到伺服器，請檢查:\n1. 後端服務是否啟動 (http://localhost:8000)\n2. Chrome 擴充功能權限是否正確\n3. 網路連線是否正常');
    } else {
      alert('登入時發生錯誤，請稍後再試');
    }
  } finally {
    // 恢復按鈕狀態
    loginButton.textContent = originalText;
    loginButton.disabled = false;
  }
});

// 傳送資料按鈕邏輯 - 使用帶驗證的請求
document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'sendData') {
    console.log('Send Data button clicked');
    try {
      // 使用帶有 token 驗證的請求
      const response = await authenticatedFetch(`${API_BASE_URL}/items/`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Data retrieved:', data);
        alert('資料傳送成功！');
      }
    } catch (error) {
      if (error.message !== 'Token expired') {
        alert('資料傳送失敗，請稍後再試');
      }
    }
  }
});

// 聊天室按鈕邏輯 - 導向聊天室頁面
document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'chatButton') {
    console.log('Chat button clicked');
    try {
      // 檢查 token 有效性
      const isValid = await verifyToken();
      if (isValid) {
        // 導向聊天室頁面
        window.location.href = 'chat.html';
      }
    } catch (error) {
      console.error('Chat button error:', error);
    }
  }
});

// 登出按鈕邏輯
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'logoutButton') {
    console.log('Logout button clicked');
    logout();
  }
});

// 添加登出功能供測試
function logout() {
  console.log('Logging out...');
  localStorage.removeItem('token');
  location.reload();
}

console.log('All event listeners added');

// 頭像和下拉選單功能
document.addEventListener('DOMContentLoaded', function() {
  const userAvatar = document.getElementById('userAvatar');
  const userDropdown = document.getElementById('userDropdown');
  const updateProfile = document.getElementById('updateProfile');
  const logoutFromDropdown = document.getElementById('logoutFromDropdown');

  // 點擊頭像顯示/隱藏下拉選單
  if (userAvatar) {
    userAvatar.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
  }

  // 點擊其他地方隱藏下拉選單
  document.addEventListener('click', function(e) {
    if (!userDropdown.contains(e.target) && !userAvatar.contains(e.target)) {
      userDropdown.classList.remove('show');
    }
  });

  // 更新資料選項
  if (updateProfile) {
    updateProfile.addEventListener('click', function() {
      userDropdown.classList.remove('show');
      showUpdateProfileDialog();
    });
  }

  // 登出選項
  if (logoutFromDropdown) {
    logoutFromDropdown.addEventListener('click', function() {
      userDropdown.classList.remove('show');
      logout();
    });
  }
});

// 顯示更新資料對話框
function showUpdateProfileDialog() {
  const currentUsername = localStorage.getItem('username') || 'admin';
  
  // 創建簡單的對話框
  const dialog = document.createElement('div');
  dialog.innerHTML = `
    <div class="profile-dialog-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 30px; border-radius: 16px; width: 280px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
        <h3 style="margin: 0 0 20px 0; color: #333; text-align: center; font-size: 18px;">更新資料</h3>
        <div style="margin-bottom: 15px;">
          <label style="display: block; font-size: 14px; color: #666; margin-bottom: 5px;">使用者帳號</label>
          <input type="text" id="newUsername" value="${currentUsername}" style="width: 100%; padding: 10px; border: 2px solid #e1e5e9; border-radius: 8px; box-sizing: border-box;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; font-size: 14px; color: #666; margin-bottom: 5px;">新密碼（選填）</label>
          <input type="password" id="newPassword" placeholder="留空則不修改密碼" style="width: 100%; padding: 10px; border: 2px solid #e1e5e9; border-radius: 8px; box-sizing: border-box;">
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="cancel-profile-update" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">取消</button>
          <button class="confirm-profile-update" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">更新</button>
        </div>
      </div>
    </div>
  `;
  
  // 添加事件監聽器
  const cancelButton = dialog.querySelector('.cancel-profile-update');
  const confirmButton = dialog.querySelector('.confirm-profile-update');
  
  cancelButton.addEventListener('click', function() {
    dialog.remove();
  });
  
  confirmButton.addEventListener('click', function() {
    updateUserProfile();
  });
  
  document.body.appendChild(dialog);
}

// 更新用戶資料
async function updateUserProfile() {
  const newUsername = document.getElementById('newUsername').value;
  const newPassword = document.getElementById('newPassword').value;
  
  if (!newUsername.trim()) {
    alert('請輸入使用者帳號');
    return;
  }
  
  try {
    // 這裡可以串接後端 API 來更新用戶資料
    // 目前先做本地更新示範
    localStorage.setItem('username', newUsername);
    
    // 如果有輸入新密碼，也可以傳送到後端
    if (newPassword.trim()) {
      // 串接後端更新密碼的 API
      console.log('Update password for user:', newUsername);
    }
    
    alert('資料更新成功！');
    
    // 關閉對話框 - 使用類別選擇器而非內聯樣式選擇器
    const dialog = document.querySelector('.profile-dialog-overlay').parentElement;
    if (dialog) dialog.remove();
    
  } catch (error) {
    console.error('Update profile error:', error);
    alert('更新資料失敗，請稍後再試');
  }
}
