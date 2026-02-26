import api from "./api";

export const memberService = {
  getAll: async () => {
    const res = await api.get("/members");
    return res.data;
  },

  create: async ({ userId, planId, startDate }) => {
    const payload = { userId, planId, startDate };
    const res = await api.post("/members", payload);
    return res.data;
  },

  update: async (id, { userId, planId, startDate }) => {
    const payload = { userId, planId, startDate };
    const res = await api.put(`/members/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/members/${id}`);
    return res.data;
  },

  renewMembership: async (memberId, planId) => {
    const res = await api.put(`/members/${memberId}/membership`, null, {
      params: { planId },
    });
    return res.data;
  },

  // convenience: fetch currently logged-in user's member record
  getProfileByLoggedInUser: async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No logged-in userId in localStorage");
    const res = await api.get(`/members/${userId}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },

  getProfile: async (email) => {
    const res = await api.get(`/members/profile/${email}`);
    return res.data; // this is MemberDTO
  },

  // Fetch all premium members
  getPremiumMembers: async () => {
    const res = await api.get("/members/premium");
    return res.data; // should return an array of member objects
  },
};
