import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Activity, Loader2, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PatientNavbar({ sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
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
      className={`fixed top-0 right-0 z-30 bg-white border-b border-slate-100 shadow-sm h-16
        flex items-center px-5 gap-3 transition-all duration-300 ease-in-out
        left-0 ${sidebarOpen ? "lg:left-64" : "lg:left-16"}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="bg-[#111111] p-1.5 rounded-xl text-white shadow-md">
          <Activity size={20} />
        </div>
        <span className="text-[#111111] font-black text-[18px] tracking-tight hidden sm:block">
          Medicare
        </span>
      </div>

      <div className="flex-1" />

      {/* Profile area */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
          aria-label="User menu"
          aria-expanded={dropdownOpen}
        >
          <div className="w-7 h-7 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-[12px] uppercase shrink-0">
            {user?.full_name?.charAt(0) || "P"}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-[11px] font-black text-slate-800 leading-tight truncate max-w-[120px]">
              {user?.full_name}
            </p>
            <p className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
              {user?.email}
            </p>
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 z-50 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-slate-900 font-black text-[15px] truncate">
                {user?.full_name}
              </p>
              <p className="text-slate-500 text-[12px] font-medium truncate mt-0.5">
                {user?.email}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={goToProfile}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-all text-[14px] font-bold"
              >
                <UserCircle size={16} className="text-slate-400" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all text-[14px] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {logoutLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
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
