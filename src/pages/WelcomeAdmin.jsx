import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { API_ROUTES } from "../lib/routes";
import {
  LogOut,
  ShieldCheck,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function WelcomeAdmin() {
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const searchTerm = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const sortOrder = searchParams.get("sort") || "asc";
  const itemsPerPage = 5;

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await api.get(API_ROUTES.admin.patients, {
          params: {
            search: searchTerm,
            page: currentPage,
            size: itemsPerPage,
            sort: sortOrder,
          },
        });
        setPatients(response.data.items || []);
        setTotalItems(response.data.total || 0);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [searchTerm, currentPage, sortOrder]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 md:p-8"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Navbar */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm mb-7">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 p-1.5 rounded-lg text-white">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h2
              className="text-slate-900 text-[15px] leading-none"
              style={{ fontWeight: 600 }}
            >
              Admin Panel
            </h2>
            <span
              className="text-[10px] text-emerald-600 uppercase tracking-widest"
              style={{ fontWeight: 600 }}
            >
              Live System
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-[13px] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
          style={{ fontWeight: 500 }}
        >
          <LogOut size={14} /> Logout
        </button>
      </nav>

      {/* Main card */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h1
            className="text-slate-900 text-[16px]"
            style={{ fontWeight: 700 }}
          >
            Patients
          </h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search patients…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-[13px] outline-none focus:border-slate-400 transition-colors bg-white"
                style={{ fontWeight: 400 }}
                value={searchTerm}
                onChange={(e) =>
                  updateFilters({ search: e.target.value, page: 1 })
                }
              />
            </div>
            {/* Sort */}
            <button
              onClick={() =>
                updateFilters({ sort: sortOrder === "asc" ? "desc" : "asc" })
              }
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-[13px] hover:border-slate-300 transition-all whitespace-nowrap"
              style={{ fontWeight: 500 }}
            >
              <ArrowUpDown size={13} />
              {sortOrder === "asc" ? "A – Z" : "Z – A"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th
                  className="text-left py-3 px-5 text-[10px] text-slate-400 uppercase tracking-widest"
                  style={{ fontWeight: 600 }}
                >
                  Patient
                </th>
                <th
                  className="text-left py-3 px-5 text-[10px] text-slate-400 uppercase tracking-widest"
                  style={{ fontWeight: 600 }}
                >
                  Patient ID
                </th>
                <th
                  className="text-right py-3 px-5 text-[10px] text-slate-400 uppercase tracking-widest"
                  style={{ fontWeight: 600 }}
                >
                  Status
                </th>
                <th
                  className="text-right py-3 px-5 text-[10px] text-slate-400 uppercase tracking-widest"
                  style={{ fontWeight: 600 }}
                >
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-14 text-center text-slate-400 text-[13px]"
                    style={{ fontWeight: 400 }}
                  >
                    Loading patients…
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-14 text-center text-slate-400 text-[13px]"
                    style={{ fontWeight: 400 }}
                  >
                    No patients found.
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
                          className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[12px] uppercase shrink-0"
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
                    <td className="py-3.5 px-5">
                      <span
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px]"
                        style={{ fontWeight: 500 }}
                      >
                        #{String(patient.id).padStart(4, "0")}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span
                        className="flex items-center justify-end gap-1.5 text-emerald-600 text-[12px]"
                        style={{ fontWeight: 500 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
          <p className="text-slate-400 text-[12px]" style={{ fontWeight: 400 }}>
            Page {currentPage} of {totalPages || 1}
            <span className="ml-1.5 text-slate-300">·</span>
            <span className="ml-1.5">{totalItems} records</span>
          </p>
          <div className="flex gap-1.5">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => updateFilters({ page: currentPage - 1 })}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={currentPage >= totalPages || loading}
              onClick={() => updateFilters({ page: currentPage + 1 })}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
