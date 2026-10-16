import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds for AI operations
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('travelgenie_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  async register(data) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async login(data) {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Trips
  async planTrip(params) {
    const res = await apiClient.post('/trips/plan', params);
    return res.data;
  },

  async saveTrip(trip) {
    const res = await apiClient.post('/trips', trip);
    return res.data;
  },

  async getSavedTrips() {
    const res = await apiClient.get('/trips');
    return res.data;
  },

  async getTripById(id) {
    const res = await apiClient.get(`/trips/${id}`);
    return res.data;
  },

  async updateTrip(id, tripData) {
    const res = await apiClient.put(`/trips/${id}`, tripData);
    return res.data;
  },

  async deleteTrip(id) {
    const res = await apiClient.delete(`/trips/${id}`);
    return res.data;
  },

  // Budget
  async calculateBudget(params) {
    const res = await apiClient.post('/budget/calculate', params);
    return res.data;
  },

  async optimizeBudget(params) {
    const res = await apiClient.post('/budget/optimize', params);
    return res.data;
  },

  // AI
  async chatWithAI(message, tripContext) {
    const res = await apiClient.post('/ai/chat', { message, tripContext });
    return res.data;
  },

  async getPackingList(destination, durationDays, travelStyle) {
    const res = await apiClient.get('/ai/packing-list', {
      params: { destination, durationDays, travelStyle },
    });
    return res.data.packingList;
  },
};
