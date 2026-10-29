'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Sparkles, MessageCircle } from 'lucide-react';
import { REVIEW_QUEUE, type ReviewItem, type ReviewVerdict, type RootCause } from '@/data/admin/aiReview';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

const TRIGGER_KEY: Record<ReviewItem['trigger'], TranslationKey> = {
  flag: 'admin.review.trigger.flag',
  low: 'admin.review.trigger.low',
  pending: 'admin.review.trigger.pending',
};

export default function AiReviewPage() {
  const { t } = useLanguage();
  const [openIds, setOpenIds] = useState<string[]>(REVIEW_QUEUE.map((i) => i.id));
  const [selectedId, setSelectedId] = useState(REVIEW_QUEUE[0].id);
  const [verdict, setVerdict] = useState<ReviewVerdict>(null);
  const [root, setRoot] = useState<RootCause>(null);
  const [correction, setCorrection] = useState('');
  const [done, setDone] = useState(false);

  const queue = REVIEW_QUEUE.filter((i) => openIds.includes(i.id));
  const selected = REVIEW_QUEUE.find((i) => i.id === selectedId) ?? REVIEW_QUEUE[0];
  const overdue = selected.hoursOpen > 24;

  const submit = () => {
    if (!verdict || !root) return;
    const remaining = openIds.filter((id) => id !== selected.id);
    setOpenIds(remaining);
    setDone(true);
    const fallback = REVIEW_QUEUE.find((i) => remaining.includes(i.id));
    setTimeout(() => {
      setDone(false);
      setVerdict(null);
      setRoot(null);
      setCorrection('');
      if (fallback) setSelectedId(fallback.id);
    }, 1600);
  };

  return (
    <div className="flex h-full">
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('admin.review.queue')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{queue.length} · {t('admin.review.sla')}</p>
        </div>
        {queue.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">{t('admin.review.done')}</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {queue.map((item) => {
              const active = item.id === selected.id;
              const late = item.hoursOpen > 24;
              return (
                <button
                  key={item.id}
                  className={`w-full text-left px-4 py-3.5 ${active ? 'bg-brand-blue/5 border-r-2 border-brand-blue' : 'hover:bg-slate-50'}`}
                  onClick={() => {
                    setSelectedId(item.id);
                    setVerdict(null);
                    setRoot(null);
                    setCorrection('');
                    setDone(false);
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {item.kind === 'ai' ? (
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {t(item.kind === 'ai' ? 'admin.review.kind.ai' : 'admin.review.kind.field')}
                    </span>
                    {late && (
                      <span className="text-[10px] font-bold uppercase text-red-600">{t('admin.review.overdue')}</span>
                    )}
                  </div>
                  <p className={`text-sm font-semibold ${active ? 'text-brand-blue' : 'text-slate-800'}`}>{item.title}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.hoursOpen}h · {t(TRIGGER_KEY[item.trigger])}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 max-w-3xl space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t('admin.review.title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('admin.review.subtitle')}</p>
          </div>

          {queue.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-500">
              {t('admin.review.done')}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900">{selected.title}</h2>
                {overdue && (
                  <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {t('admin.review.overdue')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Meta label={t('admin.review.job')} value={`${selected.jobId} · ${selected.dealer}`} />
                <Meta label={t('admin.review.confidence')} value={selected.confidence} />
                <Meta label={t('admin.review.why')} value={t(TRIGGER_KEY[selected.trigger])} />
                <Meta label={t('header.technician')} value={selected.technician} />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800 flex gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {selected.why}
              </div>

              <Field label={t('admin.review.query')} body={selected.query} />
              <Field label={t('admin.review.answer')} body={selected.answer} />
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{t('admin.review.sources')}</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {selected.sources.map((s) => (
                    <li key={s}>· {s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-600 mb-2">{t('admin.review.verdict')}</div>
                <div className="flex gap-2 flex-wrap">
                  {(['correct', 'partial', 'incorrect'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVerdict(v)}
                      className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${
                        verdict === v
                          ? 'bg-navy text-white border-navy'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t(`admin.review.${v}` as TranslationKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-600 mb-2">{t('admin.review.root')}</div>
                <div className="flex gap-2 flex-wrap">
                  {(['search', 'content', 'generation'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoot(r)}
                      className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${
                        root === r
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t(`admin.review.root.${r}` as TranslationKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">{t('admin.review.correction')}</label>
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  rows={3}
                  placeholder={t('admin.review.correction-ph')}
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>

              <button
                type="button"
                disabled={!verdict || !root}
                onClick={submit}
                className="bg-navy hover:bg-navy-light disabled:opacity-40 text-white text-sm font-bold px-4 py-2 rounded-lg"
              >
                {t('admin.review.submit')}
              </button>
              {done && (
                <p className="text-sm text-teal font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {t('admin.review.done')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-sm text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</div>
      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">{body}</p>
    </div>
  );
}
