import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ToastContainer from "./Toast";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-bg">
      <div
        className={`no-print fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="no-print fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="print-body flex-1 flex flex-col min-w-0">
        <div className="no-print">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="print-main flex-1 p-4 md:p-6 overflow-auto">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}