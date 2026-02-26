import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, CalendarClock, Timer, XCircle } from "lucide-react";

export default function Reservation() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    axios
      .get("/api/reservations/user")
      .then((res) => setReservations(res.data))
      .catch((err) => console.log(err));
  }, []);

  const cancelReservation = (id) => {
    axios
      .post(`/api/reservations/cancel/${id}`)
      .then(() => setReservations((prev) => prev.filter((r) => r.id !== id)))
      .catch((err) => alert(err.response?.data || err.message));
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div
      className="min-h-screen w-full relative p-4 sm:p-6 lg:p-8"
      style={{
        backgroundImage: "url('/libraryimg.jpeg')", // 🔹 change this to your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
            <BookOpen className="h-5 w-5 text-amber-300" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
              My Reservations
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-cream-50/80">
                <th className="px-4 py-3 text-left rounded-l-xl bg-white/10 border border-white/10">
                  Book
                </th>
                <th className="px-4 py-3 text-left bg-white/10 border border-white/10">
                  Reserved At
                </th>
                <th className="px-4 py-3 text-left bg-white/10 border border-white/10">
                  Expires At
                </th>
                <th className="px-4 py-3 text-right rounded-r-xl bg-white/10 border border-white/10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-cream-100/80"
                  >
                    No reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="text-cream-50/95">
                    <td className="px-4 py-3 rounded-l-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-amber-400/20 text-amber-200">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">
                            {r.book?.title || "Untitled"}
                          </div>
                          <div className="text-xs text-cream-50/70 truncate">
                            ID: {r.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-amber-300" />
                        <span>{fmt(r.reservedAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-amber-300" />
                        <span>{fmt(r.expiresAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 rounded-r-xl bg-white/5 border border-white/10">
                      <div className="flex justify-end">
                        {r.status === "ACTIVE" ? (
                          <button
                            onClick={() => cancelReservation(r.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-300/30 bg-gradient-to-b from-rose-500/85 to-red-600/85 text-white px-3 py-1.5 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(225,29,72,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(225,29,72,0.5)]"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-cream-50/70">
                            {r.status}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
