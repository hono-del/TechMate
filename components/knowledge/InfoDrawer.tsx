'use client';

import { X, AlertTriangle, BookOpen } from 'lucide-react';
import { InfoClassBadge, TypeBadge } from '@/components/common/Badge';
import { useLanguage } from '@/context/LanguageContext';
import type { KnowledgeItem } from '@/types';

interface InfoDrawerProps {
  item: KnowledgeItem | null;
  onClose: () => void;
  citedPage?: string | null;
}

export function InfoDrawer({ item, onClose, citedPage }: InfoDrawerProps) {
  const { t } = useLanguage();
  if (!item) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[70] flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <TypeBadge type={item.type} />
              <InfoClassBadge cls={item.informationClass} />
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h2>
            <p className="text-xs text-slate-500 mt-1">📄 {item.source}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warnings — pinned */}
        {item.warnings && item.warnings.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-200 p-4 space-y-2">
            {item.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-orange-800 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
                {w}
              </div>
            ))}
          </div>
        )}

        {citedPage && (
          <div className="bg-violet-50 border-b border-violet-200 px-5 py-2.5 text-xs font-semibold text-violet-700">
            {t('drawer.cited-page')}: {citedPage}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {item.content ? (
            <pre className="font-sans text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{item.content}</pre>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                {t('drawer.summary-title')}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{item.summary}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <strong>{t('drawer.why')}:</strong> {item.whyRecommended}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              {item.informationClass === 'oem-official' && (
                <span className="flex items-center gap-1 text-blue-600 font-medium">✓ {t('drawer.official-note')}</span>
              )}
              {item.informationClass === 'field-knowledge' && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">◈ {t('drawer.field-note')}</span>
              )}
              {item.informationClass === 'ai-generated' && (
                <span className="flex items-center gap-1 text-violet-600 font-medium">✦ {t('drawer.ai-note')}</span>
              )}
            </div>
            <button onClick={onClose} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
              {t('btn.close')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
