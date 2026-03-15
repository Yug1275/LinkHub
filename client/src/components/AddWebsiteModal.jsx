import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const AddWebsiteModal = ({ onAdd }) => {
  const { theme } = useContext(ThemeContext);

  const [form, setForm] = useState({ url: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url) return;

    setLoading(true);
    setError("");

    try {
      const meta = await API.post("/metadata", { url: form.url });

      const res = await API.post("/websites", {
        url: form.url,
        name: meta.data.title || new URL(form.url).hostname,
        icon: meta.data.favicon,
        category: form.category || "General",
      });

      onAdd(res.data);
      setForm({ url: "", category: "" });
    } catch (err) {
      setError("Failed to add website. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
          theme === "dark" ? "glass-card" : "glass-card-light"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              name="url"
              placeholder="Paste website URL (https://...)"
              value={form.url}
              onChange={handleChange}
              className={`input-base text-sm ${
                theme === "dark" ? "input-dark" : "input-light"
              }`}
            />
          </div>

          <div className="sm:w-48">
            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              className={`input-base text-sm ${
                theme === "dark" ? "input-dark" : "input-light"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.url}
            className="btn-primary text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-xs mt-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default AddWebsiteModal;