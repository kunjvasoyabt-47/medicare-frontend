import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, History, Activity, Menu } from "lucide-react";

const NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/patients", label: "Patients", icon: Users },
  {
    path: "/admin/discharge-history",
    label: "Discharge History",
    icon: History,
  },
];

export default function AdminSidebar({ isOpen, onClose, onMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/admin/patients") {
      return (
        location.pathname === "/admin/patients" ||
        location.pathname.startsWith("/admin/patient/")
      );
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleNav = (path) => {
    navigate(path);
    // Only close on mobile — never open or close on desktop
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className={`fixed top-0 left-0 h-full bg-[#111111] z-50 flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? "w-64 translate-x-0" : "lg:w-16 lg:translate-x-0 w-64 -translate-x-full"}`}
      >
        {/* Sidebar header — brand + hamburger toggle */}
        <div
          className={`h-16 flex items-center border-b border-white/10 shrink-0 transition-all duration-300
            ${isOpen ? "px-4 gap-3 justify-between" : "flex-col justify-center px-0 gap-0"}`}
        >
          {isOpen && (
            <div className="flex items-center gap-2.5">
              <Activity size={18} className="text-white shrink-0" />
              <span className="text-white font-black text-[15px] tracking-tight whitespace-nowrap">
                Admin Panel
              </span>
            </div>
          )}

          <button
            onClick={onMenuToggle}
            className={`text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all
              ${isOpen ? "p-1.5" : "p-2 w-full flex justify-center"}`}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                title={!isOpen ? label : undefined}
                className={`w-full flex items-center py-3 rounded-xl transition-all duration-200
                  ${isOpen ? "gap-3 px-4" : "justify-center px-0"}
                  ${
                    active
                      ? "bg-white text-[#111111] shadow-lg shadow-black/20"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={18} className="shrink-0" />
                {isOpen && (
                  <span className="text-[14px] font-bold whitespace-nowrap">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
