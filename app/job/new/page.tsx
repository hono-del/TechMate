'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car, CheckCircle2, ScanLine } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { UserMenu } from '@/components/common/UserMenu';
import { MANUAL_MODELS } from '@/data/manuals';

const SOURCES = ['hand', 'import', 'dms'] as const;

export default function NewJobPage() {
  const { t, lang, toggleLang } = useLanguage();
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [decoded, setDecoded] = useState(false);
  const [model, setModel] = useState('Corolla Cross');
  const [year, setYear] = useState('2022');
  const [mileage, setMileage] = useState('25430');
  const [concern, setConcern] = useState('');
  const [source, setSource] = useState<(typeof SOURCES)[number]>('hand');
  const [created, setCreated] = useState(false);

  const decode = () => {
    setDecoded(true);
    setModel('Corolla Cross');
    setYear('2022');
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-lg font-bold">{t('jobnew.title')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-700 border border-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
            <span>{lang === 'en' ? '日本語' : 'English'}</span>
          </button>
          <UserMenu variant="dark" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('jobnew.back')}
        </Link>

        <p className="text-sm text-slate-500 mb-6">{t('jobnew.subtitle')}</p>

        {created ? (
          <div className="bg-white border border-green-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-teal flex-shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">{t('jobnew.created')}</h2>
                <p className="text-sm text-slate-600 mt-1">RO-2026-10-0088 · {year} {model}</p>
                <p className="text-xs text-slate-400 mt-2">{t('jobnew.demo-note')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/job/job-001/reception')}
              className="bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2 rounded-lg"
            >
              {t('jobnew.open-demo')}
            </button>
          </div>
        ) : (
          <form
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setCreated(true);
            }}
          >
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-2">{t('jobnew.source')}</div>
              <div className="grid grid-cols-3 gap-2">
                {SOURCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg border ${
                      source === s ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t(`jobnew.source.${s}` as 'jobnew.source.hand')}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-xs font-bold uppercase text-slate-400">
              {t('jobnew.vin')}
              <div className="mt-1 flex gap-2">
                <input
                  value={vin}
                  onChange={(e) => { setVin(e.target.value); setDecoded(false); }}
                  placeholder="JTNXXXXXXXXXXXXXX"
                  className="flex-1 text-sm font-mono border border-slate-200 rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={decode}
                  className="inline-flex items-center gap-1.5 text-xs font-bold border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  <ScanLine className="w-3.5 h-3.5" /> {t('jobnew.decode')}
                </button>
              </div>
              {decoded && (
                <span className="inline-block mt-1.5 text-[10px] font-bold uppercase bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  {t('jobnew.decoded')}
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('vehicle.model')}
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
                >
                  {MANUAL_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('home.manuals.choose-year')}
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
                >
                  {['2021', '2022', '2023', '2024'].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-xs font-bold uppercase text-slate-400">
              {t('jobnew.mileage')}
              <input
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>

            <label className="block text-xs font-bold uppercase text-slate-400">
              {t('jobnew.concern')}
              <textarea
                required
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder={t('jobnew.concern.ph')}
                rows={3}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2.5 rounded-lg"
            >
              <Car className="w-4 h-4" /> {t('jobnew.create')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
