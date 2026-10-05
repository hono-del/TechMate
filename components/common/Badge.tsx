'use client';

import type { InformationClass, KnowledgeItemType, Relevance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export function InfoClassBadge({ cls }: { cls: InformationClass }) {
  const { t } = useLanguage();
  const config: Record<InformationClass, { key: Parameters<typeof t>[0]; className: string }> = {
    'oem-official':    { key: 'badge.oem-official',    className: 'bg-blue-50 text-blue-700 border border-blue-200' },
    'field-knowledge': { key: 'badge.field-knowledge', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    'ai-generated':    { key: 'badge.ai-generated',    className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  };
  const { key, className } = config[cls];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {t(key)}
    </span>
  );
}

export function TypeBadge({ type }: { type: KnowledgeItemType }) {
  const { t } = useLanguage();
  const config: Record<KnowledgeItemType, { key: Parameters<typeof t>[0]; className: string }> = {
    manual:    { key: 'type.manual',    className: 'bg-slate-100 text-slate-700' },
    tie:       { key: 'type.tie',       className: 'bg-blue-100 text-blue-700' },
    qa:        { key: 'type.qa',        className: 'bg-teal-100 text-teal-700' },
    warning:   { key: 'type.warning',   className: 'bg-orange-100 text-orange-700 font-bold' },
    checklist: { key: 'type.checklist', className: 'bg-green-100 text-green-700' },
    parts:     { key: 'type.parts',     className: 'bg-indigo-100 text-indigo-700' },
    tools:     { key: 'type.tools',     className: 'bg-purple-100 text-purple-700' },
    case:      { key: 'type.case',      className: 'bg-amber-100 text-amber-700' },
  };
  const { key, className } = config[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {t(key)}
    </span>
  );
}

export function RelevanceBadge({ relevance }: { relevance: Relevance }) {
  const { t } = useLanguage();
  const config: Record<Relevance, { key: Parameters<typeof t>[0]; className: string }> = {
    high:   { key: 'relevance.high',   className: 'text-green-700 font-semibold text-xs' },
    medium: { key: 'relevance.medium', className: 'text-yellow-600 text-xs' },
    low:    { key: 'relevance.low',    className: 'text-slate-400 text-xs' },
  };
  const { key, className } = config[relevance];
  return <span className={className}>{t(key)}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const config: Record<string, { key: Parameters<typeof t>[0]; className: string }> = {
    'in-progress':        { key: 'status.in-progress',        className: 'bg-blue-100 text-blue-700' },
    scheduled:            { key: 'status.scheduled',           className: 'bg-slate-100 text-slate-600' },
    completed:            { key: 'status.completed',           className: 'bg-green-100 text-green-700' },
    'on-hold':            { key: 'status.on-hold',             className: 'bg-amber-100 text-amber-700' },
    ready:                { key: 'status.ready',               className: 'bg-green-100 text-green-700 font-semibold' },
    'additional-check':   { key: 'status.additional-check',    className: 'bg-orange-100 text-orange-700 font-semibold' },
  };
  const entry = config[status] ?? { key: 'status.in-progress' as Parameters<typeof t>[0], className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.className}`}>
      {t(entry.key)}
    </span>
  );
}

export function ProbabilityBadge({ probability }: { probability: 'high' | 'medium' | 'low' }) {
  const { t } = useLanguage();
  const config = {
    high:   { key: 'prob.high'   as Parameters<typeof t>[0], className: 'bg-red-100 text-red-700 border border-red-200' },
    medium: { key: 'prob.medium' as Parameters<typeof t>[0], className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    low:    { key: 'prob.low'    as Parameters<typeof t>[0], className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  };
  const { key, className } = config[probability];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {t(key)}
    </span>
  );
}
