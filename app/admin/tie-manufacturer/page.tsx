'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Undo2, XCircle, Upload } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  readTieQueue,
  writeTieQueue,
  type TieApprovalStatus,
  type TieSubmission,
} from '@/data/admin/tieFlow';
import type { TranslationKey } from '@/lib/translations';
import { TieBody } from '@/components/admin/TieBody';

const STATUS_KEY: Record<TieApprovalStatus, TranslationKey> = {
  draft: 'tieq.status.draft',
  submitted: 'tieq.status.submitted',
  'review-requested': 'tieq.status.review',
  'correction-requested': 'tieq.status.correction',
  approved: 'tieq.status.approved',
  rejected: 'tieq.status.rejected',
  published: 'tieq.status.published',
};

const STATUS_CLS: Record<TieApprovalStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-amber-100 text-amber-800',
  'review-requested': 'bg-indigo-100 text-indigo-800',
  'correction-requested': 'bg-orange-100 text-orange-800',
  approved: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-green-100 text-green-800',
};

export default function TieManufacturerPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<TieSubmission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const q = readTieQueue().filter(i =>
      i.status === 'review-requested' || i.status === 'published' || i.status === 'rejected' || i.status === 'approved'
    );
    setItems(q.length ? q : readTieQueue().filter(i => i.status !== 'draft'));
    setSelectedId((q[0] ?? readTieQueue()[0])?.id ?? null);
  }, []);

  const selected = items.find(i => i.id === selectedId) ?? items[0];

  const patch = (id: string, status: TieApprovalStatus, note: TranslationKey) => {
    const all = readTieQueue().map(i => (i.id === id ? { ...i, status } : i));
    writeTieQueue(all);
    const next = all.filter(i =>
      i.status === 'review-requested' || i.status === 'published' || i.status === 'rejected' || i.status === 'approved'
    );
    setItems(next);
    setMsg(t(note));
  };

  return (
    <div className="flex h-full">
      <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('tieq.mfr.queue')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t('tieq.mfr.flow')}</p>
        </div>
        <div className="divide-y divide-slate-50">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setSelectedId(item.id); setMsg(null); }}
              className={`w-full text-left px-4 py-3.5 ${item.id === selected?.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="text-sm font-semibold text-slate-800 leading-snug mb-1.5">{item.title}</div>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${STATUS_CLS[item.status]}`}>
                {t(STATUS_KEY[item.status])}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {selected && (
        <div className="flex-1 overflow-y-auto px-8 py-6 max-w-3xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t('tieq.mfr.title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('tieq.mfr.subtitle')}</p>
          </div>

          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${STATUS_CLS[selected.status]}`}>
            {t('tieq.notify')}: {t(STATUS_KEY[selected.status])}
          </div>

          <TieBody item={selected} />

          {msg && (
            <div className="bg-teal/10 border border-teal/20 rounded-lg px-4 py-2.5 text-sm text-teal font-medium">{msg}</div>
          )}

          {selected.status === 'review-requested' && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => patch(selected.id, 'published', 'tieq.msg.published')}
                className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-bold px-3.5 py-2 rounded-lg"
              >
                <Upload className="w-4 h-4" /> {t('tieq.publish')}
              </button>
              <button
                type="button"
                onClick={() => patch(selected.id, 'correction-requested', 'tieq.msg.changes')}
                className="inline-flex items-center gap-2 bg-navy text-white text-sm font-bold px-3.5 py-2 rounded-lg"
              >
                <Undo2 className="w-4 h-4" /> {t('tieq.changes')}
              </button>
              <button
                type="button"
                onClick={() => patch(selected.id, 'rejected', 'tieq.msg.rejected')}
                className="inline-flex items-center gap-2 bg-red-700 text-white text-sm font-bold px-3.5 py-2 rounded-lg"
              >
                <XCircle className="w-4 h-4" /> {t('tieq.reject')}
              </button>
            </div>
          )}
          {selected.status === 'published' && (
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {t('tieq.msg.published')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
