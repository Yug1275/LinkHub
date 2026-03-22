import { useEffect, useState, useContext, useCallback, useRef } from "react";
import API from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import AddWebsiteModal from "../components/AddWebsiteModal";
import CategoryCard from "../components/CategoryCard";
import SettingsPanel from "../components/SettingsPanel";
import CommandPalette from "../components/CommandPalette";
import ImportExportPanel from "../components/ImportExportPanel";
import Footer from "../components/Footer";
import FocusMode from "../components/FocusMode";
import ProfileAvatar from "../components/ProfileAvatar";
import WidgetPanel from "../components/widgets/WidgetPanel";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enabledWidgets, setEnabledWidgets] = useState(["clock"]);
  const [layoutSaveStatus, setLayoutSaveStatus] = useState("idle");

  const { theme, toggleTheme, settings, settingsLoaded, loadSettings, getBackgroundStyle, updateSettings } = useContext(ThemeContext);
  const saveOrderTimeoutRef = useRef(null);
  const saveStatusTimeoutRef = useRef(null);

  const areArraysEqual = useCallback((a = [], b = []) => {
    if (a.length !== b.length) return false;
    return a.every((item, index) => item === b[index]);
  }, []);

  const mergeCategoryOrder = useCallback((baseOrder, categories) => {
    const kept = baseOrder.filter((category) => categories.includes(category));
    const added = categories.filter((category) => !kept.includes(category));
    return [...kept, ...added];
  }, []);

  useEffect(() => {
    fetchWebsites();
    loadSettings();
  }, [loadSettings]);

  // Sync enabled widgets from settings
  useEffect(() => {
    if (settings.enabledWidgets) {
      setEnabledWidgets(settings.enabledWidgets);
    }
  }, [settings.enabledWidgets]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const res = await API.get("/websites");
      setWebsites(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addWebsite = (site) => {
    setWebsites([...websites, site]);
  };

  const deleteWebsite = async (id) => {
    await API.delete(`/websites/${id}`);
    setWebsites(websites.filter(site => site._id !== id));
  };

  const deleteCategory = useCallback(async (categoryName) => {
    try {
      await API.delete(`/websites/category/${encodeURIComponent(categoryName)}`);
      setWebsites((prev) =>
        prev.filter((site) => (site.category || "General") !== categoryName)
      );
      setCategoryOrder((prev) => prev.filter((category) => category !== categoryName));
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  }, []);

  const handleReorder = (category, reorderedWebsites) => {
    setWebsites((prev) => {
      const otherCategories = prev.filter(
        (site) => (site.category || "General") !== category
      );
      return [...otherCategories, ...reorderedWebsites];
    });
  };


  const handleToggleWidget = (widgetId) => {
    const updated = enabledWidgets.includes(widgetId)
      ? enabledWidgets.filter(w => w !== widgetId)
      : [...enabledWidgets, widgetId];
    setEnabledWidgets(updated);
    updateSettings({ enabledWidgets: updated });
  };

  // Group websites by category
  const groupByCategory = useCallback((sites) => {
    return sites.reduce((groups, site) => {
      const category = site.category || "General";
      if (!groups[category]) groups[category] = [];
      groups[category].push(site);
      return groups;
    }, {});
  }, []);

  useEffect(() => {
    const grouped = groupByCategory(websites);
    const categories = Object.keys(grouped);

    setCategoryOrder((prev) => {
      const seedOrder = settingsLoaded
        ? (settings.categoryOrder || [])
        : (prev.length ? prev : categories);
      const merged = mergeCategoryOrder(seedOrder, categories);
      return areArraysEqual(prev, merged) ? prev : merged;
    });
  }, [
    websites,
    settingsLoaded,
    settings.categoryOrder,
    groupByCategory,
    mergeCategoryOrder,
    areArraysEqual,
  ]);

  useEffect(() => {
    return () => {
      if (saveOrderTimeoutRef.current) {
        clearTimeout(saveOrderTimeoutRef.current);
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    const savedOrder = settings.categoryOrder || [];

    if (areArraysEqual(categoryOrder, savedOrder)) return;

    if (saveOrderTimeoutRef.current) {
      clearTimeout(saveOrderTimeoutRef.current);
    }

    setLayoutSaveStatus("saving");

    saveOrderTimeoutRef.current = setTimeout(() => {
      updateSettings({ categoryOrder })
        .then(() => {
          setLayoutSaveStatus("saved");
          if (saveStatusTimeoutRef.current) {
            clearTimeout(saveStatusTimeoutRef.current);
          }
          saveStatusTimeoutRef.current = setTimeout(() => {
            setLayoutSaveStatus("idle");
          }, 1400);
        })
        .catch((err) => {
          console.error("Failed to save category layout:", err);
          setLayoutSaveStatus("error");
          if (saveStatusTimeoutRef.current) {
            clearTimeout(saveStatusTimeoutRef.current);
          }
          saveStatusTimeoutRef.current = setTimeout(() => {
            setLayoutSaveStatus("idle");
          }, 2200);
        });
    }, 400);

    return () => {
      if (saveOrderTimeoutRef.current) {
        clearTimeout(saveOrderTimeoutRef.current);
      }
    };
  }, [categoryOrder, settings.categoryOrder, settingsLoaded, updateSettings, areArraysEqual]);

  const moveCategory = useCallback((fromIndex, toIndex) => {
    setCategoryOrder((prev) => {
      if (fromIndex === toIndex) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  // Apply focus mode filter
  const getFilteredGroups = () => {
    const grouped = groupByCategory(websites);
    if (settings.focusCategories && settings.focusCategories.length > 0) {
      const filtered = {};
      settings.focusCategories.forEach(cat => {
        if (grouped[cat]) filtered[cat] = grouped[cat];
      });
      return filtered;
    }
    return grouped;
  };

  const groupedWebsites = getFilteredGroups();
  const orderedCategories = categoryOrder.length
    ? categoryOrder.filter((category) => groupedWebsites[category])
    : Object.keys(groupedWebsites);
  const allCategories = Object.keys(groupByCategory(websites));

  return (
    <div
      className="min-h-screen transition-all duration-500 relative"
      style={getBackgroundStyle()}
    >
      {/* Blur Overlay */}
      {settings.blur > 0 && (
        <div
          className="bg-overlay"
          style={{ backdropFilter: `blur(${settings.blur}px)` }}
        />
      )}

      {/* Opacity Overlay */}
      {settings.opacity < 100 && (
        <div
          className="bg-overlay"
          style={{
            backgroundColor: theme === "dark"
              ? `rgba(0,0,0,${1 - settings.opacity / 100})`
              : `rgba(255,255,255,${1 - settings.opacity / 100})`
          }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10"
        >
          {/* Left: Logo + Tagline */}
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              LinkHub
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              Your personal link dashboard
            </p>
          </div>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Import/Export */}
            <ImportExportPanel onImportComplete={fetchWebsites} />

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                theme === "dark"
                  ? "bg-white/10 hover:bg-white/15 text-yellow-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSettingsOpen(true)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                theme === "dark"
                  ? "bg-white/10 hover:bg-white/15 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>

            {/* Profile Avatar */}
            <ProfileAvatar />
          </div>
        </motion.header>

        {/* Widgets */}
        <WidgetPanel
          enabledWidgets={enabledWidgets}
          onToggleWidget={handleToggleWidget}
        />

        {/* Add Website */}
        <div className="mb-6">
          <AddWebsiteModal onAdd={addWebsite} />
        </div>

        {/* Focus Mode */}
        {allCategories.length > 1 && (
          <div className="mb-6">
            <FocusMode categories={allCategories} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-violet-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Loading your dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && websites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔗</div>
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              No websites yet
            </h2>
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              Add your first website using the form above to get started!
            </p>
          </motion.div>
        )}

        {/* Category Grid */}
        {!loading && Object.keys(groupedWebsites).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {orderedCategories.map((category, index) => (
                <CategoryCard
                  key={category}
                  category={category}
                  websites={groupedWebsites[category]}
                  onDelete={deleteWebsite}
                  onReorder={handleReorder}
                  onDeleteCategory={deleteCategory}
                  index={index}
                  moveCategory={moveCategory}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Focus Mode Indicator */}
        {settings.focusCategories && settings.focusCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-30 ${
              theme === "dark"
                ? "bg-violet-600/80 text-white backdrop-blur-sm"
                : "bg-violet-100 text-violet-700"
            }`}
          >
            🎯 Focus: {settings.focusCategories.join(", ")}
          </motion.div>
        )}

        {/* Layout Save Status */}
        {layoutSaveStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed bottom-6 right-6 px-3.5 py-2 rounded-full text-xs font-medium z-30 backdrop-blur-md border transition-all duration-300 ${
              layoutSaveStatus === "error"
                ? (theme === "dark"
                    ? "bg-red-500/20 border-red-400/40 text-red-200"
                    : "bg-red-100 border-red-300 text-red-700")
                : (theme === "dark"
                    ? "bg-white/10 border-white/20 text-gray-200"
                    : "bg-white/80 border-gray-200 text-gray-700")
            }`}
          >
            {layoutSaveStatus === "saving" && "Saving layout..."}
            {layoutSaveStatus === "saved" && "Layout saved"}
            {layoutSaveStatus === "error" && "Save failed"}
          </motion.div>
        )}

        {/* Keyboard shortcut hint */}
        <div className={`text-center mt-12 pb-8 text-xs ${
          theme === "dark" ? "text-gray-600" : "text-gray-400"
        }`}>
          Press <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
            theme === "dark" ? "bg-white/10" : "bg-gray-200"
          }`}>Ctrl</kbd> + <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
            theme === "dark" ? "bg-white/10" : "bg-gray-200"
          }`}>K</kbd> to search
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Command Palette */}
      <CommandPalette websites={websites} />
    </div>
  );
};

export default Dashboard;

// yug