// src/pages/MemberTransactions.jsx
import React, { useEffect, useMemo, useState } from "react";
import transactionService from "../services/transactionService";
import FineBadge from "../components/FineBadge";
import { useNavigate } from "react-router-dom";

export default function MemberTransactions() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }
      const res = await transactionService.getByUser(userId);
      setRecords(res || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
  };

  const now = Date.now();
  const getDueTone = (due) => {
    if (!due)
      return {
        label: "No due",
        tone: "bg-gray-500/15 text-gray-200 border-gray-400/30",
      };
    const t = new Date(due).getTime();
    if (isNaN(t))
      return {
        label: "—",
        tone: "bg-gray-500/15 text-gray-200 border-gray-400/30",
      };
    const days = Math.ceil((t - now) / (1000 * 60 * 60 * 24));
    if (days < 0)
      return {
        label: "Overdue",
        tone: "bg-rose-500/15 text-rose-200 border-rose-400/30",
      };
    if (days <= 3)
      return {
        label: `Due in ${days}d`,
        tone: "bg-amber-500/15 text-amber-200 border-amber-400/30",
      };
    return {
      label: `Due in ${days}d`,
      tone: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    };
  };

  const stats = useMemo(() => {
    const borrowed = records.filter((r) => r.status === "APPROVED");
    const count = borrowed.length;
    const overdue = borrowed.filter((r) => {
      const t = new Date(r.dueDate || "").getTime();
      return !isNaN(t) && t < now;
    }).length;
    const totalFine = records.reduce(
      (a, r) => a + (Number(r.fineAmount) || 0),
      0
    );
    return { count, overdue, totalFine };
  }, [records, now]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  return (
    <div className="relative p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
          <span className="text-2xl">📖</span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            My Borrowed Books
          </h2>
        </div>

        <button
          onClick={load}
          className="relative inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-b from-amber-500/85 to-orange-500/85 text-white px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0"
        >
          <span className="text-base">↻</span>
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-cream-50/90">
          <div className="text-sm opacity-80">Borrowed</div>
          <div className="mt-1 text-2xl font-semibold">{stats.count}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-cream-50/90">
          <div className="text-sm opacity-80">Overdue</div>
          <div className="mt-1 text-2xl font-semibold">{stats.overdue}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-cream-50/90">
          <div className="text-sm opacity-80">Total Fines</div>
          <div className="mt-1 text-2xl font-semibold">
            {currency.format(stats.totalFine)}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-white/10 bg-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-cream-50/90 flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <p>No borrowed books.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {records.map((r) => {
              const tone = getDueTone(r.dueDate);
              return (
                <div
                  key={r.id}
                  className="group relative flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-cream-50/95">
                        {r.book?.title}
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
                        Due:{" "}
                        <span className="font-medium text-cream-50">
                          {fmtDate(r.dueDate)}
                        </span>
                      </div>
                      <div>
                        Issued:{" "}
                        <span className="font-medium text-cream-50">
                          {fmtDate(r.issueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FineBadge fine={r.fineAmount} />
                    <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200 px-2 py-0.5 text-xs font-medium tracking-wide">
                      {r.status?.trim().toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
