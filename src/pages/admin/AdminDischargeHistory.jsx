import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { History, ChevronRight, Loader2, Calendar } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import SearchBar from "../../components/SearchBar";
import FilterBar from "../../components/FilterBar";
import Pagination from "../../components/Pagination";
import api from "../../lib/axios";

const SORT_OPTIONS = [
  { value: "desc", label: "Newest First" },
  { value: "asc", label: "Oldest First" },
];

const PAGE_SIZE = 10;

export default function AdminDischargeHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "desc";
  const dateFrom = searchParams.get("date_from") || "";
  const dateTo = searchParams.get("date_to") || "";

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
    const params = { page, size: PAGE_SIZE, sort };
    if (search) params.search = search;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    api
      .get("/admin/discharge-history", { params })
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
  }, [search, page, sort, dateFrom, dateTo]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-3">
            <History size={26} className="text-slate-400" />
            Discharge History
          </h1>
          <p className="text-slate-400 font-medium mt-1 text-[14px]">
            All completed patient discharges
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <SearchBar
            value={search}
            onChange={(v) => updateParams({ search: v, page: 1 })}
            placeholder="Search by patient name or email…"
            className="flex-1"
          />
          <FilterBar
            filters={[
              {
                key: "sort",
                label: "Sort",
                type: "select",
                value: sort,
                options: SORT_OPTIONS,
              },
              {
                key: "date_from",
                label: "From",
                type: "date",
                value: dateFrom,
              },
              {
                key: "date_to",
                label: "To",
                type: "date",
                value: dateTo,
              },
            ]}
            onFilterChange={(k, v) => updateParams({ [k]: v, page: 1 })}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Patient
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">
                    Discharge Date
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                    Documents
                  </th>
                  <th className="py-4 px-4 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <Loader2
                        size={28}
                        className="animate-spin text-slate-300 mx-auto"
                      />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <History
                        size={36}
                        className="text-slate-200 mx-auto mb-3"
                      />
                      <p className="text-slate-400 font-semibold text-[14px]">
                        No discharge records found
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((d) => (
                    <tr
                      key={d.discharge_id}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                      onClick={() =>
                        navigate(`/admin/discharge/${d.discharge_id}`)
                      }
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0f172a] text-white flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-sm">
                            {d.patient_name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-[14px] truncate">
                              {d.patient_name}
                            </p>
                            <p className="text-slate-400 text-[12px] truncate">
                              {d.patient_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[13px]">
                          <Calendar size={13} className="text-slate-400" />
                          {d.discharge_date || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold">
                            {d.processed_reports}R
                          </span>
                          <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-lg text-[11px] font-bold">
                            {d.processed_bills}B
                          </span>
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-lg text-[11px] font-bold">
                            {d.processed_prescriptions}Rx
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-slate-600 ml-auto transition-colors"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        </div>
      </div>
    </AdminLayout>
  );
}
