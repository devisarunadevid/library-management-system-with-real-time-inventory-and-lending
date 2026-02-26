// src/pages/BorrowRecordsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { borrowService } from "../services/borrowService";
import {
  ClipboardList,
  CheckCircle2,
  BookOpen,
  User,
  Clock,
  AlertTriangle,
  BookMarked,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function BorrowRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await borrowService.getAllRecords();
      setRecords(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching borrow records:", err);
      if (err.response?.status === 401)
        setError("Unauthorized: Please login as Librarian/Admin.");
      else setError("Failed to fetch borrow records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleReturn = async (id) => {
    const updatedRecord = await borrowService.returnBook(id);
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "RETURNED",
              returnDate: new Date().toISOString(),
              fineAmount: updatedRecord?.fineAmount ?? r.fineAmount ?? 0,
            }
          : r
      )
    );
  };

  const handleReport = async (id, type) => {
    try {
      const updatedRecord = await borrowService.reportDamageOrLoss(id, type);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: type.toUpperCase(),
                fineAmount: updatedRecord?.fineAmount ?? 0,
              }
            : r
        )
      );
    } catch {
      alert("Failed to update status");
    }
  };

  const computeDisplayFor = (r) => {
    const rawStatus = (r.status || "").toUpperCase();
    if (
      rawStatus !== "RETURNED" &&
      rawStatus !== "LOST" &&
      rawStatus !== "DAMAGED" &&
      r.dueDate
    ) {
      try {
        const due = new Date(r.dueDate);
        const today = new Date();
        due.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
        if (diff > 0) {
          const daysLate = diff;
          const computedFine =
            (r.fineAmount ?? 0) > 0 ? r.fineAmount : daysLate * 8;
          return {
            displayStatus: "OVERDUE",
            daysLate,
            fine: computedFine,
          };
        }
      } catch (e) {
        console.warn("Date parse error for borrow record:", r, e);
      }
    }
    return {
      displayStatus: rawStatus || "BORROWED",
      daysLate: 0,
      fine: r.fineAmount ?? 0,
    };
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Fixed bright background (stays crisp while scrolling) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bibliolibrary.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      {/* Soft golden glow + subtle veil for readability without hiding image */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      {/* Scrollable content */}
      <div className="relative h-screen overflow-y-auto">
        <div className="relative p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
              Borrow Records
            </h1>
            <span className="ml-auto inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full border border-amber-300/60 bg-amber-100 text-amber-700 shadow">
              <ShieldCheck className="w-4 h-4" />
              Librarian View
            </span>
          </div>

          {loading && (
            <p className="text-brown-900 bg-white/70 rounded-xl px-3 py-2 inline-block animate-pulse">
              Loading records...
            </p>
          )}
          {error && (
            <div className="p-4 rounded-2xl border border-rose-300 bg-rose-100 text-rose-800 shadow mb-4">
              {error}
            </div>
          )}
          {!loading && !error && records.length === 0 && (
            <p className="text-brown-900 bg-white/70 rounded-xl px-3 py-2 inline-block">
              📚 No borrow records found.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((r) => {
              const { displayStatus, daysLate, fine } = computeDisplayFor(r);

              const badgeClasses =
                displayStatus === "RETURNED"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                  : displayStatus === "OVERDUE"
                  ? "bg-rose-100 text-rose-700 border-rose-300"
                  : displayStatus === "DAMAGED"
                  ? "bg-amber-100 text-amber-700 border-amber-300"
                  : displayStatus === "LOST"
                  ? "bg-rose-100 text-rose-700 border-rose-300"
                  : "bg-amber-100 text-amber-700 border-amber-300";

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl p-5 text-brown-900 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                    <h2 className="font-semibold text-lg truncate">
                      {r.bookTitle}
                    </h2>
                  </div>

                  <p className="flex items-center gap-2 text-sm text-brown-800/85">
                    <User className="w-4 h-4 text-amber-600/90" />
                    {r.userName || r.userEmail}
                  </p>

                  <p className="flex items-center gap-2 text-sm text-brown-800/85">
                    <BookMarked className="w-4 h-4 text-amber-600/90" />
                    <span className="font-medium">Status:</span>
                    <span
                      className={`inline-flex items-center rounded-xl border px-2 py-0.5 text-xs ${badgeClasses}`}
                    >
                      {displayStatus}
                    </span>
                  </p>

                  <p className="flex items-center gap-2 text-sm text-brown-800/85">
                    <Clock className="w-4 h-4 text-amber-600/90" />
                    <span className="font-medium">Due:</span>{" "}
                    {r.dueDate
                      ? new Date(r.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>

                  {displayStatus === "OVERDUE" && (
                    <>
                      <p className="flex items-center gap-2 text-sm text-rose-700 mt-1">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>
                          Overdue by <strong>{daysLate}</strong> day
                          {daysLate !== 1 ? "s" : ""} — Fine:{" "}
                          <strong>₹{fine}</strong>
                        </span>
                      </p>
                    </>
                  )}

                  {r.returnDate && (
                    <p className="flex items-center gap-2 text-sm text-brown-800/85 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">Returned:</span>{" "}
                      {new Date(r.returnDate).toLocaleDateString()}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(r.status || "").toUpperCase() === "BORROWED" && (
                      <>
                        <button
                          onClick={() => handleReturn(r.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 font-medium shadow hover:brightness-105 hover:-translate-y-0.5 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Returned</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-90" />
                        </button>

                        <button
                          onClick={() => handleReport(r.id, "DAMAGED")}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 font-medium shadow hover:brightness-105 hover:-translate-y-0.5 transition-all"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Mark Damaged</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-90" />
                        </button>

                        <button
                          onClick={() => handleReport(r.id, "LOST")}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-300/60 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1.5 font-medium shadow hover:brightness-105 hover:-translate-y-0.5 transition-all"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Mark Lost</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-90" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          .chat-scroll{scroll-behavior:smooth}
          .chat-scroll::-webkit-scrollbar{width:10px}
          .chat-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.25);border-radius:9999px;border:2px solid transparent}
          .chat-scroll::-webkit-scrollbar-track{background:transparent}
        `}</style>
      </div>
    </div>
  );
}
