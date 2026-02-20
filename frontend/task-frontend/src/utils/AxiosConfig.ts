import axios from "axios";

const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Attach JWT token
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Dynamically choose backend service
    if (config.url?.startsWith("/api/tasks")) {
      config.baseURL = "http://localhost:8080"; // Task service
    } 
    else if (config.url?.startsWith("/api/comments")) {
      config.baseURL = "http://localhost:8080"; // Comments service (same as task service)
    }

     else if (config.url?.startsWith("/api/subtasks")) {
      config.baseURL = "http://localhost:8080"; // Task service
    }
    else if (
      config.url?.startsWith("/api/users") ||
      config.url?.startsWith("/api/roles") ||
      config.url?.startsWith("/api/auth")
    ) {
      config.baseURL = "http://localhost:8081"; // User/Auth service
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional response interceptor (central error logging)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
