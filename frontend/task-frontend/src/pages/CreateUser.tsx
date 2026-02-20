// CreateUser.tsx
import React, { useState } from "react";
import axios from "../utils/AxiosConfig"; 

const CreateUser: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("DEVELOPER");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Send JSON in the shape of CreateUserDto
      await axios.post("/api/users", {
        username,
        email,
        password,
        roleName,
      });

      setSuccess("User created successfully!");
      // Reset form
      setUsername("");
      setEmail("");
      setRoleName("DEVELOPER");
      setPassword("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create user.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create New User</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Role</label>
          <select
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="DEVELOPER">Developer</option>
            <option value="SENIOR_MANAGER">Senior Manager</option>
            <option value="HEAD">Head</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-900"
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
