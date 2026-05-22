import api from './api';

// Maps to AuthController: /api/auth/signup, /api/auth/login
// Backend returns { token, tokenType, username, role }
export const authService = {
  signup: (payload) => api.post('/auth/signup', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
};
