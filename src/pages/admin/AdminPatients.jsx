import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, Users, Loader2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import SearchBar from "../../components/SearchBar";
import FilterBar from "../../components/FilterBar";
import Pagination from "../../components/Pagination";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";
import SystemLoader from "../../components/SystemLoader";

const SORT_OPTIONS = [
  { value: "asc", label: "Sort: A → Z" },
  { value: "desc", label: "Sort: Z → A" },
];

const PAGE_SIZE = 7;

export default function AdminPatients() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "asc";

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
      .get(API_ROUTES.admin.patients, {
        params: { search, page, size: PAGE_SIZE, sort },
      })
      .then((r) => {
        if (!active) return;
        const payload = r.data;
        const list = Array.isArray(payload)
          ? payload
          : payload.items || payload.patients || payload.data || [];

        const hasServerPagination =
          !Array.isArray(payload) &&
          payload.items &&
          (payload.total != null ||
            payload.count != null ||
            payload.pagination?.total != null);

        if (hasServerPagination) {
          const totalFromApi = Number(
            payload.total ?? payload.count ?? payload.pagination?.total ?? 0,
          );
          setPatients(list);
          setTotal(Number.isFinite(totalFromApi) ? totalFromApi : 0);
          return;
        }

        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setPatients(list.slice(start, end));
        setTotal(list.length);
      })
      .catch(console.error)
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setHasLoadedOnce(true);
      });
    return () => {
      active = false;
    };
  }, [search, page, sort]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!hasLoadedOnce && loading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto">
          <SystemLoader
            label="Loading Patients"
            sublabel="Preparing patient records and status"
            className="min-h-[60vh]"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users size={26} className="text-slate-400" />
            Patients
          </h1>
          <p className="text-slate-400 font-medium mt-1 text-[14px]">
            Select a patient to view details or manage discharge
          </p>
        </div>

        {/* ── Unified Toolbar ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 mb-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">
                Search
              </label>
              <SearchBar
                value={search}
                onChange={(v) => updateParams({ search: v, page: 1 })}
                placeholder="Search by name or email…"
                debounceMs={400}
              />
            </div>

            <div className="hidden sm:block w-px self-stretch bg-slate-100 my-0.5" />

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
                  <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                    ID
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">
                    Status
                  </th>
                  <th className="py-4 px-4 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <SystemLoader compact label="Refreshing patients" />
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <Users
                        size={36}
                        className="text-slate-200 mx-auto mb-3"
                      />
                      <p className="text-slate-400 font-semibold text-[14px]">
                        {search
                          ? "No patients match your search"
                          : "No patients found"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/admin/patient/${patient.id}`)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center font-black text-[14px] uppercase shrink-0 shadow-sm">
                            {patient.full_name?.charAt(0) || "P"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-[14px] truncate">
                              {patient.full_name}
                            </p>
                            <p className="text-slate-400 text-[12px] truncate">
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-[12px]">
                          #{String(patient.id).padStart(4, "0")}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        {patient.discharge_date ? (
                          <span className="flex items-center gap-1.5 text-slate-500 font-semibold text-[13px]">
                            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                            Discharged
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[13px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-[#0f172a] group-hover:text-white transition-all">
                          <Eye size={16} />
                        </button>
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
