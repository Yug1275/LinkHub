import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";

const FocusMode = ({ categories = [] }) => {
  const { theme, settings, updateSettings } = useContext(ThemeContext);
  const { focusCategories = [] } = settings;

  const toggleCategory = (cat) => {
    const updated = focusCategories.includes(cat)
      ? focusCategories.filter(c => c !== cat)
      : [...focusCategories, cat];
    updateSettings({ focusCategories: updated });
  };

  const clearFocus = () => {
    updateSettings({ focusCategories: [] });
  };

  if (categories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className={`text-xs font-medium mr-1 ${
        theme === "dark" ? "text-gray-500" : "text-gray-400"
      }`}>
        🎯 Focus:
      </span>

      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => toggleCategory(cat)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            focusCategories.includes(cat)
              ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
              : theme === "dark"
                ? "bg-white/5 text-gray-500 hover:bg-white/10 border border-transparent"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 border border-transparent"
          }`}
        >
          {cat}
        </button>
      ))}

      {focusCategories.length > 0 && (
        <button
          onClick={clearFocus}
          className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
            theme === "dark"
              ? "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          Clear
        </button>
      )}
    </motion.div>
  );
};

export default FocusMode;
