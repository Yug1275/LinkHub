import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const noteColors = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Purple", value: "#ddd6fe" },
  { label: "Orange", value: "#fed7aa" },
];

const NotesWidget = () => {
  const { theme } = useContext(ThemeContext);
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", color: "#fef08a" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const res = await API.put(`/notes/${editing}`, form);
        setNotes(notes.map(n => n._id === editing ? res.data : n));
      } else {
        const res = await API.post("/notes", form);
        setNotes([res.data, ...notes]);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const handleEdit = (note) => {
    setForm({ title: note.title, content: note.content, color: note.color });
    setEditing(note._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const resetForm = () => {
    setForm({ title: "", content: "", color: "#fef08a" });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-5 sm:p-6 ${
        theme === "dark" ? "glass-card" : "glass-card-light"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>📝 Notes</h3>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`p-1.5 rounded-lg transition-colors ${
            theme === "dark" ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg text-sm mb-2 ${
                theme === "dark" ? "bg-white/10 text-white placeholder-gray-400 border border-white/10" : "bg-gray-50 text-gray-900 border border-gray-200"
              }`}
            />
            <textarea
              placeholder="Write something..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg text-sm mb-2 resize-none ${
                theme === "dark" ? "bg-white/10 text-white placeholder-gray-400 border border-white/10" : "bg-gray-50 text-gray-900 border border-gray-200"
              }`}
            />
            <div className="flex items-center gap-2 mb-2">
              {noteColors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-6 h-6 rounded-full transition-all ${
                    form.color === c.value ? "ring-2 ring-violet-500 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary text-xs py-2 px-4 flex-1">
                {editing ? "Update" : "Add Note"}
              </button>
              <button onClick={resetForm} className={`btn-secondary text-xs py-2 px-3 ${
                theme === "dark" ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"
              }`}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {notes.map(note => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="rounded-xl p-3 group cursor-pointer"
              style={{ backgroundColor: note.color + "40" }}
              onClick={() => handleEdit(note)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {note.title && (
                    <p className={`text-xs font-semibold truncate ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>{note.title}</p>
                  )}
                  <p className={`text-xs line-clamp-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>{note.content}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && !showForm && (
          <p className={`text-xs text-center py-3 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`}>
            No notes yet. Click + to add one.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default NotesWidget;
