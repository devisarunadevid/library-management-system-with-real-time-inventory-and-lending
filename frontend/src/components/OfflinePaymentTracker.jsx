import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Download,
  Loader2,
  AlertCircle,
  Crown,
  Sparkles,
  ShieldCheck,
  Coins,
  ArrowRightCircle,
  IndianRupee,
} from "lucide-react";
import { X } from "lucide-react";
import api from "../services/api";

const OfflinePaymentTracker = ({ role = "LIBRARIAN" }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    received: 0,
    totalAmount: 0,
  });

  // 🆕 Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // ✅ Identify Payment Type accurately
  const detectPaymentType = (p) => {
    const title = p.bookTitle || p.book_title;
    const hasBookTitle = title && title.trim().length > 0;
    const hasBorrowId = p.borrowId || p.borrow_id;
    const hasMembershipId = p.membershipRequestId || p.membership_request_id;

    // Direct classification
    if (hasBookTitle || hasBorrowId) return "Fine";
    if (hasMembershipId) return "Membership";

    // Fallback based on keywords in transaction or status
    const tx = (p.transactionId || p.transaction_id || "").toLowerCase();
    if (tx.includes("fine") || tx.includes("borrow")) return "Fine";
    if (tx.includes("member") || tx.includes("plan")) return "Membership";

    // Fallback to amount or record shape
    if (p.amount > 0 && hasBookTitle) return "Fine";
    return "Membership";
  };

  // ✅ Normalize Membership or Fine payment safely
  const normalizePayment = (p) => {
    const type = detectPaymentType(p);

    return {
      id: p.id || p.paymentId || p.payment_id || null,
      type, // ✅ Detected correctly now
      transactionId: p.transactionId || p.transaction_id || null,
      memberName:
        p.memberName ||
        p.member_name ||
        p.userName ||
        (p.user && p.user.name) ||
        "Unknown",
      memberEmail:
        p.memberEmail ||
        p.member_email ||
        p.userEmail ||
        (p.user && p.user.email) ||
        "",
      bookTitle:
        p.bookTitle ||
        p.book_title ||
        (p.book && p.book.title) ||
        (type === "Fine" ? "Unknown Book" : null),
      amount: Number(p.amount) || 0,
      status:
        p.status ||
        p.payment_status ||
        (p.amount > 0 ? "SUCCESS" : "INITIATED"),
      createdAt:
        p.createdAt ||
        p.created_at ||
        p.paymentDate ||
        p.payment_date ||
        p.returnDate ||
        p.return_date ||
        null,
      recordedBy:
        p.recordedBy ||
        p.recorded_by ||
        p.recorded_by_name ||
        p.recordedByName ||
        null,
      raw: p,
    };
  };

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const membershipPromise = api.get("/payments/offline");
      const finesPromise = api.get("/borrow/offline-fines").catch((e) => {
        console.warn(
          "borrow/offline-fines endpoint failed:",
          e?.response?.data || e.message
        );
        return { data: [] };
      });

      const [membershipRes, finesRes] = await Promise.all([
        membershipPromise,
        finesPromise,
      ]);

      const membership = Array.isArray(membershipRes.data)
        ? membershipRes.data
        : [];
      const fines = Array.isArray(finesRes.data) ? finesRes.data : [];

      const combined = [
        ...membership.map(normalizePayment),
        ...fines.map(normalizePayment),
      ];

      combined.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      setPayments(combined);

      const stats = {
        total: combined.length,
        pending: combined.filter(
          (p) => (p.status || "").toUpperCase() === "PENDING"
        ).length, // only if backend supports actual pending status
        received: combined.filter(
          (p) => (p.status || "").toUpperCase() === "SUCCESS"
        ).length,
        totalAmount: combined.reduce(
          (sum, p) => sum + (Number(p.amount) || 0),
          0
        ),
      };
      setStats(stats);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Failed to load payments. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const markAsReceived = async (item) => {
    try {
      if (item.type === "Membership") {
        await api.put(`/payments/${item.id}/mark-received`, null, {
          params: {
            receivedBy: localStorage.getItem("userName") || "Librarian",
          },
        });
      } else if (item.type === "Fine") {
        const borrowId = item.borrowId || (item.raw && item.raw.id);
        if (!borrowId) throw new Error("Borrow id not found for fine record");
        await api.put(`/borrow/${borrowId}/mark-fine-received`, {
          recordedBy:
            localStorage.getItem("userId") ||
            localStorage.getItem("userName") ||
            "Librarian",
        });
      } else {
        throw new Error("Unknown payment type");
      }

      setSuccess("Payment marked as received successfully!");
      setTimeout(() => setSuccess(""), 2500);
      await loadPayments();
    } catch (err) {
      console.error(
        "Error marking as received:",
        err?.response?.data || err.message
      );
      setError("Failed to mark payment as received.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const bulkMarkAsReceived = async () => {
    if (selectedPayments.length === 0) return;

    setLoading(true);
    try {
      const itemsToMark = payments.filter((p) =>
        selectedPayments.includes(p.id)
      );

      const promises = itemsToMark.map((item) => {
        if (item.type === "Membership") {
          return api
            .put(`/payments/${item.id}/mark-received`, null, {
              params: {
                receivedBy: localStorage.getItem("userName") || "Librarian",
              },
            })
            .catch((e) => ({ error: e }));
        } else if (item.type === "Fine") {
          const borrowId = item.borrowId || (item.raw && item.raw.id);
          if (!borrowId) return Promise.resolve({ error: "missing borrowId" });
          return api
            .put(`/borrow/${borrowId}/mark-fine-received`, {
              recordedBy:
                localStorage.getItem("userId") ||
                localStorage.getItem("userName") ||
                "Librarian",
            })
            .catch((e) => ({ error: e }));
        }
        return Promise.resolve();
      });

      const results = await Promise.all(promises);
      const errs = results.filter((r) => r && r.error);
      if (errs.length > 0) {
        console.warn("Some bulk updates failed", errs);
        setError("Some payments failed to update. Check console.");
        setTimeout(() => setError(""), 4000);
      } else {
        setSuccess(`${itemsToMark.length} payments marked as received`);
        setTimeout(() => setSuccess(""), 3000);
      }

      setSelectedPayments([]);
      await loadPayments();
    } catch (err) {
      console.error("Bulk mark error:", err);
      setError("Bulk update failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const q = (searchTerm || "").toLowerCase();
    const matchesSearch =
      payment.memberName?.toLowerCase().includes(q) ||
      payment.memberEmail?.toLowerCase().includes(q) ||
      payment.bookTitle?.toLowerCase().includes(q) ||
      (payment.transactionId || "").toString().toLowerCase().includes(q) ||
      (payment.type || "").toLowerCase().includes(q);

    const st = (payment.status || "").toUpperCase();
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "PENDING" && st === "INITIATED") ||
      (filterStatus === "RECEIVED" && st === "SUCCESS");

    return matchesSearch && matchesStatus;
  });

  const togglePaymentSelection = (paymentId) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const selectAllPayments = () => {
    setSelectedPayments(filteredPayments.map((p) => p.id));
  };

  const deselectAllPayments = () => setSelectedPayments([]);

  const exportPayments = () => {
    const csvRows = [
      [
        "Payment Type",
        "Transaction ID",
        "Member",
        "Email",
        "Book",
        "Amount",
        "Status",
        "Recorded By",
        "Date",
      ],
      ...filteredPayments.map((p) => [
        p.type,
        p.transactionId || "",
        p.memberName || "",
        p.memberEmail || "",
        p.bookTitle || "",
        p.amount != null ? p.amount : "",
        p.status === "INITIATED"
          ? "PENDING"
          : p.status === "SUCCESS"
          ? "RECEIVED"
          : p.status || "",
        p.recordedBy || p.receivedBy || "",
        p.receivedAt || p.createdAt || "",
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((v) => `"${String(v ?? "")}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offline-payments-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🆕 Handle opening modal
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-amber-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading offline payments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-300/40 bg-white/50 backdrop-blur-2xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500 drop-shadow" />
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] flex items-center gap-2">
                <Receipt className="w-6 h-6 text-amber-500" />
                Offline Payment Tracker
              </h2>
              <Sparkles className="w-4 h-4 text-amber-500 drop-shadow" />
            </div>
            <p className="text-brown-800/85 mt-1">
              Track and manage offline payments received from members
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportPayments}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 transition ring-1 ring-white/40"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={loadPayments}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300/60 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:-translate-y-0.5 transition ring-1 ring-white/40"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-2 shadow">
          <ShieldCheck className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 shadow">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-300/40 bg-white/60 backdrop-blur-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brown-800/85">
                Total Payments
              </p>
              <p className="text-2xl font-extrabold text-brown-900">
                {stats.total}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-300/40 bg-white/60 backdrop-blur-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brown-800/85">Pending</p>
              <p className="text-2xl font-extrabold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-300/40 bg-white/60 backdrop-blur-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brown-800/85">Received</p>
              <p className="text-2xl font-extrabold text-emerald-600">
                {stats.received}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/40 bg-white/60 backdrop-blur-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brown-800/85">
                Total Amount
              </p>
              <p className="text-2xl font-extrabold text-amber-600">
                ₹{stats.totalAmount.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-300/40 bg-white/60 backdrop-blur-xl p-4 shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-700/60" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-amber-300/60 rounded-xl focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 bg-white/90 shadow-sm"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-amber-300/60 rounded-xl focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 bg-white/90 shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RECEIVED">Received</option>
          </select>
        </div>
      </div>

      {selectedPayments.length > 0 && (
        <div className="rounded-2xl border border-blue-300/40 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-900">
                {selectedPayments.length} payment(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkMarkAsReceived}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300/60 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow hover:brightness-105 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Mark as Received
              </button>
              <button
                onClick={deselectAllPayments}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300/60 bg-white text-gray-800 hover:bg-gray-50 transition"
              >
                <XCircle className="w-4 h-4" />
                Deselect All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-100">
            <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedPayments.length === filteredPayments.length &&
                      filteredPayments.length > 0
                    }
                    onChange={
                      selectedPayments.length === filteredPayments.length
                        ? deselectAllPayments
                        : selectAllPayments
                    }
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Payment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Recorded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-amber-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/90">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => togglePaymentSelection(payment.id)}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-900 font-semibold">
                    {payment.type}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-brown-900">
                      {payment.transactionId || payment.id}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brown-900 font-medium">
                      {payment.memberName}
                    </div>
                    <div className="text-xs text-brown-700/80">
                      {payment.memberEmail}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brown-900">
                      {payment.bookTitle || "—"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-sm font-extrabold text-amber-700">
                      <IndianRupee className="w-4 h-4" />
                      {payment.amount != null ? payment.amount : "0"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-800">
                    {payment.recordedBy || payment.receivedBy || "—"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        payment.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : payment.status === "INITIATED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {payment.status === "SUCCESS" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {payment.status === "INITIATED" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {payment.status === "SUCCESS"
                        ? "RECEIVED"
                        : payment.status === "INITIATED"
                        ? "FAILED"
                        : payment.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-900">
                    {payment.receivedAt
                      ? new Date(payment.receivedAt).toLocaleDateString()
                      : payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(payment.status === "INITIATED" ||
                      (payment.status || "").toUpperCase() === "INITIATED") && (
                      <button
                        onClick={() => markAsReceived(payment)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/60 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 shadow hover:brightness-105 transition mr-3"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Mark Received
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(payment)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/60 bg-white text-brown-900 px-3 py-1.5 hover:bg-amber-50 transition"
                    >
                      View Details
                      <ArrowRightCircle className="w-4 h-4 text-amber-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-10">
            <Receipt className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-brown-800/85">No offline payments found</p>
          </div>
        )}
      </div>
      {/* 🆕 View Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-lg relative">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-amber-700 mb-4">
              {selectedPayment.type} Payment Details
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Transaction ID:</strong>{" "}
                {selectedPayment.transactionId || "—"}
              </p>
              <p>
                <strong>Member:</strong> {selectedPayment.memberName} (
                {selectedPayment.memberEmail})
              </p>
              <p>
                <strong>Book:</strong> {selectedPayment.bookTitle || "—"}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedPayment.amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedPayment.status}
              </p>
              <p>
                <strong>Recorded By:</strong>{" "}
                {selectedPayment.recordedBy ||
                  selectedPayment.receivedBy ||
                  "—"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedPayment.receivedAt
                  ? new Date(selectedPayment.receivedAt).toLocaleString()
                  : selectedPayment.createdAt
                  ? new Date(selectedPayment.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflinePaymentTracker;
