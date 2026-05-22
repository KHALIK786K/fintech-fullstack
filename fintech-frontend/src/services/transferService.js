import api from './api';

// Maps to TransferController: /api/transfers/rtgs and /api/transfers/neft
export const transferService = {
  rtgs: (payload) => api.post('/transfers/rtgs', payload).then((r) => r.data),
  neft: (payload) => api.post('/transfers/neft', payload).then((r) => r.data),
};
