'use client';

import { X, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { SimilarCaseRef } from '@/data/localizedData';

interface SimilarCaseDrawerProps {
  item: SimilarCaseRef | null;
  onClose: () => void;
}

export function SimilarCaseDrawer({ item, onClose }: SimilarCaseDrawerProps) {
  const { t } = useLanguage();
  if (!item) return null;

  const isTie = item.type === 'tie';

  const sections = [
    { labelKey: 'case.drawer.symptoms', value: item.symptoms, color: 'slate' as const, arrow: false },
    { labelKey: 'case.drawer.cause',    value: item.cause,    color: 'orange' as const, arrow: true },
    { labelKey: 'case.drawer.action',   value: item.action,   color: 'blue' as const,   arrow: true },
    { labelKey: 'case.drawer.result',   value: item.result,   color: 'green' as const,  arrow: true },
  ];

  const colorMap = {
    slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  label: 'text-slate-500',  text: 'text-slate-800'  },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', label: 'text-orange-600', text: 'text-orange-900' },
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'text-blue-600',   text: 'text-slate-800'  },
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  label: 'text-green-600',  text: 'text-slate-800'  },
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {isTie ? (
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">TIE</span>
              ) : (
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">Q&A</span>
              )}
              {item.hasBestAnswer && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-medium">
                  ✓ {t('case.best-answer')}
                </span>
              )}
            </div>
            <h2 className="font-bold text-slate-900 text-base leading-snug">{item.displayId}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{item.meta}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">

          {/* Symptoms → Cause → Action → Result */}
          {sections.map(({ labelKey, value, color, arrow }) => {
            const c = colorMap[color];
            return (
              <div key={labelKey}>
                {arrow && (
                  <div className="text-slate-300 text-xl ml-3 -mt-1 mb-2 leading-none">↓</div>
                )}
                <div className={`rounded-xl p-4 border ${c.bg} ${c.border}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${c.label}`}>
                    {t(labelKey as Parameters<typeof t>[0])}
                  </div>
                  <p className={`text-sm leading-relaxed ${c.text}`}>{value}</p>
                </div>
              </div>
            );
          })}

          {/* Why recommended */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700 mb-2">
              <Lightbulb className="w-4 h-4" />
              {t('case.drawer.why')}
            </div>
            <p className="text-sm text-violet-900 font-semibold leading-relaxed">
              {item.whyRecommended}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {t('btn.close')}
          </button>
        </div>
      </div>
    </>
  );
}
