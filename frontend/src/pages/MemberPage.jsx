import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { borrowService } from "../services/borrowService";
import { memberService } from "../services/memberService";
import overdueService from "../services/overdueService";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import notificationService from "../services/notificationService";
import {
  LogOut,
  Library,
  Bell,
  Trash2,
  Check,
  BookOpen,
  Coins,
  Crown,
  History,
  Receipt,
} from "lucide-react";
import transactionService from "../services/transactionService";
import LibrarioChat from "../components/LibrarioChat";

export default function MemberPage() {
  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          navigate("/login");
          return;
        }
        const memberData = await memberService.getProfile(email);
        setMember(memberData);
        const hist = await borrowService.userHistory(memberData.userId);
        setBorrowHistory(hist || []);
        const overdue = await overdueService.getByUser(memberData.userId);
        setOverdueList(overdue || []);
        const notifs = await notificationService.getUnread(memberData.userId);
        setNotifications(notifs || []);
      } catch (err) {
        console.error("Error loading member data:", err);
      }
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const txns = await transactionService.getByUser(userId);
          setHistory(Array.isArray(txns) ? txns : []);
        }
      } catch (err) {
        console.error("Error loading history:", err);
      }
    }
    loadHistory();
  }, []);

  const totalFines =
    borrowHistory.reduce((acc, b) => acc + (b.fineAmount || 0), 0) +
    overdueList.reduce((acc, o) => acc + (o.fineAmount || 0), 0);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
      alert("Failed to logout. Try again.");
    }
  };

  return (
    <div className="grid grid-cols-[18rem_1fr] h-screen w-screen overflow-hidden">
      <Sidebar role="MEMBER" />
      {/* Fixed, seamless background (stays put while page scrolls) */}
      <div className="relative min-w-0">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/bibliolibrary.jpg")',
            backgroundAttachment: "fixed",
          }}
        />
        {/* Soft golden glow overlay for readability without hiding image */}
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_800px_at_50%_-10%,rgba(255,200,120,0.18),transparent_60%)]" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />
        {/* Scrollable content */}
        <div className="relative h-screen overflow-y-auto">
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/40">
                  <Library className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                  Welcome, {member?.userName || "Reader"} ✨
                </h1>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs((prev) => !prev)}
                    className="inline-flex items-center justify-center rounded-xl border border-amber-200/50 bg-white/30 p-2 backdrop-blur-xl text-brown-900 hover:bg-white/50 transition shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                  >
                    <Bell className="w-5 h-5 text-amber-600" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.5 shadow">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/20 bg-white/40 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.28)] overflow-hidden z-50">
                      <div className="p-3 border-b border-white/20 font-semibold text-brown-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-600" />
                        Notifications
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className="p-3 border-b border-white/20 flex justify-between items-start gap-2 hover:bg-white/40 transition"
                            >
                              <div>
                                <p className="text-sm text-brown-900">
                                  {n.message}
                                </p>
                                <p className="text-xs text-brown-700/80">
                                  {new Date(n.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => markRead(n.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition shadow"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteNotif(n.id)}
                                  className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition shadow"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="p-3 text-sm text-brown-800/80">
                            No notifications
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-300/50 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-red-600 text-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_28px_rgba(225,29,72,0.45)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_16px_42px_rgba(225,29,72,0.6)] active:translate-y-0 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {location.pathname === "/member" ? (
              <div className="flex flex-col gap-8">
                {/* Quick stats with icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-2xl p-6 text-brown-900 shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 ring-1 ring-amber-200/50">
                        <BookOpen className="w-5 h-5" />
                      </span>
                      <p className="font-medium text-brown-800">
                        Borrowed Books
                      </p>
                    </div>
                    <p className="text-3xl font-extrabold mt-2 text-brown-900">
                      {borrowHistory.length}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-2xl p-6 text-brown-900 shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 ring-1 ring-amber-200/50">
                        <Coins className="w-5 h-5" />
                      </span>
                      <p className="font-medium text-brown-800">
                        Pending Fines
                      </p>
                    </div>
                    <p className="text-3xl font-extrabold mt-2 text-brown-900">
                      ₹{totalFines}
                    </p>
                  </div>
                </div>

                {/* Plan card */}
                <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-2xl p-6 text-brown-900 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 ring-1 ring-amber-200/50">
                      <Crown className="w-5 h-5" />
                    </span>
                    <p className="font-semibold text-brown-900">
                      Membership Plan
                    </p>
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {member?.planType ?? "No Plan"}
                  </p>
                  <div className="mt-2 text-brown-800 space-y-1">
                    <p>Borrowing Limit: {member?.borrowingLimit ?? 0} books</p>
                    <p>Books Borrowed: {borrowHistory.length}</p>
                    <p>
                      Remaining:{" "}
                      {(member?.borrowingLimit ?? 0) - borrowHistory.length}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate("/member/renew-membership")}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all"
                    >
                      Renew / Upgrade
                    </button>
                    <button
                      onClick={() => navigate("/member/requests")}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all"
                    >
                      My Membership Requests
                    </button>
                  </div>
                </div>

                {/* Borrow history list */}
                <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-2xl p-6 text-brown-900 overflow-auto shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 ring-1 ring-amber-200/50">
                      <History className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold">Borrow History</h2>
                  </div>
                  {borrowHistory.length === 0 ? (
                    <p className="text-brown-800/80">No borrow history yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {borrowHistory.map((record) => (
                        <div
                          key={record.id}
                          className="flex justify-between items-center rounded-xl border border-white/30 bg-white/60 p-3 shadow hover:shadow-md transition"
                        >
                          <div className="text-brown-900">
                            {record.bookTitle}
                          </div>
                          <div className="text-sm text-brown-800/80">
                            Due: {record.dueDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Books and Transactions */}
                <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-2xl p-6 text-brown-900 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 ring-1 ring-amber-200/50">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold">Your Borrowed Books</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {borrowHistory.length > 0 ? (
                      borrowHistory.map((b) => (
                        <div
                          key={b.id}
                          className="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 backdrop-blur-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)] text-center"
                        >
                          <div className="text-4xl mb-2">📘</div>
                          <p className="font-semibold text-brown-900">
                            {b.bookTitle}
                          </p>
                          <p className="text-brown-800/80 text-sm mt-1">
                            Due: {b.dueDate}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-brown-800/80">
                        No borrowed books yet.
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-white/30 bg-white/50 backdrop-blur-2xl p-6 text-brown-900 overflow-auto mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 ring-1 ring-amber-200/50">
                        <Receipt className="w-5 h-5" />
                      </span>
                      <h2 className="text-xl font-bold">Transaction History</h2>
                    </div>
                    {history.length > 0 ? (
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-brown-800/90">
                            <th className="px-3 py-2 rounded-l-xl bg-white/70 border border-white/30">
                              Date
                            </th>
                            <th className="px-3 py-2 bg-white/70 border border-white/30">
                              Type
                            </th>
                            <th className="px-3 py-2 rounded-r-xl bg-white/70 border border-white/30">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((txn) => (
                            <tr key={txn.id} className="text-brown-900">
                              <td className="px-3 py-2 rounded-l-xl bg-white/80 border border-white/30">
                                {new Date(
                                  txn.issueDate || txn.requestDate
                                ).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 bg-white/80 border border-white/30">
                                {txn.status === "APPROVED"
                                  ? "BORROW"
                                  : "REQUEST"}
                              </td>
                              <td className="px-3 py-2 rounded-r-xl bg-white/80 border border-white/30">
                                {txn.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-brown-800/80">No transactions yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Outlet />
            )}

            {/* Floating AI Chat – replace ONLY this block */}
            <div
              className={`fixed bottom-5 right-5 z-50 ${
                chatMinimized ? "w-[12rem]" : "w-[min(26rem,92vw)]"
              } transition-[width,transform] duration-300`}
            >
              <div className="relative overflow-hidden rounded-[26px] border border-white/20 bg-white/50 backdrop-blur-xl ring-1 ring-white/20 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400/80 to-orange-500/80" />
                  <div className="absolute right-4 -top-3 h-6 w-3 rotate-6 rounded-b-[6px] bg-amber-400 shadow-[0_6px_18px_rgba(245,158,11,0.55)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_-10%_-20%,rgba(255,210,150,0.16),transparent_60%),radial-gradient(760px_420px_at_120%_10%,rgba(30,64,30,0.10),transparent_55%)]" />
                </div>

                <button
                  type="button"
                  onClick={() => setChatMinimized(!chatMinimized)}
                  className="relative z-10 flex w-full items-center justify-between gap-2 px-2.5 py-2 border-b border-white/20 bg-gradient-to-r from-white/40 via-white/30 to-white/40 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-t-[22px]"
                  aria-expanded={!chatMinimized}
                  aria-controls="librario-chat-body"
                  title={chatMinimized ? "Open chat" : "Minimize chat"}
                >
                  <span className="pointer-events-none absolute -top-1.5 right-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/60 h-2.5 w-2.5" />
                    <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                  </span>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/40 ring-1 ring-white/40 shadow-inner">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-black/90"
                      >
                        <rect
                          x="6"
                          y="7"
                          width="12"
                          height="10"
                          rx="4"
                          fill="currentColor"
                          opacity=".18"
                        />
                        <rect
                          x="6"
                          y="7"
                          width="12"
                          height="10"
                          rx="4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          fill="none"
                        />
                        <circle cx="10" cy="12" r="1" fill="currentColor" />
                        <circle cx="14" cy="12" r="1" fill="currentColor" />
                        <path
                          d="M9 15h6"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 3.4v2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <circle cx="12" cy="3" r=".9" fill="currentColor" />
                      </svg>
                    </span>

                    <div className="min-w-0">
                      <div className="font-semibold text-black text-[13px] leading-tight truncate">
                        Librario Bot
                      </div>
                      {!chatMinimized && (
                        <div className="text-[10px] text-black/80 leading-tight truncate">
                          Ask about books, fines, membership…
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-block text-black text-sm transition-transform ${
                      chatMinimized ? "rotate-0" : "rotate-180"
                    }`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {!chatMinimized && (
                  <div
                    id="librario-chat-body"
                    className="relative z-10 border-t border-white/20"
                  >
                    <div className="chat-scroll max-h-[70vh] overflow-y-auto p-2 sm:p-3 bg-gradient-to-b from-white/40 via-white/30 to-white/40 backdrop-blur-md text-black">
                      <LibrarioChat
                        role="MEMBER"
                        context={{
                          borrowedBooks: borrowHistory.map((b) => b.bookTitle),
                          overdueInfo: overdueList.reduce((acc, o) => {
                            acc[o.bookTitle] = o.fineAmount || 0;
                            return acc;
                          }, {}),
                        }}
                      />
                    </div>
                  </div>
                )}

                <style>{`
                  .chat-scroll{scroll-behavior:smooth}
                  .chat-scroll::-webkit-scrollbar{width:10px}
                  .chat-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.25);border-radius:9999px;border:2px solid transparent}
                  .chat-scroll::-webkit-scrollbar-track{background:transparent}
                `}</style>
              </div>
            </div>
          </div>
          {/* closes p-8 container */}
        </div>
        {/* closes right panel */}
      </div>
    </div>
  );
}
