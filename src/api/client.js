import axios from 'axios';
import { getToken, getUser, logout } from '../utils/auth';
import getEnvVars from '../config/env';

const { API_BASE_URL } = getEnvVars();

const api = axios.create({
  baseURL: API_BASE_URL,
  // The hosted server sleeps when idle and can take about a minute to wake.
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    const user = await getUser();
    
    // If sending FormData, remove Content-Type header to let Axios set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (user?.userId) {
      config.headers['X-User-Id'] = user.userId.toString();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
