import api from './api';

// Maps to BeneficiaryController: /api/beneficiaries
export const beneficiaryService = {
  add: (payload) => api.post('/beneficiaries', payload).then((r) => r.data),
  list: () => api.get('/beneficiaries').then((r) => r.data),
  remove: (id) => api.delete(`/beneficiaries/${id}`).then((r) => r.data),
};
