import { useContext, useState, useEffect, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";
import WebsiteCard from "./WebsiteCard";

const CategoryCard = ({ category, websites, onDelete, onReorder }) => {
  const { theme, settings } = useContext(ThemeContext);
  const [localWebsites, setLocalWebsites] = useState(websites);

  // Sync local state when prop changes (e.g. after add/delete)
  useEffect(() => {
    setLocalWebsites(websites);
  }, [websites]);

  const getIconStyleClasses = () => {
    switch (settings.iconStyle) {
      case "square": return "rounded-none";
      case "circle": return "rounded-full";
      case "glass": return "rounded-xl backdrop-blur-md bg-white/5 border border-white/10";
      case "rounded":
      default: return "rounded-xl";
    }
  };

  const moveCard = useCallback((fromIndex, toIndex) => {
    setLocalWebsites((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      if (onReorder) onReorder(category, updated);
      return updated;
    });
  }, [category, onReorder]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
        theme === "dark"
          ? "glass-card hover:border-white/30"
          : "glass-card-light hover:shadow-xl hover:border-gray-300/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            {category}
          </h2>
          <p className={`text-xs mt-0.5 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            {localWebsites.length} {localWebsites.length === 1 ? "website" : "websites"}
          </p>
        </div>
        <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          theme === "dark"
            ? "bg-violet-500/20 text-violet-300"
            : "bg-violet-100 text-violet-600"
        }`}>
          {localWebsites.length}
        </div>
      </div>

      {/* Website Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {localWebsites.map((site, index) => (
          <WebsiteCard
            key={site._id}
            site={site}
            index={index}
            moveCard={moveCard}
            onDelete={onDelete}
            theme={theme}
            iconStyleClasses={getIconStyleClasses()}
            category={category}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryCard;