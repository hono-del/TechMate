'use client';

import { useState } from 'react';
import { LogOut, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { Role } from '@/data/users';

export function UserMenu({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { user, dealer, logout } = useAuth();
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const roleLabel = (role: Role) => {
    if (role === 'technician') return t('auth.role.technician');
    if (role === 'dealer-admin') return t('auth.role.dealer-admin');
    return t('auth.role.cmc');
  };

  const isDark = variant === 'dark';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
          isDark ? 'bg-blue-800 hover:bg-blue-700' : 'border border-slate-200 bg-white hover:bg-slate-50'
        }`}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          isDark ? 'bg-blue-500 text-white' : 'bg-navy text-white'
        }`}>
          {user.initials}
        </div>
        <div className="text-left hidden sm:block">
          <div className={`text-xs font-medium ${isDark ? 'text-blue-200' : 'text-slate-800'}`}>
            {lang === 'ja' ? user.nameJa : user.name}
          </div>
          <div className={`text-[10px] ${isDark ? 'text-blue-300' : 'text-slate-500'}`}>
            {roleLabel(user.role)}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-blue-300' : 'text-slate-400'}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-lg z-50 p-3">
            <div className="px-2 pb-2 border-b border-slate-100 mb-2">
              <div className="text-sm font-bold text-slate-900">{lang === 'ja' ? user.nameJa : user.name}</div>
              <div className="text-xs text-slate-500">{lang === 'ja' ? user.titleJa : user.title}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {dealer
                  ? (lang === 'ja' ? dealer.nameJa : dealer.name)
                  : t('auth.dealer.all')}
              </div>
              <div className="mt-1.5 inline-block text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {roleLabel(user.role)}
              </div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4" />
              {t('auth.logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
