// src/pages/DeveloperSubtasks.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/AxiosConfig";

interface SubTask {
  id: number;
  title: string;
  description: string;
  status: string;
  comments: string[]; // always array
}

const DeveloperSubtasks: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  // Fetch subtasks
  const fetchSubtasks = async () => {
    if (!taskId) return;
    try {
      const res = await axios.get(`/api/subtasks/task/${taskId}`);
      const subs: SubTask[] = res.data.map((sub: any) => ({
        ...sub,
        comments: Array.isArray(sub.comments) ? sub.comments : [],
      }));
      setSubtasks(subs);
    } catch (err) {
      console.error("Failed to fetch subtasks:", err);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  // Create new subtask
  const handleCreateSubtask = async () => {
    if (!newTitle || !newDescription) return;
    try {
      const res = await axios.post(`/api/subtasks/${taskId}`, {
        title: newTitle,
        description: newDescription,
        status: "PENDING",
      });
      setSubtasks((prev) => [...prev, { ...res.data, comments: [] }]);
      setNewTitle("");
      setNewDescription("");
    } catch (err) {
      console.error("Failed to create subtask:", err);
    }
  };

  // Update subtask status
  const handleStatusChange = async (subtaskId: number, newStatus: string) => {
    try {
      const res = await axios.patch(`/api/subtasks/${subtaskId}/status`, null, {
        params: { status: newStatus },
      });
      setSubtasks((prev) =>
        prev.map((st) => (st.id === subtaskId ? { ...res.data, comments: st.comments } : st))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Add comment
  const handleAddComment = async (subtaskId: number) => {
    const comment = commentInputs[subtaskId];
    if (!comment) return;

    try {
      const res = await axios.post(`/api/subtasks/${subtaskId}/comments`, { comment });
      setSubtasks((prev) =>
        prev.map((st) => (st.id === subtaskId ? { ...res.data, comments: res.data.comments || [] } : st))
      );
      setCommentInputs((prev) => ({ ...prev, [subtaskId]: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Subtasks</h1>

      {/* Create new subtask */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={handleCreateSubtask}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create
        </button>
      </div>

      {/* List subtasks */}
      <div className="flex flex-col gap-4">
        {subtasks.length === 0 && <p>No subtasks yet.</p>}

        {subtasks.map((sub) => (
          <div key={sub.id} className="border p-4 rounded flex flex-col gap-2 shadow">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{sub.title}</h2>
              <select
                value={sub.status}
                onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                className="border p-1"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <p>{sub.description}</p>

            {/* Comment section */}
            <div className="mt-2">
              <input
                type="text"
                placeholder="Add a comment"
                value={commentInputs[sub.id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))
                }
                className="border p-1 w-full"
              />
              <button
                onClick={() => handleAddComment(sub.id)}
                className="mt-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add Comment
              </button>

              {sub.comments.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-gray-600">
                  {sub.comments.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperSubtasks;
