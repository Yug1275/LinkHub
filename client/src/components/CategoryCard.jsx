import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import WebsiteCard from "./WebsiteCard";

const CategoryCard = ({
  category,
  websites,
  onDelete,
  onReorder,
  onDeleteCategory,
  index,
  moveCategory,
}) => {
  const { theme, settings } = useContext(ThemeContext);
  const [localWebsites, setLocalWebsites] = useState(websites);
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CATEGORY",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "CATEGORY",
      hover(item, monitor) {
        if (!ref.current) return;

        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only move when cursor passes half the card height to prevent rapid swapping.
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        moveCategory(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    }),
    [index, moveCategory]
  );

  drag(drop(ref));

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
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 cursor-move ${
        theme === "dark"
          ? "glass-card hover:border-white/30"
          : "glass-card-light hover:shadow-xl hover:border-gray-300/50"
      }`}
    >
      <button
        onClick={() => onDeleteCategory(category)}
        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
          theme === "dark"
            ? "bg-white/10 border-white/10 text-gray-200 hover:bg-red-500/20 hover:border-red-400/40 hover:text-red-200"
            : "bg-white/70 border-gray-200 text-gray-600 hover:bg-red-100 hover:border-red-300 hover:text-red-600"
        }`}
        aria-label={`Delete ${category} category`}
        title="Delete category"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 6V4.75A1.75 1.75 0 019.75 3h4.5A1.75 1.75 0 0116 4.75V6"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pr-10">
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