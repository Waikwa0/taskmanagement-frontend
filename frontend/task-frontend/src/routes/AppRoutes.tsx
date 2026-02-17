// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "../pages/Login";

// Head
import HeadDashboardLayout from "../pages/HeadDashboardLayout";
import HeadUsers from "../pages/HeadUsers";
import HeadTasks from "../pages/HeadTasks";
import HeadAnalytics from "../pages/HeadAnalytics";

// Senior Manager
import SeniorManagerDashboard from "../pages/SeniorManagerDashboard";
import SeniorManagerTasks from "../pages/SeniorManagerTasks";

// Developer
import DeveloperDashboardLayout from "../pages/DeveloperDashboardLayout";
import DeveloperTasks from "../pages/DeveloperTasks";
import DeveloperSubtasks from "../pages/DeveloperSubtasks";

// Get role from localStorage
const getUserRole = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  const parsed = JSON.parse(user);
  return parsed.role;
};

const AppRoutes: React.FC = () => {
  const role = getUserRole();

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          !role ? (
            <Navigate to="/login" />
          ) : role === "HEAD" ? (
            <Navigate to="/head-dashboard/users" />
          ) : role === "SENIOR_MANAGER" ? (
            <Navigate to="/manager-dashboard/tasks" />
          ) : role === "DEVELOPER" ? (
            <Navigate to="/developer-dashboard/tasks" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Head dashboard */}
      <Route path="/head-dashboard" element={<HeadDashboardLayout />}>
        <Route path="users" element={<HeadUsers />} />
        <Route path="tasks" element={<HeadTasks />} />
        <Route path="analytics" element={<HeadAnalytics />} />
        <Route path="" element={<Navigate to="users" />} />
      </Route>

      {/* Senior Manager dashboard */}
      <Route path="/manager-dashboard" element={<SeniorManagerDashboard />}>
        <Route path="tasks" element={<SeniorManagerTasks />} />
        <Route path="" element={<Navigate to="tasks" />} />
      </Route>

      {/* Developer dashboard */}
      <Route path="/developer-dashboard" element={<DeveloperDashboardLayout />}>
        <Route path="tasks" element={<DeveloperTasks />} />
        <Route path="subtasks/:taskId" element={<DeveloperSubtasks />} />
        <Route path="" element={<Navigate to="tasks" />} />
      </Route>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
