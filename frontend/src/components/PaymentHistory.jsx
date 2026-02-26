import React, { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  CreditCard,
  Receipt,
  Calendar,
  User,
  BookOpen,
  Filter,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Printer,
  Share,
  Copy,
  ExternalLink,
  Loader2,
  Info,
  HelpCircle,
  Settings,
  Bell,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  ArrowRightCircle,
  X, // ✅ Added for modal close icon
} from "lucide-react";
import transactionService from "../services/transactionService";
import { memberService } from "../services/memberService";
import { bookService } from "../services/bookService";
import api from "../services/api";

const PaymentHistory = ({ role = "ADMIN", userId = null }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });

  // ✅ Added modal state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      let response;

      if (role === "ADMIN" || role === "LIBRARIAN") {
        response = await api.get("/payments/history");
      } else if (role === "MEMBER" && userId) {
        response = await api.get(`/payments/user/${userId}`);
      } else {
        response = { data: [] };
      }

      const data = response.data || [];

      setPayments(data);

      const stats = {
        total: data.length,
        paid: data.filter((p) => p.status === "SUCCESS").length,
        pending: data.filter((p) => p.status === "INITIATED").length,
        failed: data.filter((p) => p.status === "FAILED").length,
        totalAmount: data.reduce(
          (sum, p) => sum + (parseFloat(p.amount) || 0),
          0
        ),
      };

      setStats(stats);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Failed to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markOfflineReceived = async (paymentId) => {
    try {
      const receivedBy = localStorage.getItem("userName") || "Librarian";

      await api.put(`/payments/${paymentId}/mark-received`, null, {
        params: { receivedBy },
      });

      setSuccess("Payment marked as received successfully!");
      setTimeout(() => setSuccess(""), 3000);

      await loadPayments();
    } catch (err) {
      console.error("Error marking payment as received:", err);
      setError("Failed to mark payment as received. Please try again.");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      payment.status === filterStatus ||
      (filterStatus === "PAID" && payment.status === "SUCCESS") ||
      (filterStatus === "PENDING" && payment.status === "INITIATED");

    const matchesType = filterType === "all" || payment.type === filterType;

    const matchesDate = (() => {
      if (dateRange === "all") return true;
      const paymentDate = new Date(
        payment.createdAt || payment.date || payment.updatedAt
      );
      const now = new Date();
      const daysDiff = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));

      switch (dateRange) {
        case "today":
          return daysDiff === 0;
        case "week":
          return daysDiff <= 7;
        case "month":
          return daysDiff <= 30;
        case "year":
          return daysDiff <= 365;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.createdAt || a.paymentDate);
        bValue = new Date(b.createdAt || b.paymentDate);
        break;
      case "amount":
        aValue = parseFloat(a.amount) || 0;
        bValue = parseFloat(b.amount) || 0;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "member":
        aValue = a.memberName;
        bValue = b.memberName;
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const exportPayments = () => {
    const csvContent = [
      ["Transaction ID", "Member", "Book", "Amount", "Status", "Date", "Type"],
      ...sortedPayments.map((p) => [
        p.transactionId || "",
        p.memberName || "",
        p.bookTitle || "",
        p.amount || "",
        p.status || "",
        new Date(p.createdAt || p.paymentDate).toLocaleDateString(),
        p.type || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadPayments();
  }, [role, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-flex items-center gap-2 text-amber-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading payment history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------- HEADER SECTION ---------- */}
      <div className="rounded-3xl border border-amber-300/40 bg-white/50 backdrop-blur-2xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500 drop-shadow" />
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] flex items-center gap-2">
                <Receipt className="w-6 h-6 text-amber-500" />
                Payment History
              </h2>
              <Sparkles className="w-4 h-4 text-amber-500 drop-shadow" />
            </div>
            <p className="text-brown-800/85 mt-1">
              Track and manage all payment transactions
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

      {/* ---------- STATS ---------- */}
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

        <div className="rounded-2xl border border-emerald-300/40 bg-white/60 backdrop-blur-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brown-800/85">Paid</p>
              <p className="text-2xl font-extrabold text-emerald-600">
                {stats.paid}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
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
            <TrendingUp className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* ---------- FILTERS ---------- */}
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
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-amber-300/60 rounded-xl focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 bg-white/90 shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-amber-300/60 rounded-xl focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 bg-white/90 shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-100">
            <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
              <tr>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                  Type
                </th>
                {(role === "ADMIN" || role === "LIBRARIAN") && (
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-brown-800/90 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-amber-100">
              {sortedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/90">
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
                      {payment.bookTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-sm font-extrabold text-amber-700">
                      <IndianRupee className="w-4 h-4" />
                      {payment.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const statusLabel =
                        {
                          INITIATED: "FAILED",
                          SUCCESS: "PAID",
                          FAILED: "FAILED",
                        }[payment.status] || payment.status;

                      return (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            statusLabel === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : statusLabel === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {statusLabel === "PAID" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {statusLabel === "PENDING" && (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {statusLabel === "FAILED" && (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {statusLabel}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-900">
                    {new Date(
                      payment.createdAt || payment.paymentDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        payment.type === "ONLINE"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {payment.type === "ONLINE" && (
                        <CreditCard className="w-3 h-3 mr-1" />
                      )}
                      {payment.type === "OFFLINE" && (
                        <Receipt className="w-3 h-3 mr-1" />
                      )}
                      {payment.type}
                    </span>
                  </td>
                  {(role === "ADMIN" || role === "LIBRARIAN") && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === "PENDING" &&
                        payment.type === "OFFLINE" && (
                          <button
                            onClick={() => markOfflineReceived(payment.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/60 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 shadow hover:brightness-105 transition mr-3"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Mark Received
                          </button>
                        )}
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailsModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/60 bg-white text-brown-900 px-3 py-1.5 hover:bg-amber-50 transition"
                      >
                        View Details
                        <ArrowRightCircle className="w-4 h-4 text-amber-600" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedPayments.length === 0 && (
          <div className="text-center py-10">
            <Receipt className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-brown-800/85">No payments found</p>
          </div>
        )}
      </div>

      {/* ---------- VIEW DETAILS MODAL ---------- */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-amber-700 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment Details
            </h3>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Transaction ID:</strong>{" "}
                {selectedPayment.transactionId || selectedPayment.id}
              </p>
              <p>
                <strong>Member:</strong> {selectedPayment.memberName} (
                {selectedPayment.memberEmail})
              </p>
              <p>
                <strong>Book:</strong> {selectedPayment.bookTitle}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedPayment.amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedPayment.status}
              </p>
              <p>
                <strong>Type:</strong> {selectedPayment.type}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  selectedPayment.createdAt || selectedPayment.paymentDate
                ).toLocaleString()}
              </p>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
