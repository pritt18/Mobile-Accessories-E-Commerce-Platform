import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token and guest session ID to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mobixia_token') || localStorage.getItem('nexgear_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Session ID for guest carts
  let sessionId = localStorage.getItem('mobixia_session_id') || localStorage.getItem('nexgear_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('mobixia_session_id', sessionId);
  }
  config.headers['x-session-id'] = sessionId;

  return config;
});

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && (localStorage.getItem('mobixia_token') || localStorage.getItem('nexgear_token'))) {
      // Token expired or invalid
      console.warn('Session expired. Logging out.');
      localStorage.removeItem('mobixia_token');
      localStorage.removeItem('mobixia_user');
      localStorage.removeItem('nexgear_token');
      localStorage.removeItem('nexgear_user');
      // If in admin page, redirect to login
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
