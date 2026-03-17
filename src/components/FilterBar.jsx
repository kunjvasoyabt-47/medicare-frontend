import React from "react";
import { ChevronDown, CalendarDays } from "lucide-react";

/**
 * FilterBar — renders a row of filter controls.
 * Consecutive date-type filters are automatically grouped
 * side-by-side on one line with a "–" separator.
 *
 * filters: Array<{
 *   key: string,
 *   label: string,
 *   type: "select" | "date",
 *   value: any,
 *   options?: Array<{ value: string, label: string }>
 * }>
 */
export default function FilterBar({
  filters = [],
  onFilterChange,
  className = "",
}) {
  // Group consecutive date filters into pairs so they render on one line
  const groups = [];
  let i = 0;
  while (i < filters.length) {
    const cur = filters[i];
    const next = filters[i + 1];
    if (cur.type === "date" && next?.type === "date") {
      groups.push({ type: "date-pair", from: cur, to: next });
      i += 2;
    } else {
      groups.push({ type: "single", filter: cur });
      i += 1;
    }
  }

  return (
    <div className={`flex flex-wrap items-end gap-2 ${className}`}>
      {groups.map((group) => {
        if (group.type === "date-pair") {
          const { from, to } = group;
          return (
            <div key={`${from.key}-${to.key}`} className="flex-1 sm:flex-none">
              {/* Shared label row */}
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none whitespace-nowrap">
                  {from.label}
                </label>
                <span className="text-slate-300 text-[10px] font-black">–</span>
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none whitespace-nowrap">
                  {to.label}
                </label>
              </div>

              {/* Two inputs side-by-side */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <CalendarDays
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={from.value || ""}
                    onChange={(e) => onFilterChange(from.key, e.target.value)}
                    className="w-full sm:w-[9rem] h-11 pl-7 pr-2 bg-white border border-slate-200 rounded-xl text-[12.5px] text-slate-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 hover:border-slate-300 transition-all"
                    aria-label={from.label}
                  />
                </div>

                <span className="text-slate-400 font-bold text-[13px] shrink-0">
                  →
                </span>

                <div className="relative">
                  <CalendarDays
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={to.value || ""}
                    onChange={(e) => onFilterChange(to.key, e.target.value)}
                    className="w-full sm:w-[9rem] h-11 pl-7 pr-2 bg-white border border-slate-200 rounded-xl text-[12.5px] text-slate-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 hover:border-slate-300 transition-all"
                    aria-label={to.label}
                  />
                </div>
              </div>
            </div>
          );
        }

        // Single filter (select or standalone date)
        const { filter } = group;
        return (
          <div key={filter.key} className="flex-1 min-w-[140px] sm:flex-none">
            {filter.type === "select" ? (
              <div>
                <label className="mb-1 block text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">
                  {filter.label}
                </label>
                <div className="relative">
                  <select
                    value={filter.value}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className="w-full sm:min-w-[11rem] appearance-none h-11 pl-3.5 pr-9 bg-white border border-slate-200 rounded-xl text-[13.5px] text-slate-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 hover:border-slate-300 transition-all cursor-pointer"
                    aria-label={filter.label}
                  >
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ) : filter.type === "date" ? (
              <div>
                <label className="mb-1 block text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none whitespace-nowrap">
                  {filter.label}
                </label>
                <div className="relative">
                  <CalendarDays
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={filter.value || ""}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className="w-full sm:min-w-[9.5rem] h-11 pl-7 pr-3 bg-white border border-slate-200 rounded-xl text-[13.5px] text-slate-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 hover:border-slate-300 transition-all"
                    aria-label={filter.label}
                  />
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
