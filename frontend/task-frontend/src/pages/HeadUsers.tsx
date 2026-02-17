// HeadUsers.tsx
import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig";

// --- Types ---
interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  role?: {
    id: number;
    name: string;
  } | null;
  roleId?: number | null; // Local state for select dropdown
}

const HeadUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get<User[]>("http://localhost:8081/api/users"),
          axios.get<Role[]>("http://localhost:8081/api/roles"),
        ]);

        const mappedUsers = usersRes.data.map((user) => ({
          ...user,
          roleId: user.role?.id || null,
        }));

        setUsers(mappedUsers);
        setRoles(rolesRes.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = (userId: number, newRoleId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roleId: newRoleId } : u))
    );
  };

  const saveRole = async (userId: number, roleId: number) => {
    try {
      await axios.put(`http://localhost:8081/api/users/${userId}/role`, { role_id: roleId });
      alert("Role updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.roleId || ""}
                    onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => saveRole(user.id, user.roleId ?? 0)}
                    className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HeadUsers;
