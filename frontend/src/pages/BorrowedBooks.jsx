import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { borrowService } from "../services/borrowService";
import overdueService from "../services/overdueService";
import FinePaymentPage from "../components/FinePaymentPage";
import axios from "axios";
import {
  BookOpen,
  CalendarClock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  LibraryBig,
  ShieldCheck,
  Wand2,
  HandCoins,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function BorrowedBooksPage() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paidFines, setPaidFines] = useState([]);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchBooks = async () => {
      setLoading(true);
      try {
        const books = await borrowService.userHistory(userId);
        const overdueList = await overdueService.getByUser(userId);

        const booksWithFine = (books || []).map((b) => {
          let fineAmount = 0;
          let status = b.status?.toUpperCase() || "BORROWED";

          if (status === "DAMAGED" || status === "LOST") {
            fineAmount = Number(b.fineAmount ?? b.fine_amount ?? 0);
          }

          if (
            b.dueDate &&
            status !== "RETURNED" &&
            status !== "LOST" &&
            status !== "DAMAGED"
          ) {
            const today = new Date();
            const due = new Date(b.dueDate);
            const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
            if (diff > 0) {
              const calculatedFine = diff * 8;
              fineAmount = Math.max(fineAmount, calculatedFine);
              status = "OVERDUE";
            }
          }

          const match = overdueList?.find(
            (o) => o.id === b.id || o.borrowId === b.id || o.borrow_id === b.id
          );

          if (match) {
            const backendFine =
              match.fineAmount ?? match.fine_amount ?? match.fine ?? 0;
            if (backendFine > 0) {
              fineAmount = backendFine;
            }
            status = "OVERDUE";
          }

          if (status === "OVERDUE" && fineAmount === 0 && b.dueDate) {
            const today = new Date();
            const due = new Date(b.dueDate);
            const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
            if (diff > 0) fineAmount = diff * 8;
          }

          return {
            ...b,
            fineAmount,
            status,
            renewCount: b.renewCount || 0,
            finePaid: b.finePaid ?? false,
          };
        });

        setBorrowedBooks(booksWithFine);
      } catch (err) {
        console.error(err);
        setError("Failed to load borrowed books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    const interval = setInterval(fetchBooks, 15000);
    return () => clearInterval(interval);
  }, [navigate, userId]);

  useEffect(() => {
    console.log("Borrowed Books Data:", borrowedBooks);
  }, [borrowedBooks]);

  const renewBook = async (borrowId) => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/borrow/renew/${borrowId}`,
        {},
        { withCredentials: true }
      );
      const { newDueDate } = res.data;
      const renewCount = res.data.renewCount ?? res.data.renew_count ?? 0;
      setBorrowedBooks((prev) =>
        prev.map((b) =>
          b.id === borrowId ? { ...b, dueDate: newDueDate, renewCount } : b
        )
      );
    } catch (err) {
      console.error("Renew error:", err);
      alert("Failed to renew book");
    }
  };

  const getStatus = (b) => {
    const { dueDate, status } = b;
    if (status === "RETURNED")
      return {
        label: "Returned",
        tone: "bg-emerald-100 text-emerald-700 border-emerald-300",
        icon: <CheckCircle size={16} className="text-emerald-600" />,
      };
    if (status === "DAMAGED" || status === "LOST")
      return {
        label: status,
        tone: "bg-rose-100 text-rose-700 border-rose-300",
        icon: <AlertTriangle size={16} className="text-rose-600" />,
      };
    if (!dueDate)
      return {
        label: "No due date",
        tone: "bg-gray-100 text-gray-700 border-gray-300",
        icon: <CalendarClock size={16} className="text-gray-600" />,
      };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return {
        label: "Overdue",
        tone: "bg-rose-100 text-rose-700 border-rose-300",
        icon: <AlertTriangle size={16} className="text-rose-600" />,
      };
    if (diffDays <= 3)
      return {
        label: `Due in ${diffDays}d`,
        tone: "bg-amber-100 text-amber-700 border-amber-300",
        icon: <CalendarClock size={16} className="text-amber-600" />,
      };
    return {
      label: `Due in ${diffDays}d`,
      tone: "bg-emerald-100 text-emerald-700 border-emerald-300",
      icon: <CalendarClock size={16} className="text-emerald-600" />,
    };
  };

  if (loading)
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: "url('/bibliolibrary.jpg')",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />
        <div className="relative h-screen overflow-y-auto flex items-center justify-center">
          <div className="flex items-center gap-3 text-brown-900 bg-white/70 rounded-xl px-4 py-2 shadow">
            <LibraryBig size={24} className="text-amber-600" />
            <span className="text-base tracking-wide">
              Loading borrowed books...
            </span>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: "url('/bibliolibrary.jpg')",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />
        <div className="relative h-screen overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-rose-300 bg-rose-100 text-rose-800 shadow p-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-rose-600" size={22} />
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full relative">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/library-bg.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      <div className="relative h-screen overflow-y-auto">
        <div className="relative p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-white/40 px-5 py-3 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-brown-900 ring-1 ring-white/30">
              <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
                <BookOpen size={20} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                My Borrowed Books
              </h1>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                {borrowedBooks.length}
              </span>
            </div>
          </header>

          {borrowedBooks.length === 0 ? (
            <div className="mt-10 max-w-3xl mx-auto">
              <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow p-8 text-brown-900 text-center">
                <span className="text-4xl">✨</span>
                <h2 className="text-xl sm:text-2xl font-semibold mt-4">
                  No borrowed books yet
                </h2>
                <p className="text-sm text-brown-800/85 mt-2">
                  Browse the catalog and start your reading journey 📖
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {borrowedBooks.map((b) => {
                const dueDate = b.dueDate ? new Date(b.dueDate) : null;
                const today = new Date();
                const diffDays =
                  dueDate !== null
                    ? Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
                    : 0;

                let computedStatus = b.status;
                let fine = Number(b.fineAmount ?? 0);

                computedStatus = computedStatus
                  ? computedStatus.toUpperCase()
                  : "BORROWED";

                const isBorrowed =
                  computedStatus === "BORROWED" || computedStatus === "OVERDUE";
                const hasFine = fine > 0;
                const isPaid = Boolean(b.finePaid) || paidFines.includes(b.id);
                const status = getStatus({ ...b, status: computedStatus });

                console.log(
                  "Book:",
                  b.bookTitle,
                  "| Final status:",
                  computedStatus,
                  "| Label:",
                  status.label,
                  "| Fine:",
                  fine,
                  "| Paid:",
                  isPaid
                );

                return (
                  <div
                    key={b.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)] hover:-translate-y-1"
                  >
                    <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-gradient-to-br from-amber-300/50 to-orange-400/50 blur-3xl group-hover:scale-110 transition-transform" />
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-lg text-brown-900 flex items-center gap-2 truncate">
                          <BookOpen className="text-amber-600" size={18} />
                          <span className="truncate">
                            {b?.bookTitle || "Unknown Book"}
                          </span>
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${status.tone}`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>

                      <div className="mt-4 text-brown-800/90 text-sm space-y-2">
                        {isBorrowed && !hasFine ? (
                          <>
                            <div className="flex items-center gap-2">
                              <CalendarClock
                                size={16}
                                className="text-amber-600"
                              />
                              <span>
                                Due:{" "}
                                <span className="font-semibold text-brown-900">
                                  {b.dueDate
                                    ? new Date(b.dueDate).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <RefreshCw size={14} className="text-sky-600" />
                              <span>
                                Renewed:{" "}
                                <span className="font-semibold text-brown-900">
                                  {b.renewCount}/2 times
                                </span>
                              </span>
                            </div>
                          </>
                        ) : b.status === "RETURNED" ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              size={16}
                              className="text-emerald-600"
                            />
                            <span>
                              Returned on:{" "}
                              <span className="font-semibold text-brown-900">
                                {b.returnDate
                                  ? new Date(b.returnDate).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </span>
                          </div>
                        ) : isPaid && b.paymentMode === "OFFLINE" ? (
                          <div className="inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-100/80 rounded-lg px-2 py-1">
                            <CheckCircle size={16} className="text-blue-600" />
                            <div>
                              Fine paid (Offline)
                              <div className="text-xs text-blue-700/90">
                                ₹{fine}
                              </div>
                            </div>
                          </div>
                        ) : isPaid ? (
                          <div className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-100/80 rounded-lg px-2 py-1">
                            <CheckCircle
                              size={16}
                              className="text-emerald-600"
                            />
                            <div>
                              Fine paid (Online)
                              <div className="text-xs text-emerald-700/90">
                                ₹{fine}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-1 text-rose-700 bg-rose-100/70 rounded-lg px-2 py-1 inline-flex items-center gap-2">
                            <AlertTriangle size={16} /> Book marked as{" "}
                            {computedStatus}. Pay fine below.
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex flex-col gap-3">
                        {isBorrowed && !hasFine && (
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-brown-700/80">
                              ID: {b.id}
                            </div>
                            <button
                              onClick={() => renewBook(b.id)}
                              disabled={b.renewCount >= 2}
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
                            >
                              <Wand2 size={16} />
                              <span>Renew</span>
                              <Sparkles size={16} className="opacity-90" />
                            </button>
                          </div>
                        )}

                        {b.fineAmount > 0 &&
                          !b.finePaid &&
                          !paidFines.includes(b.id) &&
                          ["OVERDUE", "DAMAGED", "LOST"].includes(
                            computedStatus?.toUpperCase()
                          ) && (
                            <FinePaymentPage
                              userId={userId}
                              requestId={b.id}
                              amount={b.fineAmount}
                              onSuccess={() => {
                                setPaidFines((prev) => [...prev, b.id]);
                                setBorrowedBooks((prev) =>
                                  prev.map((x) =>
                                    x.id === b.id ? { ...x, finePaid: true } : x
                                  )
                                );
                              }}
                            >
                              <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-sm font-semibold shadow hover:brightness-105 hover:-translate-y-0.5 transition-all">
                                <HandCoins size={16} />
                                <span>Pay Fine ₹{b.fineAmount}</span>
                                <ArrowRight size={15} className="opacity-90" />
                              </button>
                            </FinePaymentPage>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
