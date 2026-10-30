'use client';

import { useState } from 'react';
import { CheckCircle2, FlaskConical, Loader2, ShieldAlert, XCircle } from 'lucide-react';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { useLanguage } from '@/context/LanguageContext';

type Tab = 'eval' | 'audit' | 'usage';

const USAGE = [
  { user: 'Kenji Yamamoto', at: '2026-10-30 09:14', model: 'Corolla Cross', year: '2022', system: 'Engine / Exhaust', fault: 'Recurring DTC', chapter: 'SM §EC-4 p.12', follow: '2 follow-ups' },
  { user: 'Kenji Yamamoto', at: '2026-10-30 09:22', model: 'Corolla Cross', year: '2022', system: 'Engine / Exhaust', fault: 'P0420', chapter: 'TIE-2023-214', follow: 'Asked torque' },
  { user: 'Yuki Tanaka', at: '2026-10-29 16:03', model: 'RAV4', year: '2023', system: 'Audio / HU', fault: 'Connectivity', chapter: 'OM Multimedia', follow: 'None' },
];

const CASES = [
  { id: 'gs-01', query: 'P0420 after O2 sensor — next step?', expect: 'Sensor / harness first, not catalyst', actual: 'Sensor / harness first', pass: true },
  { id: 'gs-02', query: 'O2 sensor torque LC300', expect: 'Cite SM torque only', actual: '44 N·m from SM §EC-12', pass: true },
  { id: 'gs-03', query: 'P0420 replace catalyst first?', expect: 'Refuse or correct to sensor-first', actual: 'Replace catalyst first', pass: false },
  { id: 'gs-04', query: 'P9999 wastegate', expect: 'No-answer', actual: 'No-answer', pass: true },
];

const AUDIT = [
  { at: '2026-10-29 14:12', actor: 'u-8f3a', action: 'ai.answer', job: 'RO-2026-10-0042', prompt: 'v1.4', model: 'tm-rag-apac-02', sources: 'SM §EC-12; TIE-2023-214', conf: 'medium', hash: 'a91c…e2' },
  { at: '2026-10-29 13:48', actor: 'u-8f3a', action: 'ai.refuse', job: 'RO-2026-10-0042', prompt: 'v1.4', model: 'tm-rag-apac-02', sources: '—', conf: 'low', hash: 'b22d…91' },
  { at: '2026-10-29 11:05', actor: 'u-c01b', action: 'prompt.activate', job: '—', prompt: 'v1.4', model: 'tm-rag-apac-02', sources: '—', conf: '—', hash: 'c45e…08' },
];

export default function QualityPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('eval');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const runEval = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setRan(true);
    }, 1400);
  };

  const pass = CASES.filter((c) => c.pass).length;
  const gate = ran ? pass / CASES.length >= 0.9 : true;

  return (
    <div className="px-8 py-6 max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t('admin.quality.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('admin.quality.subtitle')}</p>
      </div>

      <AdminTabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'eval', label: t('admin.quality.tab.eval') },
          { id: 'audit', label: t('admin.quality.tab.audit') },
          { id: 'usage', label: t('admin.quality.tab.usage') },
        ]}
      />

      {tab === 'eval' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t('admin.quality.golden')} value="48" note={t('admin.quality.experts')} />
            <Stat label={t('admin.quality.score')} value={ran ? `${Math.round((pass / CASES.length) * 100)}%` : '91%'} note={t('admin.quality.last')} />
            <div className={`rounded-xl border p-4 ${gate && ran ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="text-[10px] font-bold uppercase text-slate-400">{t('admin.quality.gate')}</div>
              <div className={`text-lg font-bold mt-1 ${gate ? 'text-green-700' : 'text-amber-800'}`}>
                {gate ? t('admin.quality.gate.pass') : t('admin.quality.gate.fail')}
              </div>
              <p className="text-xs text-slate-500 mt-1">{t('admin.quality.gate-body')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runEval}
              disabled={running}
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              {t('admin.quality.run')}
            </button>
            {ran && (
              <span className="text-sm text-teal font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {t('admin.quality.ran')}
              </span>
            )}
          </div>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-2">{t('admin.quality.col.query')}</th>
                  <th className="px-4 py-2">{t('admin.quality.col.expect')}</th>
                  <th className="px-4 py-2">{t('admin.quality.col.actual')}</th>
                  <th className="px-4 py-2">{t('admin.quality.col.result')}</th>
                </tr>
              </thead>
              <tbody>
                {CASES.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 text-slate-800">{c.query}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.expect}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.actual}</td>
                    <td className="px-4 py-2.5">
                      {c.pass ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t('admin.quality.pass')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <XCircle className="w-3.5 h-3.5" /> {t('admin.quality.fail')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {tab === 'usage' && (
        <>
          <p className="text-sm text-slate-600">{t('admin.usage.subtitle')}</p>
          <section className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[880px]">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
                <tr>
                  <th className="px-3 py-2">{t('admin.usage.col.user')}</th>
                  <th className="px-3 py-2">{t('admin.usage.col.at')}</th>
                  <th className="px-3 py-2">{t('admin.usage.col.model')}</th>
                  <th className="px-3 py-2">{t('admin.usage.col.year')}</th>
                  <th className="px-3 py-2">{t('admin.usage.col.system')}</th>
                  <th className="px-3 py-2">{t('admin.usage.col.fault')}</th>
                  <th className="px-3 py-2">{t('admin.usage.col.chapter')}</th>
                  <th className="px-3 py-2">{t('admin.usage.col.follow')}</th>
                </tr>
              </thead>
              <tbody>
                {USAGE.map((r) => (
                  <tr key={r.at + r.user} className="border-t border-slate-100">
                    <td className="px-3 py-2.5">{r.user}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-500 whitespace-nowrap">{r.at}</td>
                    <td className="px-3 py-2.5">{r.model}</td>
                    <td className="px-3 py-2.5">{r.year}</td>
                    <td className="px-3 py-2.5">{r.system}</td>
                    <td className="px-3 py-2.5">{r.fault}</td>
                    <td className="px-3 py-2.5 text-xs">{r.chapter}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">{r.follow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {tab === 'audit' && (
        <>
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <ShieldAlert className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-600">{t('admin.audit.banner')}</p>
          </div>
          <section className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
                <tr>
                  <th className="px-3 py-2">{t('admin.audit.col.at')}</th>
                  <th className="px-3 py-2">{t('admin.audit.col.actor')}</th>
                  <th className="px-3 py-2">{t('admin.audit.col.action')}</th>
                  <th className="px-3 py-2">{t('admin.audit.col.job')}</th>
                  <th className="px-3 py-2">{t('admin.audit.col.prompt')}</th>
                  <th className="px-3 py-2">{t('admin.audit.col.model')}</th>
                  <th className="px-3 py-2">{t('admin.audit.col.sources')}</th>
                  <th className="px-3 py-2">{t('admin.audit.col.hash')}</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT.map((r) => (
                  <tr key={r.hash} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500 whitespace-nowrap">{r.at}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.actor}</td>
                    <td className="px-3 py-2">{r.action}</td>
                    <td className="px-3 py-2 text-xs">{r.job}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.prompt}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.model}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{r.sources}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-400">{r.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-lg font-bold text-slate-900 mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{note}</div>
    </div>
  );
}
