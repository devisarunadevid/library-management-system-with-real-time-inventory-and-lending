import { useEffect, useState } from "react";
import api from "../services/api";
import { AlertTriangle, RefreshCw, Clock } from "lucide-react";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/alerts");
      setAlerts(res.data || []);
    } catch (e) {
      console.error(e);
      setErr("Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
          <AlertTriangle className="h-5 w-5 text-amber-300" />
          <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Admin Alerts
          </h2>
          {alerts.length > 0 && (
            <span className="ml-2 rounded-full border border-amber-300/30 bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">
              {alerts.length}
            </span>
          )}
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-b from-amber-500/85 to-orange-500/85 px-3 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-0.5"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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
      ) : alerts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-cream-50/90">
          No alerts right now. All clear ✨
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] p-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-amber-300/35 to-orange-400/35 blur-2xl group-hover:scale-110 transition-transform" />
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-200">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-cream-50/95 font-semibold break-words">
                    {a.message}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-cream-50/70">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(
                        a.createdAt || a.date || Date.now()
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
