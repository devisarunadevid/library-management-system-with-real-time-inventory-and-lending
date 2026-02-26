// AdminMembershipRequests.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Crown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

export default function AdminMembershipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/membership-requests");
      setRequests(res.data || []);
      setError("");
    } catch (err) {
      console.error("Error loading requests:", err);
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/membership-requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Error approving request");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await axios.put(
        `/api/membership-requests/${id}/reject?reason=${encodeURIComponent(
          reason
        )}`
      );
      fetchRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Error rejecting request");
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === "APPROVED")
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
        </span>
      );
    if (status === "REJECTED")
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
          <XCircle className="h-3.5 w-3.5" /> Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" /> Pending
      </span>
    );
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="min-h-screen w-full relative">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('/libraryimg.jpeg')`,
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      <div className="relative h-screen overflow-y-auto">
        <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-white/40 backdrop-blur-2xl px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.25)] ring-1 ring-white/30">
              <span className="relative inline-flex">
                <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/25" />
                <Crown className="relative h-5 w-5 text-amber-600 drop-shadow" />
              </span>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                  Membership Requests
                </h1>
                <p className="text-xs text-brown-800/85 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Review new member applications.
                </p>
              </div>
              {requests.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {requests.length}
                </span>
              )}
              <span className="hidden sm:flex items-center gap-1 text-amber-500 ml-1">
                <Star className="w-4 h-4" />
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            <button
              onClick={fetchRequests}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
              <Sparkles className="w-4 h-4 text-white/95" />
            </button>
          </div>

          {loading ? (
            <div className="grid gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-300 bg-rose-100 text-rose-800 p-4 shadow">
              {error}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden ring-1 ring-white/30">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-white/70 via-white/60 to-white/70 border-b border-white/40">
                <div className="flex items-center gap-2 text-brown-900 text-sm">
                  <User className="h-4 w-4 text-amber-600" />
                  <span>Total: {requests.length}</span>
                  <span className="mx-2 opacity-40">•</span>
                  <span>Pending: {pendingCount}</span>
                </div>
                <div className="text-xs text-brown-800/85 inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Auto-updated
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-0 text-sm">
                  <thead>
                    <tr className="text-brown-800/90">
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        Member
                      </th>
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        Plan
                      </th>
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right bg-white/70 border-b border-white/40">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req, idx) => {
                      const leftAccent =
                        req.status === "APPROVED"
                          ? "before:bg-emerald-500"
                          : req.status === "REJECTED"
                          ? "before:bg-rose-500"
                          : "before:bg-amber-500";
                      return (
                        <tr
                          key={req.id ?? idx}
                          className="group text-brown-900 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                        >
                          <td className="relative px-4 py-4 bg-white/60 border-b border-white/40">
                            <div
                              className={`pointer-events-none absolute inset-y-0 left-0 w-1 rounded-r-xl ${leftAccent}`}
                            />
                            <div className="font-medium truncate">
                              {req.user?.name}
                            </div>
                          </td>
                          <td className="px-4 py-4 bg-white/60 border-b border-white/40">
                            <span className="group-hover:text-brown-900 transition-colors">
                              {req.user?.email}
                            </span>
                          </td>
                          <td className="px-4 py-4 bg-white/60 border-b border-white/40">
                            {req.plan?.type}
                          </td>
                          <td className="px-4 py-4 bg-white/60 border-b border-white/40">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-4 py-4 bg-white/60 border-b border-white/40">
                            {req.status === "PENDING" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:brightness-105 transition"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:brightness-105 transition"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="text-right text-brown-800/75 italic inline-flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                No actions
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    </div>
  );
}
