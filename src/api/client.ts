// src/api/client.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Type guard for the global success envelope: { success, data, ... }
const isResponseEnvelope = (
  payload: unknown
): payload is { success: boolean; data: unknown } => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    typeof (payload as { success: unknown }).success === "boolean" &&
    "data" in payload
  );
};

// Response interceptor: unwrap the global { success, data, ... } envelope so
// callers keep using `response.data` and receive the real payload, and handle errors.
apiClient.interceptors.response.use(
  (response) => {
    if (isResponseEnvelope(response.data)) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and redirect to login
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    return message || error.message || "An error occurred";
  }
  return "An unexpected error occurred";
};
