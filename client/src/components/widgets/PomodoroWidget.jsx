import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const PomodoroWidget = () => {
  const { theme } = useContext(ThemeContext);
  const [mode, setMode] = useState("work"); // work | break
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const totalTime = mode === "work" ? WORK_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setIsRunning(false);
        // Switch mode
        if (mode === "work") {
          setMode("break");
          return BREAK_TIME;
        } else {
          setMode("work");
          return WORK_TIME;
        }
      }
      return prev - 1;
    });
  }, [mode, WORK_TIME, BREAK_TIME]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, tick]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "work" ? WORK_TIME : BREAK_TIME);
  };

  // SVG circle dimensions
  const size = 120;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-5 sm:p-6 text-center ${
        theme === "dark" ? "glass-card" : "glass-card-light"
      }`}
    >
      {/* Mode Tabs */}
      <div className="flex gap-1 mb-4 justify-center">
        {["work", "break"].map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
              mode === m
                ? mode === "work"
                  ? "bg-violet-600 text-white"
                  : "bg-emerald-600 text-white"
                : theme === "dark"
                  ? "bg-white/10 text-gray-400 hover:bg-white/15"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {m === "work" ? "🎯 Work" : "☕ Break"}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={mode === "work" ? "#8b5cf6" : "#10b981"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold tracking-tight ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            isRunning
              ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
              : mode === "work"
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
          }`}
        >
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          onClick={handleReset}
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            theme === "dark"
              ? "bg-white/10 text-gray-300 hover:bg-white/15"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ↻ Reset
        </button>
      </div>
    </motion.div>
  );
};

export default PomodoroWidget;
