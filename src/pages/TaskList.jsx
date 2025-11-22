import React, { useEffect, useState } from "react";
import axios from "axios";
import TaskForm from "../components/TaskForm";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const addTask = async (task) => {
    try {
      const res = await axios.post("http://localhost:5000/api/tasks", task);
      setTasks((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-md">
      <TaskForm onAdd={addTask} />
      <ul className="mt-6 space-y-3">
        {tasks.length === 0 ? (
          <li className="text-gray-500 text-center">No tasks yet.</li>
        ) : (
          tasks.map((task) => (
            <li
              key={task._id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
              <button
                onClick={() => deleteTask(task._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}