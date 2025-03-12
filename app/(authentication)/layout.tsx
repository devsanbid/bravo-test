import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Bravo Consultancy",
  description: "Sign in or create an account to access personalized IELTS, PTE, GRE, and SAT preparation resources.",
  keywords: ["login", "register", "sign up", "authentication", "IELTS", "PTE", "GRE", "SAT"]
};

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
