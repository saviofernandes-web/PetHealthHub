import axios from "axios";

// If you test on your Android phone, replace "localhost" with your laptop's
// local IP address (e.g. http://192.168.1.5:5000/api) - see README.md
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("phh_auth");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
