import React from "react";
import { Activity } from "lucide-react";

export default function SystemLoader({
  label = "Loading...",
  sublabel,
  fullScreen = false,
  compact = false,
  className = "",
}) {
  const containerClass = fullScreen
    ? "min-h-screen bg-slate-50"
    : compact
      ? "py-4"
      : "min-h-[16rem]";

  const ringSizeClass = compact ? "h-10 w-10" : "h-14 w-14";
  const iconSize = compact ? 16 : 20;
  const titleClass = compact
    ? "text-[13px] font-semibold text-slate-500"
    : "text-[13px] font-bold uppercase tracking-widest text-slate-500";

  return (
    <div className={`flex items-center justify-center ${containerClass} ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div
            className={`${ringSizeClass} animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-500`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity size={iconSize} className="text-slate-500 animate-pulse" />
          </div>
        </div>
        <p className={titleClass}>{label}</p>
        {sublabel ? (
          <p className="max-w-xs text-center text-[12px] font-medium text-slate-400">
            {sublabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
