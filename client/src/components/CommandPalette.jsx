import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const CommandPalette = ({ websites = [] }) => {
  const { theme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter websites
  const filtered = websites.filter(site => {
    const q = query.toLowerCase();
    return (
      site.name?.toLowerCase().includes(q) ||
      site.url?.toLowerCase().includes(q) ||
      site.category?.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyNavigation = useCallback((e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      window.open(filtered[selectedIndex].url, "_blank");
      setIsOpen(false);
    }
  }, [filtered, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50"
          >
            <div className={`rounded-2xl overflow-hidden shadow-2xl ${
              theme === "dark"
                ? "bg-gray-900/95 border border-white/10"
                : "bg-white/95 border border-gray-200"
            } backdrop-blur-xl`}>
              {/* Search Input */}
              <div className={`flex items-center gap-3 px-4 py-4 border-b ${
                theme === "dark" ? "border-white/10" : "border-gray-100"
              }`}>
                <svg className={`w-5 h-5 flex-shrink-0 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyNavigation}
                  placeholder="Search websites..."
                  className={`flex-1 bg-transparent border-none outline-none text-sm ${
                    theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                  }`}
                />
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  theme === "dark" ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
                }`}>ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {filtered.length === 0 && query && (
                  <div className={`px-4 py-8 text-center text-sm ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`}>
                    No results found for "{query}"
                  </div>
                )}

                {filtered.length === 0 && !query && (
                  <div className={`px-4 py-8 text-center text-sm ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`}>
                    Type to search your websites...
                  </div>
                )}

                {filtered.map((site, index) => (
                  <button
                    key={site._id}
                    onClick={() => {
                      window.open(site.url, "_blank");
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? theme === "dark"
                          ? "bg-violet-600/20"
                          : "bg-violet-50"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === "dark" ? "bg-white/10" : "bg-gray-100"
                    }`}>
                      <img
                        src={site.icon}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          e.target.src = `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {site.name}
                      </p>
                      <p className={`text-xs truncate ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {site.category} · {site.url}
                      </p>
                    </div>
                    {index === selectedIndex && (
                      <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex-shrink-0 ${
                        theme === "dark" ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
                      }`}>↵</kbd>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className={`px-4 py-2.5 border-t flex items-center gap-4 text-[10px] ${
                theme === "dark" ? "border-white/10 text-gray-600" : "border-gray-100 text-gray-400"
              }`}>
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>ESC Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
