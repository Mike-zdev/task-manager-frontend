import { useState } from "react";
import api from "../api/axios";

export default function TaskList({ tasks, reloadTasks }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    subtasks: [],
    status: "todo",
  });

  const [filterStatus, setFilterStatus] = useState("all"); // all, todo, in-progress, done
  const [sortBy, setSortBy] = useState("none"); // none, priority, dueDate

  // --- Edit Handlers ---
  function startEdit(task) {
    setEditingId(task._id);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      subtasks: (task.subtasks || []).map((s) => ({ ...s })),
      status: task.status || "todo",
    });
  }

  function editAddSubtask() {
    setEditForm((f) => ({
      ...f,
      subtasks: [...f.subtasks, { title: "", done: false }],
    }));
  }

  function editRemoveSubtask(i) {
    setEditForm((f) => ({
      ...f,
      subtasks: f.subtasks.filter((_, index) => index !== i),
    }));
  }

  function editToggleSubtask(i) {
    setEditForm((f) => ({
      ...f,
      subtasks: f.subtasks.map((s, index) =>
        index === i ? { ...s, done: !s.done } : s
      ),
    }));
  }

  function editChangeSubtaskTitle(i, title) {
    setEditForm((f) => ({
      ...f,
      subtasks: f.subtasks.map((s, index) =>
        index === i ? { ...s, title } : s
      ),
    }));
  }

  async function saveEdit(id) {
    try {
      await api.put(`/tasks/${id}`, editForm);
      reloadTasks();
      setEditingId(null);
    } catch (err) {
      console.error("Save edit error", err);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/tasks/${id}`);
      reloadTasks();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  async function handleStatusChange(task, newStatus) {
    try {
      await api.put(`/tasks/${task._id}`, { ...task, status: newStatus });
      reloadTasks();
    } catch (err) {
      console.error("Status update failed", err);
    }
  }

  const statusClasses = {
    todo: "bg-blue-100 text-blue-800",
    "in-progress": "bg-orange-100 text-orange-800",
    done: "bg-green-100 text-green-800",
  };

  // --- Filtering & Sorting ---
  const filteredTasks =
    filterStatus === "all"
      ? tasks
      : tasks.filter((t) => t.status === filterStatus);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const order = { high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return 0;
  });

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-3">
      {/* Filter & Sort Controls */}
      <div className="flex gap-3 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="none">No Sorting</option>
          <option value="priority">Sort by Priority</option>
          <option value="dueDate">Sort by Due Date</option>
        </select>
      </div>

      {sortedTasks.map((task) => (
        <div key={task._id} className="bg-white p-4 rounded shadow-sm border">
          {editingId === task._id ? (
            // === EDIT MODE ===
            <div className="space-y-3">
              <input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full border px-3 py-2 h-24"
              />

              <div className="flex gap-3">
                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  className="border px-3 py-2 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="border px-3 py-2 rounded"
                />
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="border px-3 py-2 rounded"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Subtasks editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Subtasks</h4>
                  <button
                    type="button"
                    onClick={editAddSubtask}
                    className="text-sm px-2 py-1 bg-gray-200 rounded"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {editForm.subtasks.map((st, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!st.done}
                        onChange={() => editToggleSubtask(i)}
                      />
                      <input
                        value={st.title}
                        onChange={(e) => editChangeSubtaskTitle(i, e.target.value)}
                        className="flex-1 border px-2 py-1 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => editRemoveSubtask(i)}
                        className="text-red-600 px-2"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(task._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // === DISPLAY MODE ===
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={(e) =>
                      handleStatusChange(task, e.target.checked ? "done" : "todo")
                    }
                    className="w-5 h-5"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    {/* Show Priority or Due Date based on sort */}
                    {sortBy === "priority" && (
                      <p className="text-sm text-gray-500">Priority: {task.priority}</p>
                    )}
                    {sortBy === "dueDate" && task.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${statusClasses[task.status]}`}
                  >
                    {task.status.replace("-", " ")}
                  </span>

                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className="border px-2 py-1 rounded text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>

                  <button
                    onClick={() => startEdit(task)}
                    className="text-blue-600 px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-red-600 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Subtasks as checkboxes */}
              {task.subtasks?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {task.subtasks.map((s, i) => (
                    <label key={i} className="flex items-center gap-2">
                      <span>{s.title}</span>
                      <input
                        type="checkbox"
                        checked={s.done}
                        onChange={async () => {
                          try {
                            const updatedSubtasks = task.subtasks.map((st, idx) =>
                              idx === i ? { ...st, done: !st.done } : st
                            );
                            await api.put(`/tasks/${task._id}`, {
                              ...task,
                              subtasks: updatedSubtasks,
                            });
                            reloadTasks();
                          } catch (err) {
                            console.error("Subtask update failed", err);
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}