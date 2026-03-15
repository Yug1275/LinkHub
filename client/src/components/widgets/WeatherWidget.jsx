import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const WeatherWidget = () => {
  const { theme } = useContext(ThemeContext);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  useEffect(() => {
    if (!API_KEY) {
      setError("Weather API key not configured");
      setLoading(false);
      return;
    }

    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();
        if (data.cod === 200) {
          setWeather({
            city: data.name,
            temp: Math.round(data.main.temp),
            desc: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            feelsLike: Math.round(data.main.feels_like),
          });
        } else {
          setError("Unable to fetch weather");
        }
      } catch {
        setError("Weather service unavailable");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Default to a general location if geolocation denied
          fetchWeather(28.6139, 77.2090); // New Delhi
        }
      );
    } else {
      fetchWeather(28.6139, 77.2090);
    }
  }, [API_KEY]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-5 sm:p-6 ${
        theme === "dark" ? "glass-card" : "glass-card-light"
      }`}
    >
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-violet-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-2">
          <p className="text-2xl mb-1">🌤</p>
          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {error}
          </p>
        </div>
      )}

      {weather && !loading && (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.desc}
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                {weather.temp}°
              </span>
              <span className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>C</span>
            </div>
            <p className={`text-sm font-medium truncate ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              {weather.city}
            </p>
            <p className={`text-xs capitalize ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              {weather.desc} · Feels {weather.feelsLike}°
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WeatherWidget;
