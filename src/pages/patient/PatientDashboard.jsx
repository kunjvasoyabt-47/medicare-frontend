import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  Pill,
  FlaskConical,
  ChevronRight,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import PatientLayout from "../../components/patient/PatientLayout";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";
import SystemLoader from "../../components/SystemLoader";

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
        <p className="text-slate-900 text-[28px] font-black leading-none mt-0.5 tabular-nums">
          {value ?? <span className="text-slate-200 text-[22px]">—</span>}
        </p>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(API_ROUTES.patient.dashboard)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PatientLayout>
        <SystemLoader label="Loading Dashboard" sublabel="Preparing your latest discharge overview" />
      </PatientLayout>
    );
  }

  const { patient, stats, latest_discharge } = data || {};

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Welcome banner */}
        <div className="bg-[#0f172a] rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 grid-pattern" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-black text-white border border-white/20 backdrop-blur-md shrink-0">
              {patient?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-[13px] font-medium mb-1">
                Welcome back
              </p>
              <h1 className="text-white font-black text-[22px] md:text-[26px] tracking-tight truncate">
                {patient?.full_name}
              </h1>
              <p className="text-slate-500 text-[13px] mt-0.5 truncate">
                {patient?.email}
              </p>
            </div>
            <div>
              {stats?.is_discharged ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/20 text-slate-300 rounded-full text-[11px] font-black uppercase tracking-widest border border-slate-500/30">
                  <CheckCircle size={12} /> Discharged
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={ClipboardList}
            label="Total Discharges"
            value={stats?.discharge_count}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
          />
          <StatCard
            icon={Pill}
            label="Active Medications"
            value={stats?.active_medications}
            colorClass="text-teal-600"
            bgClass="bg-teal-50"
          />
          <StatCard
            icon={FlaskConical}
            label="Total Reports"
            value={stats?.total_reports}
            colorClass="text-violet-600"
            bgClass="bg-violet-50"
          />
        </div>

        {/* Latest discharge */}
        {latest_discharge ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-black text-slate-900 text-[16px] flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" />
                Latest Discharge
              </h2>
              <button
                onClick={() => navigate("/patient/discharge-history")}
                className="text-[13px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[12px] font-black">
                      Discharge #
                      {String(latest_discharge.discharge_id).padStart(4, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-[14px] font-semibold">
                    <Calendar size={14} className="text-slate-400" />
                    {latest_discharge.discharge_date || "Date not recorded"}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-xl text-[12px] font-bold">
                    {latest_discharge.processed_reports} Reports
                  </span>
                  <span className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-xl text-[12px] font-bold">
                    {latest_discharge.processed_bills} Bills
                  </span>
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-xl text-[12px] font-bold">
                    {latest_discharge.processed_prescriptions} Rx
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/patient/discharge/${latest_discharge.discharge_id}`,
                  )
                }
                className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-xl font-bold text-[13px] hover:bg-slate-700 transition-all"
              >
                View Documents <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <Clock size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-[15px]">
              No discharge records yet
            </p>
            <p className="text-slate-400 text-[13px] mt-1">
              Your discharge history will appear here once processed by the
              admin.
            </p>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
