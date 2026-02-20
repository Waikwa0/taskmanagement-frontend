// src/components/TaskComments.tsx
import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig";

interface Comment {
  id: number;
  task_id: number;
  commented_by: number;
  comment_text: string;
  created_at: string;
  user_name?: string;
}

interface User {
  id: number;
  username: string;
}

interface TaskCommentsProps {
  taskId: number;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get<Comment[]>(`/api/taskcomments/${taskId}`);
      const mappedComments = res.data.map((c) => {
        const user = users.find((u) => u.id === c.commented_by);
        return { ...c, user_name: user?.username || "Unknown" };
      });
      setComments(mappedComments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) fetchComments();
  }, [users]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        task_id: taskId,
        commented_by: user.id,
        comment_text: newComment,
      };

      const res = await axios.post("/api/taskcomments", payload);

      setComments((prev) => [
        ...prev,
        { ...res.data, user_name: user.username },
      ]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  if (loading) return <p>Loading comments...</p>;

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold mb-2">Comments</h3>
      {comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="border p-2 rounded">
              <p className="text-sm">{c.comment_text}</p>
              <p className="text-xs text-gray-500">
                {c.user_name} • {new Date(c.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default TaskComments;
