// HeadDashboardLayout.tsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NcbaLogo from "../assets/ncba-logo.webp";

const HeadDashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 flex flex-col items-center">
          <img
            src={NcbaLogo}
            alt="NCBA Logo"
            className="w-32 h-auto mb-4"
          />
          <div className="text-xl font-bold text-center">NCBA Task Manager</div>
        </div>

        <nav className="flex flex-col gap-2 p-4 flex-1">
          <button
            className="py-2 px-4 hover:bg-gray-800 rounded text-left"
            onClick={() => navigate("/head-dashboard/users")}
          >
            User Management
          </button>
          <button
            className="py-2 px-4 hover:bg-gray-800 rounded text-left"
            onClick={() => navigate("/head-dashboard/tasks")}
          >
            Tasks
          </button>
          <button
            className="py-2 px-4 hover:bg-gray-800 rounded text-left"
            onClick={() => navigate("/head-dashboard/analytics")}
          >
            Analytics
          </button>
          <button
            className="py-2 px-4 hover:bg-gray-800 rounded text-left mt-auto"
            onClick={() => navigate("/login")}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default HeadDashboardLayout;
