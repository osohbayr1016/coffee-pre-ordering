export const API_URL = 'http://localhost:8787/v1';
import { MenuItem } from '@coffee/shared/src/types';

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
};
