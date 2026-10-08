'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, FileText, List,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  MANUAL_MODELS,
  manualsFor,
  yearsForModel,
  getManualPages,
  type ManualCatalogItem,
  type ManualKind,
} from '@/data/manuals';
import type { TranslationKey } from '@/lib/translations';

const KIND_BADGE: Record<ManualKind, { key: TranslationKey; cls: string }> = {
  om:  { key: 'home.manuals.om',  cls: 'bg-teal-light text-teal' },
  sm:  { key: 'home.manuals.sm',  cls: 'bg-blue-50 text-brand-blue' },
  tm:  { key: 'home.manuals.tm',  cls: 'bg-violet-50 text-violet-700' },
  brm: { key: 'home.manuals.brm', cls: 'bg-orange-50 text-orange-700' },
  wd:  { key: 'home.manuals.wd',  cls: 'bg-slate-100 text-slate-700' },
  tn:  { key: 'home.manuals.tn',  cls: 'bg-amber-50 text-amber-800' },
};

const KIND_FULL: Record<ManualKind, TranslationKey> = {
  om:  'home.manuals.om.full',
  sm:  'home.manuals.sm.full',
  tm:  'home.manuals.tm.full',
  brm: 'home.manuals.brm.full',
  wd:  'home.manuals.wd.full',
  tn:  'home.manuals.tn.full',
};

function KindBadge({ kind }: { kind: ManualKind }) {
  const { t } = useLanguage();
  const meta = KIND_BADGE[kind];
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded whitespace-nowrap ${meta.cls}`}>
      {t(meta.key)}
    </span>
  );
}

function PdfViewer({ item, onClose }: { item: ManualCatalogItem; onClose: () => void }) {
  const { lang, t } = useLanguage();
  const pages = useMemo(() => getManualPages(item, lang), [item, lang]);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [tocOpen, setTocOpen] = useState(true);
  const current = pages[page];

  useEffect(() => { setPage(0); }, [item.id, lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setPage(p => Math.min(pages.length - 1, p + 1));
      if (e.key === 'ArrowLeft') setPage(p => Math.max(0, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, pages.length]);

  const go = (delta: number) => setPage(p => Math.min(pages.length - 1, Math.max(0, p + delta)));

  return (
    <div className="fixed inset-0 z-[80] bg-navy flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-navy-light border-b border-white/10 flex-shrink-0">
        <button
          onClick={() => setTocOpen(v => !v)}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          title={t('pdf.toc')}
        >
          <List className="w-4 h-4" />
        </button>
        <FileText className="w-4 h-4 text-blue-300 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-semibold truncate">{item.fileName}</div>
          <div className="text-[10px] text-white/50 truncate">
            {item.model} · {item.year} · {t('home.manuals.rev')} {item.revision} · {t('pdf.demo-note')}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-1">
          <button onClick={() => setZoom(z => Math.max(70, z - 15))} className="p-1.5 text-white/70 hover:text-white">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/80 w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(140, z + 15))} className="p-1.5 text-white/70 hover:text-white">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => go(-1)}
            disabled={page === 0}
            className="p-1.5 rounded-lg text-white/70 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white font-medium tabular-nums px-1">
            {page + 1} / {pages.length}
          </span>
          <button
            onClick={() => go(1)}
            disabled={page === pages.length - 1}
            className="p-1.5 rounded-lg text-white/70 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button onClick={onClose} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {tocOpen && (
          <aside className="w-56 bg-navy-light border-r border-white/10 overflow-y-auto flex-shrink-0">
            <div className="px-3 py-3 text-[10px] font-bold text-white/40 uppercase tracking-wide">{t('pdf.toc')}</div>
            {pages.map((p, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-full text-left px-3 py-2 text-xs border-l-2 ${
                  i === page
                    ? 'border-brand-blue bg-white/10 text-white font-semibold'
                    : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-white/30 mr-1.5">{i + 1}</span>
                {p.title}
              </button>
            ))}
          </aside>
        )}

        <div className="flex-1 overflow-auto bg-[#3d4a5c] px-6 py-8">
          <div
            className="mx-auto bg-white shadow-2xl origin-top"
            style={{
              width: 680,
              minHeight: 920,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              marginBottom: zoom > 100 ? 120 : 0,
            }}
          >
            {/* Paper */}
            <div className="px-12 py-10 flex flex-col min-h-[920px]">
              <div className="flex items-center justify-between border-b-2 border-navy pb-3 mb-8">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-navy uppercase">TechMate OEM</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.fileName}</div>
                </div>
                <KindBadge kind={item.kind} />
              </div>

              <h1 className="text-2xl font-bold text-navy tracking-tight mb-6">{current.heading}</h1>

              <div className="space-y-6 flex-1">
                {current.sections.map((sec, si) => (
                  <div key={si}>
                    {sec.heading && (
                      <h2 className="text-sm font-bold text-brand-blue mb-2">{sec.heading}</h2>
                    )}
                    <div className="space-y-2">
                      {sec.body.map((line, li) => (
                        <p key={li} className="text-sm text-slate-700 leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>{item.model} {item.year} MY · Rev.{item.revision}</span>
                <span>— {page + 1} —</span>
                <span>{t('pdf.confidential')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManualBrowserCard() {
  const { t } = useLanguage();
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [openItem, setOpenItem] = useState<ManualCatalogItem | null>(null);

  const years = model ? yearsForModel(model) : [];
  const items = model && year ? manualsFor(model, year) : [];

  const selectCls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue';

  return (
    <>
      <div className="w-full mb-8 bg-white border border-blue-200 rounded-2xl px-5 py-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900">{t('home.manuals')}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t('home.manuals.hint')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t('aisearch.filter.model')}</span>
            <select
              value={model}
              onChange={e => {
                setModel(e.target.value);
                setYear('');
              }}
              className={`${selectCls} mt-1`}
            >
              <option value="">{t('home.manuals.choose-model')}</option>
              {MANUAL_MODELS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t('aisearch.filter.year')}</span>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              disabled={!model}
              className={`${selectCls} mt-1 disabled:bg-slate-50 disabled:text-slate-400`}
            >
              <option value="">{t('home.manuals.choose-year')}</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>

        {!model && (
          <p className="text-xs text-slate-400">{t('home.manuals.prompt')}</p>
        )}
        {model && !year && (
          <p className="text-xs text-slate-400">{t('home.manuals.prompt-year')}</p>
        )}
        {model && year && items.length === 0 && (
          <p className="text-sm text-slate-500">{t('home.manuals.none')}</p>
        )}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setOpenItem(item)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50/50 transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-brand-blue">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <KindBadge kind={item.kind} />
                    <span className="text-sm font-semibold text-slate-900 truncate">{t(KIND_FULL[item.kind])}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {item.fileName} · {item.pageCount} {t('home.manuals.pages')} · {t('home.manuals.rev')} {item.revision}
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-blue whitespace-nowrap">{t('home.manuals.open')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {openItem && <PdfViewer item={openItem} onClose={() => setOpenItem(null)} />}
    </>
  );
}

export function ManualBrowserModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [openItem, setOpenItem] = useState<ManualCatalogItem | null>(null);

  const years = model ? yearsForModel(model) : [];
  const items = model && year ? manualsFor(model, year) : [];
  const selectCls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue';

  if (openItem) {
    return <PdfViewer item={openItem} onClose={() => setOpenItem(null)} />;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-8 mx-auto w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[calc(100vh-4rem)] animate-slide-up">
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-blue-50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 text-brand-blue font-bold">
              <BookOpen className="w-4 h-4" />
              {t('home.manuals')}
            </div>
            <p className="text-xs text-blue-600 mt-1">{t('home.manuals.hint')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-blue-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t('aisearch.filter.model')}</span>
              <select value={model} onChange={e => { setModel(e.target.value); setYear(''); }} className={`${selectCls} mt-1`}>
                <option value="">{t('home.manuals.choose-model')}</option>
                {MANUAL_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t('aisearch.filter.year')}</span>
              <select value={year} onChange={e => setYear(e.target.value)} disabled={!model} className={`${selectCls} mt-1 disabled:bg-slate-50`}>
                <option value="">{t('home.manuals.choose-year')}</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setOpenItem(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50/50 text-left"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <KindBadge kind={item.kind} />
                      <span className="text-sm font-semibold truncate">{t(KIND_FULL[item.kind])}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">{item.fileName} · {item.pageCount} {t('home.manuals.pages')}</div>
                  </div>
                  <span className="text-xs font-bold text-brand-blue">{t('home.manuals.open')}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">{model && year ? t('home.manuals.none') : t('home.manuals.prompt')}</p>
          )}
        </div>
      </div>
    </>
  );
}
