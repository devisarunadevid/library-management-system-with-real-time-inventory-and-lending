import { useEffect, useState } from "react";
import planService from "../services/planService";
import PlanModal from "../components/PlanModal";
import {
  Layers,
  CalendarClock,
  BookOpen,
  IndianRupee,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const loadPlans = async () => {
    try {
      const res = await planService.getPlans();
      setPlans(res || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handlePlanSave = async (plan) => {
    try {
      if (plan.id) await planService.updatePlan(plan.id, plan);
      else await planService.addPlan(plan);
      setShowPlanModal(false);
      loadPlans();
    } catch (err) {
      console.error("Failed to save plan:", err);
      alert("Error saving plan. Check console.");
    }
  };

  const handlePlanDelete = async (id) => {
    if (window.confirm("Delete this plan?")) {
      try {
        await planService.deletePlan(id);
        loadPlans();
      } catch (err) {
        console.error("Failed to delete plan:", err);
        alert("Error deleting plan.");
      }
    }
  };

  const formatAmount = (val) => {
    if (val == null) return "0.00";
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Fixed background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('/bibliolibrary.jpg')`,
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      <div className="relative h-screen overflow-y-auto">
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-white/40 px-4 py-2 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-brown-900 ring-1 ring-white/30">
              <Layers className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                Membership Plans
              </h2>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                <ShieldCheck className="w-3.5 h-3.5" /> {plans.length}
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedPlan(null);
                setShowPlanModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-4 py-2 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Plan
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const name = plan.name || plan.type || "—";
              const amount = plan.amount ?? plan.price ?? plan.fees ?? 0;

              // Correct Duration in DAYS
              const durationDays =
                plan.durationDays ??
                plan.duration_days ??
                (plan.durationMonths ? plan.durationMonths * 30 : 0);

              const limit =
                plan.borrowingLimit ?? plan.limit ?? plan.maxBooks ?? "—";

              return (
                <div
                  key={plan.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl p-5 text-brown-900 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
                >
                  <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-gradient-to-br from-amber-300/50 to-orange-400/50 blur-3xl group-hover:scale-110 transition-transform" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold truncate">{name}</h3>
                      <div className="mt-2 grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-amber-600" />
                          <span>
                            Amount:{" "}
                            <span className="font-semibold">
                              ₹{formatAmount(amount)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-amber-600" />
                          <span>
                            Duration:{" "}
                            <span className="font-semibold">
                              {durationDays} days
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-amber-600" />
                          <span>
                            Borrowing Limit:{" "}
                            <span className="font-semibold">{limit} books</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Edit/Delete Buttons */}
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowPlanModal(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 transition-all"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handlePlanDelete(plan.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-300/60 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1.5 text-sm font-semibold shadow hover:brightness-105 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>

                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/40 group-hover:ring-white/60 transition" />
                </div>
              );
            })}

            {plans.length === 0 && (
              <div className="col-span-full rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl p-6 text-brown-900">
                No plans yet.
              </div>
            )}
          </div>

          {/* Plan Modal */}
          {showPlanModal && (
            <PlanModal
              show={showPlanModal}
              initialData={selectedPlan}
              title={selectedPlan ? "Edit Plan" : "Add Plan"}
              onSave={handlePlanSave}
              onClose={() => setShowPlanModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
