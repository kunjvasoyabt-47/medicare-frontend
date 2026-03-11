import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // On mobile default closed; on desktop restore last preference (default open)
    if (window.innerWidth < 1024) return false;
    const saved = sessionStorage.getItem("admin_sidebar");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    sessionStorage.setItem("admin_sidebar", String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <AdminNavbar sidebarOpen={sidebarOpen} />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
      />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-64" : "lg:pl-16"
          }`}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
