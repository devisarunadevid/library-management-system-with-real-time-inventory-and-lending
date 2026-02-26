// src/services/overdueService.js
import api from "./api";

const normalizeReturned = (r) => {
  // Accept multiple property names and value types
  if (r == null) return false;
  const retCandidates = [
    r.returned,
    r.isReturned,
    r.returned === true,
    r.returned === 1,
    r.returned === "true",
    r.return_date,
    r.returnDate,
    r.return_date != null,
    r.returnDate != null,
    r.status === "RETURNED",
    (r.status || "").toUpperCase() === "RETURNED",
  ];
  return retCandidates.some(
    (v) => v !== undefined && v !== null && v !== false && v !== 0 && v !== ""
  );
};

const normalizeFinePaid = (r) => {
  if (r == null) return false;
  const paidCandidates = [
    r.finePaid,
    r.isFinePaid,
    r.fine_paid,
    r.paid,
    r.paid === true,
    r.fine_paid === 1,
    r.finePaid === true,
    r.paymentStatus === "PAID",
    (r.paymentStatus || "").toUpperCase() === "PAID",
  ];
  return paidCandidates.some(
    (v) => v !== undefined && v !== null && v !== false && v !== 0 && v !== ""
  );
};

const toNumberSafe = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const overdueService = {
  // Get all overdue records with dynamic fines
  getAll: async () => {
    const response = await api.get("/overdue");
    const data = response.data || [];
    return data.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName || r.user_name || "Unknown User",
      bookId: r.bookId,
      bookTitle: r.bookTitle || r.book_title || "Unknown Book",
      borrowDate: r.borrowDate ?? r.borrow_date ?? null,
      dueDate: r.dueDate ?? r.due_date ?? null,
      daysOverdue: r.daysOverdue ?? r.days_overdue ?? 0,
      fineAmount: toNumberSafe(r.fineAmount ?? r.fine_amount ?? r.fine ?? 0),
      userEmail: r.userEmail || r.user_email || "",
      // robust normalizations:
      returned: normalizeReturned(r),
      finePaid: normalizeFinePaid(r),
      returnDate: r.returnDate ?? r.return_date ?? null,
      // include the original payload for debugging if needed
      _raw: r,
    }));
  },

  // Get overdue records for a specific user
  getByUser: async (userId) => {
    const response = await api.get(`/overdue/user/${userId}`);
    const data = response.data || [];
    return data.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName || r.user_name || "Unknown User",
      bookId: r.bookId,
      bookTitle: r.bookTitle || r.book_title || "Unknown Book",
      borrowDate: r.borrowDate ?? r.borrow_date ?? null,
      dueDate: r.dueDate ?? r.due_date ?? null,
      daysOverdue: r.daysOverdue ?? r.days_overdue ?? 0,
      fineAmount: toNumberSafe(r.fineAmount ?? r.fine_amount ?? r.fine ?? 0),
      // robust normalizations:
      returned: normalizeReturned(r),
      finePaid: normalizeFinePaid(r),
      returnDate: r.returnDate ?? r.return_date ?? null,
      _raw: r,
    }));
  },

  // Get fine for a single borrow record
  getFine: async (borrowId) => {
    const response = await api.get(`/overdue/${borrowId}/fine`);
    const r = response.data;
    return {
      borrowId: r.borrowId ?? r.borrow_id,
      userId: r.userId ?? r.user_id,
      fine: toNumberSafe(r.fine ?? r.fineAmount ?? r.fine_amount ?? 0),
    };
  },

  // Trigger overdue processing manually
  processNow: async () => {
    const response = await api.post("/overdue/process");
    return response.data;
  },

  // Waive fine for a borrow record
  waiveFine: async (borrowId) => {
    const response = await api.put(`/overdue/${borrowId}/waive`);
    return response.data;
  },

  // ✅ Get borrowed books count (for dashboard or overdue summary)
  getBorrowedCount: async () => {
    const response = await api.get("/overdue/count");
    return response.data.count || 0;
  },
};

export default overdueService;
