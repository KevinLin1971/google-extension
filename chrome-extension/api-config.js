// api-config.js
// 統一的 API 配置和輔助函數

// API 設定
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  V1_PREFIX: '/api/v1',
  TIMEOUT: 10000, // 10 秒超時
};

// 建構完整的 API URL
function buildApiUrl(endpoint, version = 'v1') {
  const versionPrefix = version === 'v1' ? API_CONFIG.V1_PREFIX : `/api/${version}`;
  return `${API_CONFIG.BASE_URL}${versionPrefix}${endpoint}`;
}

// 取得儲存的認證 Token
function getAuthToken() {
  return localStorage.getItem('token');
}

// 帶有認證的 fetch 請求
async function authenticatedFetch(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.status === 401) {
      // Token 過期或無效
      localStorage.removeItem('token');
      throw new Error('Authentication failed - token expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your network connection');
    }
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network connection failed - please check if the server is running');
    }
    throw error;
  }
}

// 不需要認證的 fetch 請求
async function publicFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your network connection');
    }
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network connection failed - please check if the server is running');
    }
    throw error;
  }
}

// API 端點常數
const API_ENDPOINTS = {
  // 認證相關
  AUTH: {
    LOGIN: '/auth/login',
    TOKEN: '/auth/token',
    VERIFY: '/auth/verify-token'
  },
  
  // 項目管理
  ITEMS: {
    LIST: '/items/',
    CREATE: '/items/',
    GET: (id) => `/items/${id}`,
    UPDATE: (id) => `/items/${id}`,
    DELETE: (id) => `/items/${id}`
  }
};

// 常用的 API 調用函數
const API = {
  // 認證 API
  auth: {
    async login(username, password) {
      const response = await publicFetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      return response.json();
    },
    
    async verifyToken() {
      const response = await authenticatedFetch(API_ENDPOINTS.AUTH.VERIFY);
      return response.json();
    }
  },

  // 項目管理 API
  items: {
    async list() {
      const response = await authenticatedFetch(API_ENDPOINTS.ITEMS.LIST);
      return response.json();
    },
    
    async create(itemData) {
      const response = await authenticatedFetch(API_ENDPOINTS.ITEMS.CREATE, {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
      return response.json();
    },
    
    async get(id) {
      const response = await authenticatedFetch(API_ENDPOINTS.ITEMS.GET(id));
      return response.json();
    },
    
    async update(id, itemData) {
      const response = await authenticatedFetch(API_ENDPOINTS.ITEMS.UPDATE(id), {
        method: 'PUT',
        body: JSON.stringify(itemData)
      });
      return response.json();
    },
    
    async delete(id) {
      const response = await authenticatedFetch(API_ENDPOINTS.ITEMS.DELETE(id), {
        method: 'DELETE'
      });
      return response.json();
    }
  }
};

// 導出供其他檔案使用
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 環境
  module.exports = {
    API_CONFIG,
    buildApiUrl,
    authenticatedFetch,
    publicFetch,
    API_ENDPOINTS,
    API
  };
} else {
  // 瀏覽器環境
  window.ApiConfig = {
    API_CONFIG,
    buildApiUrl,
    authenticatedFetch,
    publicFetch,
    API_ENDPOINTS,
    API
  };
}
