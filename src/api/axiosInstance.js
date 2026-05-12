import axios from 'axios';
import { clearAuthData, getToken } from '../utils/authStorage';

/** مسارات موحّدة: `endpoints.js` — توثيق العقد: `docs/API_CONTRACT.md` */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 (skip logout+redirect for /ai/* so the chat can show an error in-thread)
function isAiRequest(config) {
  return String(config?.url || '').includes('ai/');
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (isAiRequest(error.config)) {
        return Promise.reject(error);
      }
      clearAuthData();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;