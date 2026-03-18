import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Info } from "lucide-react";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";

function ReportSummaryAccordion({ dischargeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(API_ROUTES.patient.dischargeReportSummary(dischargeId))
      .then((response) => {
        setReports(response.data.reports || []);
      })
      .catch((err) => {
        console.error("Failed to fetch report summary:", err);
        setError("Unable to load report summary");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dischargeId]);

  // Calculate flagged count
  const flaggedCount = reports.reduce((total, report) => {
    const flaggedTests = report.tests?.filter(
      (test) => test.flag === "H" || test.flag === "L" || test.flag === "**"
    ).length || 0;
    return total + flaggedTests;
  }, 0);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-3 text-slate-600 text-[14px] font-semibold">
            Loading summary...
          </span>
        </div>
      </div>
    );
  }

  if (error || !reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-center py-6 text-slate-400">
          <AlertCircle size={16} className="mr-2" />
          <span className="text-[13px] font-semibold">
            {error || "No report summary available"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Collapsed Header Button */}
      <button
        onClick={toggleAccordion}
        className="w-full flex items-center gap-3 p-6 hover:bg-slate-50 transition-all"
      >
        <div className="p-2 rounded-xl bg-indigo-50">
          {isOpen ? (
            <ChevronUp size={18} className="text-indigo-600" />
          ) : (
            <ChevronDown size={18} className="text-indigo-600" />
          )}
        </div>
        <h2 className="font-black text-slate-900 text-[16px]">
          Show Summary of All My Results
        </h2>
        <span
          className={`ml-auto px-2.5 py-1 rounded-xl text-[12px] font-black ${
            flaggedCount > 0
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {flaggedCount > 0 ? `${flaggedCount} Flagged` : "All Normal"}
        </span>
      </button>

      {/* Expanded Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-6 pb-6 space-y-4">
          {/* Color Legend Info Bar */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 mb-4">
            <Info size={13} className="text-slate-400 shrink-0" />
            <div className="flex items-center gap-3 text-[12px] font-semibold flex-wrap">
              <span className="text-red-500">🔴 Red (↑) = Above normal range</span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-500">🔵 Blue (↓) = Below normal range</span>
              <span className="text-slate-300">|</span>
              <span className="text-orange-500">🟠 Orange (⚠) = Critical value</span>
            </div>
          </div>

          {reports.map((report, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
              {/* Report Header */}
              <div className="bg-slate-800 text-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-black">
                    📋 {report.report_name || "Unnamed Report"}
                  </span>
                  {report.report_date && (
                    <span className="text-slate-300 text-[12px] font-semibold ml-auto">
                      {new Date(report.report_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Tests Table */}
              {report.tests && report.tests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="text-left px-4 py-2 font-black text-slate-700">
                          Test Name
                        </th>
                        <th className="text-right px-4 py-2 font-black text-slate-700">
                          Result
                        </th>
                        <th className="text-center px-4 py-2 font-black text-slate-700">
                          Units
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Filter out "non reactive" results
                        const shouldHide = (result) => {
                          if (!result || result.trim() === "") return true;
                          const val = result.trim().toLowerCase();
                          return (
                            val === "non-reactive" ||
                            val === "non reactive" ||
                            val === "nonreactive" ||
                            val === "non_reactive"
                          );
                        };

                        const filteredTests = report.tests.filter((test) => {
                          return !shouldHide(test.result);
                        });

                        if (filteredTests.length === 0) {
                          return (
                            <tr>
                              <td colSpan="3" className="px-4 py-6 text-center text-slate-400 text-[13px] font-semibold">
                                No flagged or numeric results to display
                              </td>
                            </tr>
                          );
                        }

                        return filteredTests.map((test, testIdx) => {
                          let resultClass = "text-slate-700";
                          let arrow = "";

                          if (test.flag === "H") {
                            resultClass = "text-red-600 font-black";
                            arrow = " ↑";
                          } else if (test.flag === "L") {
                            resultClass = "text-blue-600 font-black";
                            arrow = " ↓";
                          } else if (test.flag === "**") {
                            resultClass = "text-orange-600 font-black";
                            arrow = " ⚠";
                          }

                          return (
                            <tr
                              key={testIdx}
                              className={testIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                            >
                              <td className="px-4 py-2 text-slate-700 font-semibold">
                                {test.test_name || "—"}
                              </td>
                              <td className={`px-4 py-2 text-right ${resultClass}`}>
                                {test.result || "—"}
                                {arrow}
                              </td>
                              <td className="px-4 py-2 text-center text-slate-600">
                                {test.units || "—"}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-slate-400 text-[13px] font-semibold">
                  No test results available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportSummaryAccordion;
