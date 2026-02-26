// src/pages/TransactionsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import transactionService from "../services/transactionService";
import { Check, X, Clock, RefreshCw, Mail } from "lucide-react";
import Table from "../components/Table";
import AddEditModal from "../components/AddEditModal";
import FineBadge from "../components/FineBadge";
import api from "../services/api";

export default function TransactionsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const items = await transactionService.getPending();
      setPending(items || []);
    } catch (err) {
      console.error("Failed to load pending", err);
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApproveClick = (row) => {
    setSelected(row);
    setShowApproveModal(true);
  };

  const doApprove = async ({ durationDays }) => {
    try {
      await transactionService.approve(selected.id, Number(durationDays || 14));
      setShowApproveModal(false);
      setSelected(null);
      loadPending();
      alert("Request approved & issued.");
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  const doReject = async (row) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await transactionService.reject(row.id, reason);
      alert("Rejected");
      loadPending();
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    }
  };

  const doReturn = async (row) => {
    if (!confirm("Mark this as returned?")) return;
    try {
      await transactionService.returnBook(row.id);
      alert("Returned");
      loadPending();
    } catch (err) {
      console.error(err);
      alert("Return failed");
    }
  };

  const doRenew = async (row) => {
    const days = prompt("Extend by how many days?", "7");
    if (!days) return;
    try {
      await transactionService.renew(row.id, Number(days));
      alert("Renewed");
      loadPending();
    } catch (err) {
      console.error(err);
      alert("Renew failed");
    }
  };

  const sendReminder = async (row) => {
    try {
      // attempt server-side notification endpoint
      await api.post("/notifications/send", {
        to: row.user.email,
        subject: "Library: Borrow Reminder",
        body: `Hi ${row.user.name}, your borrow for "${row.book.title}" is due ${row.dueDate}.`,
      });
      alert("Reminder triggered (server must implement endpoint)");
    } catch (err) {
      console.warn("Notification failed", err);
      alert(
        "Notification failed (server may not support notifications endpoint)"
      );
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "user",
      label: "Member",
      render: (r) => (r.user ? r.user.name || r.user.email : "—"),
    },
    {
      key: "book",
      label: "Book",
      render: (r) => r.book?.title || r.book?.name || "—",
    },
    { key: "issueDate", label: "Issue Date" },
    { key: "dueDate", label: "Due Date" },
    {
      key: "fineAmount",
      label: "Fine",
      render: (r) => <FineBadge fine={r.fineAmount} />,
    },
    { key: "status", label: "Status" },
  ];

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url('/libraryimg.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Transactions — Issue / Return / Renew
          </h2>
          <div className="flex gap-2">
            <button
              onClick={loadPending}
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table
              columns={columns}
              data={pending}
              onEdit={(row) => handleApproveClick(row)}
              onDelete={(id) => {
                // quick delete = return? show confirm
                const r = pending.find((p) => p.id === id);
                if (!r) return;
                doReturn(r);
              }}
              // We'll add action buttons inline below table rows by customizing render via columns,
            />
          )}

          {/* quick action list under the table for selected row */}
          <div className="mt-4">
            {pending.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 mb-2 bg-white/3"
              >
                <div>
                  <div className="font-semibold">{row.book?.title}</div>
                  <div className="text-sm text-white/80">
                    {row.user?.name} — {row.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveClick(row)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500 text-white"
                  >
                    {" "}
                    <Check /> Issue
                  </button>
                  <button
                    onClick={() => doReject(row)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-500 text-white"
                  >
                    {" "}
                    <X /> Reject
                  </button>
                  <button
                    onClick={() => doRenew(row)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500 text-white"
                  >
                    {" "}
                    <RefreshCw /> Renew
                  </button>
                  <button
                    onClick={() => doReturn(row)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500 text-white"
                  >
                    {" "}
                    <Clock /> Return
                  </button>
                  <button
                    onClick={() => sendReminder(row)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-400 text-white"
                  >
                    {" "}
                    <Mail /> Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approve modal to choose duration */}
        {showApproveModal && selected && (
          <AddEditModal
            title={`Issue "${selected.book?.title}"`}
            fields={[
              {
                key: "durationDays",
                label: "Duration (days)",
                required: true,
                placeholder: "14",
              },
            ]}
            item={{ durationDays: 14 }}
            onSave={doApprove}
            onClose={() => {
              setShowApproveModal(false);
              setSelected(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
