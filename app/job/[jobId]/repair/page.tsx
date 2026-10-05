'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { REPAIR_STEPS } from '@/data/mockData';
import { getLocalizedJob, getLocalizedKnowledge } from '@/data/localizedData';
import { RecommendationCard } from '@/components/knowledge/RecommendationCard';
import { InfoDrawer } from '@/components/knowledge/InfoDrawer';
import { FieldNoteModal } from '@/components/knowledge/FieldNoteModal';
import { UnexpectedObservationModal } from '@/components/knowledge/UnexpectedObservationModal';
import { useLanguage } from '@/context/LanguageContext';
import type { KnowledgeItem } from '@/types';
import {
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  PenLine, ArrowRight, PlayCircle, Zap,
} from 'lucide-react';

export default function RepairPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [drawerItem, setDrawerItem] = useState<KnowledgeItem | null>(null);
  const [showFieldNote, setShowFieldNote] = useState(false);
  const [showUnexpected, setShowUnexpected] = useState(false);
  const [warningConfirmed, setWarningConfirmed] = useState(false);

  const job = getLocalizedJob(lang);
  // Use localized procedure steps (same ids, localized text)
  const localizedSteps = job.workPlan?.procedure ?? REPAIR_STEPS;
  const currentStep = localizedSteps[currentStepIdx];
  const totalSteps = localizedSteps.length;
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === totalSteps - 1;
  const allCompleted = localizedSteps.every(s => completedSteps.has(s.id));

  const knowledgeItems = getLocalizedKnowledge('repair', job.dtcs, job.vehicle.model, lang)
    .filter(k => k.type !== 'warning');

  const stepHasWarnings = currentStep.warnings && currentStep.warnings.length > 0;
  // 完了済みステップは再度警告確認不要。未完了ステップのみ確認を要求。
  const isCurrentStepDone = completedSteps.has(currentStep.id);
  const needsWarningConfirm = stepHasWarnings && !warningConfirmed && !isCurrentStepDone;

  const completeStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep.id]));
    setWarningConfirmed(false);
    if (!isLastStep) setCurrentStepIdx(idx => idx + 1);
  };

  const goToPrevStep = () => {
    setWarningConfirmed(false);
    setCurrentStepIdx(idx => Math.max(0, idx - 1));
  };

  const goToNextStep = () => {
    setWarningConfirmed(false);
    setCurrentStepIdx(idx => Math.min(totalSteps - 1, idx + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Purpose */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-blue-900 text-sm">{t('repair.banner.title')}: {job.workPlan!.repairDescription}</div>
          <div className="text-sm text-blue-700 mt-0.5">{t('repair.banner.body')}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Step navigator */}
        <div className="col-span-1 space-y-4">

          {/* Step progress */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">{t('repair.step-progress')}</h2>
            <div className="space-y-1.5">
              {localizedSteps.map((step, idx) => {
                const isDone = completedSteps.has(step.id);
                const isActive = idx === currentStepIdx;
                return (
                  <button
                    key={step.id}
                    onClick={() => { setCurrentStepIdx(idx); setWarningConfirmed(false); }}
                    className={`
                      w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all
                      ${isActive ? 'bg-blue-50 border border-blue-300' : 'hover:bg-slate-50 border border-transparent'}
                    `}
                  >
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                      ${isDone ? 'bg-verified text-white' : isActive ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'}
                    `}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : isDone ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-verified rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.size / totalSteps) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1 text-right">
              {completedSteps.size}/{totalSteps} {t('repair.steps-done')}
            </div>
          </section>

          {/* Torque reference */}
          {job.workPlan!.torqueValues.length > 0 && (
            <section className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-blue-700 mb-2">🔩 {t('planning.torque-specs')}</div>
              {job.workPlan!.torqueValues.map(tv => (
                <div key={tv.location} className="text-sm">
                  <div className="text-blue-600">{tv.location}</div>
                  <div className="font-mono font-black text-blue-900 text-xl">{tv.value} <span className="text-sm font-normal">{tv.unit}</span></div>
                  <div className="text-xs text-blue-500">{tv.source}</div>
                  <div className="text-xs text-blue-500 mt-1">✓ {t('planning.oem-official')}</div>
                </div>
              ))}
            </section>
          )}

          {/* Add Field Note */}
          <button
            onClick={() => setShowFieldNote(true)}
            className="w-full flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
          >
            <PenLine className="w-4 h-4" />
            {t('btn.add-field-note')}
          </button>
        </div>

        {/* Center: Current Step */}
        <div className="col-span-2 space-y-4">

          {/* Warnings — pinned before step content */}
          {stepHasWarnings && (
            <div className="space-y-2">
              {currentStep.warnings!.map((w, i) => (
                <div key={i} className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-orange-900 mb-0.5">⚠ {t('repair.warning-label')}</div>
                    <div className="text-sm text-orange-800">{w}</div>
                  </div>
                </div>
              ))}
              {/* 未完了かつ未確認の場合のみ確認ボタンを表示 */}
              {needsWarningConfirm && (
                <button
                  onClick={() => setWarningConfirmed(true)}
                  className="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  {t('repair.confirm-warning')}
                </button>
              )}
              {/* 完了済み または 確認済みの場合 */}
              {!needsWarningConfirm && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {isCurrentStepDone
                    ? (lang === 'ja' ? 'このステップは完了済みです' : 'This step is already completed')
                    : t('repair.warning-ack')}
                </div>
              )}
            </div>
          )}

          {/* Step content */}
          <section className={`
            bg-white rounded-2xl border shadow-sm p-6 transition-all
            ${needsWarningConfirm ? 'opacity-40 pointer-events-none' : ''}
            ${isCurrentStepDone ? 'border-green-300 bg-green-50' : 'border-slate-200'}
          `}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0
                ${completedSteps.has(currentStep.id) ? 'bg-verified text-white' : 'bg-brand-blue text-white'}
              `}>
                {completedSteps.has(currentStep.id) ? <CheckCircle2 className="w-6 h-6" /> : currentStep.stepNumber}
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">{t('repair.step-label')} {currentStep.stepNumber} {t('repair.of')} {totalSteps}</div>
                <h2 className="text-lg font-bold text-slate-900">{currentStep.title}</h2>
              </div>
            </div>

            {/* Illustration placeholder */}
            <div className="w-full h-32 bg-slate-100 rounded-xl mb-5 flex items-center justify-center border-2 border-dashed border-slate-300">
              <div className="text-center text-slate-400">
                <div className="text-2xl mb-1">🔧</div>
                <div className="text-xs">{t('repair.illustration')} {currentStep.stepNumber}</div>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none mb-5">
              <p className="text-slate-700 leading-relaxed text-base">{currentStep.description}</p>
            </div>

            {/* Specifications */}
            {currentStep.specifications && currentStep.specifications.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t('repair.specs')}</div>
                <ul className="space-y-1">
                  {currentStep.specifications.map((spec, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-mono text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Torque values */}
            {currentStep.torqueValues && currentStep.torqueValues.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">🔩 {t('planning.torque-specs')} — ✓ {t('planning.oem-official')}</div>
                {currentStep.torqueValues.map(tv => (
                  <div key={tv.location} className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">{tv.location}</span>
                    <span className="font-mono font-black text-blue-900 text-xl">{tv.value} <span className="text-sm font-normal">{tv.unit}</span></span>
                  </div>
                ))}
                <div className="text-xs text-blue-500 mt-1">{currentStep.torqueValues[0].source}</div>
              </div>
            )}

            {/* Step navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={goToPrevStep}
                disabled={isFirstStep}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> {t('btn.prev-step')}
              </button>

              <button
                onClick={completeStep}
                disabled={needsWarningConfirm || isCurrentStepDone}
                className={`
                  flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors
                  ${isCurrentStepDone
                    ? 'bg-green-100 text-green-700 cursor-default border border-green-300'
                    : needsWarningConfirm
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-brand-blue text-white hover:bg-blue-700 shadow-md'}
                `}
              >
                {isCurrentStepDone ? (
                  <><CheckCircle2 className="w-4 h-4" /> {t('repair.step-completed')}</>
                ) : (
                  <>{t('repair.complete-step')} <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                onClick={goToNextStep}
                disabled={isLastStep}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                {t('btn.next-step')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* ── Something is different ─────────────────── */}
          <button
            onClick={() => setShowUnexpected(true)}
            className="
              w-full flex items-center gap-3 p-4
              bg-amber-50 border-2 border-amber-300 border-dashed
              rounded-2xl text-left
              hover:bg-amber-100 hover:border-amber-400
              transition-all group
            "
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 group-hover:bg-amber-500 flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-amber-900">{t('unexpected.btn')}</div>
              <div className="text-xs text-amber-700 mt-0.5">
                {lang === 'ja'
                  ? '手順と異なる状態を発見したら — 関連事例を検索・AIに質問'
                  : 'Found something not in the procedure — search cases or ask AI'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:text-amber-700 flex-shrink-0 transition-colors" />
          </button>

          {knowledgeItems.slice(0, 2).map(item => (
            <RecommendationCard key={item.id} item={item} onOpen={setDrawerItem} compact />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg no-print">
        <div className="text-sm text-slate-500">
          {allCompleted
            ? <span className="text-green-700 font-semibold">✓ {t('repair.cta-ready')}</span>
            : <span>{completedSteps.size}/{totalSteps} {t('repair.steps-done')}</span>
          }
        </div>
        <button
          onClick={() => router.push(`/job/${jobId}/check-verify`)}
          disabled={!allCompleted}
          className={`
            flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-colors shadow-md
            ${allCompleted ? 'bg-brand-blue text-white hover:bg-blue-700' : 'bg-blue-200 text-blue-400 cursor-not-allowed'}
          `}
        >
          {t('repair.cta')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-20" />

      {showFieldNote && (
        <FieldNoteModal onClose={() => setShowFieldNote(false)} step={t('step.repair')} />
      )}
      {showUnexpected && (
        <UnexpectedObservationModal
          stepTitle={`${t('repair.step-label')} ${currentStep.stepNumber} — ${currentStep.title}`}
          onClose={() => setShowUnexpected(false)}
          onAddFieldNote={() => { setShowUnexpected(false); setShowFieldNote(true); }}
        />
      )}
      <InfoDrawer item={drawerItem} onClose={() => setDrawerItem(null)} />
    </div>
  );
}
