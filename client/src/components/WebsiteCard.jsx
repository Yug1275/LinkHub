import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";

const WebsiteCard = ({ site, index, moveCard, onDelete, theme, iconStyleClasses, category }) => {
  const ref = useRef(null);
  const dragType = `CARD-${category}`;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: dragType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [index, dragType]);

  const [, drop] = useDrop(() => ({
    accept: dragType,
    hover(item) {
      if (item.index === index) return;
      moveCard(item.index, index);
      item.index = index;
    },
  }), [index, dragType, moveCard]);

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex flex-col items-center gap-2 group cursor-move"
    >
      <a
        href={site.url}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center gap-2 w-full"
        onClick={(e) => isDragging && e.preventDefault()}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`w-12 h-12 sm:w-14 sm:h-14 ${iconStyleClasses} flex items-center justify-center transition-all duration-200 ${
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
  );
};

export default WebsiteCard;