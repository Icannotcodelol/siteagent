"use client";

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from './language-switcher';

interface ModernNavbarProps {
  authButtonSlot: React.ReactNode;
  locale?: string;
}

export default function ModernNavbar({ authButtonSlot, locale = 'en' }: ModernNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 md:top-6 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:w-full md:max-w-7xl md:px-6 md:bg-gray-900/80 md:border md:border-gray-700/50 md:rounded-2xl md:shadow-2xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href={locale === 'it' ? '/it' : locale === 'de' ? '/de' : locale === 'pl' ? '/pl' : locale === 'es' ? '/es' : '/'} className="group flex items-center gap-3">
            <div className="relative">
              <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={36} height={36} priority />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-sm"></div>
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SiteAgent
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-1">
          {[
            { 
              label: locale === 'it' ? "Caratteristiche" : locale === 'de' ? "Funktionen" : locale === 'pl' ? "Funkcje" : locale === 'es' ? "Características" : "Features", 
              href: "#features" 
            },
            { 
              label: locale === 'it' ? "Come Funziona" : locale === 'de' ? "Wie es funktioniert" : locale === 'pl' ? "Jak to działa" : locale === 'es' ? "Cómo Funciona" : "How It Works", 
              href: "#how-it-works" 
            },
            { 
              label: locale === 'it' ? "Prezzi" : locale === 'de' ? "Preise" : locale === 'pl' ? "Cennik" : locale === 'es' ? "Precios" : "Pricing", 
              href: "#pricing" 
            },
            { label: "FAQ", href: "#faq" }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all hover:text-white hover:bg-gray-800/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-3">
          <LanguageSwitcher currentLocale={locale} />
          {authButtonSlot}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800/50">
          <nav className="flex flex-col p-4 space-y-2">
            {[
              { 
                label: locale === 'it' ? "Caratteristiche" : locale === 'de' ? "Funktionen" : locale === 'pl' ? "Funkcje" : locale === 'es' ? "Características" : "Features", 
                href: "#features" 
              },
              { 
                label: locale === 'it' ? "Come Funziona" : locale === 'de' ? "Wie es funktioniert" : locale === 'pl' ? "Jak to działa" : locale === 'es' ? "Cómo Funciona" : "How It Works", 
                href: "#how-it-works" 
              },
              { 
                label: locale === 'it' ? "Prezzi" : locale === 'de' ? "Preise" : locale === 'pl' ? "Cennik" : locale === 'es' ? "Precios" : "Pricing", 
                href: "#pricing" 
              },
              { label: "FAQ", href: "#faq" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all hover:text-white hover:bg-gray-800/50"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-800/50 space-y-3">
              <LanguageSwitcher currentLocale={locale} />
              {authButtonSlot}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
} 