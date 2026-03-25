import { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [settings, setSettings] = useState({
    backgroundType: "gradient",
    backgroundValue: "",
    blur: 0,
    opacity: 100,
    iconStyle: "rounded",
    focusCategories: [],
    enabledWidgets: ["clock"],
    widgetOrder: ["clock"],
    pomodoro: {
      workMinutes: 25,
      breakMinutes: 5,
      alarmSound: "",
    },
    categoryOrder: [],
  });

  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load settings from API on mount
  const loadSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await API.get("/settings");
      if (res.data) {
        if (res.data.theme) {
          setTheme(res.data.theme);
        }
        setSettings({
          backgroundType: res.data.backgroundType || "gradient",
          backgroundValue: res.data.backgroundValue || "",
          blur: res.data.blur || 0,
          opacity: res.data.opacity ?? 100,
          iconStyle: res.data.iconStyle || "rounded",
          focusCategories: res.data.focusCategories || [],
          enabledWidgets: res.data.enabledWidgets || ["clock"],
          widgetOrder: res.data.widgetOrder || ["clock"],
          pomodoro: {
            workMinutes: res.data.pomodoro?.workMinutes || 25,
            breakMinutes: res.data.pomodoro?.breakMinutes || 5,
            alarmSound: res.data.pomodoro?.alarmSound || "",
          },
          categoryOrder: res.data.categoryOrder || [],
        });
        setSettingsLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }, []);

  // Save settings to API
  const saveSettings = useCallback(async (newSettings) => {
    try {
      const payload = {
        theme,
        ...newSettings,
      };
      await API.put("/settings", payload);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveSettings({ ...settings, theme: newTheme });
  };

  const updateSettings = (newSettings) => {
    const mergedSettings = { ...settings, ...newSettings };
    setSettings((prev) => ({ ...prev, ...newSettings }));
    return saveSettings(mergedSettings);
  };

  // Get background style based on settings
  const getBackgroundStyle = () => {
    const { backgroundType, backgroundValue } = settings;

    switch (backgroundType) {
      case "solid":
        return { backgroundColor: backgroundValue || (theme === "dark" ? "#0a0a0f" : "#f8f9fc") };
      case "gradient":
        return {
          background: backgroundValue ||
            (theme === "dark"
              ? "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #16213e 60%, #0a0a1a 100%)"
              : "linear-gradient(135deg, #f0f0ff 0%, #e8e0f0 30%, #f0e8f8 60%, #e0e8ff 100%)")
        };
      case "image":
        return {
          backgroundImage: backgroundValue ? `url(${backgroundValue})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        };
      default:
        return {
          background: theme === "dark"
            ? "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #16213e 60%, #0a0a1a 100%)"
            : "linear-gradient(135deg, #f0f0ff 0%, #e8e0f0 30%, #f0e8f8 60%, #e0e8ff 100%)"
        };
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      settings,
      updateSettings,
      loadSettings,
      settingsLoaded,
      getBackgroundStyle,
      saveSettings,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};