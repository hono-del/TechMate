'use client';

import { useState } from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

const SPEC_STATUS: Record<'pending' | 'verified' | 'rejected', TranslationKey> = {
  pending: 'admin.extract.status.pending',
  verified: 'admin.extract.status.verified',
  rejected: 'admin.extract.status.rejected',
};

type Tab = 'spec' | 'warn';

const SPECS0 = [
  { id: 'sp-1', source: 'SM §EC-12 p.8', name: 'O2 sensor (B1S2) torque', value: '44 N·m', unit: 'N·m', status: 'pending' as const },
  { id: 'sp-2', source: 'SM §IG-4 p.3', name: 'Spark plug gap', value: '1.1 mm', unit: 'mm', status: 'verified' as const },
  { id: 'sp-3', source: 'SM §EC-12 p.9', name: 'Bank 1 downstream min voltage', value: '0.6 V', unit: 'V', status: 'rejected' as const },
];

const WARNS0 = [
  { id: 'w-1', procedure: 'SM §EC-12 Step 4 — sensor removal', warning: 'Exhaust heat — wait 30 min', linked: true },
  { id: 'w-2', procedure: 'SM §EC-12 Step 7 — torque', warning: 'Do not use impact wrench on sensor', linked: true },
  { id: 'w-3', procedure: 'SM §EC-12 Step 2 — harness inspect', warning: '—', linked: false },
];

export default function ExtractPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('spec');
  const [specs, setSpecs] = useState(SPECS0);
  const [warns, setWarns] = useState(WARNS0);

  return (
    <div className="px-8 py-6 max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t('admin.extract.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('admin.extract.subtitle')}</p>
      </div>

      <AdminTabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'spec', label: t('admin.extract.tab.spec') },
          { id: 'warn', label: t('admin.extract.tab.warn') },
        ]}
      />

      {tab === 'spec' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
              <tr>
                <th className="px-4 py-2">{t('admin.extract.col.source')}</th>
                <th className="px-4 py-2">{t('admin.extract.col.name')}</th>
                <th className="px-4 py-2">{t('admin.extract.col.value')}</th>
                <th className="px-4 py-2">{t('admin.extract.col.status')}</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {specs.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 text-xs text-slate-500">{s.source}</td>
                  <td className="px-4 py-2.5">{s.name}</td>
                  <td className="px-4 py-2.5 font-mono font-bold">{s.value}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      s.status === 'verified' ? 'bg-green-100 text-green-700'
                        : s.status === 'rejected' ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t(SPEC_STATUS[s.status])}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    {s.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSpecs((p) => p.map((x) => (x.id === s.id ? { ...x, status: 'verified' } : x)))}
                          className="text-xs font-bold text-teal hover:underline"
                        >
                          {t('admin.extract.verify')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpecs((p) => p.map((x) => (x.id === s.id ? { ...x, status: 'rejected' } : x)))}
                          className="text-xs font-bold text-red-600 hover:underline"
                        >
                          {t('admin.extract.reject')}
                        </button>
                      </>
                    )}
                    {s.status === 'verified' && (
                      <span className="inline-flex text-teal text-xs font-medium items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'warn' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
              <tr>
                <th className="px-4 py-2">{t('admin.extract.col.proc')}</th>
                <th className="px-4 py-2">{t('admin.extract.col.warn')}</th>
                <th className="px-4 py-2">{t('admin.extract.col.link')}</th>
              </tr>
            </thead>
            <tbody>
              {warns.map((w) => (
                <tr key={w.id} className={`border-t border-slate-100 ${!w.linked ? 'bg-amber-50/60' : ''}`}>
                  <td className="px-4 py-2.5">{w.procedure}</td>
                  <td className="px-4 py-2.5 text-slate-600">{w.warning}</td>
                  <td className="px-4 py-2.5">
                    {w.linked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                        <Link2 className="w-3.5 h-3.5" /> {t('admin.extract.linked')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setWarns((p) => p.map((x) => (x.id === w.id ? { ...x, linked: true, warning: 'Disconnect battery before harness work' } : x)))}
                        className="text-xs font-bold bg-navy text-white px-2.5 py-1 rounded-lg"
                      >
                        {t('admin.extract.link')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
