'use client';

import { useState } from 'react';
import { Bell, Clock, Headphones, Megaphone, Newspaper, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { NEWS_ITEMS, type NewsItem, type NewsKind } from '@/data/news';
import type { TranslationKey } from '@/lib/translations';

const KIND_META: Record<NewsKind, { key: TranslationKey; icon: typeof Bell; cls: string }> = {
  helpdesk: { key: 'news.kind.helpdesk', icon: Headphones, cls: 'bg-blue-50 text-brand-blue' },
  release:  { key: 'news.kind.release',  icon: Megaphone,  cls: 'bg-violet-50 text-violet-700' },
  bulletin: { key: 'news.kind.bulletin', icon: Newspaper,  cls: 'bg-amber-50 text-amber-800' },
};

function KindChip({ kind }: { kind: NewsKind }) {
  const { t } = useLanguage();
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${meta.cls}`}>
      <Icon className="w-3 h-3" />
      {t(meta.key)}
    </span>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(!!item.pinned);
  const title = lang === 'ja' ? item.titleJa : item.titleEn;
  const body = lang === 'ja' ? item.bodyJa : item.bodyEn;

  return (
    <article className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <KindChip kind={item.kind} />
            {item.pinned && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                {t('news.pinned')}
              </span>
            )}
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.date}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">{title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{body}</p>
        </div>
      )}
    </article>
  );
}

export function LatestNewsModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const items = [...NEWS_ITEMS].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date.localeCompare(a.date);
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-8 mx-auto w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[calc(100vh-4rem)] animate-slide-up">
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-orange-50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 text-orange-700 font-bold">
              <Bell className="w-4 h-4" />
              {t('news.title')}
            </div>
            <p className="text-xs text-orange-700/80 mt-1">{t('news.subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-orange-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto space-y-2.5">
          {items.map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
