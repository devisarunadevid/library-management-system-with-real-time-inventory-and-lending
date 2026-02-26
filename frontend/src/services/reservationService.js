// src/services/reservationService.js
import api from "./api";

const base = "/reservations";

const reservationService = {
  reserve: async (userId, bookId) => {
    const res = await api.post(`${base}/reserve`, null, {
      params: { userId, bookId },
    });
    return res.data;
  },

  cancel: async (reservationId) => {
    const res = await api.delete(`${base}/${reservationId}`);
    return res.data;
  },

  getByUser: async (userId) => {
    const res = await api.get(`${base}/user/${userId}`);
    return res.data;
  },

  getAll: async () => {
    const res = await api.get(base);
    return res.data;
  },

  getByBook: async (bookId) => {
    const res = await api.get(`${base}/book/${bookId}`);
    return res.data;
  },
};

export default reservationService;
