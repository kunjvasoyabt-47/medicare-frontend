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

  const handleMenuToggle = () => {
    setSidebarOpen((o) => !o);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <AdminNavbar sidebarOpen={sidebarOpen} onMenuToggle={handleMenuToggle} />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onMenuToggle={handleMenuToggle}
      />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? "pl-64" : "pl-0"
          }`}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
