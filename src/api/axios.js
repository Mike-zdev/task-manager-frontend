import axios from "axios";

const api = axios.create({
  baseURL: "https://task-manager-backend-33pj.onrender.com/api",
});

export default api;