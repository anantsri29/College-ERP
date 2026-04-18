import axios from "axios";
import { clearAuth, getStoredToken } from "../utils/authStorage";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

const refreshAccessToken = async () => {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true, timeout: 15000 });
  const nextToken = data?.data?.token;
  if (!nextToken) throw new Error("Refresh token failed");
  localStorage.setItem("token", nextToken);
  return nextToken;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry) return Promise.reject(error);

    original._retry = true;

    try {
      if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => (refreshPromise = null));
      const nextToken = await refreshPromise;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${nextToken}`;
      return axiosInstance(original);
    } catch {
      clearAuth();
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
