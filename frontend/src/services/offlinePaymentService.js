import api from "./api";

// Safely convert values to numbers
const toNumberSafe = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Normalize boolean fields from backend
const normalizeBoolean = (val) => {
  if (val === undefined || val === null) return false;
  return (
    val === true ||
    val === 1 ||
    val === "true" ||
    val === "PAID" ||
    val === "COMPLETED"
  );
};

// Normalize BorrowRecordDTO
const normalizeBorrowRecord = (r) => ({
  id: r.id,
  bookId: r.bookId,
  bookTitle: r.bookTitle || r.book_title || "Unknown Book",
  borrowDate: r.borrowDate ?? r.borrow_date ?? null,
  dueDate: r.dueDate ?? r.due_date ?? null,
  returnDate: r.returnDate ?? r.return_date ?? null,
  fineAmount: toNumberSafe(r.fineAmount ?? r.fine_amount ?? 0),
  finePaid: normalizeBoolean(
    r.finePaid ?? r.isFinePaid ?? r.fine_paid ?? r.paid
  ),
  status: r.status || "UNKNOWN",
  renewCount: r.renewCount ?? r.renew_count ?? 0,
  userId: r.userId ?? r.user_id,
  userName: r.userName ?? r.user_name ?? "Unknown User",
  userEmail: r.userEmail ?? r.user_email ?? "",
  bookCondition: r.bookCondition ?? r.book_condition ?? "N/A",
});

const offlinePaymentService = {
  getApprovedUnpaidMembershipRequests: async () => {
    const res = await api.get("/membership-requests/approved-unpaid");
    return res.data || [];
  },

  payMembershipOffline: async (membershipRequestId, amount, librarianId) => {
    const res = await api.post("/offline-payments/membership", {
      membershipRequestId,
      amount,
      librarianId,
    });
    return res.data;
  },

  payFineOffline: async (borrowId, amount, librarianId) => {
    const res = await api.post("/offline-payments/fine", {
      borrowId,
      amount,
      librarianId,
    });
    return res.data;
  },

  getAllOfflinePayments: async () => {
    const res = await api.get("/payments/offline");
    return res.data || [];
  },

  getAllOfflineFines: async () => {
    const res = await api.get("/borrow/offline-fines");
    return res.data || [];
  },

  getUnpaidFines: async () => {
    const res = await api.get("/offline-payments/unpaid-fines");
    const data = res.data || [];
    return data.map(normalizeBorrowRecord);
  },
};

export default offlinePaymentService;
