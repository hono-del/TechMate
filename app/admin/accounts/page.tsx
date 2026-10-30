'use client';

import { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { DEALERS, USERS, type Role } from '@/data/users';
import { useLanguage } from '@/context/LanguageContext';

const EXTRA = [
  { id: 'u-tech-2', name: 'Yuki Tanaka', nameJa: '田中 優希', role: 'technician' as Role, dealer: 'Osaka Bay Toyota', lastLogin: '2026-10-29 08:11', searches: 42, status: 'active' },
  { id: 'u-admin-2', name: 'Lina Ong', nameJa: 'リン・オン', role: 'dealer-admin' as Role, dealer: 'Singapore Toyota', lastLogin: '2026-10-28 19:04', searches: 11, status: 'active' },
  { id: 'u-off', name: 'Retired demo', nameJa: '退職デモ', role: 'technician' as Role, dealer: 'Tokyo Central Toyota', lastLogin: '2026-06-02 10:00', searches: 0, status: 'disabled' },
];

export default function AccountsPage() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('technician');

  const rows = [
    ...USERS.map((u) => ({
      id: u.id,
      name: lang === 'ja' ? u.nameJa : u.name,
      role: u.role,
      dealer: u.dealerId ? (DEALERS.find((d) => d.id === u.dealerId)?.[lang === 'ja' ? 'nameJa' : 'name'] ?? '—') : t('auth.dealer.all'),
      lastLogin: '2026-10-30 09:02',
      searches: u.role === 'technician' ? 86 : u.role === 'cmc' ? 12 : 24,
      status: 'active',
    })),
    ...EXTRA.map((u) => ({ ...u, name: lang === 'ja' ? u.nameJa : u.name })),
  ];

  return (
    <div className="px-8 py-6 max-w-5xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('acct.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('acct.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(true); setCreated(false); }}
          className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-bold px-3.5 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> {t('acct.create')}
        </button>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
            <tr>
              <th className="px-4 py-2">{t('acct.col.user')}</th>
              <th className="px-4 py-2">{t('acct.col.role')}</th>
              <th className="px-4 py-2">{t('acct.col.dealer')}</th>
              <th className="px-4 py-2">{t('acct.col.login')}</th>
              <th className="px-4 py-2">{t('acct.col.usage')}</th>
              <th className="px-4 py-2">{t('acct.col.status')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-medium text-slate-800">{r.name}</td>
                <td className="px-4 py-2.5">{t(`auth.role.${r.role}` as 'auth.role.technician')}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.dealer}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{r.lastLogin}</td>
                <td className="px-4 py-2.5">{r.searches} {t('acct.searches')}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {r.status === 'active' ? t('acct.active') : t('acct.disabled')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {open && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md space-y-3">
          <h2 className="text-sm font-bold text-slate-900">{t('acct.create')}</h2>
          {created ? (
            <div className="flex items-center gap-2 text-sm text-teal font-medium">
              <CheckCircle2 className="w-4 h-4" /> {t('acct.created')}
            </div>
          ) : (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('acct.name.ph')} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2" />
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2">
                <option value="technician">{t('auth.role.technician')}</option>
                <option value="dealer-admin">{t('auth.role.dealer-admin')}</option>
                <option value="cmc">{t('auth.role.cmc')}</option>
              </select>
              <button
                type="button"
                onClick={() => setCreated(true)}
                className="bg-navy text-white text-sm font-bold px-3 py-2 rounded-lg"
              >
                {t('acct.save')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
