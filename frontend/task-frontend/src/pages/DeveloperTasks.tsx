import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  assignedTo: string;
}

interface Comment {
  id: number;
  taskId: number;
  content: string;
  createdBy: string;
}

const DeveloperTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTasks = async () => {
    try {
      if (!user.id) return;

      const res = await axios.get(`/api/tasks/assignedTo/${user.id}`);
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get("/api/comments");
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchComments();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const res = await axios.patch(`/api/tasks/${taskId}/status`, null, {
        params: { status: newStatus },
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.data : t))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const goToSubtasks = (taskId: number) => {
    navigate(`/developer-dashboard/subtasks/${taskId}`);
  };

  const handleAddComment = async (taskId: number) => {
    if (!newComment.trim()) return;

    try {
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

  // Filter tasks based on search
  const filteredTasks = tasks.filter(
    (task) =>
      `${task.title} ${task.description} ${task.status}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading) return <p>Loading tasks...</p>;
  if (tasks.length === 0) return <p>No tasks assigned yet.</p>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">My Tasks</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <ul className="space-y-3">
        {filteredTasks.map((task) => (
          <li key={task.id} className="border p-4 rounded shadow space-y-2">
            <div>
              <h2 className="font-semibold">{task.title}</h2>
              <p>{task.description}</p>
              <p className="text-sm text-gray-500">Created By: {task.createdBy}</p>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-gray-500">Status: {task.status}</p>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* SUBTASKS BUTTON */}
            <button
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => goToSubtasks(task.id)}
            >
              View Subtasks
            </button>

            {/* COMMENTS */}
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
    </div>
  );
};

export default DeveloperTasks;
