import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, History, Activity } from "lucide-react";

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
    if (path === "/admin/patients")
      return (
        location.pathname === "/admin/patients" ||
        location.pathname.startsWith("/admin/patient/")
      );
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? "w-64 translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: "#0f172a",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="h-14 flex items-center px-4 gap-3 border-b shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Activity size={16} className="text-slate-400 shrink-0" />
          <span
            className="text-white text-[14px] whitespace-nowrap"
            style={{ fontWeight: 600 }}
          >
            Admin Panel
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-150 text-left
                  ${active ? "bg-white text-slate-900" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}
              >
                <Icon size={16} className="shrink-0" />
                <span
                  className="text-[13px] whitespace-nowrap"
                  style={{ fontWeight: active ? 600 : 400 }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
