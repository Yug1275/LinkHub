import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const ClockWidget = () => {
  const { theme } = useContext(ThemeContext);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[time.getDay()];
  const date = `${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-5 sm:p-6 text-center ${
        theme === "dark" ? "glass-card" : "glass-card-light"
      }`}
    >
      <div className="mb-1">
        <span className={`text-4xl sm:text-5xl font-bold tracking-tight ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          {hours}
          <span className="animate-pulse">:</span>
          {minutes}
        </span>
        <span className={`text-lg sm:text-xl ml-1 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          {seconds}
        </span>
      </div>
      <p className={`text-sm font-medium ${
        theme === "dark" ? "text-violet-400" : "text-violet-600"
      }`}>
        {dayName}
      </p>
      <p className={`text-xs ${
        theme === "dark" ? "text-gray-500" : "text-gray-400"
      }`}>
        {date}
      </p>
    </motion.div>
  );
};

export default ClockWidget;
