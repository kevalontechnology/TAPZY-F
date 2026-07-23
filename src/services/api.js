import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tapzy-b.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tapzy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON. Make sure the backend server (port 5000) is running.');
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tapzy_token');
      localStorage.removeItem('tapzy_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    let message = 'API Request failed';
    if (error.response && error.response.data) {
      if (typeof error.response.data === 'object' && error.response.data.message) {
        message = error.response.data.message;
      } else if (typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
        message = 'Backend server returned HTML (Check if Node server is running on port 5000).';
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({ message });
  }
);

export default api;
