import { useEffect, useState, useRef } from "react";
import {
  BellRing,
  Bell,
  Check,
  Trash2,
  Crown,
  Sparkles,
  Star,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";
import notificationService from "../services/notificationService";

export default function AdminNotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // fetch admin notifications
  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAdmin();
      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.read).length;
      setCount(unread);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // delete notification
  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative cursor-pointer p-2 rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 shadow hover:brightness-105 transition ring-1 ring-white/40"
        title="Notifications"
      >
        <div className="absolute -top-2 -left-2 text-amber-200/90 drop-shadow">
          <Crown className="w-3.5 h-3.5" />
        </div>
        <BellRing className="w-5 h-5 text-white drop-shadow" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5 ring-2 ring-white/70 shadow">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-2xl border z-50 shadow-xl"
          style={{
            backgroundImage: "url('/libraryimg.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-[rgba(15,10,3,0.35)] backdrop-blur-[2px]" />
          <div className="relative">
            <div className="p-3 border-b border-amber-200/40 bg-white/70 backdrop-blur-md rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white shadow ring-1 ring-white/30">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                    Notifications
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto bg-white/80 backdrop-blur-md">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-stone-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  No notifications
                </div>
              ) : (
                <ul className="divide-y divide-amber-100/70">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`p-3 text-sm ${
                        !n.read ? "bg-amber-50/70" : "bg-transparent"
                      } hover:bg-amber-50/80 transition`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <div className="font-semibold text-stone-900 truncate">
                              {n.title || n.type}
                            </div>
                          </div>
                          <div className="text-stone-700 mt-0.5">
                            {n.message}
                          </div>
                          <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600/80" />
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!n.read && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-105 shadow ring-1 ring-white/40"
                              title="Mark as Read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="p-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 text-white hover:brightness-105 shadow ring-1 ring-white/40"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
