import { useState } from "react";
import api from "../api/axios";

export default function TaskForm({ onTaskAdded }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setSubtasks([]);
    setShowSubtaskInput(false);
    setNewSubtaskTitle("");
    setOpen(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), done: false }]);
    setNewSubtaskTitle("");
    setShowSubtaskInput(false);
  };

  const handleToggleSubtaskDone = (index) => {
    setSubtasks(subtasks.map((s, i) => (i === index ? { ...s, done: !s.done } : s)));
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = { title, description, priority, dueDate, subtasks, status: "todo" };
    try {
      await api.post("/tasks", payload);
      onTaskAdded();
      resetForm();
    } catch (err) {
      console.error("Create task failed", err);
    }
  };

  return (
    <div className="mb-6 max-w-xl mx-auto">
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setOpen(!open)}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          {open ? "Close Form −" : "Create New Task +"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border p-2 w-full rounded"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <div className="flex gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border p-2 rounded flex-1"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-2 rounded flex-1"
            />
          </div>

          {/* Subtask input */}
          <div>
            {!showSubtaskInput ? (
              <button
                type="button"
                onClick={() => setShowSubtaskInput(true)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                + Add Subtask
              </button>
            ) : (
              <div className="flex gap-2 items-center mt-2">
                <input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Subtask title"
                  className="flex-1 border px-2 py-1 rounded"
                />
                <button type="button" onClick={handleAddSubtask} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSubtaskInput(false); setNewSubtaskTitle(""); }}
                  className="px-2 py-1 border rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            {subtasks.length > 0 && (
              <div className="mt-2 space-y-1">
                {subtasks.map((s, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <span>{s.title}</span>
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() => handleToggleSubtaskDone(i)}
                      className="w-4 h-4"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-red-600 text-sm px-1"
                    >
                      Delete
                    </button>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Add Task
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}