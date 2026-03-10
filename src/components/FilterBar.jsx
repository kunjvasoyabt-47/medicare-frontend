import React from "react";

/**
 * FilterBar — renders a row of filter controls.
 *
 * filters: Array<{
 *   key: string,
 *   label: string,
 *   type: "select" | "date",
 *   value: any,
 *   options?: Array<{ value: string, label: string }>   // for "select"
 * }>
 */
export default function FilterBar({
  filters = [],
  onFilterChange,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((filter) => (
        <div key={filter.key}>
          {filter.type === "select" ? (
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all cursor-pointer hover:border-slate-300"
              aria-label={filter.label}
            >
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : filter.type === "date" ? (
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">
                {filter.label}
              </label>
              <input
                type="date"
                value={filter.value || ""}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"
                aria-label={filter.label}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
