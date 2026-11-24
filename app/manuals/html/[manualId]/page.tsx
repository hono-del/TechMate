'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { UserMenu } from '@/components/common/UserMenu';
import { getManual, getManualPages, type ManualDocLang } from '@/data/manuals';

export default function ManualHtmlPage() {
  const { t, lang, toggleLang } = useLanguage();
  const params = useParams();
  const search = useSearchParams();
  const manualId = params.manualId as string;
  const item = getManual(manualId);
  const requested = (search.get('lang') as ManualDocLang) || 'en';
  const docLang: ManualDocLang = item?.langs.includes(requested) ? requested : (item?.langs[0] ?? 'en');
  const pages = useMemo(() => (item ? getManualPages(item, docLang) : []), [item, docLang]);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-slate-500">{t('home.manuals.none')}</p>
        <Link href="/" className="text-brand-blue text-sm mt-4 inline-block">{t('home.manuals.html.back')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-blue">
          <ArrowLeft className="w-4 h-4" /> {t('home.manuals.html.back')}
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5"
          >
            {lang === 'en' ? '日本語' : 'English'}
          </button>
          <UserMenu variant="light" />
        </div>
      </header>

      <article className="max-w-3xl mx-auto my-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">HTML · {docLang.toUpperCase()}</div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{item.model} {item.year}</h1>
          <p className="text-xs text-slate-500 mt-1">{lang === 'ja' ? item.applicable.ja : item.applicable.en}</p>
          <p className="text-xs text-amber-700 mt-2">{t('home.manuals.html.demo')}</p>
        </div>
        <div className="px-8 py-8 space-y-8">
          {pages.map((page, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-navy mb-3">{page.heading}</h2>
              {page.sections.map((sec, si) => (
                <div key={si} className="mb-4">
                  {sec.heading && <h3 className="text-sm font-bold text-brand-blue mb-1">{sec.heading}</h3>}
                  {sec.body.map((line, li) => (
                    <p key={li} className="text-sm text-slate-700 leading-relaxed mb-1.5">{line}</p>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
