"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  BookOpen,
  Camera,
  Star,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logout } from "@/controllers/AuthController";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "sonner";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Users Management",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Slider Management",
    icon: ImageIcon,
    href: "/admin/slider",
  },
  {
    label: "About Section",
    icon: FileText,
    href: "/admin/about",
  },
  {
    label: "Services",
    icon: BookOpen,
    href: "/admin/services",
  },
  {
    label: "Contact Info",
    icon: MessageSquare,
    href: "/admin/contact",
  },
  {
    label: "Gallery",
    icon: Camera,
    href: "/admin/gallery",
  },
  {
    label: "Testimonials",
    icon: Star,
    href: "/admin/testimonials",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const router = useRouter();

  const { user, setUser, setLoading,checkUser } = useAuthStore();

  useEffect(() => {
    checkUser()
  }, []);

  useEffect(() => {
    if (user && user.profile) {
      setUserDetails({
        email: user.email || "",
        name: user.name || "",
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Error logging out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "relative h-full bg-white border-r transition-all duration-300",
      isCollapsed ? "w-[80px]" : "w-72"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border bg-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="space-y-4 py-4 flex flex-col h-full">
        <div className="px-3 py-2">
          <div className="mb-8 flex items-center justify-center">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-brand-orange">Admin Panel</h1>
            )}
          </div>
        </div>

        <div className="px-3 py-2 flex-1">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex p-3 w-full justify-start font-medium cursor-pointer hover:text-brand-orange hover:bg-gray-100/50 rounded-lg transition",
                  pathname === route.href ? "text-brand-orange bg-gray-100" : "text-gray-500",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? route.label : undefined}
              >
                <div className={cn(
                  "flex items-center flex-1",
                  isCollapsed && "justify-center"
                )}>
                  <route.icon className={cn(
                    "h-5 w-5",
                    !isCollapsed && "mr-3",
                    pathname === route.href ? "text-brand-orange" : "text-gray-500"
                  )} />
                  {!isCollapsed && <span className="text-sm">{route.label}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="px-3 py-2 border-t">
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}>
            <div className="h-10 w-10 relative rounded-full bg-brand-purple flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && userDetails && (
              <div className="space-y-1">
                <p className="text-sm font-medium">{userDetails.name}</p>
                <p className="text-xs text-gray-500">{userDetails.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full mt-4 text-red-500 hover:text-red-600 hover:bg-red-50",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
