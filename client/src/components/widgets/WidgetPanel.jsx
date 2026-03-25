import { useContext, useMemo, useRef } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import ClockWidget from "./ClockWidget";
import WeatherWidget from "./WeatherWidget";
import NotesWidget from "./NotesWidget";
import PomodoroWidget from "./PomodoroWidget";
import CalendarWidget from "./CalendarWidget";
import { useDrag, useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";

const widgetConfig = [
  { id: "clock", label: "🕐 Clock", component: ClockWidget },
  { id: "weather", label: "🌤 Weather", component: WeatherWidget },
  { id: "notes", label: "📝 Notes", component: NotesWidget },
  { id: "pomodoro", label: "🍅 Pomodoro", component: PomodoroWidget },
  { id: "calendar", label: "📅 Calendar", component: CalendarWidget },
];

const WIDGET_DRAG_TYPE = "WIDGET_CARD";

const orderWidgets = (widgets, widgetOrder = []) => {
  const orderMap = new Map(widgetOrder.map((id, index) => [id, index]));

  return [...widgets].sort((a, b) => {
    const aIndex = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
};

const WidgetPanel = ({
  enabledWidgets = ["clock"],
  widgetOrder = ["clock"],
  onToggleWidget,
  onReorderWidgets,
}) => {
  const { theme } = useContext(ThemeContext);
  const liveOrderRef = useRef([]);

  const activeWidgets = useMemo(() => {
    const enabled = widgetConfig.filter(w => enabledWidgets.includes(w.id));
    return orderWidgets(enabled, widgetOrder);
  }, [enabledWidgets, widgetOrder]);

  liveOrderRef.current = activeWidgets.map((w) => w.id);

  const moveWidget = (dragId, hoverId) => {
    if (!dragId || !hoverId || dragId === hoverId) return;

    const currentOrder = liveOrderRef.current;
    const from = currentOrder.indexOf(dragId);
    const to = currentOrder.indexOf(hoverId);

    if (from === -1 || to === -1) return;

    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(from, 1);
    nextOrder.splice(to, 0, moved);
    liveOrderRef.current = nextOrder;
    onReorderWidgets?.(nextOrder);
  };

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
              <DraggableWidgetCard
                key={w.id}
                widget={w}
                moveWidget={moveWidget}
              >
                <w.component />
              </DraggableWidgetCard>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

const DraggableWidgetCard = ({ widget, moveWidget, children }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: WIDGET_DRAG_TYPE,
      item: { id: widget.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [widget.id]
  );

  const [, drop] = useDrop(
    () => ({
      accept: WIDGET_DRAG_TYPE,
      hover(item) {
        if (!item?.id || item.id === widget.id) return;
        moveWidget(item.id, widget.id);
        item.id = widget.id;
      },
    }),
    [widget.id, moveWidget]
  );

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDragging ? 0.55 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="cursor-move"
    >
      {children}
    </motion.div>
  );
};

export default WidgetPanel;
