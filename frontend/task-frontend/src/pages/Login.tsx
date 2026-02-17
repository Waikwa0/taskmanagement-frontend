import React, { useState } from "react";
import axios from "../utils/AxiosConfig"; 
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const user = response.data;

      // Save JWT token
      localStorage.setItem("token", user.token);

      // Save full user info 
      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role?.toString().toUpperCase();
      console.log("User role from backend:", user.role, "Normalized role:", role);

      switch (role) {
        case "HEAD":
          navigate("/head-dashboard");
          break;
        case "SENIOR_MANAGER":
          navigate("/manager-dashboard");
          break;
        case "DEVELOPER":
          navigate("/developer-dashboard");
          break;
        default:
          navigate("/developer-dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError("Login failed. Please check your email or password.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background Image */}
      <img
        src="https://play-lh.googleusercontent.com/81w7kSItx2G-kPPOwgVwl_6sXO-R3KBWFyTfmRVwHLKRp-4imBFPc1Q7112fZHgrWUv_"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-30 filter blur-sm"
      />

      {/* Login Form */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-8 z-10">
        <div className="flex justify-center mb-6">
          <img
            src="https://prestigeplaza.co.ke/cdn/shop/files/NCBABank.png?v=1740440087"
            alt="NCBA Bank Logo"
            className="h-24 object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-black text-center mb-2">
          Task Management System
        </h1>

        <p className="text-sm text-gray-600 text-center mb-8">
          NCBA Internal Access
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@ncbagroup.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-black"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-900 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          © {new Date().getFullYear()} NCBA Group
        </p>
      </div>
    </div>
  );
};

export default Login;
