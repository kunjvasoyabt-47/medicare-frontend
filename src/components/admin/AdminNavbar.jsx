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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
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
      className={`fixed top-0 right-0 z-30 bg-white border-b border-slate-100 shadow-sm h-16
        flex items-center px-5 gap-3 transition-all duration-300 ease-in-out
        left-0 font-sans ${sidebarOpen ? "lg:left-64" : "lg:left-0"}`}
    >
      {/* Menu toggle for all screen sizes */}
      <button
        onClick={onMenuToggle}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="bg-[#111111] p-1.5 rounded-xl text-white shadow-md">
          <ShieldCheck size={20} />
        </div>
        <span className="text-[#111111] font-black text-[18px] tracking-tight hidden sm:block">
          Medicare Admin
        </span>
      </div>

      <div className="flex-1" />

      {/* Admin avatar + dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="w-10 h-10 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-black text-[15px] uppercase shadow-md hover:bg-slate-700 transition-all ring-2 ring-transparent hover:ring-slate-200"
          aria-label="Admin menu"
          aria-expanded={dropdownOpen}
        >
          {user?.full_name?.charAt(0) || "A"}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 z-50 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Signed in as
              </p>
              <p className="text-slate-900 font-black text-[15px] truncate">
                {user?.full_name || "Administrator"}
              </p>
              <p className="text-slate-500 text-[12px] font-medium truncate mt-0.5">
                {user?.email || "admin@medicare.com"}
              </p>
            </div>
            <div className="p-2">
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
