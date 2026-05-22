import axios from 'axios';
import { storage } from '../utils/storage';

// Single shared Axios instance for the whole app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor -------------------------------------------------
// Attaches the JWT (if present) to every outgoing request as a Bearer token.
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor ------------------------------------------------
// A 401 means the token is missing, invalid, or expired. We clear the session
// and bounce the user to /login. We dispatch a custom event so the AuthContext
// can react without this module importing React (keeps it framework-agnostic).
let handlingAuthError = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && !handlingAuthError) {
      handlingAuthError = true;
      storage.clear();
      // Avoid redirect loops if we're already on the login page.
      if (!window.location.pathname.startsWith('/login')) {
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: 'expired' }));
      }
      setTimeout(() => { handlingAuthError = false; }, 500);
    }
    return Promise.reject(error);
  }
);

// Normalizes the backend's ErrorResponse shape into a single message string.
export function extractError(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  // Backend GlobalExceptionHandler returns { message, fieldErrors, ... }
  if (data.fieldErrors && Object.keys(data.fieldErrors).length) {
    return Object.values(data.fieldErrors).join(' ');
  }
  return data.message || fallback;
}

export default api;
