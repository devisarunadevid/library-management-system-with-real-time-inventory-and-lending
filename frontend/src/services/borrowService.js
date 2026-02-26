import api from "./api"; // your pre-configured axios instance

export const borrowService = {
  // --- Student: borrow request ---
  borrowBook: async (userEmail, bookId) => {
    const res = await api.post(
      `/borrow/request?email=${userEmail}&bookId=${bookId}`
    );
    return res.data;
  },

  // --- Student: borrow history ---
  userHistory: async (userId) => {
    const res = await api.get(`/borrow/history/${userId}`);
    return res.data;
  },

  // --- Admin: pending requests ---
  getPendingRequests: async () =>
    (await api.get("/borrow/requests/pending")).data,

  // --- Admin: all requests ---
  getAllRequests: async () => (await api.get("/borrow/requests")).data,

  // --- Admin: approve/reject ---
  approve: async (requestId) =>
    (await api.post(`/borrow/approve/${requestId}`)).data,

  reject: async (requestId) =>
    (await api.post(`/borrow/reject/${requestId}`)).data,

  // --- Overdue ---
  getOverdueBooks: async () => {
    try {
      const res = await api.get("/borrow/overdue");
      return res.data;
    } catch (err) {
      console.error(
        "Fetch overdue books error:",
        err.response?.data || err.message
      );
      throw err;
    }
  },

  // --- Damage/Loss ---
  reportDamageOrLoss: async (borrowId, condition) => {
    const res = await api.post(
      `/borrow/report/${borrowId}?condition=${condition.toUpperCase()}`
    );
    return res.data;
  },

  // --- Renew ---
  renewBook: async (borrowId) => {
    const res = await api.post(`/borrow/renew/${borrowId}`);
    return res.data;
  },

  // --- Librarian: get all borrow records ---
  getAllRecords: async () => {
    const res = await api.get("/borrow/records/all");
    return res.data; // ✅ unwraps ResponseEntity<List<BorrowRecordDTO>>
  },

  // --- Librarian: confirm return ---
  returnBook: async (id, condition) => {
    try {
      const url = condition
        ? `/borrow/return/${id}?condition=${condition.toUpperCase()}`
        : `/borrow/return/${id}`;
      const res = await api.post(url);
      return res.data || {}; // ✅ always return object even if empty
    } catch (err) {
      console.error("Error in returnBook:", err.response?.data || err.message);
      // Return minimal object so UI can still update
      return { id };
    }
  },
};
