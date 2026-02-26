// src/services/transactionService.js
import api from "./api";

const base = "/borrow-requests";

const transactionService = {
  getPending: async () => {
    const res = await api.get(`${base}/pending`);
    return res.data;
  },

  getByUser: async (userId) => {
    const res = await api.get(`${base}/user/${userId}`);
    return res.data;
  },

  requestBorrow: async (userId, bookId) => {
    // controller expects POST /request with query params
    const res = await api.post(`${base}/request`, null, {
      params: { userId, bookId },
    });
    return res.data;
  },

  approve: async (requestId, durationDays) => {
    const res = await api.post(`${base}/approve/${requestId}`, null, {
      params: { durationDays },
    });
    return res.data;
  },

  reject: async (requestId, reason) => {
    const res = await api.post(`${base}/reject/${requestId}`, null, {
      params: { reason },
    });
    return res.data;
  },

  returnBook: async (requestId) => {
    const res = await api.post(`${base}/return/${requestId}`);
    return res.data;
  },

  renew: async (recordId) => {
    const res = await api.post(`/borrow/renew/${recordId}`);
    return res.data;
  },

  // admin helper: get single
  getById: async (id) => {
    const res = await api.get(`${base}/${id}`);
    return res.data;
  },
};

export default transactionService;
