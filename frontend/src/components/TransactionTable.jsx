import { useEffect, useState, useMemo } from "react";
import { transactionService } from "../services/transactionService";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  IndianRupee,
  Sparkles,
  Star,
  Crown,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function TransactionTable({ memberId, role }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (memberId)
      transactionService.getByMember(memberId).then(setTransactions);
    else transactionService.getAll().then(setTransactions);
  }, [memberId]);

  const fmt = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
  };

  const totalFine = useMemo(
    () => transactions.reduce((a, t) => a + (Number(t.fine) || 0), 0),
    [transactions]
  );

  return (
    <div className="relative p-4 sm:p-6 lg:p-8">
      {/* Background image with fixed attachment for clear scrolling */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bibliolibrary.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-[rgba(15,10,3,0.45)] backdrop-blur-[2px]" />

      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-200/40 bg-white/20 px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] ring-1 ring-white/30">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white ring-1 ring-white/40 shadow">
            <Receipt className="w-5 h-5" />
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            Transactions
          </h2>
          <span className="ml-2 rounded-full border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-100 shadow ring-1 ring-white/20">
            {transactions.length}
          </span>
          <span className="ml-1.5 flex items-center gap-1 text-amber-300">
            <Crown className="w-4 h-4" />
            <Star className="w-4 h-4" />
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        <div className="rounded-xl border border-amber-200/40 bg-white/20 px-3 py-1.5 text-xs text-cream-50/90 backdrop-blur-md ring-1 ring-white/20">
          Total Fines:{" "}
          <span className="inline-flex items-center gap-1 font-semibold text-cream-50">
            <IndianRupee className="w-3.5 h-3.5 text-amber-300" />
            {totalFine}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-amber-200/40 bg-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] ring-1 ring-white/20">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-cream-50/90">
              <th className="px-4 py-3 text-left rounded-l-xl bg-white/20 border border-amber-200/40">
                Book
              </th>
              <th className="px-4 py-3 text-left bg-white/20 border border-amber-200/40">
                Issue Date
              </th>
              <th className="px-4 py-3 text-left bg-white/20 border border-amber-200/40">
                Due Date
              </th>
              <th className="px-4 py-3 text-left bg-white/20 border border-amber-200/40">
                Return Date
              </th>
              <th className="px-4 py-3 text-left bg-white/20 border border-amber-200/40">
                Fine
              </th>
              {role !== "MEMBER" && (
                <th className="px-4 py-3 text-right rounded-r-xl bg-white/20 border border-amber-200/40">
                  <span className="inline-flex items-center justify-end gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Actions
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={role !== "MEMBER" ? 6 : 5}
                  className="px-4 py-10 text-center text-cream-100/85"
                >
                  <div className="inline-flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-300" />
                    No records found
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="text-cream-50/95">
                  <td className="px-4 py-3 rounded-l-xl bg-white/10 border border-white/10">
                    {t.bookTitle}
                  </td>
                  <td className="px-4 py-3 bg-white/10 border border-white/10">
                    {fmt(t.issueDate)}
                  </td>
                  <td className="px-4 py-3 bg-white/10 border border-white/10">
                    {fmt(t.dueDate)}
                  </td>
                  <td className="px-4 py-3 bg-white/10 border border-white/10">
                    {t.returnDate ? (
                      fmt(t.returnDate)
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-100">
                        <Clock className="w-3.5 h-3.5" />
                        Not Returned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 bg-white/10 border border-white/10">
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-xl border px-2 py-0.5 text-xs",
                        Number(t.fine) > 0
                          ? "border-rose-300/30 bg-rose-500/15 text-rose-200"
                          : "border-emerald-300/30 bg-emerald-500/15 text-emerald-200",
                      ].join(" ")}
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      {t.fine}
                    </span>
                  </td>

                  {role !== "MEMBER" && (
                    <td className="px-4 py-3 rounded-r-xl bg-white/10 border border-white/10">
                      {!t.returnDate ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/30 bg-emerald-600 text-white hover:brightness-110 shadow-[0_6px_16px_rgba(16,185,129,0.35)]"
                            onClick={() =>
                              transactionService
                                .returnBook(t.id)
                                .then(() =>
                                  setTransactions((prev) =>
                                    prev.map((x) =>
                                      x.id === t.id
                                        ? {
                                            ...x,
                                            returnDate:
                                              new Date().toISOString(),
                                          }
                                        : x
                                    )
                                  )
                                )
                            }
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Return
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
                            onClick={() =>
                              transactionService
                                .renewBook(t.id)
                                .then(() => alert("Book renewed successfully"))
                            }
                          >
                            <RefreshCw className="w-4 h-4" />
                            Renew
                          </Button>
                        </div>
                      ) : (
                        <div className="text-right text-cream-50/70 text-xs">
                          Completed
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
