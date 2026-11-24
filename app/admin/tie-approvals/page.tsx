'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Undo2, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  'review-requested': 'bg-blue-100 text-blue-800',
  'correction-requested': 'bg-orange-100 text-orange-800',
  approved: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-green-100 text-green-800',
};

export default function TieApprovalsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isLeader = user?.role === 'technician-manager' || user?.role === 'dealer-admin' || user?.role === 'system-admin';
  const [items, setItems] = useState<TieSubmission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const q = readTieQueue().filter(i => i.status !== 'draft');
    setItems(q);
    setSelectedId(q[0]?.id ?? null);
  }, []);

  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  const patch = (id: string, status: TieApprovalStatus, note: TranslationKey) => {
    const all = readTieQueue().map((i) => (i.id === id ? { ...i, status } : i));
    writeTieQueue(all);
    setItems(all.filter(i => i.status !== 'draft'));
    setMsg(t(note));
  };

  return (
    <div className="flex h-full">
      <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('tieq.queue')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{items.length} · {t('tieq.flow')}</p>
        </div>
        <div className="divide-y divide-slate-50">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setSelectedId(item.id); setMsg(null); }}
              className={`w-full text-left px-4 py-3.5 ${item.id === selected?.id ? 'bg-brand-blue/5 border-r-2 border-brand-blue' : 'hover:bg-slate-50'}`}
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
            <h1 className="text-xl font-bold text-slate-900">{t('tieq.title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('tieq.subtitle')}</p>
          </div>

          <ol className="flex flex-wrap gap-2 text-[11px] font-bold uppercase text-slate-400">
            {(['submitted', 'review-requested', 'published'] as TieApprovalStatus[]).map((s, i) => (
              <li key={s} className={`px-2 py-1 rounded ${selected.status === s ? STATUS_CLS[s] : 'bg-slate-100'}`}>
                {i + 1}. {t(STATUS_KEY[s])}
              </li>
            ))}
          </ol>

          <TieBody item={selected} />

          {msg && (
            <div className="bg-teal/10 border border-teal/20 rounded-lg px-4 py-2.5 text-sm text-teal font-medium">{msg}</div>
          )}

          <div className="flex flex-wrap gap-2">
            {isLeader && selected.status === 'submitted' && (
              <>
                <Action icon={ArrowRight} label={t('tieq.forward')} onClick={() => patch(selected.id, 'review-requested', 'tieq.msg.forward')} />
                <Action icon={Undo2} label={t('tieq.changes')} onClick={() => patch(selected.id, 'correction-requested', 'tieq.msg.changes')} />
                <Action icon={XCircle} label={t('tieq.reject')} onClick={() => patch(selected.id, 'rejected', 'tieq.msg.rejected')} />
              </>
            )}
            {isLeader && selected.status === 'review-requested' && (
              <p className="text-xs text-slate-500">{t('tieq.mfr-wait')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Action({ icon: Icon, label, onClick }: { icon: typeof CheckCircle2; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-bold px-3.5 py-2 rounded-lg"
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}
