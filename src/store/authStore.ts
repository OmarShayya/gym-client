import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "../types/api.types";

interface AuthState {
  user: AuthResponse["user"] | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data: AuthResponse) => {
        set({
          user: data.user,
          token: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      isAdmin: () => {
        return get().user?.role === "admin";
      },
    }),
    {
      name: "gym-auth",
    }
  )
);
