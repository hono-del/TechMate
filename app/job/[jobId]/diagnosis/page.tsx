'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getLocalizedJob,
  adjustCauseProbabilities,
  getAnswerInsights,
  getDiagnosticFlowSteps,
} from '@/data/localizedData';
import type { SimilarCaseRef, ManualRef } from '@/data/localizedData';
import { SimilarCaseDrawer } from '@/components/knowledge/SimilarCaseDrawer';
import { ManualDrawer } from '@/components/knowledge/ManualDrawer';
import { ProbabilityBadge } from '@/components/common/Badge';
import { useLanguage } from '@/context/LanguageContext';
import { useWorkflow } from '@/context/WorkflowContext';
import type { PossibleCause } from '@/types';
import {
  AlertCircle, ArrowRight, ChevronRight, CheckCircle2,
  Activity, Lightbulb, ListChecks, ScanLine, Wifi,
  TrendingUp, TrendingDown, Minus, MessageSquareDot,
  Car, Gauge, BookOpen, AlertTriangle, ChevronDown,
  FileText, MessageSquare, ClipboardList,
} from 'lucide-react';

export default function DiagnosisPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();
  const { receptionAnswers } = useWorkflow();

  // Cause selection
  const [confirmedCause, setConfirmedCause] = useState<string | null>(null);
  const [expandedCause, setExpandedCause] = useState<string | null>(null);

  // Flow step selection
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  // Similar case drawer
  const [selectedCase, setSelectedCase] = useState<SimilarCaseRef | null>(null);

  // Manual drawer
  const [selectedManual, setSelectedManual] = useState<ManualRef | null>(null);

  // DTC acquisition
  const [dtcAcquired, setDtcAcquired] = useState(false);
  const [scanning, setScanning] = useState(false);

  const job = getLocalizedJob(lang);
  const diagnosis = job.diagnosis!;
  const flowSteps = useMemo(() => getDiagnosticFlowSteps(lang), [lang]);

  // Reception-based adjustments
  const hasReceptionAnswers = Object.keys(receptionAnswers).length > 0;
  const adjustedScores = adjustCauseProbabilities(receptionAnswers);
  const insights = getAnswerInsights(receptionAnswers, lang);

  const getCauseProbability = (cause: PossibleCause): 'high' | 'medium' | 'low' => {
    if (!hasReceptionAnswers) return cause.probability;
    if (cause.id === 'pc-001') return adjustedScores.catalyst.probability;
    if (cause.id === 'pc-002') return adjustedScores.o2sensor.probability;
    if (cause.id === 'pc-003') return adjustedScores.exhaust.probability;
    return cause.probability;
  };

  const getCauseDelta = (cause: PossibleCause): number => {
    if (!hasReceptionAnswers) return 0;
    if (cause.id === 'pc-001') return adjustedScores.catalyst.delta;
    if (cause.id === 'pc-002') return adjustedScores.o2sensor.delta;
    if (cause.id === 'pc-003') return adjustedScores.exhaust.delta;
    return 0;
  };

  const sortedCauses = hasReceptionAnswers
    ? [...diagnosis.possibleCauses].sort((a, b) => {
        const score = (c: PossibleCause) =>
          c.id === 'pc-001' ? adjustedScores.catalyst.score
          : c.id === 'pc-002' ? adjustedScores.o2sensor.score
          : adjustedScores.exhaust.score;
        return score(b) - score(a);
      })
    : diagnosis.possibleCauses;

  const handleGetDTC = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setDtcAcquired(true);
      setExpandedCause(sortedCauses[0]?.id ?? null);
      setSelectedStep(flowSteps[0]?.id ?? null); // auto-select first step
    }, 1800);
  };

  const activeStep = flowSteps.find(s => s.id === selectedStep) ?? null;
  const activeStepIndex = flowSteps.findIndex(s => s.id === selectedStep);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* ── Purpose banner ──────────────────────────────────────────────────── */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Activity className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-blue-900 text-sm">{t('diagnosis.banner.title')}</div>
          <div className="text-sm text-blue-700 mt-0.5">{t('diagnosis.banner.body')}</div>
        </div>
      </div>

      {/* ── BEFORE DTC: centered scan panel ──────────────────────────────────── */}
      {!dtcAcquired ? (
        <div className="max-w-sm mx-auto">
          <section className="bg-white rounded-2xl border-2 border-dashed border-blue-300 shadow-sm p-8 text-center">
            {/* Scan animation */}
            <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center ${
              scanning ? 'bg-blue-100 animate-pulse' : 'bg-slate-100'
            }`}>
              {scanning
                ? <Wifi className="w-10 h-10 text-blue-500 animate-bounce" />
                : <ScanLine className="w-10 h-10 text-slate-400" />
              }
            </div>

            {/* Vehicle quick-info */}
            <div className="mb-5 text-left bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Car className="w-3 h-3" /> {t('vehicle.model')}
                </span>
                <span className="font-semibold text-slate-800">{job.vehicle.year} {job.vehicle.model}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Gauge className="w-3 h-3" /> {t('vehicle.mileage')}
                </span>
                <span className="font-semibold text-slate-800">
                  {job.vehicle.mileage.toLocaleString('en-US')} km
                </span>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-lg mb-2">{t('dtc.acquire.title')}</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t('dtc.acquire.subtitle')}</p>

            <button
              onClick={handleGetDTC}
              disabled={scanning}
              className={`
                w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all text-base
                ${scanning
                  ? 'bg-blue-100 text-blue-400 cursor-wait'
                  : 'bg-brand-blue text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
                }
              `}
            >
              <ScanLine className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? t('dtc.acquire.scanning') : t('dtc.acquire.btn')}
            </button>
          </section>
        </div>

      ) : (
        /* ── AFTER DTC: 3-column layout ─────────────────────────────────────── */
        <div className="grid grid-cols-12 gap-5 items-start">

          {/* ════════════════════════════════════════════════════════════════
              LEFT col-span-3 — DTC overview + Insights + Possible Causes
          ════════════════════════════════════════════════════════════════ */}
          <div className="col-span-3 space-y-4">

            {/* DTC Overview */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                {t('diagnosis.dtc-overview')}
                <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3" /> {t('dtc.acquired.label')}
                </span>
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3">
                <div className="text-2xl font-black text-orange-800 mb-0.5">P0420</div>
                <div className="text-xs font-semibold text-orange-700 leading-snug">{t('dtc.p0420.title')}</div>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div><span className="font-medium text-slate-600">{t('dtc.system')}:</span> {t('dtc.p0420.system')}</div>
                <div><span className="font-medium text-slate-600">{t('dtc.monitor')}:</span> {t('dtc.p0420.monitor')}</div>
                <div><span className="font-medium text-slate-600">{t('dtc.status')}:</span> {t('dtc.p0420.status')}</div>
              </div>
            </section>

            {/* Customer Interview Insights */}
            {insights.length > 0 && (
              <section className="bg-violet-50 rounded-2xl border border-violet-200 shadow-sm p-4">
                <h2 className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <MessageSquareDot className="w-3.5 h-3.5" />
                  {t('dtc.reception-note.title')}
                </h2>
                <ul className="space-y-2">
                  {insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-violet-800 leading-relaxed">
                      <span className="text-violet-400 flex-shrink-0 mt-0.5">→</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Possible Causes */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-violet-500" />
                {t('diagnosis.possible-causes')}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full border border-violet-200">
                  ✦ {t('badge.ai-generated')}
                </span>
                {hasReceptionAnswers && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
                    {lang === 'ja' ? '受付で調整' : 'Adjusted'}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {sortedCauses.map((cause, rank) => {
                  const prob = getCauseProbability(cause);
                  const delta = getCauseDelta(cause);
                  return (
                    <div
                      key={cause.id}
                      className={`
                        border rounded-xl transition-all cursor-pointer
                        ${expandedCause === cause.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'}
                        ${confirmedCause === cause.id ? '!border-green-300 !bg-green-50' : ''}
                      `}
                    >
                      <button
                        className="w-full text-left p-3"
                        onClick={() => setExpandedCause(expandedCause === cause.id ? null : cause.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className={`w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 text-white mt-0.5 ${
                              rank === 0 ? 'bg-red-400' : rank === 1 ? 'bg-yellow-400' : 'bg-slate-300'
                            }`}>{rank + 1}</span>
                            <span className="text-xs font-medium text-slate-800 leading-snug">{cause.description}</span>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${
                            expandedCause === cause.id ? 'rotate-180' : ''
                          }`} />
                        </div>
                        <div className="ml-6 mt-1.5 flex flex-wrap items-center gap-1.5">
                          <ProbabilityBadge probability={prob} />
                          {hasReceptionAnswers && delta !== 0 && (
                            <span className={`flex items-center gap-0.5 text-xs font-medium ${
                              delta > 0 ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {delta > 0
                                ? <TrendingUp className="w-3 h-3" />
                                : <TrendingDown className="w-3 h-3" />
                              }
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          )}
                          {hasReceptionAnswers && delta === 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-slate-400">
                              <Minus className="w-3 h-3" />
                            </span>
                          )}
                          {confirmedCause === cause.id && (
                            <span className="text-xs text-green-700 font-medium flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> {t('diagnosis.confirmed')}
                            </span>
                          )}
                        </div>
                      </button>

                      {expandedCause === cause.id && (
                        <div className="px-3 pb-3 space-y-2">
                          <p className="text-xs text-slate-600 leading-relaxed">{cause.evidence}</p>
                          <button
                            onClick={() => setConfirmedCause(confirmedCause === cause.id ? null : cause.id)}
                            className={`
                              w-full text-xs font-semibold px-3 py-2 rounded-lg transition-colors
                              ${confirmedCause === cause.id
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700'}
                            `}
                          >
                            {confirmedCause === cause.id
                              ? `✓ ${t('diagnosis.confirmed')}`
                              : t('diagnosis.confirm-cause')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-2 text-xs text-violet-500 flex items-start gap-1">
                <span className="flex-shrink-0">✦</span>
                {t('diagnosis.ai-ranking-note')}
              </p>
            </section>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              CENTER col-span-4 — Recommended Diagnostic Flow (interactive)
          ════════════════════════════════════════════════════════════════ */}
          <div className="col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-blue-500" />
                  {t('diagnosis.flow-title')}
                </h2>
                <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
                  ✦ {t('badge.ai-generated')}
                </span>
              </div>

              {/* Step list */}
              <ol className="space-y-0.5">
                {flowSteps.map((step, i) => (
                  <li key={step.id}>
                    <button
                      className={`
                        w-full text-left rounded-xl transition-all px-3.5 py-3 border-2
                        ${selectedStep === step.id
                          ? 'border-blue-400 bg-blue-50 shadow-sm'
                          : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}
                      `}
                      onClick={() => setSelectedStep(step.id)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Step number circle */}
                        <span className={`
                          w-7 h-7 rounded-full text-sm font-black flex items-center justify-center flex-shrink-0 transition-colors
                          ${selectedStep === step.id
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500'}
                        `}>
                          {i + 1}
                        </span>
                        <span className={`text-sm font-semibold flex-1 leading-snug transition-colors ${
                          selectedStep === step.id ? 'text-blue-800' : 'text-slate-700'
                        }`}>
                          {step.title}
                        </span>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          selectedStep === step.id ? 'text-blue-400' : 'text-slate-200'
                        }`} />
                      </div>
                    </button>

                    {/* Connector line between steps */}
                    {i < flowSteps.length - 1 && (
                      <div className="flex justify-start ml-6 my-0.5">
                        <div className="w-px h-4 bg-slate-200" />
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              {/* Hint text */}
              {!selectedStep && (
                <p className="mt-4 text-xs text-center text-slate-400 leading-relaxed">
                  {t('diagnosis.flow.select-hint')}
                </p>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              RIGHT col-span-5 — Step Detail Panel
          ════════════════════════════════════════════════════════════════ */}
          <div className="col-span-5 space-y-4">

            {!activeStep ? (
              /* Placeholder */
              <div className="h-72 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center p-8">
                <ListChecks className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-500 mb-1">{t('diagnosis.flow.select-step')}</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  {t('diagnosis.flow.select-hint')}
                </p>
              </div>
            ) : (
              <>
                {/* Step header banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 text-white shadow-sm">
                  <div className="text-xs font-medium text-blue-200 mb-1">
                    {lang === 'ja' ? 'ステップ' : 'Step'} {activeStepIndex + 1} / {flowSteps.length}
                  </div>
                  <h3 className="text-lg font-bold leading-snug">{activeStep.title}</h3>
                </div>

                {/* What to Check */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-green-500" />
                    {t('diagnosis.flow.what-check')}
                  </h4>
                  <ul className="space-y-2.5">
                    {activeStep.whatToCheck.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center mt-0.5">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Relevant Manual */}
                {activeStep.relevantManual.length > 0 && (
                  <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      {t('diagnosis.flow.manual')}
                    </h4>
                    <div className="space-y-2">
                      {activeStep.relevantManual.map((manual, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedManual(manual)}
                          className="w-full text-left flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all group cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-blue-800 leading-snug group-hover:text-blue-900">
                              {manual.title}
                            </div>
                            <div className="text-xs text-blue-500 mt-0.5">📄 {manual.source}</div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-xs bg-blue-100 text-blue-700 border border-blue-300 px-2 py-0.5 rounded-full font-bold">
                              §{manual.section}
                            </span>
                            <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Similar Cases */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-violet-500" />
                    {t('diagnosis.flow.cases')}
                  </h4>
                  <div className="space-y-3">
                    {activeStep.similarCases.map(sc => (
                      <button
                        key={sc.id}
                        onClick={() => setSelectedCase(sc)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all group"
                      >
                        {/* Case title row */}
                        <div className="flex items-center gap-2 mb-1.5">
                          {sc.type === 'tie' ? (
                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">TIE</span>
                          ) : (
                            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">Q&A</span>
                          )}
                          <span className="font-semibold text-sm text-slate-800">{sc.displayId}</span>
                          {sc.hasBestAnswer && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 font-medium">
                              ✓ {lang === 'ja' ? 'ベストアンサー' : 'Best Answer'}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 ml-auto transition-colors" />
                        </div>

                        {/* Meta */}
                        <div className="text-xs text-slate-500 mb-1">{sc.meta}</div>

                        {/* Resolution */}
                        <div className="text-xs font-semibold text-slate-700">{sc.resolution}</div>
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-violet-500 flex items-start gap-1">
                    <span className="flex-shrink-0">✦</span>
                    {lang === 'ja'
                      ? 'AIが車種・DTC・症状の一致に基づいて推薦しています'
                      : 'AI-recommended based on model, DTC, and symptom match'}
                  </p>
                </section>

                {/* Precautions */}
                {activeStep.precautions.length > 0 && (
                  <section className="bg-orange-50 rounded-2xl border border-orange-200 shadow-sm p-4">
                    <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      {t('diagnosis.flow.precautions')}
                    </h4>
                    <ul className="space-y-2">
                      {activeStep.precautions.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-orange-800 leading-relaxed">
                          <span className="flex-shrink-0 mt-0.5">⚠</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>

        </div>
      )}

      {/* ── CTA Footer ────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="text-sm text-slate-500">
          {!dtcAcquired ? (
            <span className="text-slate-400">
              {lang === 'ja' ? 'まずDTCを取得してください' : 'Get DTC first to proceed'}
            </span>
          ) : confirmedCause ? (
            <span className="text-green-700 font-medium">✓ {t('diagnosis.cta-ready')}</span>
          ) : (
            <span>{t('diagnosis.cta-pending')}</span>
          )}
        </div>
        <button
          onClick={() => router.push(`/job/${jobId}/work-planning`)}
          disabled={!confirmedCause || !dtcAcquired}
          className={`
            flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-colors shadow-md
            ${confirmedCause && dtcAcquired
              ? 'bg-brand-blue text-white hover:bg-blue-700'
              : 'bg-blue-200 text-blue-400 cursor-not-allowed'}
          `}
        >
          {t('diagnosis.cta')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-20" />

      {/* Similar Case Drawer */}
      <SimilarCaseDrawer item={selectedCase} onClose={() => setSelectedCase(null)} />

      {/* Manual Drawer */}
      <ManualDrawer item={selectedManual} onClose={() => setSelectedManual(null)} />
    </div>
  );
}
