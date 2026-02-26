import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { memberService } from "../services/memberService";
import { BadgeCheck, CalendarClock, BookOpen, IndianRupee } from "lucide-react";

export default function RenewMembershipPage() {
  const [plans, setPlans] = useState([]);
  const [member, setMember] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const plansRes = await api.get("/membership-plans");
        setPlans(plansRes.data || []);
      } catch (err) {
        console.error("Failed to load plans", err);
      }
      try {
        const m = await memberService.getProfileByLoggedInUser();
        setMember(m);
        setSelectedPlan(String(m?.membershipPlan?.id ?? m?.planId ?? ""));
      } catch (err) {
        console.error("Failed to load member profile", err);
      }
    };
    load();
  }, []);

  const handleConfirm = async () => {
    if (!selectedPlan) return alert("Please select a plan");
    try {
      const memberId = member.id;
      await memberService.renewMembership(memberId, parseInt(selectedPlan, 10));
      alert("Membership updated");
      navigate("/member");
    } catch (err) {
      console.error("Renew failed", err);
      alert("Renew failed");
    }
  };

  const bg =
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop";

  const getPlan = (id) => plans.find((p) => String(p.id) === String(id));

  return (
    <div
      className="min-h-screen flex items-center justify-center relative p-4 sm:p-6 lg:p-8"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_center,rgba(255,255,255,0.14),transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.10)_100%)] backdrop-blur-[1.5px]" />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
          <span className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-brown-900 shadow">
            <BadgeCheck className="w-5 h-5" />
          </span>
          <h2 className="text-lg sm:text-xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Renew / Upgrade Membership
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_100%)] backdrop-blur-xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          {member ? (
            <div className="mb-5 grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-4 text-cream-50">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">Current Plan:</span>
                <span className="font-semibold">
                  {member.planType ?? member.membershipPlan?.type ?? "No Plan"}
                </span>
              </div>
              <div className="text-sm text-cream-50/80 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-300" />
                <span>
                  Valid: {member.startDate ?? "—"} → {member.endDate ?? "—"}
                </span>
              </div>
              <div className="text-sm text-cream-50/80 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>
                  Borrow Limit:{" "}
                  {member.borrowingLimit ??
                    member.membershipPlan?.borrowingLimit ??
                    0}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-5 text-cream-50/90">Loading your profile...</div>
          )}

          <label className="block mb-2 text-cream-50/90">Choose plan</label>
          <div className="relative">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/15 bg-white/15 px-3 py-2 pr-10 text-cream-50 outline-none backdrop-blur-md placeholder:text-cream-50/60 focus:ring-2 focus:ring-amber-300/40"
            >
              <option value="">-- select plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {(p.type || p.name || p.plan_name) ?? "Plan"} — limit:{" "}
                  {p.borrowingLimit ?? p.borrow_limit ?? 0} —{" "}
                  {p.durationMonths ?? p.duration_months ?? p.duration} months
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream-50/70">
              ▾
            </span>
          </div>

          {selectedPlan && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-cream-50/85 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-300" />
                <span>
                  Amount:{" "}
                  <span className="text-cream-50 font-semibold">
                    ₹
                    {getPlan(selectedPlan)?.amount ??
                      getPlan(selectedPlan)?.price ??
                      getPlan(selectedPlan)?.fees ??
                      "—"}
                  </span>
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-cream-50/85 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-300" />
                <span>
                  Duration:{" "}
                  <span className="text-cream-50 font-semibold">
                    {getPlan(selectedPlan)?.durationMonths ??
                      getPlan(selectedPlan)?.duration_months ??
                      getPlan(selectedPlan)?.duration ??
                      "—"}{" "}
                    months
                  </span>
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-cream-50/85 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>
                  Limit:{" "}
                  <span className="text-cream-50 font-semibold">
                    {getPlan(selectedPlan)?.borrowingLimit ??
                      getPlan(selectedPlan)?.borrow_limit ??
                      "—"}{" "}
                    books
                  </span>
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => navigate("/member")}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-cream-50 hover:bg-white/15 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
