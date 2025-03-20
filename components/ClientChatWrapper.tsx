"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the GuestChatWidget to avoid server-side rendering issues
const GuestChatWidget = dynamic(() => import("@/components/GuestChatWidget"), {
  ssr: false,
  loading: () => null,
});

export default function ClientChatWrapper() {
  const pathname = usePathname();
  const [shouldShowChat, setShouldShowChat] = useState(false);
  
  useEffect(() => {
    // Only show the chat widget on public-facing pages
    // Don't show it on admin, dashboard, authentication, or moderator pages
    const isPublicPage = !(
      pathname.includes("/admin") ||
      pathname.includes("/dashboard") ||
      pathname.includes("/auth") ||
      pathname.includes("/mod") ||
      pathname.includes("/login") ||
      pathname.includes("/register")
    );
    
    setShouldShowChat(isPublicPage);
  }, [pathname]);
  
  // Only render the chat widget if we're on a public-facing page
  if (!shouldShowChat) {
    return null;
  }
  
  return <GuestChatWidget />;
}
