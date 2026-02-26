// src/pages/OverdueBooksPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import overdueService from "../services/overdueService";
import { borrowService } from "../services/borrowService";
import {
  RefreshCw,
  Trash2,
  BookOpen,
  User,
  CalendarClock,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function OverdueBooksPage() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Overdue Records
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await overdueService.getAll();

      // Keep only active items (not returned and not paid) with positive fine
      const filtered = (data || []).filter((b) => {
        const returned = Boolean(b.returned) || Boolean(b.returnDate);
        const finePaid = Boolean(b.finePaid);
        const fineAmount = Number(b.fineAmount || 0);
        return !returned && !finePaid && fineAmount > 0;
      });

      setOverdue(filtered);
    } catch (err) {
      console.error("Error loading overdue records:", err);
      setOverdue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Mark as Returned
  const handleReturn = async (id) => {
    if (!window.confirm("Mark this book as returned?")) return;
    try {
      await borrowService.returnBook(id);
      // re-sync with backend so flags are fresh
      await load();
      alert("✅ Book marked as returned!");
    } catch (err) {
      console.error("Return failed:", err);
      alert("❌ Failed to mark as returned.");
    }
  };

  // Waive or Mark Fine as Paid
  const handleWaive = async (id) => {
    if (!window.confirm("Waive or mark fine as paid for this borrow?")) return;
    try {
      await overdueService.waiveFine(id);
      // re-sync to remove it
      await load();
      alert("✅ Fine waived successfully!");
    } catch (err) {
      console.error("Waive failed:", err);
      alert("❌ Failed to waive fine.");
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* background and header identical to yours */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bibliolibrary.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      <div className="relative h-screen overflow-y-auto">
        <div className="relative z-10 flex min-h-screen w-full">
          <div className="flex-1 relative p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Overdue Books & Penalties
                  </h1>
                  <p className="text-sm text-brown-800/85 -mt-0.5">
                    Track overdue items and manage fines efficiently.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-white/60 px-3 py-1.5 text-brown-900 shadow">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold">
                    Overdues: {overdue.length}
                  </span>
                </span>
                <button
                  onClick={load}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-3 py-2 text-sm font-semibold shadow hover:brightness-105 hover:-translate-y-0.5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl p-6 shadow-xl">
              {loading ? (
                <p className="animate-pulse">Loading...</p>
              ) : overdue.length === 0 ? (
                <p className="italic">📚 No overdue items</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm text-left">
                    <thead>
                      <tr className="text-brown-800/90 uppercase tracking-wide border-b border-white/40">
                        <th className="px-3 py-2 w-[25%]">
                          <BookOpen className="inline w-4 h-4 text-amber-600 mr-1" />
                          Book
                        </th>
                        <th className="px-3 py-2 w-[20%]">
                          <User className="inline w-4 h-4 text-amber-600 mr-1" />
                          Member
                        </th>
                        <th className="px-3 py-2 w-[15%]">
                          <CalendarClock className="inline w-4 h-4 text-amber-600 mr-1" />
                          Due Date
                        </th>
                        <th className="px-3 py-2 w-[10%] text-center">Days</th>
                        <th className="px-3 py-2 w-[15%]">
                          <AlertCircle className="inline w-4 h-4 text-amber-600 mr-1" />
                          Fine
                        </th>
                        <th className="px-3 py-2 w-[15%] text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdue.map((r, i) => (
                        <tr
                          key={r.id}
                          className={`border-t border-white/30 ${
                            i % 2 === 0 ? "bg-white/60" : "bg-white/40"
                          } hover:bg-white/80 transition-colors`}
                        >
                          <td className="px-3 py-2">{r.bookTitle}</td>
                          <td className="px-3 py-2">{r.userName}</td>
                          <td className="px-3 py-2">
                            {r.dueDate
                              ? new Date(r.dueDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {r.daysOverdue ?? 0}
                          </td>
                          <td className="px-3 py-2">
                            ₹{(Number(r.fineAmount) || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-2">
                              {/* now hide Return if returned flag or returnDate present */}
                              {!Boolean(r.returned) &&
                                !Boolean(r.returnDate) && (
                                  <button
                                    onClick={() => handleReturn(r.id)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-300/50 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 font-medium shadow hover:brightness-105 transition"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Return
                                  </button>
                                )}
                              {!Boolean(r.finePaid) && (
                                <button
                                  onClick={() => handleWaive(r.id)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-300/50 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1.5 font-medium shadow hover:brightness-105 transition"
                                >
                                  <Trash2 className="w-4 h-4" /> Waive
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
