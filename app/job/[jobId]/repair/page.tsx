'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { REPAIR_STEPS } from '@/data/mockData';
import { getLocalizedJob, getLocalizedKnowledge, getJobWorkContext } from '@/data/localizedData';
import {
  REPAIR_BRANCH_STEP_ID,
  REPAIR_FINDINGS,
  REPAIR_PATHS,
  type RepairPathId,
} from '@/data/repairFlow';
import { RecommendationCard } from '@/components/knowledge/RecommendationCard';
import { InfoDrawer } from '@/components/knowledge/InfoDrawer';
import { FieldNoteModal } from '@/components/knowledge/FieldNoteModal';
import { UnexpectedObservationModal } from '@/components/knowledge/UnexpectedObservationModal';
import { useLanguage } from '@/context/LanguageContext';
import { useWorkflow } from '@/context/WorkflowContext';
import type { KnowledgeItem, WorkStep } from '@/types';
import {
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  PenLine, ArrowRight, PlayCircle, Zap, Package, Wrench,
  RotateCcw,
} from 'lucide-react';

function orderSteps(all: WorkStep[], ids: string[]): WorkStep[] {
  return ids
    .map((id, i) => {
      const step = all.find(s => s.id === id);
      if (!step) return null;
      return { ...step, stepNumber: i + 1 };
    })
    .filter((s): s is WorkStep => !!s);
}

export default function RepairPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();
  const { confirmedCauseId, setConfirmedCauseId, setReturnedFromRepair } = useWorkflow();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<RepairPathId>('sensor');
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);
  const [recordedFinding, setRecordedFinding] = useState<string | null>(null);
  const [rediagnose, setRediagnose] = useState(false);
  const [drawerItem, setDrawerItem] = useState<KnowledgeItem | null>(null);
  const [showFieldNote, setShowFieldNote] = useState(false);
  const [showUnexpected, setShowUnexpected] = useState(false);
  const [warningConfirmed, setWarningConfirmed] = useState(true);

  const job = getLocalizedJob(lang);
  const workCtx = getJobWorkContext(jobId, lang);
  const catalog = job.workPlan?.procedure ?? REPAIR_STEPS;
  const visibleIds = rediagnose
    ? REPAIR_PATHS.sensor.slice(0, REPAIR_PATHS.sensor.indexOf(REPAIR_BRANCH_STEP_ID) + 1)
    : REPAIR_PATHS[path];
  const localizedSteps = orderSteps(catalog, visibleIds);
  const currentStep = localizedSteps[currentStepIdx] ?? localizedSteps[0];
  const totalSteps = localizedSteps.length;
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === totalSteps - 1;
  const pathCompleted = localizedSteps.every(s => completedSteps.has(s.id));
  const allCompleted = pathCompleted && !rediagnose;

  const isBranchStep = currentStep?.id === REPAIR_BRANCH_STEP_ID;
  const needsFinding = isBranchStep && !completedSteps.has(REPAIR_BRANCH_STEP_ID);

  const confirmedCause = useMemo(() => {
    const fromDiagnosis = job.diagnosis?.possibleCauses.find(c => c.id === confirmedCauseId);
    return fromDiagnosis?.description ?? job.workPlan?.confirmedCause ?? '';
  }, [job, confirmedCauseId]);

  const knowledgeItems = getLocalizedKnowledge('repair', job.dtcs, job.vehicle.model, lang)
    .filter(k => k.type !== 'warning');

  const stepHasWarnings = currentStep.warnings && currentStep.warnings.length > 0;
  const isCurrentStepDone = completedSteps.has(currentStep.id);
  const needsWarningConfirm = false;
  const firstIncompleteIdx = localizedSteps.findIndex(s => !completedSteps.has(s.id));
  const maxReachableIdx = firstIncompleteIdx === -1 ? localizedSteps.length - 1 : firstIncompleteIdx;

  const completeStep = () => {
    if (needsFinding) {
      const finding = REPAIR_FINDINGS.find(f => f.id === selectedFinding);
      if (!finding) return;
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));
      setRecordedFinding(finding.id);
      if (finding.rediagnose) {
        setRediagnose(true);
        return;
      }
      if (finding.path) {
        const nextPath = finding.path;
        setPath(nextPath);
        const nextIds = REPAIR_PATHS[nextPath];
        const nextIdx = nextIds.indexOf(currentStep.id) + 1;
        setCurrentStepIdx(Math.min(nextIdx, nextIds.length - 1));
      }
      return;
    }
    setCompletedSteps(prev => new Set([...prev, currentStep.id]));
    setWarningConfirmed(false);
    if (!isLastStep) setCurrentStepIdx(idx => idx + 1);
  };

  const goToPrevStep = () => {
    setWarningConfirmed(false);
    setCurrentStepIdx(idx => Math.max(0, idx - 1));
  };

  const goToNextStep = () => {
    if (!isCurrentStepDone || isLastStep || rediagnose) return;
    setWarningConfirmed(false);
    setCurrentStepIdx(idx => Math.min(totalSteps - 1, idx + 1));
  };

  const returnToDiagnosis = () => {
    setConfirmedCauseId(null);
    setReturnedFromRepair(true);
    router.push(`/job/${jobId}/diagnosis`);
  };

  const recorded = REPAIR_FINDINGS.find(f => f.id === recordedFinding);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="font-semibold text-blue-900 text-sm">{t('repair.banner.title')}: {job.workPlan!.repairDescription}</div>
          <div className="text-sm text-blue-700 mt-0.5">{t('repair.banner.body')}</div>
          {confirmedCause && (
            <div className="mt-2 text-xs text-blue-800 bg-white/70 border border-blue-100 rounded-lg px-2.5 py-1.5">
              <span className="font-bold">{t('repair.based-on')}: </span>
              {confirmedCause}
            </div>
          )}
          {recorded?.path && (
            <div className="mt-1.5 text-xs font-semibold text-blue-800">
              {recorded.path === 'harness' ? t('repair.path.harness') : t('repair.path.sensor')}
            </div>
          )}
        </div>
      </div>

      {rediagnose && (
        <div className="mb-5 bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-amber-900">{t('repair.rediagnose.title')}</div>
            <p className="text-sm text-amber-800 mt-1 leading-relaxed">{t('repair.rediagnose.body')}</p>
            <button
              type="button"
              onClick={returnToDiagnosis}
              className="mt-3 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
            >
              <RotateCcw className="w-4 h-4" />
              {t('repair.rediagnose.cta')}
            </button>
          </div>
        </div>
      )}

      <section className="mb-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-1">{t('repair.prep.title')}</h2>
        <p className="text-xs text-slate-500 mb-4">{t('repair.prep.stock')}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> {t('repair.prep.parts')}
            </div>
            <ul className="space-y-1.5">
              {workCtx.plan.requiredParts.map(p => (
                <li key={p.partNumber} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{p.name}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${p.available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                    {p.available ? t('repair.prep.in-stock') : t('repair.prep.out')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> {t('repair.prep.tools')}
            </div>
            <ul className="space-y-1.5">
              {workCtx.plan.requiredTools.map(tool => (
                <li key={tool.toolNumber} className="text-sm text-slate-700">{tool.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">{t('repair.step-progress')}</h2>
            <div className="space-y-1.5">
              {localizedSteps.map((step, idx) => {
                const isDone = completedSteps.has(step.id);
                const isActive = idx === currentStepIdx;
                const locked = idx > maxReachableIdx;
                return (
                  <button
                    key={step.id}
                    disabled={locked}
                    onClick={() => { setCurrentStepIdx(idx); setWarningConfirmed(false); }}
                    className={`
                      w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all
                      ${isActive ? 'bg-blue-50 border border-blue-300' : 'hover:bg-slate-50 border border-transparent'}
                      ${locked ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}
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
                style={{ width: `${(localizedSteps.filter(s => completedSteps.has(s.id)).length / Math.max(totalSteps, 1)) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1 text-right">
              {localizedSteps.filter(s => completedSteps.has(s.id)).length}/{totalSteps} {t('repair.steps-done')}
            </div>
          </section>

          {job.workPlan!.torqueValues.length > 0 && path === 'sensor' && (
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

          <button
            onClick={() => setShowFieldNote(true)}
            className="w-full flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
          >
            <PenLine className="w-4 h-4" />
            {t('btn.add-field-note')}
          </button>

          <button
            type="button"
            onClick={returnToDiagnosis}
            className="w-full flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            {t('repair.rediagnose.link')}
          </button>
        </div>

        <div className="col-span-2 space-y-4">
          {stepHasWarnings && (
            <div className="space-y-2">
              {currentStep.warnings!.map((w, i) => (
                <div key={i} className="bg-red-50 border-2 border-red-400 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-black text-red-800 mb-0.5">⚠ {t('repair.warning-label')}</div>
                    <div className="text-sm font-semibold text-red-800">{w}</div>
                  </div>
                </div>
              ))}
              {isCurrentStepDone && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'ja' ? 'このステップは完了済みです' : 'This step is already completed'}
                </div>
              )}
            </div>
          )}

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

            <div className="w-full h-32 bg-slate-100 rounded-xl mb-5 flex items-center justify-center border-2 border-dashed border-slate-300">
              <div className="text-center text-slate-400">
                <div className="text-2xl mb-1">🔧</div>
                <div className="text-xs">{t('repair.illustration')} {currentStep.stepNumber}</div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-5">
              <p className="text-slate-700 leading-relaxed text-base">{currentStep.description}</p>
            </div>

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

            {isBranchStep && (
              <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
                <div className="text-sm font-bold text-violet-900">{t('repair.record-result')}</div>
                <p className="text-xs text-violet-700 mt-1 mb-3">{t('repair.record-hint')}</p>
                <div className="space-y-2">
                  {REPAIR_FINDINGS.map(f => {
                    const chosen = (isCurrentStepDone ? recordedFinding : selectedFinding) === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        disabled={isCurrentStepDone}
                        onClick={() => setSelectedFinding(f.id)}
                        className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${
                          chosen
                            ? f.rediagnose
                              ? 'border-amber-400 bg-amber-50'
                              : 'border-violet-500 bg-white ring-1 ring-violet-300'
                            : 'border-slate-200 bg-white hover:border-violet-300'
                        } ${isCurrentStepDone ? 'cursor-default' : ''}`}
                      >
                        <div className="text-sm font-semibold text-slate-800">{t(f.labelKey)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{t(f.hintKey)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                disabled={needsWarningConfirm || isCurrentStepDone || rediagnose || (needsFinding && !selectedFinding)}
                className={`
                  flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors
                  ${isCurrentStepDone
                    ? 'bg-green-100 text-green-700 cursor-default border border-green-300'
                    : needsWarningConfirm || (needsFinding && !selectedFinding) || rediagnose
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-brand-blue text-white hover:bg-blue-700 shadow-md'}
                `}
              >
                {isCurrentStepDone ? (
                  <><CheckCircle2 className="w-4 h-4" /> {t('repair.step-completed')}</>
                ) : needsFinding ? (
                  <>{t('repair.continue-result')} <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>{t('repair.complete-step')} <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                onClick={goToNextStep}
                disabled={isLastStep || !isCurrentStepDone || rediagnose}
                title={!isCurrentStepDone ? t('repair.next-locked') : undefined}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                {t('btn.next-step')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg no-print">
        <div className="text-sm text-slate-500">
          {rediagnose
            ? <span className="text-amber-800 font-semibold">{t('repair.rediagnose.title')}</span>
            : allCompleted
              ? <span className="text-green-700 font-semibold">✓ {t('repair.cta-ready')}</span>
              : <span>{localizedSteps.filter(s => completedSteps.has(s.id)).length}/{totalSteps} {t('repair.steps-done')}</span>
          }
        </div>
        {rediagnose ? (
          <button
            onClick={returnToDiagnosis}
            className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            {t('repair.rediagnose.cta')}
          </button>
        ) : (
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
        )}
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
