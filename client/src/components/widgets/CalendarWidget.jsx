import { useContext, useMemo, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatMonthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);

const CalendarWidget = () => {
  const { theme } = useContext(ThemeContext);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = new Date();

  const calendarDays = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const days = [];
    const leadingDays = start.getDay();

    for (let i = leadingDays - 1; i >= 0; i -= 1) {
      const date = new Date(start);
      date.setDate(start.getDate() - i - 1);
      days.push({ date, inMonth: false });
    }

    for (let day = 1; day <= end.getDate(); day += 1) {
      days.push({
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
        inMonth: true,
      });
    }

    const trailing = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= trailing; i += 1) {
      const date = new Date(end);
      date.setDate(end.getDate() + i);
      days.push({ date, inMonth: false });
    }

    return days;
  }, [currentMonth]);

  const isToday = (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const moveMonth = (offset) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 sm:p-6 ${theme === "dark" ? "glass-card" : "glass-card-light"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className={`text-[11px] uppercase tracking-[0.22em] ${theme === "dark" ? "text-sky-300" : "text-sky-700"}`}>
            Calendar
          </p>
          <h3 className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {formatMonthLabel(currentMonth)}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => moveMonth(-1)}
            className={`h-8 w-8 rounded-lg text-sm transition-colors ${
              theme === "dark"
                ? "bg-white/10 text-gray-200 hover:bg-white/20"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={() => moveMonth(1)}
            className={`h-8 w-8 rounded-lg text-sm transition-colors ${
              theme === "dark"
                ? "bg-white/10 text-gray-200 hover:bg-white/20"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {weekLabels.map((label) => (
          <div
            key={label}
            className={`text-[10px] font-medium tracking-wide ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {label}
          </div>
        ))}

        {calendarDays.map(({ date, inMonth }) => {
          const todayMark = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                todayMark
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : inMonth
                    ? (theme === "dark" ? "text-gray-100 bg-white/5" : "text-gray-700 bg-gray-50")
                    : (theme === "dark" ? "text-gray-500 bg-white/[0.03]" : "text-gray-400 bg-gray-50/60")
              }`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CalendarWidget;
