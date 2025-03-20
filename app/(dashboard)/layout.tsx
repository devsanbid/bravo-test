import '@/app/globals.css';
import type { Metadata } from 'next';
import { Livvic } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';
//import ChatWidget from '../../../chat/_ChatWidget';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

const livvic = Livvic({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Student Dashboard - Bravo Consultancy',
  description: 'Track your learning progress, access study materials, and prepare for your IELTS, PTE, GRE, or SAT exam.',
  keywords: ['dashboard', 'student portal', 'learning progress', 'IELTS preparation', 'PTE coaching', 'GRE training', 'SAT preparation'],

  openGraph: {
    title: 'Student Dashboard - Bravo Consultancy',
    description: 'Track your learning progress, access study materials, and prepare for your IELTS, PTE, GRE, or SAT exam.',
    type: 'website',
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`h-screen flex ${livvic.className}`}>
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      <MobileNav />
      <main className="flex-1 h-full overflow-y-auto pb-20 md:pb-0">
        <div className="p-4">
          <EmailVerificationBanner />
        </div>
        {children}
      </main>
     {/* <ChatWidget /> */}
    </div>
  );
}
