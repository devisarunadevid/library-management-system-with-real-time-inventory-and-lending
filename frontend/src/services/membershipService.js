import api from "./api";

export const membershipService = {
  getAll: async () => {
    const res = await api.get("/plans");
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/plans/${id}`);
    return res.data;
  },

  create: async (plan) => {
    const res = await api.post("/plans", plan);
    return res.data;
  },

  update: async (id, plan) => {
    const res = await api.put(`/plans/${id}`, plan);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/plans/${id}`);
    return res.data;
  },

  // ✅ Fetch logged-in user's membership plan safely
  getUserPlan: async (userId) => {
    try {
      const res = await api.get(`/membership/user/${userId}`);
      return res.data; // { id, type, discountRate, etc. }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // User has no plan
        return null;
      }
      throw err; // rethrow other errors
    }
  },
};
