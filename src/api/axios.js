import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kidcare.sy/api',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('reception_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      sessionStorage.removeItem('reception_token');
      sessionStorage.removeItem('reception_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;