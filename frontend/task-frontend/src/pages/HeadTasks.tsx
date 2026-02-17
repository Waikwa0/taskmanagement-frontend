// HeadTasks.tsx
import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig";

// --- Types ---
interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo?: number | null;
  assigned_user_name?: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
  team?: string;
  project?: string;
}

interface User {
  id: number;
  username: string;
  role?: {
    id: number;
    name: string;
  } | null;
}

interface Role {
  id: number;
  name: string;
}

interface FormState {
  title: string;
  description: string;
  assigned_user_id: number;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
  team: string;
  project: string;
}

const HeadTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    assigned_user_id: 0,
    dueDate: "",
    status: "Pending",
    team: "",
    project: "",
  });

  const [teamFilter, setTeamFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, usersRes, rolesRes] = await Promise.all([
          axios.get<Task[]>("http://localhost:8080/api/tasks"),
          axios.get<User[]>("http://localhost:8081/api/users"),
          axios.get<Role[]>("http://localhost:8081/api/roles"),
        ]);

        const mappedTasks = tasksRes.data.map((task) => {
          const assignedUser = usersRes.data.find((u) => u.id === task.assignedTo);
          return {
            ...task,
            assigned_user_name: assignedUser
              ? `${assignedUser.username} (${assignedUser.role?.name ?? "No Role"})`
              : "Unassigned",
            dueDate: task.dueDate.split("T")[0],
            team: task.team ?? "",
            project: task.project ?? "",
          };
        });

        setTasks(mappedTasks);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Unique teams/projects for filters
  const uniqueTeams = Array.from(new Set(tasks.map((t) => t.team).filter(Boolean)));
  const uniqueProjects = Array.from(new Set(tasks.map((t) => t.project).filter(Boolean)));

  // --- Handlers ---
  const handleAdd = () => {
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      assigned_user_id: 0,
      dueDate: "",
      status: "Pending",
      team: "",
      project: "",
    });
    setShowModal(true);
  };

  const handleEdit = (task: Task) => {
    const assignedUser = users.find((u) => u.id === task.assignedTo);
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      assigned_user_id: assignedUser?.id || 0,
      dueDate: task.dueDate,
      status: task.status,
      team: task.team ?? "",
      project: task.project ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.dueDate) return alert("Title and Due Date are required");

    const payload = {
      title: form.title,
      description: form.description,
      assignedTo: form.assigned_user_id || null,
      dueDate: form.dueDate,
      status: form.status,
      team: form.team || null,
      project: form.project || null,
    };

    try {
      if (editingTask) {
        const res = await axios.put(`http://localhost:8080/api/tasks/${editingTask.id}`, payload);

        // Map updated task so table shows correctly
        const assignedUser = users.find((u) => u.id === res.data.assignedTo);
        const updatedTask: Task = {
          ...res.data,
          assigned_user_name: assignedUser
            ? `${assignedUser.username} (${assignedUser.role?.name ?? "No Role"})`
            : "Unassigned",
          dueDate: res.data.dueDate.split("T")[0],
          team: res.data.team ?? "",
          project: res.data.project ?? "",
        };

        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updatedTask : t))
        );
      } else {
        const res = await axios.post("http://localhost:8080/api/tasks", payload);

        const assignedUser = users.find((u) => u.id === res.data.assignedTo);
        const newTask: Task = {
          ...res.data,
          assigned_user_name: assignedUser
            ? `${assignedUser.username} (${assignedUser.role?.name ?? "No Role"})`
            : "Unassigned",
          dueDate: res.data.dueDate.split("T")[0],
          team: res.data.team ?? "",
          project: res.data.project ?? "",
        };

        setTasks((prev) => [...prev, newTask]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save task");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete task");
    }
  };

  const getUserLabel = (user: User) => `${user.username} (${user.role?.name ?? "No Role"})`;

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-extrabold">Task Management</h1>
        <button onClick={handleAdd} className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800">
          + Create Task
        </button>
      </div>

      {/* --- FILTER DROPDOWNS --- */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block mb-1 font-semibold">Team</label>
          <select
            className="border rounded-lg p-2"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">All Teams</option>
            {uniqueTeams.map((team) => (
              <option key={team} value={team || ""}>{team}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Project</label>
          <select
            className="border rounded-lg p-2"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project || ""}>{project}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- TASK TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Assignee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Team</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Project</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks
              .filter(
                (task) =>
                  (!teamFilter || task.team === teamFilter) &&
                  (!projectFilter || task.project === projectFilter)
              )
              .map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{task.title}</td>
                  <td className="px-6 py-4">{task.assigned_user_name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{task.dueDate}</td>
                  <td className="px-6 py-4">{task.team || "—"}</td>
                  <td className="px-6 py-4">{task.project || "—"}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => handleEdit(task)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold">{editingTask ? "Edit Task" : "New Task"}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Description</label>
                <textarea
                  className="w-full border p-2 rounded-lg h-24 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Assign To</label>
                  <select
                    className="w-full border p-2 rounded-lg outline-none"
                    value={String(form.assigned_user_id)}
                    onChange={(e) =>
                      setForm({ ...form, assigned_user_id: Number(e.target.value) })
                    }
                  >
                    <option value="0">Select User</option>
                    {users.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {getUserLabel(u)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Due Date</label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded-lg outline-none"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Team</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.team}
                    onChange={(e) => setForm({ ...form, team: e.target.value })}
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Project</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Status</label>
                <select
                  className="w-full border p-2 rounded-lg outline-none"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as "Pending" | "In Progress" | "Completed" })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadTasks;
