import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig"; // your configured Axios instance
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  assignedTo: string;
}

const DeveloperTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return;

      const res = await axios.get(`/api/tasks/assignedTo/${user.id}`);
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const goToSubtasks = (taskId: number) => {
    navigate(`/developer-dashboard/subtasks/${taskId}`);
  };

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

  if (loading) return <p>Loading tasks...</p>;
  if (tasks.length === 0) return <p>No tasks assigned yet.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="border p-4 mb-2 rounded shadow">
            <h2 className="font-semibold">{task.title}</h2>
            <p>{task.description}</p>

            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">Status: {task.status}</p>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className="border p-1 rounded"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => goToSubtasks(task.id)}
            >
              View Subtasks
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeveloperTasks;
