import api from './api';

// Maps to AccountController: /api/accounts
export const accountService = {
  create: (payload) => api.post('/accounts', payload).then((r) => r.data),
  myAccounts: () => api.get('/accounts').then((r) => r.data),
  byNumber: (accountNumber) => api.get(`/accounts/${accountNumber}`).then((r) => r.data),
};
