// src/pages/MemberMembershipPlans.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // use your pre-configured axios instance
import { Crown, CalendarClock, BookOpen, IndianRupee } from "lucide-react";

export default function MemberMembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlans() {
      try {
        // Use `api` so the request goes to your backend (not vite dev server)
        const res = await api.get("/membership-plans"); // backend controller is /api/membership-plans; api base should include /api
        setPlans(Array.isArray(res.data) ? res.data : []);
        console.log("Plans fetched:", res.data);
      } catch (err) {
        console.error("Failed to load membership plans:", err);
        alert("Failed to load membership plans.");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleRequest = async (plan) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not logged in.");
        navigate("/login");
        return;
      }
      // keep same endpoint you had — adjust if your backend expects different path
      await api.post(`/membership-requests/${plan.id}`, null, {
        params: { userId },
      });
      alert("Request sent to admin successfully!");
      navigate("/member/requests");
    } catch (err) {
      console.error("Failed to send request:", err);
      alert("Failed to send request. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-6">
          <Crown className="h-5 w-5 text-amber-300" />
          <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Membership Plans
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!Array.isArray(plans) || plans.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 text-cream-50/90">
          No membership plans available.
        </div>
      </div>
    );
  }

  // helper to display amount (safe)
  const formatAmount = (val) => {
    if (val == null || val === "") return "—";
    const num = Number(val);
    if (Number.isNaN(num)) return "—";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-6">
        <Crown className="h-5 w-5 text-amber-300" />
        <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
          Membership Plans
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          // Preferred backend fields:
          // fees (BigDecimal) -> plan.fees
          // durationDays -> plan.durationDays OR duration_days
          // fallback: durationMonths -> plan.durationMonths * 30
          // borrowingLimit -> plan.borrowingLimit OR borrowing_limit
          const amount =
            plan.fees ??
            plan.amount ??
            plan.price ??
            plan.fee ??
            plan.Fees ??
            null;

          const durationDays =
            plan.durationDays ??
            plan.duration_days ??
            (plan.durationMonths ? plan.durationMonths * 30 : null);

          const borrowingLimit =
            plan.borrowingLimit ?? plan.borrowing_limit ?? plan.maxBooks ?? "—";

          return (
            <div
              key={plan.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
            >
              <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-gradient-to-br from-amber-300/35 to-orange-400/35 blur-3xl group-hover:scale-110 transition-transform" />
              <div className="flex items-start gap-3">
                <div className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-brown-900 shadow">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-cream-50/95 text-lg font-bold tracking-wide">
                    {plan.type}
                  </h3>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/15 px-2 py-1 text-xs text-amber-200">
                    Best value
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-cream-50/85">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-amber-300" />
                  <span className="text-sm">
                    Amount:{" "}
                    <span className="font-semibold text-cream-50">
                      {amount != null ? `₹${formatAmount(amount)}` : "—"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-amber-300" />
                  <span className="text-sm">
                    Duration:{" "}
                    <span className="font-semibold text-cream-50">
                      {durationDays != null ? `${durationDays} days` : "—"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-300" />
                  <span className="text-sm">
                    Borrowing Limit:{" "}
                    <span className="font-semibold text-cream-50">
                      {borrowingLimit}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => handleRequest(plan)}
                  className="relative inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0"
                >
                  Renew / Upgrade
                </button>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
