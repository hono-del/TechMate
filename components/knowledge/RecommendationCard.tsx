'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, ChevronRight, AlertTriangle, BookOpen, Zap, MessageSquare, CheckSquare, Package, Wrench, Lightbulb } from 'lucide-react';
import { InfoClassBadge, TypeBadge, RelevanceBadge } from '@/components/common/Badge';
import { useLanguage } from '@/context/LanguageContext';
import type { KnowledgeItem, KnowledgeItemType } from '@/types';

// moved inside component — module-level JSX can cause SSR/client hydration drift

type FeedbackReason = 'unrelated' | 'hard-to-understand' | 'incorrect' | 'insufficient' | 'other';

interface RecommendationCardProps {
  item: KnowledgeItem;
  onOpen?: (item: KnowledgeItem) => void;
  compact?: boolean;
}

export function RecommendationCard({ item, onOpen, compact = false }: RecommendationCardProps) {
  const { t } = useLanguage();

  const TYPE_ICONS: Record<KnowledgeItemType, React.ReactNode> = {
    manual:    <BookOpen className="w-4 h-4" />,
    tie:       <Zap className="w-4 h-4" />,
    qa:        <MessageSquare className="w-4 h-4" />,
    warning:   <AlertTriangle className="w-4 h-4 text-warning" />,
    checklist: <CheckSquare className="w-4 h-4" />,
    parts:     <Package className="w-4 h-4" />,
    tools:     <Wrench className="w-4 h-4" />,
    case:      <Lightbulb className="w-4 h-4" />,
  };
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showReasons, setShowReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);
  const [feedbackDone, setFeedbackDone] = useState(false);

  const isWarning = item.type === 'warning';

  const FEEDBACK_REASONS: { value: FeedbackReason; key: Parameters<typeof t>[0] }[] = [
    { value: 'unrelated',          key: 'feedback.unrelated' },
    { value: 'hard-to-understand', key: 'feedback.hard-to-understand' },
    { value: 'incorrect',          key: 'feedback.incorrect' },
    { value: 'insufficient',       key: 'feedback.insufficient' },
    { value: 'other',              key: 'feedback.other' },
  ];

  const handleHelpful = () => { setFeedback('helpful'); setFeedbackDone(true); };
  const handleNotHelpful = () => { setFeedback('not-helpful'); setShowReasons(true); };
  const handleReason = (reason: FeedbackReason) => {
    setSelectedReason(reason);
    setFeedbackDone(true);
    setShowReasons(false);
  };

  return (
    <div className={`
      rounded-xl border shadow-sm bg-white transition-shadow hover:shadow-md
      ${isWarning ? 'border-orange-300 bg-orange-50' : 'border-slate-200'}
      ${compact ? 'p-3' : 'p-4'}
    `}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5
          ${isWarning ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}
        `}>
          {TYPE_ICONS[item.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <TypeBadge type={item.type} />
            <InfoClassBadge cls={item.informationClass} />
            <RelevanceBadge relevance={item.relevance} />
          </div>

          <button onClick={() => onOpen?.(item)} className="text-left w-full group">
            <h3 className={`
              font-semibold leading-snug group-hover:text-brand-blue transition-colors text-sm
              ${isWarning ? 'text-orange-800' : 'text-slate-900'}
            `}>
              {item.title}
              {onOpen && <ChevronRight className="w-4 h-4 inline ml-1 text-slate-400 group-hover:text-brand-blue transition-colors" />}
            </h3>
          </button>
        </div>
      </div>

      {/* Warnings */}
      {isWarning && item.warnings && (
        <div className="mb-3 space-y-1.5">
          {item.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 bg-orange-100 border border-orange-300 rounded-lg px-3 py-2 text-xs text-orange-800 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.summary}</p>

      {/* Why recommended */}
      {!compact && (
        <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
          <span className="text-violet-500">✦</span>
          <span className="italic">{t('why-recommended')}: {item.whyRecommended}</span>
        </div>
      )}

      {/* Source */}
      <div className="text-xs text-slate-400 mb-3">
        📄 <span className="font-medium text-slate-500">{item.source}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
        {onOpen ? (
          <button onClick={() => onOpen(item)} className="text-xs font-medium text-brand-blue hover:underline flex items-center gap-1">
            {t('btn.view-full')} <ChevronRight className="w-3 h-3" />
          </button>
        ) : <div />}

        <div className="flex items-center gap-2">
          {feedbackDone ? (
            <span className="text-xs text-slate-400">
              {feedback === 'helpful' ? t('feedback.thanks') : `${t('feedback.noted')} (${selectedReason ?? ''})`}
            </span>
          ) : showReasons ? (
            <div className="flex flex-col gap-1 items-end">
              <span className="text-xs text-slate-500 font-medium">{t('feedback.why')}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {FEEDBACK_REASONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => handleReason(r.value)}
                    className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {t(r.key)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 mr-1">{t('feedback.helpful')}</span>
              <button onClick={handleHelpful} className="p-1 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors" title={t('feedback.yes')}>
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleNotHelpful} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title={t('feedback.no')}>
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
