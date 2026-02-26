import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Pencil,
  Trash2,
  BookOpen,
  AlertCircle,
  Sparkles,
  Star,
  Loader2,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  loading = false,
  searchable = true,
  sortable = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [focusedRow, setFocusedRow] = useState(-1);
  const [focusedAction, setFocusedAction] = useState(-1);
  const tableRef = useRef(null);
  const actionMenuRef = useRef(null);

  const autoCols = useMemo(() => {
    if (columns.length) return columns;
    if (!data?.length) return [];
    const keys = Object.keys(
      data.reduce((a, r) => Object.assign(a, r || {}), {})
    );
    const hidden = new Set(["password", "createdAt", "updatedAt"]);
    return keys
      .filter((k) => !hidden.has(k))
      .map((k) => ({
        key: k,
        label: k
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (c) => c.toUpperCase()),
      }));
  }, [columns, data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    if (searchTerm && searchable) {
      filtered = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, searchable, sortable]);

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedRow((prev) =>
          Math.min(prev + 1, filteredAndSortedData.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedRow((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (focusedRow >= 0 && onEdit) {
          onEdit(filteredAndSortedData[focusedRow]);
        }
        break;
      case "Delete":
        if (focusedRow >= 0 && onDelete) {
          const row = filteredAndSortedData[focusedRow];
          if (row?.id != null) {
            onDelete(row.id);
          }
        }
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (focusedRow >= 0) {
      const rowElement = tableRef.current?.querySelector(
        `tr[data-row-index="${focusedRow}"]`
      );
      rowElement?.focus();
    }
  }, [focusedRow]);

  if (loading) {
    return (
      <div className="relative rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-white/85">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Background image + overlay for bright, clear look */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bibliolibrary.jpg')",
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-[rgba(15,10,3,0.4)] backdrop-blur-[2px]" />

      {/* Header with search and controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-3 border-b border-amber-200/40 bg-white/20">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white ring-1 ring-white/40 shadow"
            role="img"
            aria-label="Data table"
          >
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </span>
          <h3 className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            Records ({filteredAndSortedData.length})
          </h3>
        </div>

        {searchable && (
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg bg-white/20 border border-amber-200/40 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400/60 w-full sm:w-64"
              aria-label="Search table data"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto" onKeyDown={handleKeyDown} tabIndex={0}>
        <table
          ref={tableRef}
          className="min-w-full text-sm"
          role="table"
          aria-label="Data table with sortable columns"
        >
          <thead>
            <tr className="bg-white/20 text-white/95 border-b border-amber-200/40">
              {autoCols.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${
                    sortable
                      ? "cursor-pointer hover:bg-white/30 transition-colors"
                      : ""
                  }`}
                  onClick={() => handleSort(c.key)}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === c.key ? sortConfig.direction : "none"
                  }
                  tabIndex={sortable ? 0 : -1}
                >
                  <div className="flex items-center gap-2">
                    <span>{c.label}</span>
                    {sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortConfig.key === c.key &&
                            sortConfig.direction === "asc"
                              ? "text-amber-400"
                              : "text-white/40"
                          }`}
                          aria-hidden="true"
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig.key === c.key &&
                            sortConfig.direction === "desc"
                              ? "text-amber-400"
                              : "text-white/40"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold">
                <div className="flex items-center justify-end gap-2">
                  <Sparkles
                    className="w-4 h-4 text-amber-300"
                    aria-hidden="true"
                  />
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-white/95">
            {filteredAndSortedData?.length === 0 && (
              <tr>
                <td
                  colSpan={autoCols.length + 1}
                  className="px-4 py-10 text-center text-white/85"
                >
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle
                      className="w-6 h-6 text-amber-400"
                      aria-hidden="true"
                    />
                    {searchTerm
                      ? "No records match your search"
                      : "No records found"}
                  </div>
                </td>
              </tr>
            )}

            {filteredAndSortedData?.map((row, i) => (
              <tr
                key={row?.id ?? i}
                data-row-index={i}
                className={`border-b border-white/10 hover:bg-white/15 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                  focusedRow === i ? "bg-white/20" : ""
                }`}
                tabIndex={0}
                role="row"
                aria-label={`Row ${i + 1} of ${filteredAndSortedData.length}`}
                onFocus={() => setFocusedRow(i)}
                onMouseEnter={() => setFocusedRow(i)}
              >
                {autoCols.map((c) => (
                  <td
                    key={c.key}
                    className="px-4 py-3 whitespace-nowrap max-w-xs truncate"
                    role="cell"
                  >
                    {"render" in c && c.render
                      ? c.render(row)
                      : typeof row?.[c.key] === "object"
                      ? JSON.stringify(row[c.key])
                      : String(row?.[c.key] ?? "")}
                  </td>
                ))}

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => onEdit?.(row)}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white px-3 py-1.5 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                      aria-label={`Edit ${row?.id || "record"}`}
                    >
                      <Pencil
                        className="w-4 h-4 text-white"
                        aria-hidden="true"
                      />
                      <span className="sr-only sm:not-sr-only">Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => row?.id != null && onDelete?.(row.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-300/30 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1.5 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(244,63,94,0.35)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(244,63,94,0.5)] active:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400/60"
                      aria-label={`Delete ${row?.id || "record"}`}
                    >
                      <Trash2
                        className="w-4 h-4 text-white"
                        aria-hidden="true"
                      />
                      <span className="sr-only sm:not-sr-only">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table summary for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {filteredAndSortedData.length} records displayed
        {searchTerm && ` matching "${searchTerm}"`}
        {sortConfig.key &&
          ` sorted by ${sortConfig.key} ${sortConfig.direction}`}
      </div>
    </div>
  );
}
