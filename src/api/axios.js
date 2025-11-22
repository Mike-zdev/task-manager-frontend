import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // make sure backend is on this port
});

export default api;