'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { TieSubmission } from '@/data/admin/tieFlow';

export function TieBody({ item }: { item: TieSubmission }) {
  const { t } = useLanguage();
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 text-sm">
      <h2 className="text-base font-bold text-slate-900">{item.title}</h2>
      <Meta label={t('tiesub.system')} value={`${item.system} · ${item.faultType}`} />
      <Meta label={t('vehicle.model')} value={`${item.year} ${item.model}`} />
      <Meta label={t('tiesub.dtc')} value={item.dtc || '—'} />
      <Meta label={t('tiesub.chapter')} value={item.chapter || '—'} />
      <Meta label={t('tiesub.drive')} value={item.driveType || '—'} />
      <Meta label={t('tiesub.powertrain')} value={item.powertrain || '—'} />
      <Meta label={t('tiesub.tags')} value={item.tags.join(', ') || '—'} />
      <Meta label={t('tieq.author')} value={`${item.author} · ${item.dealer}`} />
      <Meta label={t('tieq.when')} value={item.submittedAt} />
      <div className="pt-3">
        <div className="text-xs font-bold uppercase text-slate-400 mb-1">{t('tiesub.problem')}</div>
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.problem}</p>
      </div>
      <div>
        <div className="text-xs font-bold uppercase text-slate-400 mb-1">{t('tiesub.action')}</div>
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.action}</p>
      </div>
      {item.attachments.length > 0 && (
        <p className="text-xs text-slate-500">{t('tiesub.media')}: {item.attachments.map(a => a.name).join(', ')}</p>
      )}
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}
