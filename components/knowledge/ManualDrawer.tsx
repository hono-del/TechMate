'use client';

import { X, BookOpen, AlertTriangle, CheckCircle2, List, Wrench, FlaskConical } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ManualRef } from '@/data/localizedData';

interface ManualDrawerProps {
  item: ManualRef | null;
  onClose: () => void;
}

export function ManualDrawer({ item, onClose }: ManualDrawerProps) {
  const { lang } = useLanguage();
  if (!item) return null;

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
        <div className="p-5 border-b border-slate-200 bg-blue-50 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                §{item.section}
              </span>
              <span className="text-xs text-blue-500 font-medium">{item.source}</span>
            </div>
            <h2 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-blue-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              {lang === 'ja' ? '概要' : 'Overview'}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{item.overview}</p>
          </div>

          {/* Key Points */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wide mb-3">
              <List className="w-3.5 h-3.5" />
              {lang === 'ja' ? 'ポイント' : 'Key Points'}
            </div>
            <ul className="space-y-2.5">
              {item.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-blue-900 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Procedure */}
          {item.procedure && item.procedure.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ja' ? '手順' : 'Procedure'}
              </div>
              <ol className="space-y-0">
                {item.procedure.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    {/* Step number + connector */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                      {i < item.procedure!.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 my-1" style={{ minHeight: '1rem' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-4 last:pb-0">
                      <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Specifications */}
          {item.spec && item.spec.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'ja' ? '規定値・仕様' : 'Specifications'}
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {item.spec.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="py-2 px-3 text-slate-500 font-medium w-1/2 rounded-l">{row.label}</td>
                      <td className="py-2 px-3 text-slate-900 font-bold font-mono text-right rounded-r">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Warning */}
          {item.warning && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lang === 'ja' ? '注意事項' : 'Caution'}
              </div>
              <p className="text-sm text-orange-800 leading-relaxed font-medium">{item.warning}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>
      </div>
    </>
  );
}
