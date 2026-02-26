import api from "./api";

export const adminService = {
  getAllLibrarians: async () => {
    const res = await api.get("/admin/librarians");
    return res.data;
  },

  addLibrarian: async (librarian) => {
    const token = localStorage.getItem("token");
    const res = await api.post("/admin/add-librarian", librarian, {
      headers: { token },
    });
    return res.data;
  },

  updateLibrarian: async (id, librarian) => {
    const res = await api.put(`/admin/librarians/${id}`, librarian);
    return res.data;
  },
};
