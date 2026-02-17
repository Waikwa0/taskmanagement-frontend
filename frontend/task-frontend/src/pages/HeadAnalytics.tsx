import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Task {
  id: number;
  title: string;
  status: string;
  team?: string | null;
  project?: string | null;
  createdBy?: number | null;
  assignedTo?: number | null;
  createdByRole?: string;
  assignedToRole?: string;
}

interface User {
  id: number;
  username: string;
  role?: { name: string };
}

const COLORS = ["#22c55e", "#facc15", "#3b82f6"];

const HeadAnalytics: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tasksRes, rolesRes] = await Promise.all([
          axios.get("http://localhost:8081/api/users"),
          axios.get("http://localhost:8080/api/tasks"),
          axios.get("http://localhost:8081/api/roles"),
        ]);

        setUsers(usersRes.data);
        setRoles(["ALL", ...rolesRes.data.map((r: any) => r.name)]);

        // Map user IDs to roles
        const userRoleMap: Record<number, string> = {};
        usersRes.data.forEach((u: User) => {
          userRoleMap[u.id] = u.role?.name || "UNKNOWN";
        });

        // Map tasks to include roles
        const tasksWithRoles: Task[] = tasksRes.data.map((t: any) => ({
          ...t,
          status: t.status.toUpperCase(),
          createdByRole: t.createdBy ? userRoleMap[t.createdBy] : "UNKNOWN",
          assignedToRole: t.assignedTo ? userRoleMap[t.assignedTo] : "UNKNOWN",
        }));

        setTasks(tasksWithRoles);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };

    fetchData();
  }, []);

  // Get unique teams and projects for dropdowns
  const uniqueTeams = Array.from(new Set(tasks.map((t) => t.team).filter(Boolean)));
  const uniqueProjects = Array.from(new Set(tasks.map((t) => t.project).filter(Boolean)));

  // Filter tasks by role, team, and project
  const filteredTasks = tasks.filter((t) => {
    const roleMatch =
      selectedRole === "ALL" || t.createdByRole === selectedRole || t.assignedToRole === selectedRole;
    const teamMatch = !teamFilter || t.team === teamFilter;
    const projectMatch = !projectFilter || t.project === projectFilter;
    return roleMatch && teamMatch && projectMatch;
  });

  // Task counts
  const totalTasks = filteredTasks.length;
  const completed = filteredTasks.filter((t) => t.status === "COMPLETED").length;
  const pending = filteredTasks.filter((t) => t.status === "PENDING").length;
  const inProgress = filteredTasks.filter((t) => t.status === "IN_PROGRESS").length;

  const chartData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
  ];

  // User role counts
  const filteredUsers =
    selectedRole === "ALL" ? users : users.filter((u) => u.role?.name === selectedRole);
  const roleCounts: Record<string, number> = {};
  filteredUsers.forEach((u) => {
    const role = u.role?.name || "UNKNOWN";
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">System Analytics</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Role Filter */}
        <div>
          <label className="font-semibold mr-2">Filter by Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div>
          <label className="font-semibold mr-2">Filter by Team:</label>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Teams</option>
            {uniqueTeams.map((team) => (
              <option key={team ?? ""} value={team ?? ""}>
                {team ?? "—"}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="font-semibold mr-2">Filter by Project:</label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Projects</option>
            {uniqueProjects.map((project) => (
              <option key={project ??"empty"} value={project ?? ""}>
                {project ?? "—"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Tasks" value={totalTasks} />
        <Card title="Completed" value={completed} />
        <Card title="Pending" value={pending} />
        <Card title="In Progress" value={inProgress} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Status Pie Chart */}
        <div className="bg-white shadow rounded-xl p-4 h-96 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Task Status Distribution</h2>
          <div className="flex justify-around w-full mb-4">
            <span className="text-green-600 font-semibold">Completed</span>
            <span className="text-yellow-400 font-semibold">Pending</span>
            <span className="text-blue-500 font-semibold">In Progress</span>
          </div>

          {totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label={false}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 mt-12">No tasks to display</p>
          )}
        </div>

        {/* User Roles */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Roles</h2>
          {Object.keys(roleCounts).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(roleCounts).map(([role, count]) => (
                <li key={role}>
                  {role}: {count}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No users to display</p>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
        {filteredTasks.length > 0 ? (
          <ul className="space-y-2">
            {filteredTasks.slice(0, 5).map((task) => (
              <li key={task.id} className="border-b pb-2">
              <div><strong>Title:</strong> {task.title}</div>
              <div><strong>Status:</strong> {task.status}</div>
              <div><strong>Team:</strong> {task.team}</div>
              <div><strong>Project:</strong> {task.project}</div>
            </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No tasks to display</p>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <p className="text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default HeadAnalytics;
