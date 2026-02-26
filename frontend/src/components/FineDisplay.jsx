import React from "react";

const FineDisplay = ({ fineAmount, plan }) => {
  // Optional label for plan-based adjustment
  const adjustmentLabel = plan
    ? plan.type === "PREMIUM"
      ? "50% discount applied"
      : plan.type === "BASIC"
      ? "20% extra applied"
      : null
    : null;

  return (
    <div
      style={{
        border: "1px solid #E74C3C",
        borderRadius: "10px",
        padding: "15px",
        backgroundColor: "#FDEDEC",
        color: "#C0392B",
        fontWeight: "bold",
        textAlign: "center",
        minWidth: "140px",
      }}
      title={adjustmentLabel || ""}
    >
      <p>💰 Fine Due</p>
      <h3>₹ {fineAmount.toFixed(2)}</h3>
      {adjustmentLabel && <small>({adjustmentLabel})</small>}
    </div>
  );
};

export default FineDisplay;
