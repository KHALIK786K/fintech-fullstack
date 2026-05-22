import api from './api';

// Maps to TransactionController: /api/transactions
export const transactionService = {
  byReference: (ref) => api.get(`/transactions/${ref}`).then((r) => r.data),
  // Backend returns a Spring Page object: { content, totalElements, totalPages, number, ... }
  history: (accountNumber, { page = 0, size = 20 } = {}) =>
    api.get(`/transactions/account/${accountNumber}`, { params: { page, size } }).then((r) => r.data),
};
