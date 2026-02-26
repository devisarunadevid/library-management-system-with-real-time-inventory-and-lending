// src/pages/AdminNotifications.jsx
import { useEffect, useState } from "react";
import notificationService from "../services/notificationService"; // ✅ fixed import
import { Bell, Check } from "lucide-react";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService
      .getAdmin()
      .then((res) => setNotifications(res || []))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url('/libraryimg.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(245,230,210,0.25),transparent_60%),radial-gradient(700px_400px_at_90%_20%,rgba(80,50,20,0.35),transparent_50%)]" />
      <div className="absolute inset-0 bg-[color:rgba(20,14,5,0.55)] backdrop-blur-[3px]" />

      {/* Page content */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-6">
          <Bell className="h-5 w-5 text-amber-300" />
          <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Admin Notifications
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl animate-pulse"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 text-cream-50/90">
            No notifications.
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={[
                  "group p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5",
                  "shadow-[0_8px_30px_rgba(0,0,0,0.16)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.28)]",
                  "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)]",
                  n.read ? "opacity-80" : "ring-1 ring-amber-300/20",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-cream-50/95 truncate">
                      {n.title || "Notification"}
                    </p>
                    <p className="text-cream-50/85 break-words">{n.message}</p>
                    <small className="text-cream-50/60">
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="self-start inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)]"
                    >
                      <Check className="h-4 w-4" />
                      Mark as read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
