import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, Users } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import SearchBar from "../../components/SearchBar";
import FilterBar from "../../components/FilterBar";
import Pagination from "../../components/Pagination";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";
import SystemLoader from "../../components/SystemLoader";

const SORT_OPTIONS = [
  { value: "asc", label: "A → Z" },
  { value: "desc", label: "Z → A" },
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
        } else {
          const start = (page - 1) * PAGE_SIZE;
          setPatients(list.slice(start, start + PAGE_SIZE));
          setTotal(list.length);
        }
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
            sublabel="Preparing patient records"
            className="min-h-[60vh]"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-slate-900 text-[22px] flex items-center gap-2.5"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            <Users size={20} className="text-slate-400" />
            Patients
          </h1>
          <p
            className="text-slate-500 text-[13px] mt-1"
            style={{ fontWeight: 400 }}
          >
            Select a patient to view details or manage discharge
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-0">
              <label
                className="block text-slate-500 mb-1 text-[10px] uppercase tracking-widest"
                style={{ fontWeight: 600 }}
              >
                Search
              </label>
              <SearchBar
                value={search}
                onChange={(v) => updateParams({ search: v, page: 1 })}
                placeholder="Search by name or email…"
                debounceMs={400}
              />
            </div>
            <div className="hidden sm:block w-px self-stretch bg-slate-100" />
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Patient", "ID", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`text-left py-3 px-5 text-[10px] text-slate-400 uppercase tracking-widest ${i === 1 ? "hidden sm:table-cell" : ""} ${i === 2 ? "hidden md:table-cell" : ""}`}
                      style={{ fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <SystemLoader compact label="Refreshing patients" />
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <Users
                        size={32}
                        className="text-slate-200 mx-auto mb-3"
                      />
                      <p
                        className="text-slate-400 text-[13px]"
                        style={{ fontWeight: 500 }}
                      >
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
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/admin/patient/${patient.id}`)}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[12px] uppercase shrink-0"
                            style={{ fontWeight: 600 }}
                          >
                            {patient.full_name?.charAt(0) || "P"}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-slate-900 text-[13px] truncate"
                              style={{ fontWeight: 500 }}
                            >
                              {patient.full_name}
                            </p>
                            <p
                              className="text-slate-400 text-[12px] truncate"
                              style={{ fontWeight: 400 }}
                            >
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 hidden sm:table-cell">
                        <span
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px]"
                          style={{ fontWeight: 500 }}
                        >
                          #{String(patient.id).padStart(4, "0")}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 hidden md:table-cell">
                        {patient.discharge_date ? (
                          <span
                            className="flex items-center gap-1.5 text-slate-500 text-[12px]"
                            style={{ fontWeight: 500 }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                            Discharged
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1.5 text-emerald-600 text-[12px]"
                            style={{ fontWeight: 500 }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />{" "}
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        </div>
      </div>
    </AdminLayout>
  );
}
