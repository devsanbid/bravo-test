// lib/hooks/useAuthCheck.ts
"use client"; // Ensure this runs only on the client

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export function useAuthCheck(protectedRoute: boolean = false) {
  const { user, loading, checkUser } = useAuthStore();
  const router = useRouter();

  // Run checkUser on component mount
  useEffect(() => {
    const initAuth = async () => {
      await checkUser();
    };
    
    initAuth();
  }, [checkUser]);

  // Handle redirects based on auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        const role = user.profile?.role;
        const currentPath = typeof window !== "undefined" ? window.location.pathname : ""; // Guard against SSR
        const isAuthRoute = ["/login", "/register", "/forgotpassword"].includes(currentPath);

        // Redirect authenticated users away from auth pages
        if (isAuthRoute) {
          switch (role) {
            case "admin":
              router.push("/admin");
              break;
            case "mod":
              router.push("/mod");
              break;
            default:
              router.push("/dashboard");
              break;
          }
        }

        // Redirect from home page
        if (currentPath === "/") {
          switch (role) {
            case "student":
              router.push("/dashboard");
              break;
            case "mod":
              router.push("/mod");
              break;
            case "admin":
              router.push("/admin");
              break;
            default:
              router.push("/dashboard");
          }
        }

        // Always enforce role-based access control, not just for protected routes
        if (role) {
          // Only redirect if the user has a role
          if (currentPath.startsWith("/admin") && role !== "admin") {
            console.log("Non-admin tried to access admin route, redirecting");
            router.push(role === "mod" ? "/mod" : "/dashboard");
          } else if (currentPath.startsWith("/mod") && role !== "mod") {
            console.log("Non-mod tried to access mod route, redirecting");
            router.push(role === "admin" ? "/admin" : "/dashboard");
          } else if (currentPath.startsWith("/dashboard") && role !== "student") {
            console.log("Non-student tried to access dashboard, redirecting");
            router.push(role === "mod" ? "/mod" : "/admin");
          }
        } else {
          // For users with no role, only redirect away from admin and mod pages
          if (currentPath.startsWith("/admin") || currentPath.startsWith("/mod")) {
            console.log("User with no role tried to access admin/mod route, redirecting to dashboard");
            router.push("/dashboard");
          }
        }
      } else if (protectedRoute) {
        // Redirect unauthenticated users away from protected routes
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        if (
          currentPath.startsWith("/dashboard") ||
          currentPath.startsWith("/mod") ||
          currentPath.startsWith("/admin")
        ) {
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }
      }
    }
  }, [loading, user, router, protectedRoute]);

  return { user, loading };
}
