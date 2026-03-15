import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const SettingsPanel = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, settings, updateSettings } = useContext(ThemeContext);
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync when panel opens
  const syncSettings = () => {
    setLocalSettings(settings);
  };

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const backgroundPresets = [
    { label: "Midnight", value: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)", type: "gradient" },
    { label: "Ocean", value: "linear-gradient(135deg, #0c1445 0%, #0d3b66 50%, #0a2463 100%)", type: "gradient" },
    { label: "Forest", value: "linear-gradient(135deg, #0a1a0a 0%, #1a2e1a 50%, #0a1a0a 100%)", type: "gradient" },
    { label: "Sunset", value: "linear-gradient(135deg, #1a0a0a 0%, #2e1a0a 50%, #1a0a0a 100%)", type: "gradient" },
    { label: "Lavender", value: "linear-gradient(135deg, #f0f0ff 0%, #e8e0f0 50%, #f0f0ff 100%)", type: "gradient" },
    { label: "Peach", value: "linear-gradient(135deg, #fff0f0 0%, #ffe8e0 50%, #fff0f0 100%)", type: "gradient" },
  ];

  const iconStyles = [
    { label: "Square", value: "square", preview: "rounded-none" },
    { label: "Rounded", value: "rounded", preview: "rounded-xl" },
    { label: "Circle", value: "circle", preview: "rounded-full" },
    { label: "Glass", value: "glass", preview: "rounded-xl ring-1 ring-white/20" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onAnimationStart={syncSettings}
            className={`fixed right-0 top-0 h-full w-full sm:w-96 z-50 overflow-y-auto ${
              theme === "dark"
                ? "bg-gray-900/95 backdrop-blur-xl border-l border-white/10"
                : "bg-white/95 backdrop-blur-xl border-l border-gray-200"
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  ⚙️ Settings
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${
                    theme === "dark" ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Theme Toggle */}
              <Section title="Theme" theme={theme}>
                <div className="flex gap-3">
                  {["light", "dark"].map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        if (theme !== t) toggleTheme();
                      }}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        theme === t
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                          : theme === "dark"
                            ? "bg-white/10 text-gray-300 hover:bg-white/15"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {t === "light" ? "☀️ Light" : "🌙 Dark"}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Background Type */}
              <Section title="Background" theme={theme}>
                <div className="flex gap-2 mb-4">
                  {["gradient", "solid", "image"].map(type => (
                    <button
                      key={type}
                      onClick={() => handleChange("backgroundType", type)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                        localSettings.backgroundType === type
                          ? "bg-violet-600 text-white"
                          : theme === "dark"
                            ? "bg-white/10 text-gray-300 hover:bg-white/15"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Gradient Presets */}
                {localSettings.backgroundType === "gradient" && (
                  <div className="grid grid-cols-3 gap-2">
                    {backgroundPresets.map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => handleChange("backgroundValue", preset.value)}
                        className={`h-16 rounded-xl border-2 transition-all ${
                          localSettings.backgroundValue === preset.value
                            ? "border-violet-500 scale-105"
                            : "border-transparent hover:border-white/20"
                        }`}
                        style={{ background: preset.value }}
                        title={preset.label}
                      >
                        <span className="text-white text-[10px] font-medium drop-shadow-lg">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Solid Color */}
                {localSettings.backgroundType === "solid" && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={localSettings.backgroundValue || "#0a0a0f"}
                      onChange={(e) => handleChange("backgroundValue", e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={localSettings.backgroundValue || ""}
                      onChange={(e) => handleChange("backgroundValue", e.target.value)}
                      placeholder="#0a0a0f"
                      className={`input-base text-sm flex-1 ${
                        theme === "dark" ? "input-dark" : "input-light"
                      }`}
                    />
                  </div>
                )}

                {/* Image URL */}
                {localSettings.backgroundType === "image" && (
                  <input
                    type="url"
                    value={localSettings.backgroundValue || ""}
                    onChange={(e) => handleChange("backgroundValue", e.target.value)}
                    placeholder="https://example.com/wallpaper.jpg"
                    className={`input-base text-sm ${
                      theme === "dark" ? "input-dark" : "input-light"
                    }`}
                  />
                )}
              </Section>

              {/* Blur & Opacity */}
              <Section title="Effects" theme={theme}>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}>Background Blur</label>
                      <span className={`text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}>{localSettings.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={localSettings.blur}
                      onChange={(e) => handleChange("blur", Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}>Overlay Opacity</label>
                      <span className={`text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}>{localSettings.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localSettings.opacity}
                      onChange={(e) => handleChange("opacity", Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                </div>
              </Section>

              {/* Icon Style */}
              <Section title="Icon Style" theme={theme}>
                <div className="grid grid-cols-4 gap-2">
                  {iconStyles.map(style => (
                    <button
                      key={style.value}
                      onClick={() => handleChange("iconStyle", style.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                        localSettings.iconStyle === style.value
                          ? "bg-violet-600/20 border border-violet-500/50"
                          : theme === "dark"
                            ? "bg-white/5 hover:bg-white/10 border border-transparent"
                            : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 ${style.preview} ${
                        theme === "dark" ? "bg-white/20" : "bg-gray-300"
                      }`} />
                      <span className={`text-[10px] font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}>{style.label}</span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Save Button */}
              <button onClick={handleSave} className="btn-primary w-full mt-6">
                Save Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Section = ({ title, theme, children }) => (
  <div className="mb-6">
    <h3 className={`text-sm font-semibold mb-3 ${
      theme === "dark" ? "text-gray-400" : "text-gray-500"
    }`}>
      {title}
    </h3>
    {children}
  </div>
);

export default SettingsPanel;