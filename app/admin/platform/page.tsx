'use client';

import { useState } from 'react';
import { Ban, CheckCircle2, Globe, Lock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PlatformPage() {
  const { t, lang } = useLanguage();
  const [claimMissing, setClaimMissing] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const complaintRaw = lang === 'ja'
    ? '山田太郎（090-1234-5678）から。高速走行中に警告灯。'
    : 'Call from Taro Yamada (090-1234-5678). Light came on at highway speed.';
  const complaintMasked = lang === 'ja'
    ? '［氏名］（［電話］）から。高速走行中に警告灯。'
    : 'Call from [NAME] ([PHONE]). Light came on at highway speed.';

  return (
    <div className="px-8 py-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t('admin.platform.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('admin.platform.subtitle')}</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4" /> {t('admin.platform.sso')}
        </h2>
        <p className="text-xs text-slate-500">{t('admin.platform.sso-body')}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Meta label={t('admin.platform.idp')} value="Toyota IAM (OIDC)" />
          <Meta label={t('admin.platform.claims')} value="role, dealer_id, region" />
        </div>
        <button
          type="button"
          onClick={() => setClaimMissing((v) => !v)}
          className="text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          {claimMissing ? t('admin.platform.sso-restore') : t('admin.platform.sso-test')}
        </button>
        {claimMissing && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-800">
            {t('admin.platform.sso-block')}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4" /> {t('admin.platform.residency')}
        </h2>
        <p className="text-xs text-slate-500">{t('admin.platform.residency-body')}</p>
        <div className="space-y-2">
          {[
            { r: 'Asia Pacific', data: 'Tokyo', llm: 'tm-rag-apac-02', on: true },
            { r: 'Europe', data: '— (off)', llm: 'not hosted', on: false },
            { r: 'North America', data: 'Oregon', llm: 'tm-rag-na-01', on: true },
          ].map((row) => (
            <div key={row.r} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2 text-sm">
              <span className="font-medium text-slate-800">{row.r}</span>
              <span className="text-xs text-slate-500">{row.data} · {row.llm}</span>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${row.on ? 'bg-teal/15 text-teal' : 'bg-slate-100 text-slate-500'}`}>
                {row.on ? t('admin.gov.enabled') : t('admin.gov.disabled')}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">{t('admin.platform.pii')}</h2>
        <p className="text-xs text-slate-500">{t('admin.platform.pii-body')}</p>
        <pre className="text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 whitespace-pre-wrap font-sans">
          {showRaw ? complaintRaw : complaintMasked}
        </pre>
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="text-xs font-bold text-violet-700 hover:underline"
        >
          {showRaw ? t('admin.platform.pii-hide') : t('admin.platform.pii-show')}
        </button>
      </section>

      <section className={`rounded-xl border p-5 ${degraded ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {degraded ? <Ban className="w-4 h-4 text-amber-700" /> : <ShieldAlert className="w-4 h-4" />}
              {t('admin.platform.monitor')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{t('admin.platform.monitor-body')}</p>
            <p className={`text-xs font-bold mt-2 ${degraded ? 'text-amber-800' : 'text-teal'}`}>
              {degraded ? t('admin.platform.degraded') : t('admin.platform.healthy')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDegraded((v) => !v)}
            className={`text-sm font-bold px-3.5 py-2 rounded-lg ${
              degraded ? 'bg-navy text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {degraded ? t('admin.platform.resume') : t('admin.platform.degrade')}
          </button>
        </div>
        {degraded && (
          <p className="text-xs text-amber-800 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('admin.platform.degraded-note')}
          </p>
        )}
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-100 rounded-lg px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-sm text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}
