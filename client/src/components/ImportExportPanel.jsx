import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import API from "../services/api";
import { motion } from "framer-motion";

const ImportExportPanel = ({ onImportComplete }) => {
  const { theme } = useContext(ThemeContext);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setMessage("");
    try {
      const res = await API.get("/export");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "linkhub-dashboard.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("✅ Dashboard exported successfully!");
    } catch (err) {
      setMessage("❌ Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setMessage("");
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await API.post("/import", data);
      setMessage("✅ Dashboard imported successfully!");
      if (onImportComplete) onImportComplete();
    } catch (err) {
      setMessage("❌ Import failed. Please check your file format.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2"
    >
      <button
        onClick={handleExport}
        disabled={exporting}
        className={`btn-secondary text-xs flex items-center gap-1.5 ${
          theme === "dark"
            ? "bg-white/10 text-gray-300 hover:bg-white/15"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } disabled:opacity-50`}
      >
        {exporting ? (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        Export
      </button>

      <label className={`btn-secondary text-xs flex items-center gap-1.5 cursor-pointer ${
        theme === "dark"
          ? "bg-white/10 text-gray-300 hover:bg-white/15"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${importing ? "opacity-50 pointer-events-none" : ""}`}>
        {importing ? (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
        Import
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>

      {message && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs ${
            message.includes("✅")
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {message}
        </motion.span>
      )}
    </motion.div>
  );
};

export default ImportExportPanel;
