import { useEffect, useState } from "react";
import { Bell, BellRing, Crown, Sparkles, Star } from "lucide-react";
import notificationService from "../services/notificationService";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      notificationService
        .getUnreadCount(userId)
        .then((c) => setCount(Number(c) || 0))
        .catch((err) => console.error("Failed to load unread count", err));
    }
  }, []);

  const display = count > 99 ? "99+" : count;

  return (
    <div className="relative inline-block">
      <div
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/40 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white backdrop-blur-xl hover:brightness-110 transition shadow-[0_8px_20px_rgba(245,158,11,0.45)] cursor-pointer ring-1 ring-white/30"
        aria-label="Notifications"
        role="button"
        title="Notifications"
      >
        <div className="absolute -top-1.5 -left-1.5 text-amber-200/90 drop-shadow">
          <Crown className="w-3.5 h-3.5" />
        </div>
        {count > 0 ? (
          <BellRing className="w-5 h-5 drop-shadow" />
        ) : (
          <Bell className="w-5 h-5 drop-shadow" />
        )}
        <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 bg-[radial-gradient(180px_circle_at_center,rgba(251,191,36,0.18),transparent_60%)]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 text-amber-200/90 opacity-0 group-hover:opacity-100 transition">
          <Sparkles className="w-3.5 h-3.5" />
          <Star className="w-3.5 h-3.5" />
        </div>
      </div>

      {count > 0 && (
        <>
          <span className="absolute -top-1.5 -right-1.5 rounded-full border border-amber-300/40 bg-gradient-to-br from-amber-500 to-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_4px_12px_rgba(245,158,11,0.45)] ring-1 ring-white/60">
            {display}
          </span>
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400/50 animate-ping" />
        </>
      )}
    </div>
  );
}
