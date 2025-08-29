import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import type { LoginDto, RegisterDto } from "../types/api.types";
import { getErrorMessage } from "../api/client";

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data);
      // Redirect to admin dashboard instead of /dashboard
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", getErrorMessage(error));
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (data) => {
      setAuth(data);
      // Redirect to admin dashboard for new registrations too
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      console.error("Registration error:", getErrorMessage(error));
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear all cached data
      queryClient.clear();
      logout();
    },
    onSuccess: () => {
      // Redirect to admin login page
      navigate("/admin/login");
    },
  });
};

export const useProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["profile"],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    retry: false,
  });
};

// Helper hook to get auth state
export const useAuth = () => {
  const { user, token, isAuthenticated, logout, isAdmin } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    logout,
    isAdmin: isAdmin(),
  };
};
