import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/notifications")
      .then((res) => setNotifications(res.data || []))
      .catch((e) => setErr("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-6">
        <Bell className="h-5 w-5 text-amber-300" />
        <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
          Notifications
        </h2>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl animate-pulse"
            />
          ))}
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-900/30 text-rose-100 p-4">
          {err}
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
              className="group p-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-cream-50/95 truncate">
                    {n.title}
                  </p>
                  <p className="text-cream-50/85 break-words">{n.message}</p>
                  <div className="text-xs text-cream-50/60">
                    {new Date(n.date).toLocaleString()}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">
                  New
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
