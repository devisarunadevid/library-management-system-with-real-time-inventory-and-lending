// AdminAlerts.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  AlertTriangle,
  BookOpen,
  Hash,
  RefreshCcw,
  Library,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

export default function AdminAlerts() {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchLowStock = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await axios.get("/api/books/low-stock");
      setLowStock(res.data || []);
    } catch {
      setErr("Failed to load low stock books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  const fmt = (v) => (v ?? v === 0 ? String(v) : "—");

  return (
    <div className="min-h-screen w-full relative">
      {/* Fixed bright background that never breaks on scroll */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('/bibliolibrary.jpg')`,
          backgroundAttachment: "fixed",
        }}
      />
      {/* Soft golden glow + subtle veil for readability while keeping image visible */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      {/* Scrollable content */}
      <div className="relative h-screen overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-white/40 backdrop-blur-2xl px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.25)] ring-1 ring-white/30">
              <span className="relative inline-flex">
                <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/25" />
                <AlertTriangle className="relative h-5 w-5 text-amber-600 drop-shadow" />
              </span>
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                  Low Stock Alerts
                </h2>
                <p className="text-xs text-brown-800/85 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Monitor books nearing depletion and restock proactively.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-amber-500 ml-1">
                <Star className="w-4 h-4" />
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-white/60 px-3 py-1.5 text-brown-900 shadow">
                <Library className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold">
                  Alerts: {lowStock.length}
                </span>
              </span>
              <button
                onClick={fetchLowStock}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-3 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition"
                title="Refresh alerts"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
                <Sparkles className="w-4 h-4 text-white/95" />
              </button>
            </div>
          </div>

          {/* States */}
          {loading ? (
            <div className="grid gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl border border-white/30 bg-white/50 backdrop-blur-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              ))}
            </div>
          ) : err ? (
            <div className="rounded-2xl border border-rose-300/50 bg-white/70 text-rose-700 p-4 shadow">
              {err}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden ring-1 ring-white/30">
              {/* Card header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-white/70 via-white/60 to-white/70 border-b border-white/40">
                <div className="flex items-center gap-2 text-brown-900">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-600 ring-1 ring-amber-300/40">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold">
                    {lowStock.length === 0
                      ? "No alerts"
                      : `${lowStock.length} alert(s)`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brown-800/85">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Auto-updated
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-0 text-sm">
                  <thead>
                    <tr className="text-brown-800/90">
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        <span className="inline-flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          Book
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        Author
                      </th>
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        Available Copies
                      </th>
                      <th className="px-4 py-3 text-left bg-white/70 border-b border-white/40">
                        Shelf
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-12 text-center text-brown-900"
                        >
                          All good — no low stock alerts.
                        </td>
                      </tr>
                    ) : (
                      lowStock.map((b, idx) => {
                        const copies = Number(b.availableCopies);
                        const danger = copies <= 0;
                        const warn = copies > 0 && copies <= 3;
                        const badge = danger
                          ? "bg-rose-100 text-rose-700 border-rose-300"
                          : warn
                          ? "bg-amber-100 text-amber-700 border-amber-300"
                          : "bg-emerald-100 text-emerald-700 border-emerald-300";
                        const leftAccent = danger
                          ? "before:bg-rose-400"
                          : warn
                          ? "before:bg-amber-400"
                          : "before:bg-emerald-500";
                        return (
                          <tr
                            key={b.id ?? idx}
                            className="group text-brown-900 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
                          >
                            <td className="relative px-4 py-4 bg-white/60 border-b border-white/40">
                              <div
                                className={`pointer-events-none absolute inset-y-0 left-0 w-1 rounded-r-xl ${leftAccent}`}
                              />
                              <div className="flex items-center gap-3">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-300 group-hover:scale-105 transition">
                                  <BookOpen className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold truncate">
                                    {b.title}
                                  </div>
                                  <div className="text-xs text-brown-800/75 flex items-center gap-1">
                                    <Hash className="h-3.5 w-3.5 opacity-70" />
                                    ID: {fmt(b.id)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 bg-white/60 border-b border-white/40">
                              <span className="group-hover:text-brown-900 transition-colors">
                                {fmt(b.author)}
                              </span>
                            </td>
                            <td className="px-4 py-4 bg-white/60 border-b border-white/40">
                              <span
                                className={`inline-flex items-center rounded-xl border px-2 py-1 text-xs ${badge}`}
                                title={
                                  danger
                                    ? "Out of stock"
                                    : warn
                                    ? "Low stock"
                                    : "Sufficient stock"
                                }
                              >
                                {fmt(b.availableCopies)}
                              </span>
                            </td>
                            <td className="px-4 py-4 bg-white/60 border-b border-white/40">
                              <span className="text-brown-900">
                                {fmt(b.shelf)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes shimmer { 100% { transform: translateX(100%); } }
          .chat-scroll{scroll-behavior:smooth}
          .chat-scroll::-webkit-scrollbar{width:10px}
          .chat-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.25);border-radius:9999px;border:2px solid transparent}
          .chat-scroll::-webkit-scrollbar-track{background:transparent}
        `}</style>
      </div>
    </div>
  );
}
