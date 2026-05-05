export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://coffee-api.osohoo691016.workers.dev/v1';
import { MenuItem } from '@coffee/shared/src/types';

const CUSTOMER_TOKEN_KEY = 'bonum_customer_token';
export const ADMIN_TOKEN_KEY = 'bonum_admin_token';

export const fetchWithAdminAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;

  const headers = new Headers(options.headers || {});
  headers.append('Content-Type', 'application/json');
  if (token) headers.append('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    throw new Error('API request failed');
  }

  return res.json();
};

export const fetchWithCustomerAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;

  const headers = new Headers(options.headers || {});
  headers.append('Content-Type', 'application/json');
  if (token) headers.append('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    throw new Error('API request failed');
  }

  return res.json();
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bonum_token') : null;
  
  const headers = new Headers(options.headers || {});
  headers.append('Content-Type', 'application/json');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error('API request failed');
  }

  return res.json();
};

export const api = {
  getOrders: (shopId: string) => fetchWithAuth(`/shops/${shopId}/orders`),
  getMenu: (shopId: string) => fetchWithAuth(`/shops/${shopId}/menu`),
  createMenuItem: (shopId: string, data: Partial<MenuItem>) => fetchWithAuth(`/shops/${shopId}/menu`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getShops: async () => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const res = await fetch(`${API_URL}/shops`, { headers });
    if (!res.ok) throw new Error('Failed to load shops');
    return res.json();
  },
  getShopBySlug: async (slug: string) => {
    const res = await fetch(`${API_URL}/shops/slug/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Shop not found');
    return res.json();
  },
  bootstrapCustomer: async () => {
    const res = await fetch(`${API_URL}/auth/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Session bootstrap failed');
    const data = await res.json();
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
    }
    return data;
  },
  createShop: (data: { name: string; address: string; lat: number; lng: number }) => fetchWithAuth('/shops', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  async adminLogin(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      token?: string;
      user?: { role?: string };
    };
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.user?.role !== 'admin') {
      throw new Error('This account is not a platform admin.');
    }
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    }
    return data;
  },

  async shopPortalLogin(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      token?: string;
      user?: { role?: string; shopId?: string | null };
    };
    if (!res.ok) throw new Error(data.error || 'Login failed');
    const r = data.user?.role;
    const needsShop =
      r === 'shop_owner' || r === 'menu_manager' || r === 'orders_manager';
    if (needsShop && !data.user?.shopId) {
      throw new Error('No shop is assigned to this account.');
    }
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('bonum_token', data.token);
      localStorage.setItem('bonum_shop_id', data.user?.shopId ?? '');
      localStorage.setItem('bonum_dashboard_role', r ?? '');
    }
    return data;
  },

  shopPortalLogout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('bonum_token');
    localStorage.removeItem('bonum_shop_id');
    localStorage.removeItem('bonum_dashboard_role');
  },

  adminLogout() {
    if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  adminCreateShop: (body: Record<string, unknown>) =>
    fetchWithAdminAuth('/admin/shops', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  adminGetShopTeam: (shopId: string) =>
    fetchWithAdminAuth(`/admin/shops/${shopId}/team`),

  adminAddShopManager: (
    shopId: string,
    body: {
      email: string;
      password: string;
      display_name: string;
      staff_role: 'menu_manager' | 'orders_manager';
    }
  ) =>
    fetchWithAdminAuth(`/admin/shops/${shopId}/managers`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // fetchWithAuth automatically adds Content-Type: application/json, which breaks multipart/form-data.
    // So we need a custom fetch here or adjust fetchWithAuth. We'll do a custom fetch.
    const token = typeof window !== 'undefined' ? localStorage.getItem('bonum_token') : null;
    const headers = new Headers();
    if (token) headers.append('Authorization', `Bearer ${token}`);
    
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  getAdminMetrics: () => fetchWithAdminAuth('/admin/metrics'),
  getAdminPayouts: () => fetchWithAdminAuth('/admin/payouts'),
  getAdminHeatmap: () => fetchWithAdminAuth('/admin/heatmap'),
  
  // Shop Dashboard Endpoints
  getShop: (shopId: string) => fetchWithAuth(`/shops/${shopId}`),
  updateShop: (shopId: string, data: any) => fetchWithAuth(`/shops/${shopId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getShopMetrics: (shopId: string) => fetchWithAuth(`/shops/${shopId}/metrics`),
  
  // Modifiers
  getModifiers: (shopId: string) => fetchWithAuth(`/shops/${shopId}/modifiers`),
  createModifier: (shopId: string, data: {name: string, extra_price?: number}) => fetchWithAuth(`/shops/${shopId}/modifiers`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  toggleModifier: (shopId: string, modId: string, is_available: boolean) => fetchWithAuth(`/shops/${shopId}/modifiers/${modId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_available })
  }),
  
  // Menu Updates
  toggleMenuItem: (shopId: string, itemId: string, is_available: boolean) => fetchWithAuth(`/shops/${shopId}/menu/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_available })
  }),
  
  // Orders
  updateOrderStatus: (orderId: string, status: string) => fetchWithAuth(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  getRecentOrder: () => fetchWithCustomerAuth(`/orders/recent`),
  getOrder: (orderId: string) => fetchWithAuth(`/orders/${orderId}`),
  reorder: (orderId: string) => fetchWithCustomerAuth(`/orders/${orderId}/reorder`, {
    method: 'POST'
  }),
  createOrder: (body: {
    shop_id: string;
    items: { menu_item_id: string; quantity: number; temperature?: string }[];
    promo_code?: string;
  }) =>
    fetchWithCustomerAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Profile (customer anonymous JWT from bootstrap)
  getProfile: () => fetchWithCustomerAuth('/users/me/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    fetchWithCustomerAuth('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

let customerSessionInflight: Promise<void> | null = null;

/** Ensures anonymous customer JWT exists before orders/profile calls (deduped). */
export async function ensureCustomerSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(CUSTOMER_TOKEN_KEY)) return;
  if (!customerSessionInflight) {
    customerSessionInflight = api
      .bootstrapCustomer()
      .then(() => undefined)
      .finally(() => {
        customerSessionInflight = null;
      });
  }
  await customerSessionInflight;
}
