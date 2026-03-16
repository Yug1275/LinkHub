import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ProfileAvatar = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }
    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await API.post("/users/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      updateUser({ profileImage: res.data.profileImage });
      setImgError(false);
      setOpen(false);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getImageUrl = () => {
    if (!user?.profileImage) return null;
    const base = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";
    return `${base}${user.profileImage}`;
  };

  const imageUrl = getImageUrl();
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Avatar Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all duration-200 ${
            theme === "dark"
              ? "border-white/20 hover:border-violet-400/60 hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]"
              : "border-gray-200 hover:border-violet-400 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]"
          }`}
          title="Profile"
        >
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-sm font-semibold ${
              theme === "dark"
                ? "bg-violet-600/30 text-violet-300"
                : "bg-violet-100 text-violet-600"
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </motion.button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleUpload}
        />

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 top-12 w-56 rounded-xl shadow-2xl z-50 overflow-hidden border ${
                theme === "dark"
                  ? "bg-gray-900/95 backdrop-blur-xl border-white/10"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* User info header */}
              <div className={`px-4 py-3 border-b ${
                theme === "dark" ? "border-white/10" : "border-gray-100"
              }`}>
                <p className={`text-sm font-semibold truncate ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {user?.name || "User"}
                </p>
                <p className={`text-xs truncate mt-0.5 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  {user?.email || ""}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {/* View Profile Image */}
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowImageModal(true);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-white/10 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Profile Image
                </button>

                {/* Change Profile Image */}
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-white/10 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  } ${uploading ? "opacity-50 cursor-wait" : ""}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? "Uploading…" : "Change Profile Image"}
                </button>

                <div className={`my-1 border-t ${
                  theme === "dark" ? "border-white/5" : "border-gray-100"
                }`} />

                {/* Logout */}
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                    navigate("/");
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                    theme === "dark"
                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      : "text-red-500 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Profile Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            {/* Blurred Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center gap-4 max-w-xs sm:max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Large Profile Image */}
              {imageUrl && !imgError ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full ring ring-purple-500/40 shadow-lg object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-32 h-32 rounded-full ring ring-purple-500/40 shadow-lg bg-violet-600/30 flex items-center justify-center text-4xl font-bold text-violet-300">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* User Name */}
              <p className="text-white text-lg font-semibold">
                {user?.name || "User"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileAvatar;
