import React from "react";
import { ChevronDown, CalendarDays } from "lucide-react";

/**
 * FilterBar — renders a row of filter controls.
 * Consecutive date-type filters are automatically grouped
 * side-by-side on one line with a "–" separator.
 */
export default function FilterBar({
  filters = [],
  onFilterChange,
  className = "",
}) {
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

  const labelCls = "block text-slate-400 mb-1 leading-none whitespace-nowrap";
  const labelStyle = {
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const inputCls =
    "bg-white border border-slate-200 rounded-lg text-slate-700 outline-none " +
    "hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 " +
    "transition-all cursor-pointer";
  const inputStyle = {
    fontSize: "12px",
    fontWeight: 500,
    fontFamily: "'Inter', system-ui, sans-serif",
    height: "34px",
  };

  return (
    <div
      className={`flex flex-wrap items-end gap-2 ${className}`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {groups.map((group) => {
        if (group.type === "date-pair") {
          const { from, to } = group;
          return (
            <div key={`${from.key}-${to.key}`} className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <label style={labelStyle} className={labelCls}>
                  {from.label}
                </label>
                <span
                  className="text-slate-300 text-[10px]"
                  style={{ fontWeight: 500 }}
                >
                  —
                </span>
                <label style={labelStyle} className={labelCls}>
                  {to.label}
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <CalendarDays
                    size={12}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={from.value || ""}
                    onChange={(e) => onFilterChange(from.key, e.target.value)}
                    className={inputCls + " pl-7 pr-2 w-[8.5rem]"}
                    style={inputStyle}
                    aria-label={from.label}
                  />
                </div>
                <span
                  className="text-slate-300 text-[12px]"
                  style={{ fontWeight: 500 }}
                >
                  →
                </span>
                <div className="relative">
                  <CalendarDays
                    size={12}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={to.value || ""}
                    onChange={(e) => onFilterChange(to.key, e.target.value)}
                    className={inputCls + " pl-7 pr-2 w-[8.5rem]"}
                    style={inputStyle}
                    aria-label={to.label}
                  />
                </div>
              </div>
            </div>
          );
        }

        const { filter } = group;

        if (filter.type === "select") {
          return (
            <div key={filter.key} className="flex flex-col">
              <label style={labelStyle} className={labelCls}>
                {filter.label}
              </label>
              <div className="relative">
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className={
                    inputCls + " appearance-none pl-3 pr-8 min-w-[130px]"
                  }
                  style={inputStyle}
                  aria-label={filter.label}
                >
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        }

        if (filter.type === "date") {
          return (
            <div key={filter.key} className="flex flex-col">
              <label style={labelStyle} className={labelCls}>
                {filter.label}
              </label>
              <div className="relative">
                <CalendarDays
                  size={12}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="date"
                  value={filter.value || ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className={inputCls + " pl-7 pr-2 w-[9rem]"}
                  style={inputStyle}
                  aria-label={filter.label}
                />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
