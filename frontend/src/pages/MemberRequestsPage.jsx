// src/pages/MemberRequestsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PaymentPage from "../components/PaymentPage";
import { Crown, IndianRupee, CalendarClock, BadgeCheck } from "lucide-react";

export default function MemberRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchRequests() {
      try {
        if (!userId) {
          alert("User not logged in.");
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `http://localhost:8080/api/membership-requests/my?userId=${userId}`,
          { withCredentials: true }
        );

        // Minimal change: auto-mark ₹0 approved requests as paid
        const data = (Array.isArray(res.data) ? res.data : []).map((req) => {
          const amount =
            req.amount ??
            req.plan?.fees ??
            req.plan?.amount ??
            req.plan?.price ??
            0;

          if (req.status === "APPROVED" && amount === 0) {
            return { ...req, paid: true };
          }
          return req;
        });

        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch membership requests:", err);
        alert("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [userId, navigate]);

  const tone = (s) => {
    if (s === "APPROVED")
      return "bg-emerald-500/15 text-emerald-200 border-emerald-300/30";
    if (s === "REJECTED")
      return "bg-rose-500/15 text-rose-200 border-rose-300/30";
    return "bg-amber-500/15 text-amber-200 border-amber-300/30";
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-6">
          <Crown className="h-5 w-5 text-amber-300" />
          <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            My Membership Requests
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 text-cream-50/90">
          You have no membership requests.
        </div>
      </div>
    );
  }

  const formatAmount = (val) => {
    if (val == null) return "—";
    const num = Number(val);
    if (isNaN(num)) return "—";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-6">
        <Crown className="h-5 w-5 text-amber-300" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
          My Membership Requests
        </h1>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((req) => {
          // Safely extract amount and duration
          const amount =
            req.amount ??
            req.plan?.fees ??
            req.plan?.amount ??
            req.plan?.price ??
            0;

          // Duration in days — handle both object levels and naming styles
          const durationDays =
            req.durationDays ??
            req.duration_days ??
            req.plan?.durationDays ??
            req.plan?.duration_days ??
            (req.plan?.durationMonths ? req.plan.durationMonths * 30 : null);

          return (
            <div
              key={req.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
            >
              <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-gradient-to-br from-amber-300/35 to-orange-400/35 blur-3xl group-hover:scale-110 transition-transform" />

              {/* Top section */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-cream-50/95 text-lg font-bold">
                    Plan: {req.planType || req.plan?.type || "—"}
                  </h3>

                  <div className="mt-3 grid gap-2 text-cream-50/85 text-sm">
                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-amber-300" />
                      <span>
                        Amount:{" "}
                        <span className="font-semibold text-cream-50">
                          ₹{formatAmount(amount)}
                        </span>
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-amber-300" />
                      <span>
                        Duration:{" "}
                        <span className="font-semibold text-cream-50">
                          {durationDays != null ? `${durationDays} days` : "—"}
                        </span>
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-amber-300" />
                      <span
                        className={`inline-flex items-center rounded-xl border px-2 py-0.5 text-xs ${tone(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                      {req.paid && (
                        <span className="ml-2 inline-flex items-center rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-200">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-brown-900 shadow">
                  <Crown className="h-5 w-5" />
                </div>
              </div>

              {/* Payment button when approved and not yet paid */}
              {req.status === "APPROVED" && !req.paid && amount > 0 && (
                <PaymentPage
                  userId={userId}
                  requestId={req.id}
                  amount={amount}
                />
              )}

              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />
            </div>
          );
        })}
      </div>

      {/* Optional payment modal if you use it elsewhere */}
      {selectedRequest && (
        <PaymentModal
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          userId={userId}
          requestId={selectedRequest.id}
          amount={selectedRequest.amount}
          onSuccess={(updated) =>
            setRequests((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            )
          }
        />
      )}
    </div>
  );
}
