import api from "./api";

const planService = {
  getPlans: async () => {
    const res = await api.get("/membership-plans");
    return res.data;
  },

  addPlan: async (plan) => {
    const res = await api.post("/membership-plans", plan);
    return res.data;
  },

  updatePlan: async (id, plan) => {
    const res = await api.put(`/membership-plans/${id}`, plan);
    return res.data;
  },

  deletePlan: async (id) => {
    await api.delete(`/membership-plans/${id}`);
  },
};

export default planService;
