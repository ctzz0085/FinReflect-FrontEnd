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
      console.log('=== API REQUEST (FormData) ===');
      console.log('Method:', config.method?.toUpperCase());
      console.log('URL:', config.baseURL + config.url);
      console.log('FormData detected - Content-Type will be set automatically');
    } else {
      console.log('=== API REQUEST ===');
      console.log('Method:', config.method?.toUpperCase());
      console.log('URL:', config.baseURL + config.url);
      if (!config.url?.startsWith('/auth/')) {
        console.log('Request Body:', JSON.stringify(config.data, null, 2));
      }
    }
    
    console.log('User:', user);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (user?.userId) {
      config.headers['X-User-Id'] = user.userId.toString();
      console.log('X-User-Id header set to:', user.userId);
    } else {
      console.warn('No userId found in user object!');
    }
    
    console.log('==================');
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Response Error:', error?.response?.status, error?.response?.statusText);
    console.log('Error URL:', error?.config?.url);
    console.log('Error Data:', JSON.stringify(error?.response?.data));
    if (!error?.config?.url?.startsWith('/auth/')) {
      console.log('Request Data:', JSON.stringify(error?.config?.data));
    }
    
    if (error?.response?.status === 401) {
      console.log('401 Unauthorized - logging out');
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
