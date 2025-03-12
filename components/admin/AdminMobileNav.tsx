"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Content",
    icon: ImageIcon,
    href: "/admin/slider",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/admin/messages",
  },
];

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
          <div className="grid grid-cols-5 gap-1 p-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-lg gap-1",
                  pathname === route.href
                    ? "text-brand-orange bg-gray-50"
                    : "text-gray-500 hover:text-brand-orange hover:bg-gray-50"
                )}
              >
                <route.icon className="h-5 w-5" />
                <span className="text-xs">{route.label}</span>
              </Link>
            ))}
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-lg gap-1",
                  "text-gray-500 hover:text-brand-orange hover:bg-gray-50"
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs">Menu</span>
              </button>
            </SheetTrigger>
          </div>
        </div>
        <SheetContent side="left" className="p-0 w-72">
          <AdminSidebar />
        </SheetContent>
      </Sheet>
      <div className="h-[72px] md:h-0" />
    </>
  );
}