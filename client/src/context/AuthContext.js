import { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingProfile(false);
      return;
    }
    try {
      const res = await API.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // Token might be invalid
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Auto-fetch profile on mount if token exists
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, loadingProfile, login, logout, updateUser, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};