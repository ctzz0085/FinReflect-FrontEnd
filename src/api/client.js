import axios from 'axios';
import { getToken, getUser, logout } from '../utils/auth';

const api = axios.create({
  baseURL: 'http://localhost:8090/',
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    const user = await getUser();
    
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Token:', token ? 'Bearer ' + token.substring(0, 20) + '...' : 'No token');
    console.log('User:', user);
    console.log('Request Body:', JSON.stringify(config.data));
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (user?.userId) {
      config.headers['X-User-Id'] = user.userId.toString();
      console.log('X-User-Id header set to:', user.userId);
    } else {
      console.warn('No userId found in user object!');
    }
    
    console.log('Final headers:', JSON.stringify(config.headers));
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Response Error:', error?.response?.status, error?.response?.statusText);
    console.log('Error URL:', error?.config?.url);
    console.log('Error Headers:', error?.response?.headers);
    
    if (error?.response?.status === 401) {
      console.log('401 Unauthorized - logging out');
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
