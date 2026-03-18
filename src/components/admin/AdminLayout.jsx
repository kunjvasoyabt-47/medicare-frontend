import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return false;
    const saved = sessionStorage.getItem("admin_sidebar");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    sessionStorage.setItem("admin_sidebar", String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <AdminNavbar
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
      />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
      />
      <main
        className={`pt-14 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}
      >
        <div className="p-5 md:p-7 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
