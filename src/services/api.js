import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============ Auth ============
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  getUsers: () => api.get('/auth/users/'),
  updateUser: (id, data) => api.patch(`/auth/manage/${id}/`, data),
  getUserActivity: (id) => api.get(`/auth/manage/${id}/activity/`),
  getAuditLogs: () => api.get('/auth/audit/'),
  getNotifications: () => api.get('/auth/notifications/'),
  markNotificationRead: (id) => api.post(`/auth/notifications/${id}/mark_read/`),
  updateZone: (userId, zone) => api.patch(`/auth/manage/${userId}/`, { zone }),
};

import { cacheData, getCachedData } from './db';

// ============ Land & Farming ============
export const farmingAPI = {
  getLands: async () => {
    try {
      const res = await api.get('/farming/lands/');
      const data = res.data.results || res.data;
      cacheData('lands', data); // Sync to IndexedDB
      return res;
    } catch (err) {
      if (!window.navigator.onLine) {
        const cached = await getCachedData('lands');
        return { data: cached, fromCache: true };
      }
      throw err;
    }
  },
  getLand: (id) => api.get(`/farming/lands/${id}/`),
  createLand: (data) => api.post('/farming/lands/', data),
  updateLand: (id, data) => api.put(`/farming/lands/${id}/`, data),
  deleteLand: (id) => api.delete(`/farming/lands/${id}/`),
  getLandHistory: (id) => api.get(`/farming/lands/${id}/history/`),
  getTracks: async () => {
    try {
      const res = await api.get('/farming/tracks/');
      const data = res.data.results || res.data;
      cacheData('tracks', data);
      return res;
    } catch (err) {
      if (!window.navigator.onLine) {
        const cached = await getCachedData('tracks');
        return { data: cached, fromCache: true };
      }
      throw err;
    }
  },
  getTrack: (id) => api.get(`/farming/tracks/${id}/`),
  createTrack: (data) => api.post('/farming/tracks/', data),
  updateTrack: (id, data) => api.put(`/farming/tracks/${id}/`, data),
  getStages: (trackId) => api.get('/farming/stages/', { params: { track: trackId } }),
  updateStage: (id, data) => api.put(`/farming/stages/${id}/`, data),
  getWeather: (params) => api.get('/farming/weather/', { params }),
};

// ============ AI Chat (Memory-Aware) ============
export const chatAPI = {
  getSoilLogs: () => api.get('/ai/soil-classify/logs/'),
  voiceCommand: (text) => api.post('/ai/voice-command/', { text }),
  voiceCommandAudio: (formData) => api.post('/ai/voice-command/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSessions: () => api.get('/ai/chat-sessions/'),
  getSession: (id) => api.get(`/ai/chat-sessions/${id}/`),
  createSession: (data) => api.post('/ai/chat-sessions/', data),
  deleteSession: (id) => api.delete(`/ai/chat-sessions/${id}/`),
  sendMessage: (data) => api.post('/ai/gemini-chat/', data),
};

export const weatherAPI = {
  getForecast: (params) => api.get('/ai/weather-forecast/', { params }),
};

// ============ Disease Detection ============
export const diseaseAPI = {
  detect: (formData) => api.post('/ai/disease-detect/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSupportedCrops: () => api.get('/ai/disease-detect/'),
};

// ============ Soil Classification ============
export const soilAPI = {
  classify: (formData) => api.post('/ai/soil-classify/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ============ Marketplace ============
export const marketAPI = {
  getProducts: (params) => api.get('/marketplace/products/', { params }),
  getProduct: (id) => api.get(`/marketplace/products/${id}/`),
  createProduct: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.post('/marketplace/products/', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  updateProduct: (id, formData) => api.put(`/marketplace/products/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  patchProduct: (id, data) => api.patch(`/marketplace/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/marketplace/products/${id}/`),
  getOrders: () => api.get('/marketplace/orders/'),
  updateOrder: (id, data) => api.patch(`/marketplace/orders/${id}/`, data),
  createOrder: (data) => api.post('/marketplace/orders/', data),
};

// ============ Finance & Subscriptions ============
export const financeAPI = {
  getPlans: () => api.get('/finance/plans/'),
  seedDefaults: () => api.post('/finance/plans/seed-defaults/'),
  createPlan: (data) => api.post('/finance/plans/', data),
  updatePlan: (id, data) => api.put(`/finance/plans/${id}/`, data),
  deletePlan: (id) => api.delete(`/finance/plans/${id}/`),
  getSubscription: () => api.get('/finance/subscription/'),
  checkout: (data) => api.post('/finance/checkout/', data),
  triggerIPN: (data) => api.post('/finance/payment/callback/', data),
  getLedger: () => api.get('/finance/ledger/'),
};

// ============ Consultations ============
export const consultationAPI = {
  getSlots: (paramsOrAvailable) => {
    const params =
      paramsOrAvailable && typeof paramsOrAvailable === 'object' && !Array.isArray(paramsOrAvailable)
        ? paramsOrAvailable
        : { available: paramsOrAvailable };
    return api.get('/consultation/slots/', { params });
  },
  getCoverage: (params) => api.get('/consultation/slots/coverage/', { params }),
  createSlot: (data) => api.post('/consultation/slots/', data),
  updateSlot: (id, data) => api.patch(`/consultation/slots/${id}/`, data),
  deleteSlot: (id) => api.delete(`/consultation/slots/${id}/`),
  getTickets: () => api.get('/consultation/tickets/'),
  getTicket: (id) => api.get(`/consultation/tickets/${id}/`),
  bookTicket: (data) => api.post('/consultation/tickets/book/', data),
  startSession: (id) => api.post(`/consultation/tickets/${id}/start_session/`),
  completeSession: (id, summary) => api.post(`/consultation/tickets/${id}/complete_session/`, { expert_summary: summary }),
};

export default api;
