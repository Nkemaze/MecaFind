import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mecafind_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mecafind_token');
      localStorage.removeItem('mecafind_user');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
