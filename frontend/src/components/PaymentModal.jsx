// PaymentModal.jsx
import React, { useState } from "react";
import axios from "axios";

export default function PaymentModal({
  open,
  onClose,
  userId,
  requestId,
  amount,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handlePay = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.put(`/api/membership-requests/${requestId}/pay`);
      setLoading(false);
      onSuccess && onSuccess(res.data);
      onClose();
      alert("🎉 Payment simulated — membership activated.");
    } catch (err) {
      console.error("Payment failed (simulated):", err);
      setError("Failed to process payment. Try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_100%)] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-7 text-cream-50 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-sm text-cream-50/90 hover:bg-white/15 transition"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-3 py-1.5">
          <span className="text-lg">💳</span>
          <h3 className="text-lg sm:text-xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Pay ₹{amount} — Membership
          </h3>
        </div>

        <label className="block text-sm text-cream-50/80 mb-1">
          Name on card
        </label>
        <input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="w-full px-3 py-2 mb-3 rounded-xl bg-white/10 border border-white/15 text-cream-50 placeholder:text-cream-50/60 outline-none focus:ring-2 focus:ring-amber-300/40"
          placeholder="Full name"
        />

        <label className="block text-sm text-cream-50/80 mb-1">
          Card number (test)
        </label>
        <input
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className="w-full px-3 py-2 mb-3 rounded-xl bg-white/10 border border-white/15 text-cream-50 placeholder:text-cream-50/60 outline-none focus:ring-2 focus:ring-amber-300/40"
          placeholder="4111 1111 1111 1111"
        />

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm text-cream-50/80 mb-1">
              Expiry
            </label>
            <input
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-cream-50 placeholder:text-cream-50/60 outline-none focus:ring-2 focus:ring-amber-300/40"
              placeholder="MM/YY"
            />
          </div>
          <div className="w-[110px]">
            <label className="block text-sm text-cream-50/80 mb-1">CVV</label>
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-cream-50 placeholder:text-cream-50/60 outline-none focus:ring-2 focus:ring-amber-300/40"
              placeholder="123"
            />
          </div>
        </div>

        {error && <p className="text-rose-200 text-sm mb-3">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-cream-50 hover:bg-white/15 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Pay ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  );
}
