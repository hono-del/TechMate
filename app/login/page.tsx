'use client';

import { useRouter } from 'next/navigation';
import { Building2, Globe, Shield, Wrench, UserCog, Landmark, ClipboardList, BadgeCheck, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { USERS, getDealer, type Role } from '@/data/users';
import { CmcLogo } from '@/components/common/CmcLogo';

const ROLE_ICON: Record<Role, typeof Wrench> = {
  'system-admin': Landmark,
  'dealer-admin': UserCog,
  'manufacturer-approver': BadgeCheck,
  'service-advisor': ClipboardList,
  technician: Wrench,
  'technician-manager': Users,
};

const ROLE_ACCENT: Record<Role, string> = {
  'system-admin': 'bg-brand-purple',
  'dealer-admin': 'bg-brand-teal-deep',
  'manufacturer-approver': 'bg-brand-navy',
  'service-advisor': 'bg-warning',
  technician: 'bg-brand-purple',
  'technician-manager': 'bg-brand-teal-deep',
};

const ROLE_LABEL: Record<Role, 'auth.role.system-admin' | 'auth.role.dealer-admin' | 'auth.role.manufacturer-approver' | 'auth.role.service-advisor' | 'auth.role.technician' | 'auth.role.technician-manager'> = {
  'system-admin': 'auth.role.system-admin',
  'dealer-admin': 'auth.role.dealer-admin',
  'manufacturer-approver': 'auth.role.manufacturer-approver',
  'service-advisor': 'auth.role.service-advisor',
  technician: 'auth.role.technician',
  'technician-manager': 'auth.role.technician-manager',
};

const ROLE_SCOPE: Record<Role, 'auth.scope.system-admin' | 'auth.scope.dealer-admin' | 'auth.scope.manufacturer-approver' | 'auth.scope.service-advisor' | 'auth.scope.technician' | 'auth.scope.technician-manager'> = {
  'system-admin': 'auth.scope.system-admin',
  'dealer-admin': 'auth.scope.dealer-admin',
  'manufacturer-approver': 'auth.scope.manufacturer-approver',
  'service-advisor': 'auth.scope.service-advisor',
  technician: 'auth.scope.technician',
  'technician-manager': 'auth.scope.technician-manager',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="header-cmc px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CmcLogo href={null} />
          <div className="hidden sm:block pl-3 border-l border-[var(--line-dark)]">
            <div className="eyebrow">{t('app.name')}</div>
            <div className="text-sm font-bold text-slate-900">{t('app.tagline')}</div>
          </div>
        </div>
        <button
          onClick={toggleLang}
          className="btn-ghost"
        >
          <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
          <span>{lang === 'en' ? '日本語' : 'English'}</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <p className="eyebrow mb-3">{t('app.name')}</p>
        <h1 className="text-[36px] sm:text-[48px] font-bold tracking-tight text-slate-900 mb-2 text-center leading-[1.1]">
          {t('auth.title')}
        </h1>
        <p className="text-[16px] leading-[1.55] text-slate-600 mb-10 text-center max-w-lg">{t('auth.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
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
                className="text-left card-cmc p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${ROLE_ACCENT[u.role]} text-white flex items-center justify-center font-bold`}>
                    {u.initials}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${ROLE_ACCENT[u.role]}`}>
                    {t(ROLE_LABEL[u.role])}
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
                    <span>{t(ROLE_SCOPE[u.role])}</span>
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

        <p className="text-xs text-slate-400 mt-10 max-w-xl text-center">{t('auth.demo-note')}</p>
      </main>
    </div>
  );
}
