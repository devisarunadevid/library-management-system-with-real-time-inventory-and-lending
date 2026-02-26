// src/pages/OfflinePaymentForm.jsx
import React, { useEffect, useState } from "react";
import offlinePaymentService from "../services/offlinePaymentService";
import SelectMemberDropdown from "../components/SelectMemberDropdown";
import { toast } from "react-toastify";
import {
  Crown,
  Sparkles,
  CreditCard,
  Coins,
  ShieldCheck,
  ClipboardList,
  User,
  IdCard,
  FileCheck,
  Receipt,
  IndianRupee,
  BookOpen,
  ArrowRightCircle,
} from "lucide-react";

export default function OfflinePaymentForm() {
  const [paymentType, setPaymentType] = useState("MEMBERSHIP");
  const [memberId, setMemberId] = useState("");
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedBorrowId, setSelectedBorrowId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const librarian = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!memberId) {
      setMembershipRequests([]);
      setBorrowRecords([]);
      setSelectedRequestId("");
      setSelectedBorrowId("");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (paymentType === "MEMBERSHIP") {
          const allRequests =
            (await offlinePaymentService.getApprovedUnpaidMembershipRequests()) ||
            [];

          const filtered = allRequests.filter((r) => {
            const uid =
              r.user?.id ?? r.userId ?? r.member?.id ?? r.memberId ?? null;
            return uid != null && String(uid) === String(memberId);
          });

          setMembershipRequests(filtered);
          setSelectedRequestId(
            filtered[0]?.id ?? filtered[0]?.membershipRequestId ?? ""
          );
        } else {
          const allFines = (await offlinePaymentService.getUnpaidFines()) || [];

          const filtered = allFines.filter((b) => {
            const uid =
              b.userId ??
              b.user?.id ??
              b.userId ??
              b.member?.id ??
              b.memberId ??
              null;
            return uid != null && String(uid) === String(memberId);
          });

          setBorrowRecords(filtered);
          setSelectedBorrowId(filtered[0]?.id ?? filtered[0]?.borrowId ?? "");
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId, paymentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId) return toast.error("Please select a member.");
    if (!librarian?.id) return toast.error("Librarian info missing.");

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0)
      return toast.error("Enter a valid amount.");

    try {
      if (paymentType === "MEMBERSHIP") {
        if (!selectedRequestId)
          return toast.error("Please select a membership request.");
        await offlinePaymentService.payMembershipOffline(
          selectedRequestId,
          numericAmount,
          librarian.id
        );
      } else {
        if (!selectedBorrowId)
          return toast.error("Please select a borrow record.");
        await offlinePaymentService.payFineOffline(
          selectedBorrowId,
          numericAmount,
          librarian.id
        );
      }

      toast.success("Offline payment recorded successfully!");
      setAmount("");
      setMemberId("");
      setSelectedRequestId("");
      setSelectedBorrowId("");
      setMembershipRequests([]);
      setBorrowRecords([]);
    } catch (err) {
      console.error("Offline payment failed:", err);
      const msg =
        err?.response?.data?.error || err.message || "Failed to record payment";
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/libraryimg.jpeg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      <div className="max-w-lg mx-auto mt-10 mb-16 bg-white/85 backdrop-blur-md p-6 rounded-3xl shadow-2xl hover:shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition border border-amber-200 ring-1 ring-white/30">
        <div className="flex items-center justify-center gap-2 mb-5">
          <Crown className="w-5 h-5 text-amber-500 drop-shadow" />
          <h2 className="text-2xl font-extrabold text-center bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            Record Offline Payment
          </h2>
          <Sparkles className="w-5 h-5 text-amber-500 drop-shadow" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type */}
          <div>
            <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <ClipboardList className="w-4.5 h-4.5 text-amber-600" />
              Payment Type
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="border border-amber-300/60 rounded-xl p-2.5 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60 shadow-sm"
            >
              <option value="MEMBERSHIP">Membership</option>
              <option value="FINE">Fine</option>
            </select>
          </div>

          {/* Member */}
          <div>
            <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <User className="w-4.5 h-4.5 text-amber-600" />
              Select Member
            </label>
            <SelectMemberDropdown value={memberId} onSelect={setMemberId} />
          </div>

          {/* Membership Requests */}
          {paymentType === "MEMBERSHIP" && (
            <div>
              <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                <FileCheck className="w-4.5 h-4.5 text-amber-600" />
                Membership Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="border border-amber-300/60 rounded-xl p-2.5 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <option>Loading...</option>
                ) : membershipRequests.length === 0 ? (
                  <option value="">No approved unpaid requests</option>
                ) : (
                  <>
                    <option value="">Select Request</option>
                    {membershipRequests.map((r) => {
                      const id = r.id ?? r.membershipRequestId ?? r.requestId;
                      const planType = r.plan?.type ?? r.planType ?? "Unknown";
                      const amt =
                        r.amount ?? r.plan?.fees ?? r.plan?.amount ?? "—";
                      return (
                        <option key={id} value={String(id)}>
                          {`#${id} — ${planType} — ₹${amt}`}
                        </option>
                      );
                    })}
                  </>
                )}
              </select>
            </div>
          )}

          {/* Borrow Records (Fines) */}
          {paymentType === "FINE" && (
            <div>
              <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                <Receipt className="w-4.5 h-4.5 text-amber-600" />
                Borrow Record (Unpaid Fine)
              </label>
              <select
                value={selectedBorrowId}
                onChange={(e) => setSelectedBorrowId(e.target.value)}
                className="border border-amber-300/60 rounded-xl p-2.5 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <option>Loading unpaid fines...</option>
                ) : borrowRecords.length === 0 ? (
                  <option value="">No unpaid fines</option>
                ) : (
                  <>
                    <option value="">Select Borrow Record</option>
                    {borrowRecords.map((b) => {
                      const id = b.id ?? b.borrowId ?? b.recordId;
                      const bookTitle =
                        b.bookTitle ?? b.book?.title ?? "Unknown Book";
                      const fine = b.fineAmount ?? b.fine ?? b.amount ?? 0;
                      return (
                        <option key={id} value={String(id)}>
                          {`#${id} — ${bookTitle} — ₹${fine}`}
                        </option>
                      );
                    })}
                  </>
                )}
              </select>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <IndianRupee className="w-4.5 h-4.5 text-amber-600" />
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
              className="border border-amber-300/60 rounded-xl p-2.5 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60 shadow-sm"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Librarian */}
          <div>
            <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <IdCard className="w-4.5 h-4.5 text-amber-600" />
              Recorded By
            </label>
            <input
              type="text"
              value={
                librarian?.name || librarian?.username || "Unknown Librarian"
              }
              readOnly
              className="border border-amber-300/60 rounded-xl p-2.5 w-full bg-amber-50 text-gray-800 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white font-semibold py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_14px_36px_rgba(245,158,11,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all ring-1 ring-white/40 ${
              loading ? "opacity-80 pointer-events-none" : ""
            }`}
            title="Record Payment"
          >
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="w-5 h-5 text-white/95 drop-shadow" />
              <BookOpen className="w-4.5 h-4.5 text-white/90 hidden sm:block" />
            </span>
            <span className="font-semibold drop-shadow-sm">Record Payment</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-white/95 drop-shadow" />
              <Coins className="w-5 h-5 text-white/95 hidden sm:block" />
              <ArrowRightCircle className="w-5 h-5 text-white/95 drop-shadow" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
