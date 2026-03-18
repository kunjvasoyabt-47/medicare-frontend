import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  FlaskConical,
  Loader2,
} from "lucide-react";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";

function FlagBadge({ flag }) {
  if (flag === "H")
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[11px]"
        style={{ fontWeight: 600 }}
      >
        ↑ High
      </span>
    );
  if (flag === "L")
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px]"
        style={{ fontWeight: 600 }}
      >
        ↓ Low
      </span>
    );
  if (flag === "**")
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[11px]"
        style={{ fontWeight: 600 }}
      >
        ⚠ Critical
      </span>
    );
  return null;
}

function ReportBlock({ report, index }) {
  const [open, setOpen] = useState(false);

  const shouldHide = (result) => {
    if (!result || result.trim() === "") return true;
    const val = result.trim().toLowerCase();
    return [
      "non-reactive",
      "non reactive",
      "nonreactive",
      "non_reactive",
    ].includes(val);
  };

  const tests = (report.tests || []).filter((t) => !shouldHide(t.result));
  const flagged = tests.filter(
    (t) => t.flag === "H" || t.flag === "L" || t.flag === "**",
  );
  const hasFlagged = flagged.length > 0;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
          <span
            className="text-slate-500 text-[11px]"
            style={{ fontWeight: 600 }}
          >
            {index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-slate-800 text-[13px] truncate"
            style={{ fontWeight: 500 }}
          >
            {report.report_name || "Unnamed Report"}
          </p>
          {report.report_date && (
            <p
              className="text-slate-400 text-[11px]"
              style={{ fontWeight: 400 }}
            >
              {new Date(report.report_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasFlagged ? (
            <span
              className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[11px]"
              style={{ fontWeight: 600 }}
            >
              {flagged.length} flagged
            </span>
          ) : (
            <span
              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[11px]"
              style={{ fontWeight: 600 }}
            >
              Normal
            </span>
          )}
          {open ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {tests.length === 0 ? (
            <p
              className="text-slate-400 text-[12px] text-center py-5"
              style={{ fontWeight: 400 }}
            >
              No numeric results to display
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th
                    className="text-left px-4 py-2 text-slate-500 text-[10px] uppercase tracking-widest"
                    style={{ fontWeight: 600 }}
                  >
                    Test
                  </th>
                  <th
                    className="text-right px-4 py-2 text-slate-500 text-[10px] uppercase tracking-widest"
                    style={{ fontWeight: 600 }}
                  >
                    Result
                  </th>
                  <th
                    className="text-center px-4 py-2 text-slate-500 text-[10px] uppercase tracking-widest hidden sm:table-cell"
                    style={{ fontWeight: 600 }}
                  >
                    Units
                  </th>
                  <th
                    className="text-right px-4 py-2 text-slate-500 text-[10px] uppercase tracking-widest"
                    style={{ fontWeight: 600 }}
                  >
                    Flag
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tests.map((test, i) => {
                  const isFlagged =
                    test.flag === "H" ||
                    test.flag === "L" ||
                    test.flag === "**";
                  return (
                    <tr
                      key={i}
                      className={isFlagged ? "bg-red-50/30" : "bg-white"}
                    >
                      <td
                        className="px-4 py-2.5 text-slate-700 text-[12px]"
                        style={{ fontWeight: isFlagged ? 500 : 400 }}
                      >
                        {test.test_name || "—"}
                      </td>
                      <td
                        className="px-4 py-2.5 text-right text-[12px] tabular-nums"
                        style={{
                          fontWeight: isFlagged ? 600 : 400,
                          color:
                            test.flag === "H"
                              ? "#dc2626"
                              : test.flag === "L"
                                ? "#2563eb"
                                : test.flag === "**"
                                  ? "#d97706"
                                  : "#374151",
                        }}
                      >
                        {test.result || "—"}
                      </td>
                      <td
                        className="px-4 py-2.5 text-center text-slate-500 text-[12px] hidden sm:table-cell"
                        style={{ fontWeight: 400 }}
                      >
                        {test.units || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <FlagBadge flag={test.flag} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportSummaryAccordion({ dischargeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(API_ROUTES.patient.dischargeReportSummary(dischargeId))
      .then((r) => setReports(r.data.reports || []))
      .catch(() => setError("Unable to load report summary"))
      .finally(() => setLoading(false));
  }, [dischargeId]);

  const flaggedCount = reports.reduce((total, report) => {
    return (
      total +
      (report.tests?.filter(
        (t) => t.flag === "H" || t.flag === "L" || t.flag === "**",
      ).length || 0)
    );
  }, 0);

  if (loading) {
    return (
      <div
        className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-3"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <Loader2 size={15} className="animate-spin text-slate-400 shrink-0" />
        <span
          className="text-slate-500 text-[13px]"
          style={{ fontWeight: 400 }}
        >
          Loading report summary…
        </span>
      </div>
    );
  }

  if (error || !reports || reports.length === 0) {
    return (
      <div
        className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-2.5"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <AlertCircle size={14} className="text-slate-400 shrink-0" />
        <span
          className="text-slate-400 text-[13px]"
          style={{ fontWeight: 400 }}
        >
          {error || "No report summary available"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
          <FlaskConical size={15} className="text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 text-[13px]" style={{ fontWeight: 600 }}>
            Test Results Summary
          </p>
          <p
            className="text-slate-400 text-[11px] mt-0.5"
            style={{ fontWeight: 400 }}
          >
            {reports.length} report{reports.length !== 1 ? "s" : ""} across this
            discharge
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] ${
              flaggedCount > 0
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
            style={{ fontWeight: 600 }}
          >
            {flaggedCount > 0 ? `${flaggedCount} abnormal` : "All normal"}
          </span>
          {isOpen ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          {/* Legend */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Info size={12} className="text-slate-400 shrink-0" />
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-red-600 text-[11px]"
                style={{ fontWeight: 500 }}
              >
                ↑ Above range
              </span>
              <span className="text-slate-300 text-[10px]">|</span>
              <span
                className="text-blue-600 text-[11px]"
                style={{ fontWeight: 500 }}
              >
                ↓ Below range
              </span>
              <span className="text-slate-300 text-[10px]">|</span>
              <span
                className="text-amber-600 text-[11px]"
                style={{ fontWeight: 500 }}
              >
                ⚠ Critical
              </span>
            </div>
          </div>

          {/* Per-report blocks */}
          <div className="space-y-2">
            {reports.map((report, idx) => (
              <ReportBlock key={idx} report={report} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
