import { useEffect, useState } from "react";
import notificationService from "../services/notificationService";
import { Bell, Sparkles, Check } from "lucide-react";
import Sidebar from "../components/Sidebar"; // ✅ Add this import

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const role = user?.role;

  useEffect(() => {
    if (!userId && role !== "ADMIN") return;
    setLoading(true);
    const fetchData = async () => {
      try {
        let data = [];
        if (role === "ADMIN") data = await notificationService.getAdmin();
        else data = await notificationService.getUnread(userId);
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, userId]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(
        unread.map((n) => notificationService.markAsRead(n.id))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url('/bibliolibrary.jpg')`,
            backgroundAttachment: "fixed",
          }}
        />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />
        <div className="relative h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
          <p className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl p-4 text-brown-900 inline-block">
            Please login to view notifications.
          </p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen w-full relative flex">
        {/* ✅ Conditionally show Sidebar only for member */}
        <div className="flex-1 relative h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div
            className="fixed inset-0 -z-10 bg-cover bg-center"
            style={{
              backgroundImage: `url('/bibliolibrary.jpg')`,
              backgroundAttachment: "fixed",
            }}
          />
          <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
          <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />
          <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-white/40 px-4 py-2 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-6 text-brown-900 ring-1 ring-white/30">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
              Notifications
            </h2>
          </div>
          <div className="grid gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex">
      {/* ✅ Sidebar appears only for member */}
      {role === "MEMBER" && <Sidebar />}

      {/* Page content */}
      <div className="flex-1 relative h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Background setup */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url('/library-bg.jpg')`,
            backgroundAttachment: "fixed",
          }}
        />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

        {/* Existing notification content remains unchanged */}
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-white/40 px-4 py-2 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-brown-900 ring-1 ring-white/30">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                <Sparkles className="w-3.5 h-3.5" />
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-3 py-1.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] p-6 text-brown-900 inline-flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <p>No new notifications</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => {
              const isUnread = !n.read;
              return (
                <li
                  key={n.id}
                  className={[
                    "group p-4 rounded-2xl border backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5",
                    "shadow-[0_8px_30px_rgba(0,0,0,0.16)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.28)]",
                    "border-white/40 bg-white/60",
                    isUnread ? "ring-1 ring-amber-300/40" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-1 h-2.5 w-2.5 rounded-full shrink-0",
                        isUnread
                          ? "bg-amber-500 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]"
                          : "bg-emerald-500/80",
                      ].join(" ")}
                    />
                    <div className="flex-1 text-brown-900">
                      <p className="font-semibold leading-snug">
                        {n.title || n.type}
                      </p>
                      <p className="text-brown-800/85">{n.message}</p>
                      <small className="text-brown-700/80">
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {isUnread && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="self-start inline-flex items-center gap-1 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 text-xs font-semibold shadow hover:brightness-105 hover:-translate-y-0.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark as read
                      </button>
                    )}
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
