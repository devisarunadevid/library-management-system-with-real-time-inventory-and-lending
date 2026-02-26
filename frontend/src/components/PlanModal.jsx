import { useState, useEffect } from "react";
import {
  X,
  Crown,
  Sparkles,
  Star,
  BookOpen,
  BadgeDollarSign,
  Calendar,
  Hash,
  Coins,
  Timer,
  Ban,
  Save,
} from "lucide-react";

export default function PlanModal({
  show,
  onClose,
  onSave,
  initialData,
  title,
}) {
  const [formData, setFormData] = useState({
    type: "",
    fees: "",
    durationMonths: "",
    borrowingLimit: "",
    finePerDay: "",
    durationDays: "",
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (
      !formData.fees ||
      !formData.durationMonths ||
      !formData.borrowingLimit ||
      !formData.finePerDay ||
      !formData.durationDays
    ) {
      alert("Please fill all required fields");
      return;
    }

    onSave({
      ...formData,
      fees: parseFloat(formData.fees),
      durationMonths: parseInt(formData.durationMonths, 10),
      borrowingLimit: parseInt(formData.borrowingLimit, 10),
      finePerDay: parseFloat(formData.finePerDay),
      durationDays: parseInt(formData.durationDays, 10),
    });

    setFormData({
      type: "",
      fees: "",
      durationMonths: "",
      borrowingLimit: "",
      finePerDay: "",
      durationDays: "",
    });
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/libraryimg.jpeg')",
          backgroundAttachment: "fixed",
        }}
        onClick={onClose}
      />
      <div
        className="absolute inset-0 bg-[rgba(20,14,5,0.35)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl rounded-3xl border border-amber-200/50 bg-white/85 text-stone-900 shadow-2xl backdrop-blur-xl ring-1 ring-white/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-amber-200/50 bg-white/70 rounded-t-3xl">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white ring-1 ring-white/40 shadow">
                <Crown className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  {title}
                </h2>
                <div className="text-[11px] text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Configure membership plan details
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <Star className="w-5 h-5" />
              <Sparkles className="w-5 h-5" />
            </div>
            <button
              onClick={onClose}
              className="ml-3 p-2 rounded-xl hover:bg-amber-100/40 border border-amber-200/60 transition text-amber-700"
              aria-label="Close"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-sm text-stone-800 font-medium inline-flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-amber-600" />
                  Plan Name
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                    <BookOpen className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="Enter plan name"
                    className="border border-amber-200/60 bg-white/70 w-full pl-10 pr-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm text-stone-800 font-medium inline-flex items-center gap-2">
                  <BadgeDollarSign className="w-4.5 h-4.5 text-amber-600" />
                  Fees
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                    <BadgeDollarSign className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="number"
                    name="fees"
                    value={formData.fees}
                    onChange={handleChange}
                    className="border border-amber-200/60 bg-white/70 w-full pl-10 pr-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm text-stone-800 font-medium inline-flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-amber-600" />
                  Duration (Months)
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                    <Calendar className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="number"
                    name="durationMonths"
                    value={formData.durationMonths}
                    onChange={handleChange}
                    className="border border-amber-200/60 bg-white/70 w-full pl-10 pr-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm text-stone-800 font-medium inline-flex items-center gap-2">
                  <Hash className="w-4.5 h-4.5 text-amber-600" />
                  Borrowing Limit
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                    <Hash className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="number"
                    name="borrowingLimit"
                    value={formData.borrowingLimit}
                    onChange={handleChange}
                    className="border border-amber-200/60 bg-white/70 w-full pl-10 pr-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm text-stone-800 font-medium inline-flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-amber-600" />
                  Fine Per Day
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                    <Coins className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="number"
                    name="finePerDay"
                    value={formData.finePerDay}
                    onChange={handleChange}
                    className="border border-amber-200/60 bg-white/70 w-full pl-10 pr-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm text-stone-800 font-medium inline-flex items-center gap-2">
                  <Timer className="w-4.5 h-4.5 text-amber-600" />
                  Duration (Days)
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                    <Timer className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    className="border border-amber-200/60 bg-white/70 w-full pl-10 pr-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                  />
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300/60 text-amber-800 hover:bg-amber-100/50 transition ring-1 ring-white/40"
              >
                <Ban className="w-4.5 h-4.5" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white font-semibold shadow hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all ring-1 ring-white/40"
              >
                <Save className="w-4.5 h-4.5" />
                Save
                <Sparkles className="w-4 h-4 text-white/95" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
