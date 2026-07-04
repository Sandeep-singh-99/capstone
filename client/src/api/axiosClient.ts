import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for centralized error mapping
axiosClient.interceptors.response.use(
  (response) => {
    // Optionally display success toasts for mutate operations (POST, PUT, DELETE, PATCH)
    const method = response.config.method?.toUpperCase();
    if (method && method !== "GET") {
      const message = response.data?.message;
      if (message) {
        toast.success(message);
      }
    }
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please check your network and try again.");
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error("Network error. Please check your internet connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorMessage = data?.detail || data?.message || "An error occurred.";

    switch (status) {
      case 400:
        toast.error(errorMessage);
        break;
      case 401:
        // Do not toast for /auth/me failures since they happen silently on app load
        if (!error.config?.url?.includes("/auth/me")) {
          toast.warning("Session expired. Please log in again.");
          // Only redirect if not already on login/signup page
          if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup") && window.location.pathname !== "/") {
            window.location.href = "/login";
          }
        }
        break;
      case 403:
        toast.error("Access denied. You do not have permission for this action.");
        break;
      case 404:
        toast.error(errorMessage || "Requested resource not found.");
        break;
      case 422:
        // Validation error
        if (data?.detail && Array.isArray(data.detail)) {
          const firstErr = data.detail[0];
          const field = firstErr.loc ? firstErr.loc[firstErr.loc.length - 1] : "";
          toast.error(`Validation Error: ${field ? `'${field}' ` : ""}${firstErr.msg}`);
        } else {
          toast.error(errorMessage || "Validation failed.");
        }
        break;
      case 429:
        toast.error("Too many requests. Please slow down and try again later.");
        break;
      case 500:
        toast.error("Internal server error. Our team has been notified.");
        break;
      default:
        toast.error(errorMessage || "An unknown error occurred.");
    }

    return Promise.reject(error);
  }
);
