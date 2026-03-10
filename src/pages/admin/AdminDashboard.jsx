import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  UserCheck,
  ClipboardList,
  ChevronRight,
  Loader2,
  Calendar,
  FlaskConical,
  Receipt,
  Pill,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../lib/axios";

function StatCard({ icon: Icon, label, value, colorClass, bgClass }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bgClass} group-hover:scale-110 transition-transform`}
      >
        <Icon size={22} className={colorClass} />
      </div>
      <div>
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
          {label}
        </p>
        <p className="text-slate-900 text-[30px] font-black leading-none mt-0.5 tabular-nums">
          {value ?? <span className="text-slate-200 text-[24px]">—</span>}
        </p>
      </div>
    </div>
  );
}

function DocBadge({ count, label, colorClass, bgClass }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${bgClass} ${colorClass}`}
    >
      {count} {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={36} className="animate-spin text-slate-300" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 font-medium mt-1 text-[14px]">
            Overview of patient management and discharge activity
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Patients"
            value={stats?.total_patients}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
          />
          <StatCard
            icon={Activity}
            label="Active Patients"
            value={stats?.active_patients}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
          />
          <StatCard
            icon={UserCheck}
            label="Discharged"
            value={stats?.discharged_patients}
            colorClass="text-slate-600"
            bgClass="bg-slate-100"
          />
          <StatCard
            icon={ClipboardList}
            label="Total Discharges"
            value={stats?.total_discharges}
            colorClass="text-violet-600"
            bgClass="bg-violet-50"
          />
        </div>

        {/* Recent Discharges */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-black text-slate-900 text-[16px] flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              Recent Discharges
            </h2>
            <button
              onClick={() => navigate("/admin/discharge-history")}
              className="text-[13px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {!stats?.recent_discharges?.length ? (
            <div className="py-16 text-center">
              <ClipboardList
                size={36}
                className="text-slate-200 mx-auto mb-3"
              />
              <p className="text-slate-400 font-semibold text-[14px]">
                No discharge records yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="text-left py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">
                      Discharge Date
                    </th>
                    <th className="text-left py-3 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                      Documents
                    </th>
                    <th className="py-3 px-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recent_discharges.map((d) => (
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
                        <span className="text-[13px] font-semibold text-slate-700">
                          {d.discharge_date || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <DocBadge
                            count={d.processed_reports}
                            label="R"
                            colorClass="text-blue-600"
                            bgClass="bg-blue-50"
                          />
                          <DocBadge
                            count={d.processed_bills}
                            label="B"
                            colorClass="text-violet-600"
                            bgClass="bg-violet-50"
                          />
                          <DocBadge
                            count={d.processed_prescriptions}
                            label="Rx"
                            colorClass="text-teal-600"
                            bgClass="bg-teal-50"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-slate-600 ml-auto transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
