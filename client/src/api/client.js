import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medstore_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response interceptor — auto-logout on 401 and normalise errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and redirect to /auth
      localStorage.removeItem('medstore_token');
      localStorage.removeItem('medstore_user');
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
        window.location.href = '/auth';
      }
    }

    // Normalise the rejected error so callers always get a message string
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network error — please check your connection';

    return Promise.reject(new Error(message));
  }
);

export default api;
