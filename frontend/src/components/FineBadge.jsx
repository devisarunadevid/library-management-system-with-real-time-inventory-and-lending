// src/components/FineBadge.jsx
import React from "react";

export default function FineBadge({ fine = 0 }) {
  if (!fine || fine <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
        No fine
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-800">
      ₹{Number(fine).toFixed(0)}
    </span>
  );
}
