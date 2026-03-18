import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Activity, Loader2, UserCircle, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PatientNavbar({ sidebarOpen, onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } finally {
      setLogoutLoading(false);
    }
  };

  const goToProfile = () => {
    navigate("/patient/profile");
    setDropdownOpen(false);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 bg-white border-b border-slate-200 h-14
        flex items-center px-4 gap-3 transition-all duration-300 ease-in-out
        left-0 ${sidebarOpen ? "lg:left-64" : "lg:left-0"}`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <button
        onClick={onMenuToggle}
        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div className="flex items-center gap-2">
        <div className="bg-slate-900 p-1.5 rounded-lg text-white">
          <Activity size={16} />
        </div>
        <span
          className="text-slate-900 text-[15px] hidden sm:block"
          style={{ fontWeight: 600 }}
        >
          Medicare
        </span>
      </div>

      <div className="flex-1" />

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
        >
          <div
            className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-[11px] uppercase shrink-0"
            style={{ fontWeight: 600 }}
          >
            {user?.email?.charAt(0) || "P"}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p
              className="text-slate-800 text-[12px] leading-tight truncate max-w-[110px]"
              style={{ fontWeight: 600 }}
            >
              {user?.full_name}
            </p>
            <p
              className="text-slate-500 text-[11px] truncate max-w-[110px]"
              style={{ fontWeight: 400 }}
            >
              {user?.email}
            </p>
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-10 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p
                className="text-slate-900 text-[14px] truncate"
                style={{ fontWeight: 600 }}
              >
                {user?.full_name}
              </p>
              <p
                className="text-slate-500 text-[12px] truncate"
                style={{ fontWeight: 400 }}
              >
                {user?.email}
              </p>
            </div>
            <div className="p-1.5">
              <button
                onClick={goToProfile}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-all text-[13px]"
                style={{ fontWeight: 500 }}
              >
                <UserCircle size={14} className="text-slate-400" /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-[13px] disabled:opacity-60"
                style={{ fontWeight: 500 }}
              >
                {logoutLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                {logoutLoading ? "Logging out…" : "Logout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
