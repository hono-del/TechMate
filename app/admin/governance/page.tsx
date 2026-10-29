'use client';

import { useState } from 'react';
import { ShieldAlert, CheckCircle2, Ban } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const REGIONS = [
  { id: 'apac', label: 'Asia Pacific', labelJa: 'アジアパシフィック', on: true },
  { id: 'eu', label: 'Europe', labelJa: '欧州', on: false },
  { id: 'na', label: 'North America', labelJa: '北米', on: true },
];

export default function GovernancePage() {
  const { t, lang } = useLanguage();
  const [killed, setKilled] = useState(false);
  const [regions, setRegions] = useState(REGIONS);
  const [qaOn, setQaOn] = useState(true);
  const [summaryOn, setSummaryOn] = useState(true);
  const [disclaimer, setDisclaimer] = useState(
    lang === 'ja'
      ? 'AI回答は意思決定支援です。公式手順ではありません。出典のマニュアル / TIE を確認してから作業してください。'
      : 'AI answers are decision support, not official instructions. Confirm the cited Manual / TIE before acting.',
  );
  const [saved, setSaved] = useState(false);

  const toggleRegion = (id: string) => {
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  };

  return (
    <div className="px-8 py-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t('admin.gov.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('admin.gov.subtitle')}</p>
      </div>

      <section className={`rounded-xl border p-5 ${killed ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${killed ? 'bg-red-600 text-white' : 'bg-navy text-white'}`}>
              {killed ? <Ban className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('admin.gov.kill')}</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md">{t('admin.gov.kill-body')}</p>
              <p className={`text-xs font-bold mt-2 ${killed ? 'text-red-700' : 'text-teal'}`}>
                {killed ? t('admin.gov.kill-on') : t('admin.gov.kill-off')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setKilled((v) => !v)}
            className={`text-sm font-bold px-3.5 py-2 rounded-lg ${
              killed
                ? 'bg-navy text-white hover:bg-navy-light'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {killed ? t('admin.gov.resume') : t('admin.gov.stop')}
          </button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">{t('admin.gov.regions')}</h2>
        <div className="space-y-2">
          {regions.map((r) => (
            <div key={r.id} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2.5">
              <span className="text-sm text-slate-800">{lang === 'ja' ? r.labelJa : r.label}</span>
              <button
                type="button"
                disabled={killed}
                onClick={() => toggleRegion(r.id)}
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  killed || !r.on ? 'bg-slate-100 text-slate-500' : 'bg-teal/15 text-teal'
                }`}
              >
                {killed || !r.on ? t('admin.gov.disabled') : t('admin.gov.enabled')}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
        <h2 className="text-sm font-bold text-slate-900 mb-3">{t('admin.gov.features')}</h2>
        <FeatureRow
          label={t('admin.gov.feat.qa')}
          on={qaOn && !killed}
          locked={false}
          onToggle={() => setQaOn((v) => !v)}
          onLabel={t('admin.gov.enabled')}
          offLabel={t('admin.gov.disabled')}
        />
        <FeatureRow
          label={t('admin.gov.feat.summary')}
          on={summaryOn && !killed}
          locked={false}
          onToggle={() => setSummaryOn((v) => !v)}
          onLabel={t('admin.gov.enabled')}
          offLabel={t('admin.gov.disabled')}
        />
        <FeatureRow
          label={t('admin.gov.feat.procedure')}
          on={false}
          locked
          onToggle={() => {}}
          onLabel={t('admin.gov.enabled')}
          offLabel={t('admin.gov.blocked')}
        />
        <FeatureRow
          label={t('admin.gov.feat.spec')}
          on={false}
          locked
          onToggle={() => {}}
          onLabel={t('admin.gov.enabled')}
          offLabel={t('admin.gov.blocked')}
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <label className="text-sm font-bold text-slate-900">{t('admin.gov.disclaimer')}</label>
        <textarea
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          rows={3}
          className="mt-2 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button
          type="button"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
          className="mt-3 bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2 rounded-lg"
        >
          {t('admin.gov.save')}
        </button>
        {saved && (
          <p className="mt-2 text-sm text-teal font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {t('admin.gov.saved')}
          </p>
        )}
      </section>
    </div>
  );
}

function FeatureRow({
  label,
  on,
  locked,
  onToggle,
  onLabel,
  offLabel,
}: {
  label: string;
  on: boolean;
  locked: boolean;
  onToggle: () => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <div className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2.5">
      <span className="text-sm text-slate-800">{label}</span>
      <button
        type="button"
        disabled={locked}
        onClick={onToggle}
        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          on ? 'bg-teal/15 text-teal' : 'bg-slate-100 text-slate-500'
        } ${locked ? 'cursor-not-allowed' : ''}`}
      >
        {on ? onLabel : offLabel}
      </button>
    </div>
  );
}
