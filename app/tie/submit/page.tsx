'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { UserMenu } from '@/components/common/UserMenu';
import { MANUAL_MODELS } from '@/data/manuals';
import { TIE_TEMPLATES, readTieQueue, writeTieQueue, type TieSubmission } from '@/data/admin/tieFlow';

export default function TieSubmitPage() {
  const { t, lang, toggleLang } = useLanguage();
  const { user, dealer } = useAuth();
  const activeTemplates = useMemo(() => TIE_TEMPLATES.filter((tpl) => tpl.active), []);
  const [templateId, setTemplateId] = useState(activeTemplates[0]?.id ?? 'tpl-recurring');
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('Corolla Cross');
  const [year, setYear] = useState('2022');
  const [system, setSystem] = useState('Engine / Exhaust');
  const [faultType, setFaultType] = useState('Recurring DTC');
  const [dtc, setDtc] = useState('P0420');
  const [chapter, setChapter] = useState('SM §EC-4');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const tpl = TIE_TEMPLATES.find((x) => x.id === templateId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: TieSubmission = {
      id: `tie-sub-${Date.now()}`,
      title: title || `${dtc} ${model}`,
      model,
      year,
      system,
      faultType,
      dtc,
      chapter,
      body,
      author: user ? (lang === 'ja' ? user.nameJa : user.name) : 'Technician',
      dealer: dealer ? (lang === 'ja' ? dealer.nameJa : dealer.name) : '—',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'submitted',
      templateId,
    };
    writeTieQueue([item, ...readTieQueue()]);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-lg font-bold">{t('tiesub.title')}</div>
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
        <p className="text-sm text-slate-500 mb-6">{t('tiesub.subtitle')}</p>

        {sent ? (
          <div className="bg-white border border-green-200 rounded-2xl p-6 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal flex-shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('tiesub.sent.title')}</h2>
              <p className="text-sm text-slate-600 mt-1">{t('tiesub.sent.body')}</p>
            </div>
          </div>
        ) : (
          <form className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4" onSubmit={submit}>
            <label className="block text-xs font-bold uppercase text-slate-400">
              {t('tiesub.template')}
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
              >
                {activeTemplates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {lang === 'ja' ? item.nameJa : item.name}
                  </option>
                ))}
              </select>
            </label>
            {tpl && (
              <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                {t('tiesub.fields')}: {tpl.fields.join(' · ')}
              </p>
            )}

            <label className="block text-xs font-bold uppercase text-slate-400">
              {t('tiesub.form.title')}
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('vehicle.model')}
                <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2">
                  {MANUAL_MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('home.manuals.choose-year')}
                <select value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2">
                  {['2021', '2022', '2023'].map((y) => <option key={y}>{y}</option>)}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('tiesub.system')} value={system} onChange={setSystem} />
              <Field label={t('tiesub.fault')} value={faultType} onChange={setFaultType} />
              <Field label={t('tiesub.dtc')} value={dtc} onChange={setDtc} />
              <Field label={t('tiesub.chapter')} value={chapter} onChange={setChapter} />
            </div>

            <label className="block text-xs font-bold uppercase text-slate-400">
              {t('tiesub.body')}
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder={t('tiesub.body.ph')}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>

            <button type="submit" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg">
              <Zap className="w-4 h-4" /> {t('tiesub.send')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs font-bold uppercase text-slate-400">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2" />
    </label>
  );
}
