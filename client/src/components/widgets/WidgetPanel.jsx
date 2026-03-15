import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import ClockWidget from "./ClockWidget";
import WeatherWidget from "./WeatherWidget";
import NotesWidget from "./NotesWidget";
import PomodoroWidget from "./PomodoroWidget";
import { motion, AnimatePresence } from "framer-motion";

const widgetConfig = [
  { id: "clock", label: "🕐 Clock", component: ClockWidget },
  { id: "weather", label: "🌤 Weather", component: WeatherWidget },
  { id: "notes", label: "📝 Notes", component: NotesWidget },
  { id: "pomodoro", label: "🍅 Pomodoro", component: PomodoroWidget },
];

const WidgetPanel = ({ enabledWidgets = ["clock"], onToggleWidget }) => {
  const { theme } = useContext(ThemeContext);

  const activeWidgets = widgetConfig.filter(w => enabledWidgets.includes(w.id));

  return (
    <div className="mb-8">
      {/* Widget Toggle Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-xs font-medium mr-1 ${
          theme === "dark" ? "text-gray-500" : "text-gray-400"
        }`}>
          Widgets:
        </span>
        {widgetConfig.map(w => (
          <button
            key={w.id}
            onClick={() => onToggleWidget(w.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              enabledWidgets.includes(w.id)
                ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                : theme === "dark"
                  ? "bg-white/5 text-gray-500 hover:bg-white/10 border border-transparent"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 border border-transparent"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Active Widgets Grid */}
      {activeWidgets.length > 0 && (
        <motion.div
          layout
          className={`grid gap-4 ${
            activeWidgets.length === 1
              ? "grid-cols-1 max-w-md"
              : activeWidgets.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : activeWidgets.length === 3
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {activeWidgets.map(w => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <w.component />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default WidgetPanel;
