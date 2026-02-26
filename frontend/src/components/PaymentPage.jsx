import { useState } from "react";
import axios from "axios";
import {
  Crown,
  Sparkles,
  CreditCard,
  ArrowRightCircle,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";

export default function PaymentPage({ userId, requestId, amount }) {
  const [loading, setLoading] = useState(false);

  // Dynamically load Razorpay SDK
  const loadRazorpay = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });

  const startPayment = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 1️⃣ Load SDK
      await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");

      // 2️⃣ Create order from backend
      const res = await axios.post("http://localhost:8080/api/payments/order", {
        userId,
        membershipRequestId: requestId, // ✅ must match backend param
        amount, // send in rupees
      });

      const { orderId, currency, key, amount: amountInPaise } = res.data;
      if (!orderId || !key) throw new Error("Backend order creation failed");

      // 3️⃣ Razorpay options
      const options = {
        key, // ✅ comes from backend
        amount: amountInPaise, // already in paise
        currency,
        name: "Library Membership",
        description: "Membership Plan Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            // 4️⃣ Verify payment with backend
            const successRes = await axios.post(
              "http://localhost:8080/api/payments/success",
              {
                userId,
                requestId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );
            console.log("Backend success response:", successRes.data);
            alert("🎉 Payment Successful — Membership Activated!");
          } catch (err) {
            console.error("Failed to mark payment as success:", err);
            alert("⚠️ Payment succeeded but update failed. Contact admin.");
          }
        },
        theme: { color: "#f59e0b" }, // golden theme
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment init failed:", err);
      alert("❌ Failed to start payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={startPayment}
        disabled={loading}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") startPayment();
        }}
        className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white px-6 py-3 shadow hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all ring-1 ring-white/30 disabled:opacity-60 disabled:cursor-not-allowed`}
        title="Pay membership fee"
      >
        <span className="inline-flex items-center gap-1">
          <Crown className="w-5 h-5 text-white" />
          <Sparkles className="w-4 h-4 text-white/90 hidden sm:block" />
        </span>
        <span className="font-semibold">
          {loading ? (
            "Processing..."
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="w-5 h-5" />
              Pay
              <span className="inline-flex items-center gap-0.5">
                <IndianRupee className="w-4 h-4" />
                {amount}
              </span>
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1">
          {loading ? (
            <ShieldCheck className="w-5 h-5 text-white/95" />
          ) : (
            <ArrowRightCircle className="w-5 h-5 text-white/95" />
          )}
        </span>
      </button>
    </div>
  );
}
