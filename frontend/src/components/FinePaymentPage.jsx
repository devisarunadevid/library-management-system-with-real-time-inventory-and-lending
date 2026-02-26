// src/components/FinePaymentPage.jsx
import { useState } from "react";
import axios from "axios";
import {
  Crown,
  Sparkles,
  CreditCard,
  ArrowRightCircle,
  ShieldCheck,
  Coins,
} from "lucide-react";

export default function FinePaymentPage({
  userId,
  requestId,
  amount,
  children,
}) {
  const [loading, setLoading] = useState(false);

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
      // 1️⃣ Load Razorpay SDK
      await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");

      // 2️⃣ Create fine order in backend
      const orderRes = await axios.post(
        "http://localhost:8080/api/payments/order/fine",
        {
          userId: Number(userId),
          borrowId: requestId, // ✅ Must be borrowId to match backend
          amount,
        }
      );

      const { orderId, currency, key, amount: amountInPaise } = orderRes.data;
      if (!orderId || !key) throw new Error("Backend order creation failed");

      // 3️⃣ Razorpay checkout
      const options = {
        key,
        amount: amountInPaise,
        currency,
        name: "Library Fine Payment",
        description: "Pay overdue fine for borrowed book",
        order_id: orderId,
        handler: async function (response) {
          try {
            // 4️⃣ Build payload exactly as backend expects
            const payload = {
              userId: Number(userId),
              borrowId: requestId,
              amount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            // 5️⃣ Send success event to backend
            const successRes = await axios.post(
              "http://localhost:8080/api/payments/fine-success",
              payload
            );

            console.log("Fine payment success response:", successRes.data);
            alert("🎉 Fine payment successful!");
            window.location.reload();
          } catch (err) {
            console.error("Failed to mark fine as paid:", err.response || err);
            alert("⚠️ Payment succeeded but update failed. Contact admin.");
          }
        },
        theme: { color: "#f59e0b" }, // golden theme
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Fine payment init failed:", err.response || err);
      alert("❌ Failed to start fine payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-block">
      <div
        onClick={startPayment}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") startPayment();
        }}
        className={`cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white px-5 py-2.5 shadow hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all ring-1 ring-white/30 select-none ${
          loading ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <Crown className="w-4.5 h-4.5 text-white/95 drop-shadow" />
          <Sparkles className="w-4 h-4 text-white/90 hidden sm:block" />
        </span>
        <span className="font-semibold drop-shadow-sm">{children}</span>
        <span className="inline-flex items-center gap-1.5">
          <CreditCard className="w-4.5 h-4.5 text-white/95 drop-shadow" />
          <ShieldCheck className="w-4 h-4 text-white/95 hidden sm:block" />
          <Coins className="w-4 h-4 text-white/95 hidden sm:block" />
          <ArrowRightCircle className="w-5 h-5 text-white/95 drop-shadow" />
        </span>
      </div>
    </div>
  );
}
