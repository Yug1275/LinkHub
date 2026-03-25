import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import API from "../../services/api";

const PomodoroWidget = () => {
  const { theme, settings, updateSettings } = useContext(ThemeContext);
  const [mode, setMode] = useState("work"); // work | break
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [alarmSound, setAlarmSound] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const workSeconds = workMinutes * 60;
  const breakSeconds = breakMinutes * 60;

  const totalTime = mode === "work" ? workSeconds : breakSeconds;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    const savedPomodoro = settings.pomodoro || {};
    const savedWork = savedPomodoro.workMinutes || 25;
    const savedBreak = savedPomodoro.breakMinutes || 5;
    const savedAlarm = savedPomodoro.alarmSound || "";

    setWorkMinutes(savedWork);
    setBreakMinutes(savedBreak);
    setAlarmSound(savedAlarm);

    if (!isRunning) {
      setTimeLeft(mode === "work" ? savedWork * 60 : savedBreak * 60);
    }
  }, [settings.pomodoro, isRunning, mode]);

  useEffect(() => {
    if (!alarmSound) return;

    const base = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";
    const soundUrl = alarmSound.startsWith("http") ? alarmSound : `${base}${alarmSound}`;

    audioRef.current = new Audio(soundUrl);
    audioRef.current.onended = () => setIsAlarmPlaying(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsAlarmPlaying(false);
    };
  }, [alarmSound]);

  const playAlarm = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    setIsAlarmPlaying(true);
    audioRef.current.play().catch(() => {
      setIsAlarmPlaying(false);
      // Ignore playback block errors caused by browser autoplay policies.
    });
  };

  const stopAlarm = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsAlarmPlaying(false);
  };

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setIsRunning(false);
        playAlarm();
        // Switch mode
        if (mode === "work") {
          setMode("break");
          return breakSeconds;
        } else {
          setMode("work");
          return workSeconds;
        }
      }
      return prev - 1;
    });
  }, [mode, workSeconds, breakSeconds]);

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
    setTimeLeft(mode === "work" ? workSeconds : breakSeconds);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "work" ? workSeconds : breakSeconds);
  };

  const savePomodoroSettings = async () => {
    const safeWork = Math.max(1, Math.min(180, Number(workMinutes) || 25));
    const safeBreak = Math.max(1, Math.min(60, Number(breakMinutes) || 5));

    setWorkMinutes(safeWork);
    setBreakMinutes(safeBreak);
    setIsSaving(true);

    await updateSettings({
      pomodoro: {
        workMinutes: safeWork,
        breakMinutes: safeBreak,
        alarmSound,
      },
    });

    setIsRunning(false);
    setTimeLeft(mode === "work" ? safeWork * 60 : safeBreak * 60);
    setIsSaving(false);
  };

  const handleUploadSound = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedAudio = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/webm",
      "audio/mp4",
      "audio/x-m4a",
    ];

    if (!allowedAudio.includes(file.type)) {
      alert("Please select an MP3, WAV, OGG, M4A, or WebM audio file.");
      return;
    }

    const formData = new FormData();
    formData.append("sound", file);

    try {
      setIsUploading(true);
      const res = await API.post("/settings/pomodoro-sound", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedSound = res.data?.alarmSound || "";
      setAlarmSound(uploadedSound);

      await updateSettings({
        pomodoro: {
          workMinutes,
          breakMinutes,
          alarmSound: uploadedSound,
        },
      });
    } catch (error) {
      alert("Failed to upload alarm sound. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearSound = async () => {
    stopAlarm();
    setAlarmSound("");
    await updateSettings({
      pomodoro: {
        workMinutes,
        breakMinutes,
        alarmSound: "",
      },
    });
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

      {/* Preferences */}
      <div className="mt-4 space-y-3 text-left">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`text-[11px] block mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Work (min)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Number(e.target.value))}
              className={`w-full rounded-lg px-2 py-1.5 text-xs border outline-none ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            />
          </div>
          <div>
            <label className={`text-[11px] block mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Break (min)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className={`w-full rounded-lg px-2 py-1.5 text-xs border outline-none ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={savePomodoroSettings}
            disabled={isSaving}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-violet-600 hover:bg-violet-500 text-white"
                : "bg-violet-600 hover:bg-violet-500 text-white"
            } ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isSaving ? "Saving..." : "Save Timer"}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-white/10 text-gray-300 hover:bg-white/15"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isUploading ? "Uploading..." : "Upload Alarm"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleUploadSound}
        />

        <div className="flex items-center justify-between gap-2">
          <p className={`text-[11px] truncate ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {alarmSound ? `Alarm: ${alarmSound.split("/").pop()}` : "Alarm: default silent"}
          </p>
          <div className="flex gap-1">
            <button
              onClick={playAlarm}
              disabled={!alarmSound}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                alarmSound
                  ? (theme === "dark" ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700")
                  : (theme === "dark" ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400")
              }`}
            >
              Preview
            </button>
            <button
              onClick={stopAlarm}
              disabled={!isAlarmPlaying}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                isAlarmPlaying
                  ? (theme === "dark" ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-700")
                  : (theme === "dark" ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400")
              }`}
            >
              Stop
            </button>
            <button
              onClick={handleClearSound}
              disabled={!alarmSound}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                alarmSound
                  ? (theme === "dark" ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700")
                  : (theme === "dark" ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400")
              }`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PomodoroWidget;
