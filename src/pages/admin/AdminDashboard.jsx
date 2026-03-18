import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  UserCheck,
  ClipboardList,
  ChevronRight,
  Calendar,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";
import SystemLoader from "../../components/SystemLoader";

function StatCard({ icon: Icon, label, value, colorClass, bgClass }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}
      >
        <Icon size={18} className={colorClass} />
      </div>
      <div>
        <p
          className="text-slate-500 text-[11px] uppercase tracking-widest mb-0.5"
          style={{ fontWeight: 500 }}
        >
          {label}
        </p>
        <p
          className="text-slate-900 text-[28px] leading-none tabular-nums"
          style={{ fontWeight: 700 }}
        >
          {value ?? <span className="text-slate-200 text-[22px]">—</span>}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(API_ROUTES.admin.dashboard)
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <SystemLoader
          label="Loading Dashboard"
          sublabel="Collecting discharge analytics"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-7">
          <h1
            className="text-slate-900 text-[22px]"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Dashboard
          </h1>
          <p
            className="text-slate-500 text-[13px] mt-1"
            style={{ fontWeight: 400 }}
          >
            Overview of patient management and discharge activity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2
              className="text-slate-900 text-[14px] flex items-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <Calendar size={15} className="text-slate-400" />
              Recent Discharges
            </h2>
            <button
              onClick={() => navigate("/admin/discharge-history")}
              className="text-[12px] text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              style={{ fontWeight: 500 }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {!stats?.recent_discharges?.length ? (
            <div className="py-14 text-center">
              <ClipboardList
                size={32}
                className="text-slate-200 mx-auto mb-3"
              />
              <p
                className="text-slate-400 text-[13px]"
                style={{ fontWeight: 500 }}
              >
                No discharge records yet
              </p>
            </div>
          ) : (
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
                  {stats.recent_discharges.map((d) => (
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
                        <span
                          className="text-slate-700 text-[13px]"
                          style={{ fontWeight: 400 }}
                        >
                          {d.discharge_date || "—"}
                        </span>
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
                        <ChevronRight
                          size={14}
                          className="text-slate-300 group-hover:text-slate-500 ml-auto transition-colors"
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
