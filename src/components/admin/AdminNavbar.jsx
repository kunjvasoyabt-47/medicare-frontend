import React, { useState, useRef, useEffect } from "react";
import { LogOut, ShieldCheck, Loader2, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminNavbar({ sidebarOpen, onMenuToggle }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } finally {
      setLogoutLoading(false);
    }
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
          <ShieldCheck size={16} />
        </div>
        <span
          className="text-slate-900 text-[15px] hidden sm:block"
          style={{ fontWeight: 600 }}
        >
          Medicare Admin
        </span>
      </div>

      <div className="flex-1" />

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[13px] uppercase hover:bg-slate-700 transition-all"
          style={{ fontWeight: 600 }}
          aria-label="Admin menu"
        >
          {user?.full_name?.charAt(0) || "A"}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-10 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p
                className="text-slate-400 text-[10px] uppercase tracking-widest mb-0.5"
                style={{ fontWeight: 600 }}
              >
                Signed in as
              </p>
              <p
                className="text-slate-900 text-[14px] truncate"
                style={{ fontWeight: 600 }}
              >
                {user?.full_name || "Administrator"}
              </p>
              <p
                className="text-slate-500 text-[12px] truncate"
                style={{ fontWeight: 400 }}
              >
                {user?.email || "admin@medicare.com"}
              </p>
            </div>
            <div className="p-1.5">
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
