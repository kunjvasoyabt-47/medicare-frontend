import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  History,
  ChevronRight,
  Loader2,
  Calendar,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import SearchBar from "../../components/SearchBar";
import FilterBar from "../../components/FilterBar";
import Pagination from "../../components/Pagination";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";

const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

const PAGE_SIZE = 10;

export default function AdminDischargeHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

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
      .get(API_ROUTES.admin.dischargeHistory, { params })
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

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3500);
  }, []);

  const handleDeleteDischarge = useCallback(async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await api.delete(API_ROUTES.discharge.remove(confirmDeleteId));
      setItems((prev) =>
        prev.filter((item) => item.discharge_id !== confirmDeleteId),
      );
      setTotal((prev) => Math.max(0, prev - 1));
      if (items.length === 1 && page > 1) updateParams({ page: page - 1 });
      showToast("Discharge record deleted.", "success");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to delete.", "error");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, items.length, page, showToast, updateParams]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-slate-900 text-[22px] flex items-center gap-2.5"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            <History size={20} className="text-slate-400" />
            Discharge History
          </h1>
          <p
            className="text-slate-500 text-[13px] mt-1"
            style={{ fontWeight: 400 }}
          >
            All completed patient discharges
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:flex-wrap">
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
                placeholder="Search by patient name or email…"
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
                {
                  key: "date_from",
                  label: "From",
                  type: "date",
                  value: dateFrom,
                },
                { key: "date_to", label: "To", type: "date", value: dateTo },
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
                  {["Patient", "Discharge Date", "Documents", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className={`text-left py-3 px-5 text-[10px] text-slate-400 uppercase tracking-widest ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden sm:table-cell" : ""}`}
                        style={{ fontWeight: 600 }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <Loader2
                        size={24}
                        className="animate-spin text-slate-300 mx-auto"
                      />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <History
                        size={32}
                        className="text-slate-200 mx-auto mb-3"
                      />
                      <p
                        className="text-slate-400 text-[13px]"
                        style={{ fontWeight: 500 }}
                      >
                        No discharge records found
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((d) => (
                    <tr
                      key={d.discharge_id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      onClick={() =>
                        navigate(`/admin/discharge/${d.discharge_id}`)
                      }
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[12px] uppercase shrink-0"
                            style={{ fontWeight: 600 }}
                          >
                            {d.patient_name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-slate-900 text-[13px] truncate"
                              style={{ fontWeight: 500 }}
                            >
                              {d.patient_name}
                            </p>
                            <p
                              className="text-slate-400 text-[12px] truncate"
                              style={{ fontWeight: 400 }}
                            >
                              {d.patient_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 hidden md:table-cell">
                        <div
                          className="flex items-center gap-1.5 text-slate-600 text-[13px]"
                          style={{ fontWeight: 400 }}
                        >
                          <Calendar size={12} className="text-slate-400" />
                          {d.discharge_date || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[11px]"
                            style={{ fontWeight: 500 }}
                          >
                            {d.processed_reports}R
                          </span>
                          <span
                            className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-md text-[11px]"
                            style={{ fontWeight: 500 }}
                          >
                            {d.processed_bills}B
                          </span>
                          <span
                            className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-md text-[11px]"
                            style={{ fontWeight: 500 }}
                          >
                            {d.processed_prescriptions}Rx
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(d.discharge_id);
                            }}
                            disabled={deletingId === d.discharge_id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === d.discharge_id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                          <ChevronRight
                            size={14}
                            className="text-slate-300 group-hover:text-slate-500 transition-colors"
                          />
                        </div>
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

        {/* Delete Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3
                  className="text-slate-900 text-[16px]"
                  style={{ fontWeight: 700 }}
                >
                  Delete discharge record?
                </h3>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p
                className="text-slate-600 text-[13px] leading-relaxed"
                style={{ fontWeight: 400 }}
              >
                This will permanently remove discharge #{confirmDeleteId} and
                all related records. This action cannot be undone.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-[13px] hover:bg-slate-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDischarge}
                  disabled={Boolean(deletingId)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  style={{ fontWeight: 500 }}
                >
                  {deletingId && <Loader2 size={13} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.message && (
          <div
            className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-[13px] ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
            style={{ fontWeight: 500 }}
          >
            {toast.message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
