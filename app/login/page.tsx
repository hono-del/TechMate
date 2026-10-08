'use client';

import { useRouter } from 'next/navigation';
import { Building2, Globe, Shield, Wrench, UserCog, Landmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { USERS, getDealer, type Role } from '@/data/users';

const ROLE_ICON: Record<Role, typeof Wrench> = {
  technician: Wrench,
  'dealer-admin': UserCog,
  cmc: Landmark,
};

const ROLE_ACCENT: Record<Role, string> = {
  technician: 'bg-brand-blue',
  'dealer-admin': 'bg-teal',
  cmc: 'bg-violet-600',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  const roleLabel = (role: Role) => {
    if (role === 'technician') return t('auth.role.technician');
    if (role === 'dealer-admin') return t('auth.role.dealer-admin');
    return t('auth.role.cmc');
  };

  const roleScope = (role: Role) => {
    if (role === 'technician') return t('auth.scope.technician');
    if (role === 'dealer-admin') return t('auth.scope.dealer-admin');
    return t('auth.scope.cmc');
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-white font-bold">{t('app.tagline')}</div>
        </div>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
        >
          <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
          <span>{lang === 'en' ? '日本語' : 'English'}</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center mb-4">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('auth.title')}</h1>
        <p className="text-sm text-white/60 mb-8 text-center max-w-lg">{t('auth.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {USERS.map(u => {
            const dealer = getDealer(u.dealerId);
            const Icon = ROLE_ICON[u.role];
            return (
              <button
                key={u.id}
                onClick={() => {
                  login(u.id);
                  router.replace('/');
                }}
                className="text-left bg-white rounded-2xl p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${ROLE_ACCENT[u.role]} text-white flex items-center justify-center font-bold`}>
                    {u.initials}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${ROLE_ACCENT[u.role]}`}>
                    {roleLabel(u.role)}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-base">
                  {lang === 'ja' ? u.nameJa : u.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {lang === 'ja' ? u.titleJa : u.title}
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {dealer
                      ? (lang === 'ja' ? dealer.nameJa : dealer.name)
                      : t('auth.dealer.all')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {dealer
                      ? (lang === 'ja' ? dealer.regionJa : dealer.region)
                      : t('admin.filter.region')}
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{roleScope(u.role)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-brand-blue">
                  <Icon className="w-4 h-4" />
                  {t('auth.signin')}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-white/40 mt-8 max-w-xl text-center">{t('auth.demo-note')}</p>
      </main>
    </div>
  );
}
