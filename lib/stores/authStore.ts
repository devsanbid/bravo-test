"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser, login as loginApi, logout as logoutApi } from "@/controllers/AuthController";

// Use a more generic type to avoid type issues
interface User {
  $id: string;
  name: string;
  profile?: any; // Allow any type for profile
  [key: string]: any; // Allow any other properties
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true, // Start with true to prevent flash of unauthenticated content
      initialized: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      
      checkUser: async () => {
        // Skip if already initialized and user exists
        if (get().initialized && get().user) {
          return;
        }
        
        try {
          set({ loading: true });
          const user = await getCurrentUser();
          set({ user, initialized: true });
        } catch (error) {
          console.error("Error checking user:", error);
          set({ user: null, initialized: true });
        } finally {
          set({ loading: false });
        }
      },
      
      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const session = await loginApi(email, password);
          
          if (session) {
            // Get user details after successful login
            const user = await getCurrentUser();
            set({ user, initialized: true });
          }
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      logout: async () => {
        try {
          set({ loading: true });
          await logoutApi();
          set({ user: null });
        } catch (error) {
          console.error("Logout error:", error);
          throw error;
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: "auth-storage", // name of the item in storage
      partialize: (state) => ({ user: state.user }), // only store user
    }
  )
);
