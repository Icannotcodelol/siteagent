'use client';

import Link from 'next/link';
import { Menu, X, Bot } from 'lucide-react';
import { Suspense, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/app/_components/ui/button'; // Assuming cn is exported from your ui/button.tsx

interface DashboardLayoutProps {
  children: ReactNode;
  authButtonSlot?: ReactNode; // Make authButtonSlot optional or provide a default
}

// Adapted Navbar from landing-page-client.tsx
function DashboardNavbar({ authButtonSlot }: { authButtonSlot?: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/chatbots', label: 'Chatbots' },
    // Add more dashboard specific links here if needed
    // { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300',
        scrolled
          ? 'border-slate-700 bg-slate-900/80 supports-[backdrop-filter]:bg-slate-900/70'
          : 'border-transparent bg-slate-900',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 md:self-center">
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 transition-all duration-300 group-hover:bg-blue-500">
              {/* Using Bot icon as an example, or keep 'S' if preferred */}
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
              Dashboard
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative text-sm font-medium text-slate-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4 md:self-center">
          {/* AuthButton will be passed here */}
          {authButtonSlot}
        </div>

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col space-y-2 border-t border-slate-700 px-4 pb-4 pt-2">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {authButtonSlot && (
              <div className="mt-4 flex flex-col space-y-2 border-t border-slate-700 pt-4">
                 {/* Ensure authButtonSlot is correctly styled for mobile if it's complex */}
                {authButtonSlot}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// Adapted Footer from landing-page-client.tsx or a simpler one
function DashboardFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400">
      <div className="container mx-auto px-4 py-8 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
               <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">SiteAgent Dashboard</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} SiteAgent. All rights reserved.
          </p>
          {/* Add any other footer links or info if needed */}
        </div>
      </div>
    </footer>
  );
}

export default function DashboardLayout({ children, authButtonSlot }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-slate-100">
      {/* Suspense can be used here if authButtonSlot involves async operations */}
      <Suspense fallback={<div className="h-16 bg-slate-900 flex items-center justify-center">Loading navigation...</div>}>
        <DashboardNavbar authButtonSlot={authButtonSlot} />
      </Suspense>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
} 