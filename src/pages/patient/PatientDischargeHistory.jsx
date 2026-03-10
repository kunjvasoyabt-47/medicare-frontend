import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  ChevronRight,
  Loader2,
  Calendar,
  ClipboardList,
} from "lucide-react";
import PatientLayout from "../../components/patient/PatientLayout";
import FilterBar from "../../components/FilterBar";
import Pagination from "../../components/Pagination";
import api from "../../lib/axios";

const SORT_OPTIONS = [
  { value: "desc", label: "Newest First" },
  { value: "asc", label: "Oldest First" },
];

const PAGE_SIZE = 10;

export default function PatientDischargeHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "desc";

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/patient/discharge-history", {
        params: { page, size: PAGE_SIZE, sort },
      })
      .then((r) => {
        if (!active) return;
        setItems(r.data.items || []);
        setTotal(r.data.total || 0);
      })
      .catch(console.error)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, sort]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText size={26} className="text-slate-400" />
            Discharge History
          </h1>
          <p className="text-slate-400 font-medium mt-1 text-[14px]">
            Your past discharge records and associated documents
          </p>
        </div>

        {/* Filter toolbar */}
        <div className="flex justify-end mb-5">
          <FilterBar
            filters={[
              {
                key: "sort",
                label: "Sort",
                type: "select",
                value: sort,
                options: SORT_OPTIONS,
              },
            ]}
            onFilterChange={(k, v) => updateParams({ [k]: v, page: 1 })}
          />
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 size={28} className="animate-spin text-slate-300" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList
                size={40}
                className="text-slate-200 mx-auto mb-3"
              />
              <p className="text-slate-400 font-semibold text-[14px]">
                No discharge records found
              </p>
              <p className="text-slate-300 text-[13px] mt-1">
                Your records will appear here once processed by the admin.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {items.map((d, index) => (
                  <div
                    key={d.discharge_id}
                    className="p-5 hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    onClick={() =>
                      navigate(`/patient/discharge/${d.discharge_id}`)
                    }
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Index badge */}
                        <div className="w-10 h-10 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-[13px] shrink-0 shadow-sm">
                          {String(
                            total - (page - 1) * PAGE_SIZE - index,
                          ).padStart(2, "0")}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-black text-slate-900">
                              Discharge #
                              {String(d.discharge_id).padStart(4, "0")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-semibold mt-0.5">
                            <Calendar size={12} />
                            {d.discharge_date || "Date not recorded"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-bold">
                          {d.processed_reports} Reports
                        </span>
                        <span className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-xl text-[11px] font-bold">
                          {d.processed_bills} Bills
                        </span>
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-xl text-[11px] font-bold">
                          {d.processed_prescriptions} Rx
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-slate-600 transition-colors ml-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-5">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => updateParams({ page: p })}
                  isLoading={loading}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
