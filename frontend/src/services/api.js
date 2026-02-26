import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // crucial for sending JSESSIONID cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
