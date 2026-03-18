import { useState, useEffect, useCallback } from "react";
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
import { API_ROUTES } from "../../lib/routes";

const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
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
      .get(API_ROUTES.patient.dischargeHistory, {
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
        <div className="mb-6">
          <h1
            className="text-slate-900 text-[22px] flex items-center gap-2.5"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            <FileText size={20} className="text-slate-400" />
            Discharge History
          </h1>
          <p
            className="text-slate-500 text-[13px] mt-1"
            style={{ fontWeight: 400 }}
          >
            Your past discharge records and associated documents
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-end">
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-14 flex justify-center">
              <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-14 text-center">
              <ClipboardList
                size={32}
                className="text-slate-200 mx-auto mb-3"
              />
              <p
                className="text-slate-500 text-[13px]"
                style={{ fontWeight: 500 }}
              >
                No discharge records found
              </p>
              <p
                className="text-slate-400 text-[12px] mt-1"
                style={{ fontWeight: 400 }}
              >
                Your records will appear here once processed by the admin.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {items.map((d, index) => (
                  <div
                    key={d.discharge_id}
                    className="px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() =>
                      navigate(`/patient/discharge/${d.discharge_id}`)
                    }
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[12px] shrink-0"
                          style={{ fontWeight: 600 }}
                        >
                          {String(
                            total - (page - 1) * PAGE_SIZE - index,
                          ).padStart(2, "0")}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-slate-900 text-[13px]"
                            style={{ fontWeight: 500 }}
                          >
                            Discharge #{String(d.discharge_id).padStart(4, "0")}
                          </p>
                          <div
                            className="flex items-center gap-1.5 text-slate-500 text-[12px] mt-0.5"
                            style={{ fontWeight: 400 }}
                          >
                            <Calendar size={11} />
                            {d.discharge_date || "Date not recorded"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px]"
                          style={{ fontWeight: 500 }}
                        >
                          {d.processed_reports} Reports
                        </span>
                        <span
                          className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-md text-[11px]"
                          style={{ fontWeight: 500 }}
                        >
                          {d.processed_bills} Bills
                        </span>
                        <span
                          className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-md text-[11px]"
                          style={{ fontWeight: 500 }}
                        >
                          {d.processed_prescriptions} Rx
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-slate-300 group-hover:text-slate-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-4">
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
