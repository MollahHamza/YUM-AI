// Simple API client mapping frontend to backend endpoints
// Use relative paths by default so Vite proxy handles CORS in dev
const BASE_URL = import.meta.env.VITE_API_BASE || '';

async function fetchJSON(path, { method = 'GET', body, headers } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  };
  if (body !== undefined) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
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

export const OrdersAPI = {
  // Mounted under /api/ via orders.urls
  getMenuItems: () => fetchJSON('/api/menu-items/'),
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

export default { OrdersAPI, InventoryAPI, DashboardAPI };