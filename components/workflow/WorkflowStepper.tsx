'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Check, Home, ChevronLeft } from 'lucide-react';
import { WORKFLOW_STEPS, type WorkflowStep } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

const STEP_ORDER: WorkflowStep[] = [
  'reception', 'diagnosis', 'work-planning', 'repair', 'check-verify', 'handover'
];

const STEP_TRANSLATION_KEYS: Record<WorkflowStep, { label: TranslationKey; short: TranslationKey }> = {
  'reception':    { label: 'step.reception',    short: 'step.reception' },
  'diagnosis':    { label: 'step.diagnosis',    short: 'step.diagnosis' },
  'work-planning':{ label: 'step.work-planning', short: 'step.planning' },
  'repair':       { label: 'step.repair',       short: 'step.repair' },
  'check-verify': { label: 'step.check-verify', short: 'step.verify' },
  'handover':     { label: 'step.handover',     short: 'step.handover' },
};

export function WorkflowStepper({ jobId }: { jobId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const currentSegment = pathname.split('/').pop() ?? 'reception';
  const currentIndex = STEP_ORDER.indexOf(currentSegment as WorkflowStep);

  const navigateTo = (step: WorkflowStep) => {
    router.push(`/job/${jobId}/${step}`);
  };

  const prevStep = currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-0 flex items-stretch gap-0">
      {/* ── Left navigation: Home + Back ── */}
      <div className="flex items-center gap-1 pr-3 border-r border-slate-200 mr-3 flex-shrink-0">
        {/* Home */}
        <button
          onClick={() => router.push('/')}
          title={t('nav.home')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-brand-blue hover:bg-blue-50 transition-colors text-xs font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('nav.home')}</span>
        </button>

        {/* Back to previous step */}
        {prevStep ? (
          <button
            onClick={() => navigateTo(prevStep)}
            title={t('nav.prev-step')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-brand-blue hover:bg-blue-50 transition-colors text-xs font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('nav.back')}</span>
          </button>
        ) : (
          /* On first step, back goes to home (job list) */
          <button
            onClick={() => router.push('/')}
            title={t('nav.back')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition-colors text-xs font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('nav.back')}</span>
          </button>
        )}
      </div>

      {/* ── Step indicator ── */}
      <nav className="flex items-stretch gap-0 flex-1 overflow-x-auto">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const keys = STEP_TRANSLATION_KEYS[step.id];

          return (
            <button
              key={step.id}
              onClick={() => navigateTo(step.id)}
              className={`
                relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all
                border-b-[3px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                ${isActive
                  ? 'border-brand-blue text-brand-blue bg-blue-50'
                  : isCompleted
                    ? 'border-verified text-verified hover:bg-green-50 cursor-pointer'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer'
                }
              `}
            >
              <span className={`
                w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${isActive ? 'bg-brand-blue text-white' : isCompleted ? 'bg-verified text-white' : 'bg-slate-200 text-slate-500'}
              `}>
                {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
              </span>
              <span className="hidden sm:inline">{t(keys.label)}</span>
              <span className="sm:hidden">{t(keys.short)}</span>

              {idx < WORKFLOW_STEPS.length - 1 && (
                <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-slate-200 text-lg pointer-events-none z-10">›</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

