import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import api from "./api/axios";

export default function App() {
  const [tasks, setTasks] = useState([]);

  async function reloadTasks() {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  }

  useEffect(() => {
    reloadTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        📝 Task Manager
      </h1>

      <TaskForm onTaskAdded={reloadTasks} />
      <TaskList tasks={tasks} reloadTasks={reloadTasks} />
    </div>
  );
}