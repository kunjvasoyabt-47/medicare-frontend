import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
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
          className="text-slate-900 text-[26px] leading-none tabular-nums"
          style={{ fontWeight: 700 }}
        >
          {value ?? <span className="text-slate-200 text-[20px]">—</span>}
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
        <SystemLoader
          label="Loading Dashboard"
          sublabel="Preparing your latest discharge overview"
        />
      </PatientLayout>
    );
  }

  const { patient, stats, latest_discharge } = data || {};

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Welcome banner */}
        <div className="bg-slate-900 rounded-xl p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center text-xl text-white border border-white/15 shrink-0"
              style={{ fontWeight: 700 }}
            >
              {patient?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-slate-500 text-[12px] mb-0.5"
                style={{ fontWeight: 400 }}
              >
                Welcome back
              </p>
              <h1
                className="text-white text-[20px] md:text-[22px] truncate"
                style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
              >
                {patient?.full_name}
              </h1>
              <p
                className="text-slate-500 text-[12px] mt-0.5 truncate"
                style={{ fontWeight: 400 }}
              >
                {patient?.email}
              </p>
            </div>
            <div>
              {stats?.is_discharged ? (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-slate-300 rounded-full text-[11px] border border-white/10"
                  style={{ fontWeight: 500 }}
                >
                  <CheckCircle size={11} /> Discharged
                </span>
              ) : (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[11px] border border-emerald-500/30"
                  style={{ fontWeight: 500 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-slate-900 text-[14px] flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <Calendar size={15} className="text-slate-400" />
                Latest Discharge
              </h2>
              <button
                onClick={() => navigate("/patient/discharge-history")}
                className="text-[12px] text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                style={{ fontWeight: 500 }}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[12px] inline-block mb-2"
                    style={{ fontWeight: 500 }}
                  >
                    Discharge #
                    {String(latest_discharge.discharge_id).padStart(4, "0")}
                  </span>
                  <div
                    className="flex items-center gap-1.5 text-slate-600 text-[13px]"
                    style={{ fontWeight: 400 }}
                  >
                    <Calendar size={13} className="text-slate-400" />
                    {latest_discharge.discharge_date || "Date not recorded"}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[12px]"
                    style={{ fontWeight: 500 }}
                  >
                    {latest_discharge.processed_reports} Reports
                  </span>
                  <span
                    className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-md text-[12px]"
                    style={{ fontWeight: 500 }}
                  >
                    {latest_discharge.processed_bills} Bills
                  </span>
                  <span
                    className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-md text-[12px]"
                    style={{ fontWeight: 500 }}
                  >
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
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[13px] hover:bg-slate-700 transition-all"
                style={{ fontWeight: 500 }}
              >
                View Documents <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <Clock size={32} className="text-slate-200 mx-auto mb-3" />
            <p
              className="text-slate-600 text-[14px]"
              style={{ fontWeight: 500 }}
            >
              No discharge records yet
            </p>
            <p
              className="text-slate-400 text-[13px] mt-1"
              style={{ fontWeight: 400 }}
            >
              Your discharge history will appear here once processed by the
              admin.
            </p>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
