// src/pages/ReservationsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import reservationService from "../services/reservationService";
import { useNavigate } from "react-router-dom";
import { BookPlus, Trash2, RefreshCw } from "lucide-react";

export default function ReservationsPage({ role }) {
  const [reservations, setReservations] = useState([]);
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      let res;
      if (role === "LIBRARIAN") {
        res = await reservationService.getAll();
      } else {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }
        res = await reservationService.getByUser(userId);
      }
      setReservations(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load reservations:", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const doReserve = async () => {
    if (!bookId) return alert("Enter book id");
    try {
      const userId = localStorage.getItem("userId");
      await reservationService.reserve(userId, bookId);
      alert("Reserved");
      setBookId("");
      load();
    } catch (err) {
      console.error(err);
      alert("Reserve failed");
    }
  };

  const doCancel = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await reservationService.cancel(id);
      alert("Cancelled");
      load();
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleString();
  };

  const now = Date.now();
  const dueTone = (d) => {
    if (!d)
      return {
        label: "No expiry",
        tone: "bg-gray-500/15 text-gray-200 border-gray-400/30",
      };
    const t = new Date(d).getTime();
    if (isNaN(t))
      return {
        label: "—",
        tone: "bg-gray-500/15 text-gray-200 border-gray-400/30",
      };
    const days = Math.ceil((t - now) / (1000 * 60 * 60 * 24));
    if (days < 0)
      return {
        label: "Expired",
        tone: "bg-rose-500/15 text-rose-200 border-rose-400/30",
      };
    if (days <= 3)
      return {
        label: `Expires in ${days}d`,
        tone: "bg-amber-500/15 text-amber-200 border-amber-400/30",
      };
    return {
      label: `Expires in ${days}d`,
      tone: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    };
  };

  const count = useMemo(() => reservations.length, [reservations]);

  return (
    <div className="relative p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
          <span className="text-2xl">📑</span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Reservations
          </h2>
          <span className="ml-2 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-cream-50/80">
            {count}
          </span>
        </div>

        <button
          onClick={load}
          className="relative inline-flex items-center gap-2 rounded-xl border border-sky-300/30 bg-gradient-to-b from-sky-500/80 to-sky-600/80 text-white px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(2,132,199,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(2,132,199,0.5)] active:translate-y-0"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            placeholder="Book ID to reserve"
            className="w-full sm:max-w-xs px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-cream-50 placeholder:text-cream-50/60 outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300/40 transition"
          />
          <button
            onClick={doReserve}
            className="inline-flex gap-2 items-center px-4 py-2 rounded-xl border border-emerald-300/30 bg-gradient-to-b from-emerald-500/80 to-emerald-600/80 text-white text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(16,185,129,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(16,185,129,0.5)] active:translate-y-0"
          >
            <BookPlus className="h-4 w-4" />
            Reserve
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-white/10 bg-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-cream-50/90 flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <p>No reservations.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reservations.map((r) => {
              const tone = dueTone(r.expiresAt);
              return (
                <li
                  key={r.id}
                  className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-cream-50/95">
                        {r.book?.title ||
                          r.book?.name ||
                          "Book #" + (r.book?.id || "?")}
                      </div>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide",
                          tone.tone,
                        ].join(" ")}
                      >
                        {tone.label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-cream-50/80">
                      <div>
                        {r.user?.name || r.user?.email || "—"}
                        <span className="mx-2 opacity-60">•</span>
                        Expires:{" "}
                        <span className="font-medium text-cream-50">
                          {fmtDate(r.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/books/${r.book?.id}`)}
                      className="px-3 py-1 rounded-xl border border-indigo-300/30 bg-gradient-to-b from-indigo-500/80 to-indigo-600/80 text-white text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(79,70,229,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(79,70,229,0.5)] active:translate-y-0"
                    >
                      View
                    </button>
                    <button
                      onClick={() => doCancel(r.id)}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-xl border border-rose-300/30 bg-gradient-to-b from-rose-500/80 to-rose-600/80 text-white text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(225,29,72,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(225,29,72,0.5)] active:translate-y-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
