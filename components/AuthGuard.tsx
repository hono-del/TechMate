'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, canAccess } = useAuth();
  const { t } = useLanguage();
  const isLogin = pathname === '/login';

  useEffect(() => {
    if (!ready) return;
    if (!user && !isLogin) router.replace('/login');
    if (user && isLogin) router.replace('/');
  }, [ready, user, isLogin, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading…</div>
      </div>
    );
  }

  if (isLogin) return <>{children}</>;

  if (!user) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-white/60 text-sm">{t('auth.redirect')}</div>
      </div>
    );
  }

  if (!canAccess(pathname)) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">{t('auth.denied.title')}</h1>
          <p className="text-sm text-slate-500 mb-6">{t('auth.denied.body')}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-navy text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-navy-light"
          >
            {t('auth.denied.back')}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
