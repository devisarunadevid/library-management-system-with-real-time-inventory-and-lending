import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  User,
  BookOpen,
  Layers,
  Wand2,
  Sparkles,
} from "lucide-react";

export default function AddEditModal({
  title = "Edit",
  fields = [],
  item = null,
  onSave,
  onClose,
}) {
  const initial = useMemo(() => {
    const base = {};
    fields.forEach((f) => {
      base[f.key] = item?.[f.key] ?? "";
    });
    return base;
  }, [fields, item]);

  const [values, setValues] = useState(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const change = (key, val) => setValues((s) => ({ ...s, [key]: val }));

  const submit = (e) => {
    e.preventDefault();
    onSave?.(values);
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Darkened blurred background */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-amber-200/20 bg-white/10 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 ring-1 ring-amber-200/50">
                <BookOpen className="w-5 h-5 text-amber-900" />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                {title}
              </span>
            </h3>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 p-2 rounded-xl border border-rose-300/40 bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(244,63,94,0.35)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_32px_rgba(244,63,94,0.5)] active:translate-y-0 transition-all"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="p-5 space-y-5">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm font-medium text-white/90 flex items-center gap-2">
                  {/* Icon mapping for fields */}
                  {f.key.toLowerCase().includes("user") && (
                    <User className="w-4 h-4 text-amber-300" />
                  )}
                  {f.key.toLowerCase().includes("plan") && (
                    <Layers className="w-4 h-4 text-orange-300" />
                  )}
                  {f.type === "date" && (
                    <Calendar className="w-4 h-4 text-emerald-300" />
                  )}
                  {f.label}
                  {f.required ? " *" : ""}
                </label>

                {f.type === "select" ? (
                  <select
                    required={!!f.required}
                    value={values[f.key]}
                    onChange={(e) => change(f.key, e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400/60 transition"
                  >
                    <option value="" disabled>
                      Select {f.label}
                    </option>
                    {(f.options || []).map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-stone-900 text-white"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    required={!!f.required}
                    value={values[f.key]}
                    onChange={(e) => change(f.key, e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-400/60 transition"
                  />
                ) : (
                  <input
                    type="text"
                    required={!!f.required}
                    value={values[f.key]}
                    onChange={(e) => change(f.key, e.target.value)}
                    placeholder={f.placeholder || ""}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-amber-400/60 transition"
                  />
                )}
              </div>
            ))}

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300/40 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(244,63,94,0.35)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_32px_rgba(244,63,94,0.5)] active:translate-y-0 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(245,158,11,0.35)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all"
              >
                <Wand2 className="w-4 h-4" />
                <span>Save</span>
                <Sparkles className="w-4 h-4 opacity-90" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
