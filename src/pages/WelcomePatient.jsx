import { useAuth } from "../context/AuthContext";
import { LogOut, Activity, Mail, Hash } from "lucide-react";

export default function WelcomePatient() {
  const { user, logout } = useAuth();

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-6"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white text-[16px] border border-white/15"
              style={{ fontWeight: 700 }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div>
              <p
                className="text-slate-400 text-[11px]"
                style={{ fontWeight: 400 }}
              >
                Signed in as
              </p>
              <p
                className="text-white text-[14px] leading-tight"
                style={{ fontWeight: 600 }}
              >
                {user?.full_name || "Patient"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-[12px] border border-white/10 hover:bg-white/20 transition-all"
            style={{ fontWeight: 500 }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-slate-400" />
            <h2
              className="text-slate-700 text-[13px]"
              style={{ fontWeight: 600 }}
            >
              Account Details
            </h2>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <Hash className="text-slate-400 shrink-0" size={14} />
              <div className="min-w-0">
                <p
                  className="text-slate-400 text-[10px] uppercase tracking-widest mb-0.5"
                  style={{ fontWeight: 600 }}
                >
                  Patient ID
                </p>
                <p
                  className="text-slate-800 text-[13px] truncate"
                  style={{ fontWeight: 500 }}
                >
                  {user?.pid || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <Mail className="text-slate-400 shrink-0" size={14} />
              <div className="min-w-0">
                <p
                  className="text-slate-400 text-[10px] uppercase tracking-widest mb-0.5"
                  style={{ fontWeight: 600 }}
                >
                  Email Address
                </p>
                <p
                  className="text-slate-800 text-[13px] truncate"
                  style={{ fontWeight: 500 }}
                >
                  {user?.email || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
