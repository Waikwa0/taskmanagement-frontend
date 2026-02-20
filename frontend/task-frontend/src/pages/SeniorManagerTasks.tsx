import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig";

interface Task {
  id: number;
  title: string;
  description: string;
  project?: string;
  team?: string;
  dueDate?: string;
  status?: string;
  assignedTo?: number;
}

interface User {
  id: number;
  username: string;
  role: {
    id: number;
    name: string;
  };
}

interface Comment {
  id: number;
  taskId: number;
  content: string;
  createdBy: string;
}

const SeniorManagerTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState("");
  const [project, setProject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | "">("");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks");
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      const relevantUsers = res.data.filter((u: User) =>
        ["DEVELOPER", "HEAD", "SENIOR_MANAGER"].includes(u.role?.name)
      );
      setUsers(relevantUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

    // Fetch comments
    const fetchComments = async () => {
      try {
        const res = await axios.get("/api/comments"); // <-- use backticks
        setComments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };


  useEffect(() => {
    const loadData = async () => {
      await fetchTasks();
      await fetchUsers();
      await fetchComments();
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo) {
      alert("Assign a user first");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, {
          title,
          description,
          team,
          project,
          dueDate,
          assignedTo,
        });
      } else {
        await axios.post("/api/tasks", {
          title,
          description,
          team,
          project,
          dueDate,
          createdBy: user.id,
          assignedTo,
          status: "PENDING",
        });
      }

      resetForm();
      fetchTasks();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setTeam(task.team || "");
    setProject(task.project || "");
    setDueDate(task.dueDate || "");
    setAssignedTo(task.assignedTo || "");
  };

  const resetForm = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setTeam("");
    setProject("");
    setDueDate("");
    setAssignedTo("");
  };

  const updateStatus = async (taskId: number, status: string) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const getUserName = (id?: number) => {
    if (!id) return "Unassigned";
    const user = users.find((u) => u.id === Number(id));
    return user ? `${user.username} (${user.role.name})` : "User not found";
  };

  const handleAddComment = async (taskId: number) => {
    if (!newComment.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.post("/api/comments", {
        taskId,
        content: newComment,
        createdBy: user.username,
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Add comment failed:", err);
    }
  };

  // Filter tasks based on search, team, and project
  const filteredTasks = tasks.filter(
    (task) =>
      (`${task.title} ${task.description} ${task.project} ${task.team}`)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filterTeam ? task.team === filterTeam : true) &&
      (filterProject ? task.project === filterProject : true)
  );

  // Extract unique teams and projects for filter dropdowns
  const uniqueTeams = Array.from(new Set(tasks.map((t) => t.team).filter(Boolean)));
  const uniqueProjects = Array.from(
    new Set(tasks.map((t) => t.project).filter(Boolean))
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Senior Manager Dashboard</h1>

      {/* SEARCH & FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
        />

        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Teams</option>
          {uniqueTeams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Projects</option>
          {uniqueProjects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* TASK FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingTask ? "Edit Task" : "Create Task"}
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="Team"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="Project"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <select
          value={assignedTo}
          onChange={(e) =>
            setAssignedTo(e.target.value ? Number(e.target.value) : "")
          }
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Assign User</option>
          {["HEAD", "SENIOR_MANAGER", "DEVELOPER"].map((role) => (
            <optgroup key={role} label={role}>
              {users
                .filter((u) => u.role?.name === role)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-black text-white rounded">
            {editingTask ? "Update Task" : "Create Task"}
          </button>

          {editingTask && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* TASK LIST */}
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Tasks</h2>

        {filteredTasks.length === 0 ? (
          <p className="text-gray-500">No tasks found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredTasks.map((task) => (
              <li key={task.id} className="border p-3 rounded space-y-2">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p>{task.description}</p>
                  <p className="text-sm text-gray-500">
                    👤 Assigned: {getUserName(task.assignedTo)} <br />
                    Team: {task.team || "N/A"} | Project: {task.project || "N/A"}
                    <br />
                    Due: {task.dueDate || "N/A"}
                  </p>
                </div>

                {/* STATUS & ACTIONS */}
                <div className="flex gap-3 mt-2">
                  <select
                    value={task.status || "PENDING"}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <button
                    onClick={() => handleEdit(task)}
                    className="px-3 py-1 text-sm bg-gray-200 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>

                {/* COMMENTS SECTION */}
                <div className="mt-3 border-t pt-2 space-y-2">
                  <p className="font-semibold">Comments:</p>
                  {comments
                    .filter((c) => c.taskId === task.id)
                    .map((c) => (
                      <p key={c.id} className="text-sm text-gray-700">
                        {c.createdBy}: {c.content}
                      </p>
                    ))}

                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add comment..."
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => handleAddComment(task.id)}
                      className="px-3 py-1 bg-black text-white rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SeniorManagerTasks;
