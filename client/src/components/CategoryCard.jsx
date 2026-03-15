import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";

const CategoryCard = ({ category, websites, onDelete }) => {
  const { theme, settings } = useContext(ThemeContext);

  const getIconStyleClasses = () => {
    switch (settings.iconStyle) {
      case "square": return "rounded-none";
      case "circle": return "rounded-full";
      case "glass": return "rounded-xl backdrop-blur-md bg-white/5 border border-white/10";
      case "rounded":
      default: return "rounded-xl";
    }
  };

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
            {websites.length} {websites.length === 1 ? "website" : "websites"}
          </p>
        </div>
        <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          theme === "dark"
            ? "bg-violet-500/20 text-violet-300"
            : "bg-violet-100 text-violet-600"
        }`}>
          {websites.length}
        </div>
      </div>

      {/* Website Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {websites.map((site, index) => (
          <motion.div
            key={site._id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex flex-col items-center gap-2 group"
          >
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 w-full"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 ${getIconStyleClasses()} flex items-center justify-center transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <img
                  src={site.icon}
                  alt={site.name}
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  onError={(e) => {
                    e.target.src = `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`;
                  }}
                />
              </motion.div>

              <p className={`text-xs text-center font-medium truncate w-full ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                {site.name}
              </p>
            </a>

            <button
              onClick={() => onDelete(site._id)}
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryCard;