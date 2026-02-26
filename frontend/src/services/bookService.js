import api from "./api";

export const bookService = {
  getAll: async () => {
    const res = await api.get("/books");
    return res.data;
  },

  search: async (query) => {
    if (!query || query.trim() === "") {
      return bookService.getAll();
    }
    const res = await api.get("/books/search", { params: { q: query } });
    return res.data;
  },

  searchAdvanced: async (filters) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/books/search?${params}`);
    return res.data;
  },

  add: async (book) => {
    const res = await api.post("/books", book);
    return res.data;
  },

  update: async (id, book) => {
    const res = await api.put(`/books/${id}`, book);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/books/${id}`);
  },

  getCount: async () => {
    const res = await api.get("/books/count");
    return res.data;
  },

  // ✅ Updated borrow method
  borrowBook: async (bookId, email) =>
    (await api.post(`/borrow/request`, null, { params: { email, bookId } }))
      .data,

  getAvailability: async () => {
    const res = await api.get("/books/availability");
    return res.data; // { totalBooks, availableBooks }
  },

  getLowStock: async (threshold = 3) => {
    const res = await api.get("/books/low-stock", { params: { threshold } });
    return res.data;
  },
};
