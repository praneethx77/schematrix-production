'use client';

// ==============================================================================
// SCHEMATRIX - Accessible Main Navigation Bar
// Fully responsive across mobile, tablet, and desktop with accessible ARIA states.
// Navigates between dedicated routes via next/link and highlights the active route.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/lib/i18n';
import {
  Landmark,
  FileCheck,
  FolderLock,
  Compass,
  Bot,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Navigation,
  GraduationCap,
} from 'lucide-react';

// Static navigation structure. href, icon, order, and keys are constant so the
// server and the first client render always produce identical navigation markup.
// Only the visible label is translated, and that happens after hydration.
const NAV_ITEMS: ReadonlyArray<{
  labelKey: TranslationKey;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}> = [
  { labelKey: 'schemes', href: '/schemes', icon: Compass },
  { labelKey: 'scholarships', href: '/scholarships', icon: GraduationCap },
  { labelKey: 'services', href: '/services', icon: Landmark },
  { labelKey: 'offices', href: '/offices', icon: Navigation },
  { labelKey: 'checker', href: '/eligibility', icon: FileCheck },
  { labelKey: 'vault', href: '/vault', icon: FolderLock },
  { labelKey: 'sahayak', href: '/sahayak', icon: Bot, highlight: true },
];

export function GovTechNavbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || '/';

  const navItems = NAV_ITEMS;
  const isLoginActive = pathname === '/login';

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile menu is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors shadow-xs">
      {/* Skip to Content Link for WCAG AAA Accessibility */}
      <a href="#main-content" className="skip-to-content">
        {t('skipToContent')}
      </a>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 outline-none"
            aria-label="SCHEMATRIX Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-neutral-900 dark:text-white">
                  SCHEMATRIX
                </span>
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-1.5 py-0.5 rounded-full">
                  GovTech MVP
                </span>
              </div>
              <p className="hidden sm:block text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[200px] md:max-w-sm">
                {t('appTagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden 2xl:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                      : item.highlight
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Action Buttons (desktop only; mobile uses the hamburger menu) */}
          <div className="hidden 2xl:flex items-center gap-2">
            <Link
              href="/login"
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${
                isLoginActive
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              {t('login')}
            </Link>
            <Link
              href="/eligibility"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400 transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('checkEligibility')}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex 2xl:hidden items-center gap-2">
            <Link
              href="/login"
              className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${
                isLoginActive
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700'
              }`}
            >
              {t('login')}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="2xl:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2"
            role="dialog"
            aria-label="Mobile Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-3 min-h-[48px] rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                      : item.highlight
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
              <Link
                href="/eligibility"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 min-h-[48px] px-4 text-sm font-bold bg-amber-500 text-neutral-950 rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('checkEligibility')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
