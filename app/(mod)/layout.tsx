"use client";

import '@/app/globals.css';
import { Livvic } from 'next/font/google';
import { ModSidebar } from '@/components/admin/ModSidebar';
import { ModMobileNav } from '@/components/admin/ModMobileNav';

const livvic = Livvic({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// Metadata is defined in a separate file (metadata.ts) since this is a client component

export default function ModLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`h-screen flex bg-gray-50 ${livvic.className}`}>
      <div className="hidden md:block h-full">
        <ModSidebar />
      </div>
      <ModMobileNav />
      <main className="flex-1 h-full overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
