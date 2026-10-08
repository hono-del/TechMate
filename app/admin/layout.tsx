'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ChevronDown,
  Globe,
  Calendar,
  Building2,
  ArrowLeft,
  Wrench,
  Lock,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/common/UserMenu';
import type { TranslationKey } from '@/lib/translations';

const NAV_HREFS: { href: string; key: TranslationKey; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { href: '/admin', key: 'admin.nav.overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/knowledge', key: 'admin.nav.knowledge', icon: BookOpen },
  { href: '/admin/recommendations', key: 'admin.nav.recs', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();
  const { user, dealer, canAccess } = useAuth();
  const [mounted, setMounted] = useState(false);
  const isCmc = user?.role === 'cmc';

  useEffect(() => { setMounted(true); }, []);

  const visNav = NAV_HREFS.filter(item => canAccess(item.href));

  const isActive = (item: typeof NAV_HREFS[0]) => {
    if (!mounted) return false;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const dealerLabel = dealer
    ? (lang === 'ja' ? dealer.nameJa : dealer.name)
    : t('admin.filter.dealer');
  const regionLabel = dealer
    ? (lang === 'ja' ? dealer.regionJa : dealer.region)
    : t('admin.filter.region');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-navy flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-none">TechMate</div>
              <div className="text-white/50 text-[10px] mt-0.5 uppercase tracking-wider">{t('admin.console')}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {visNav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 border-t border-white/10 pt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('admin.nav.technician')}</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm text-slate-600 ${isCmc ? 'hover:bg-slate-50 cursor-pointer' : 'bg-slate-50'}`}>
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{regionLabel}</span>
              {isCmc && <ChevronDown className="w-3 h-3 text-slate-400" />}
              {!isCmc && <Lock className="w-3 h-3 text-slate-400" />}
            </div>

            <div
              className={`flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 ${isCmc ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50'}`}
              title={!isCmc ? t('auth.filter.locked') : undefined}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{dealerLabel}</span>
              {isCmc && <ChevronDown className="w-3 h-3 text-slate-400" />}
              {!isCmc && <Lock className="w-3 h-3 text-slate-400" />}
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('admin.filter.period')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 text-sm text-slate-600 font-medium transition-colors"
            >
              <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
              <span>{lang === 'en' ? '日本語' : 'English'}</span>
            </button>

            <UserMenu variant="light" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
