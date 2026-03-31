// src/services/notificationService.js
import api from "./api";

const base = "/notifications";

const notificationService = {
  // 🔹 Get all notifications for a user
  getByUser: async (userId) => {
    const res = await api.get(`${base}/user/${userId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // 🔹 Get only unread notifications for a user
  getUnread: async (userId) => {
    const res = await api.get(`${base}/unread/${userId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // 🔹 Get admin unread notifications (UPDATED)
  getAdmin: async () => {
    // call the new backend endpoint for admin notifications
    const res = await api.get(`${base}/admin/unread`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // 🔹 Mark notification as read
  markAsRead: async (id) => {
    const res = await api.put(`${base}/${id}/read`);
    return res.data;
  },

  // 🔹 Delete notification
  delete: async (notificationId) => {
    const res = await api.delete(`${base}/${notificationId}`);
    return res.data;
  },

  // 🔹 Get unread count (frontend helper)
  getUnreadCount: async (userId) => {
    const res = await api.get(`${base}/unread/${userId}`);
    return Array.isArray(res.data) ? res.data.length : 0; // return count instead of array
  },
};

export default notificationService;
