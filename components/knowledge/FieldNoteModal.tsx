'use client';

import { useState } from 'react';
import { X, PenLine, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type NoteType = 'observation' | 'problem' | 'solution' | 'tip';

interface FieldNoteModalProps {
  onClose: () => void;
  step: string;
}

export function FieldNoteModal({ onClose, step }: FieldNoteModalProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<NoteType>('observation');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const NOTE_TYPES: { value: NoteType; labelKey: Parameters<typeof t>[0]; descKey: Parameters<typeof t>[0]; color: string }[] = [
    { value: 'observation', labelKey: 'fieldnote.type.observation', descKey: 'fieldnote.type.observation.desc', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'problem',     labelKey: 'fieldnote.type.problem',     descKey: 'fieldnote.type.problem.desc',     color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'solution',    labelKey: 'fieldnote.type.solution',    descKey: 'fieldnote.type.solution.desc',    color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'tip',         labelKey: 'fieldnote.type.tip',         descKey: 'fieldnote.type.tip.desc',         color: 'bg-amber-100 text-amber-700 border-amber-300' },
  ];

  const handleSubmit = () => {
    if (!content.trim()) return;
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  if (submitted) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('fieldnote.saved.title')}</h3>
            <p className="text-sm text-slate-500">{t('fieldnote.saved.body')}</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              ◈ {t('fieldnote.status')}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <PenLine className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('fieldnote.title')}</h2>
              <p className="text-xs text-slate-500">{step} — {t('fieldnote.subtitle')}</p>
            </div>
            <button onClick={onClose} className="ml-auto p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t('fieldnote.title')}</label>
              <div className="grid grid-cols-2 gap-2">
                {NOTE_TYPES.map(n => (
                  <button
                    key={n.value}
                    onClick={() => setType(n.value)}
                    className={`
                      text-left p-3 rounded-lg border-2 transition-all
                      ${type === n.value ? `${n.color} border-current` : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}
                    `}
                  >
                    <div className="font-semibold text-sm">{t(n.labelKey)}</div>
                    <div className="text-xs opacity-75">{t(n.descKey)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {NOTE_TYPES.find(n => n.value === type)?.labelKey ? t(NOTE_TYPES.find(n => n.value === type)!.labelKey) : ''}
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={type === 'observation' ? 'e.g. O2 sensor connector was corroded' : type === 'problem' ? 'e.g. Sensor threads were seized' : type === 'solution' ? 'e.g. Extended penetrating oil soak resolved thread seizure' : 'e.g. Use a heat gun (low) on the bung for 30 sec'}
              />
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              ◈ {t('fieldnote.info')}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t border-slate-200">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              {t('btn.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('btn.save-field-note')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
