// Simple API client mapping frontend to backend endpoints
const BASE_URL = import.meta.env.VITE_API_BASE || '';

// Gemini API key - can be overridden from user settings
const DEFAULT_GEMINI_API_KEY = 'AIzaSyCgGDug9wjaCwxl8dMtaS4AUyNYPwEdW6A';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Get auth headers
function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Token ${token}` } : {};
}

async function fetchJSON(path, { method = 'GET', body, headers, requireAuth = true } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(requireAuth ? getAuthHeaders() : {}),
      ...(headers || {}),
    },
  };
  if (body !== undefined) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  // Some endpoints may return 204 No Content
  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

export const AuthAPI = {
  register: (payload) => fetchJSON('/users/register/', { method: 'POST', body: payload, requireAuth: false }),
  login: (payload) => fetchJSON('/users/login/', { method: 'POST', body: payload, requireAuth: false }),
  logout: () => fetchJSON('/users/logout/', { method: 'POST' }),
  getProfile: () => fetchJSON('/users/profile/'),
  updateProfile: (payload) => fetchJSON('/users/profile/update/', { method: 'PUT', body: payload }),
  updateSettings: (payload) => fetchJSON('/users/settings/', { method: 'PUT', body: payload }),
  changePassword: (payload) => fetchJSON('/users/change-password/', { method: 'POST', body: payload }),
  checkUsername: (username) => fetchJSON(`/users/check-username/?username=${encodeURIComponent(username)}`, { requireAuth: false }),
  checkEmail: (email) => fetchJSON(`/users/check-email/?email=${encodeURIComponent(email)}`, { requireAuth: false }),
};

export const OrdersAPI = {
  getMenuItems: () => fetchJSON('/api/menu-items/'),
  createMenuItem: (payload) => fetchJSON('/api/menu-items/', { method: 'POST', body: payload }),
  updateMenuItem: (id, payload) => fetchJSON(`/api/menu-items/${id}/`, { method: 'PUT', body: payload }),
  deleteMenuItem: (id) => fetchJSON(`/api/menu-items/${id}/`, { method: 'DELETE' }),
  listOrders: () => fetchJSON('/api/orders/'),
  getOrder: (id) => fetchJSON(`/api/orders/${id}/`),
  createOrder: (payload) => fetchJSON('/api/orders/create_order/', { method: 'POST', body: payload }),
  payOrder: (payload) => fetchJSON('/api/pay-order/', { method: 'POST', body: payload }),
  getBillingHistory: () => fetchJSON('/api/billing-history/'),
  getBillingItems: (id) => fetchJSON(`/api/billing-history/${id}/items/`),
};

export const InventoryAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const path = qs ? `/inventory/items/?${qs}` : '/inventory/items/';
    return fetchJSON(path);
  },
  get: (id) => fetchJSON(`/inventory/items/${id}/`),
  create: (payload) => fetchJSON('/inventory/items/', { method: 'POST', body: payload }),
  update: (id, payload) => fetchJSON(`/inventory/items/${id}/`, { method: 'PUT', body: payload }),
  patch: (id, payload) => fetchJSON(`/inventory/items/${id}/`, { method: 'PATCH', body: payload }),
  remove: (id) => fetchJSON(`/inventory/items/${id}/`, { method: 'DELETE' }),
  stats: () => fetchJSON('/inventory/items/stats/'),
  lowStock: () => fetchJSON('/inventory/items/low_stock/'),
};

export const DashboardAPI = {
  stats: () => fetchJSON('/dashboard/stats/'),
};

export const GeminiAPI = {
  /**
   * Chat with Gemini API
   * @param {Object} options
   * @param {string} options.model - Model name (default: gemini-2.0-flash)
   * @param {Array} options.messages - Array of { role: 'user'|'model', content: string }
   * @param {string} options.apiKey - Optional API key override
   * @returns {Promise<Object>} Response with message content
   */
  chat: async ({ model = 'gemini-2.0-flash', messages = [], apiKey = null }) => {
    const key = apiKey || localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    // Convert messages to Gemini format
    const contents = [];
    let systemInstruction = null;

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      message: {
        content: content
      }
    };
  }
};

// Legacy alias for backward compatibility
export const LLMAPI = GeminiAPI;

export default { AuthAPI, OrdersAPI, InventoryAPI, DashboardAPI, GeminiAPI, LLMAPI };
