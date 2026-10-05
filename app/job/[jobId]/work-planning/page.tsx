'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getJobWorkContext, type WorkCautionItem } from '@/data/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import {
  Package, Wrench, Clock, AlertTriangle, ArrowRight,
  ListOrdered, ShieldAlert, CheckCircle2, Info,
  Sparkles, ChevronDown, AlertCircle, X, Truck,
  ShoppingCart, ChevronRight, Ban,
} from 'lucide-react';

export default function WorkPlanningPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();

  // Phase control
  const [planCreated, setPlanCreated] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Step accordion
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Ready Check — SST tool starts as "not confirmed"
  const [sstConfirmed, setSstConfirmed] = useState(false);

  // ── Parts ordering flow ──────────────────────────────────────────────────
  // Set of part numbers that have been ordered
  const [orderedParts, setOrderedParts] = useState<Set<string>>(new Set());
  // Which part's order panel is currently expanded
  const [expandedOrderPart, setExpandedOrderPart] = useState<string | null>(null);

  const orderPart = (partNumber: string) => {
    setOrderedParts(prev => new Set([...prev, partNumber]));
    setExpandedOrderPart(null);
  };

  // ── Job-specific work context (plan + caution items) ─────────────────────
  const workCtx = useMemo(() => getJobWorkContext(jobId, lang), [jobId, lang]);
  const plan = workCtx.plan;
  const watchOutItems: WorkCautionItem[] = workCtx.cautionItems;

  // ── Ready Check items ─────────────────────────────────────────────────────
  const readyItems = useMemo(() => {
    const ja = lang === 'ja';
    return [
      ...plan.requiredParts.map(p => ({
        category: 'parts' as const,
        label: p.name.length > 36 ? p.name.slice(0, 36) + '…' : p.name,
        ok: p.available,
        toggleable: false,
        id: p.partNumber,
        partRef: p,
      })),
      ...plan.requiredTools.map(tool => ({
        category: 'tools' as const,
        label: tool.name,
        ok: tool.type === 'sst' ? sstConfirmed : true,
        toggleable: tool.type === 'sst',
        id: tool.toolNumber,
        partRef: null,
      })),
      { category: 'info' as const, label: ja ? '診断手順' : 'Diagnostic Procedure', ok: true, toggleable: false, id: 'info-proc', partRef: null },
      { category: 'info' as const, label: ja ? 'トルク規定値' : 'Torque Specifications', ok: true, toggleable: false, id: 'info-torque', partRef: null },
      { category: 'info' as const, label: ja ? '配線図' : 'Wiring Diagram', ok: true, toggleable: false, id: 'info-wiring', partRef: null },
    ];
  }, [lang, plan, sstConfirmed]);

  // A part that is out-of-stock but has been ordered counts as "in progress" (not ready)
  const confirmedCount = readyItems.filter(i => i.ok).length;
  const totalItems = readyItems.length;
  const readinessPct = Math.round((confirmedCount / totalItems) * 100);

  const outOfStockItems = readyItems.filter(i => i.category === 'parts' && !i.ok);
  const unorderedOutOfStock = outOfStockItems.filter(i => !orderedParts.has(i.id));
  const orderedNotArrived = outOfStockItems.filter(i => orderedParts.has(i.id));
  // SST tools not yet confirmed (separate from parts issues)
  const unconfirmedSst = readyItems.filter(i => i.category === 'tools' && !i.ok);
  const isFullyReady = unorderedOutOfStock.length === 0 && orderedNotArrived.length === 0 && readyItems.every(i => i.ok);
  // Overall blocker category (for CTA messaging)
  const blockerType: 'none' | 'outOfStock' | 'waitingParts' | 'sst' =
    unorderedOutOfStock.length > 0 ? 'outOfStock' :
    orderedNotArrived.length > 0 ? 'waitingParts' :
    unconfirmedSst.length > 0 ? 'sst' :
    'none';

  const handleCreatePlan = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setPlanCreated(true);
      setExpandedStep(plan.procedure[0]?.id ?? null);
    }, 2000);
  };

  // Arrival label helper
  const arrivalLabel = (partNumber: string) => {
    const part = plan.requiredParts.find(p => p.partNumber === partNumber);
    if (!part?.estimatedArrival) return lang === 'ja' ? '日程調整中' : 'TBD';
    const raw = part.estimatedArrival; // e.g. "10/8（Thu）"
    if (lang === 'ja') {
      // Convert "10/8（Thu）" → "10月8日（木）"
      return raw.replace('（Thu）', '（木）').replace(/(\d+)\/(\d+)/, '$1月$2日');
    }
    return raw;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* ── Purpose banner ────────────────────────────────────────────────── */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-blue-900 text-sm">{t('planning.banner.title')}</div>
          <div className="text-sm text-blue-700 mt-0.5">{t('planning.banner.body')}</div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 1 — Before "Create Work Plan"
      ════════════════════════════════════════════════════════════════════ */}
      {!planCreated ? (
        <div className="max-w-lg mx-auto space-y-5">

          {/* Confirmed Diagnosis */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {t('planning.diagnosis-result')}
            </h2>
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl mb-3">
              <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-orange-600 mb-0.5">DTC</div>
                <div className="font-black text-orange-800 text-2xl leading-none mb-1">{workCtx.dtc}</div>
                <div className="text-sm text-orange-700">{workCtx.dtcTitle}</div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
              <div className="text-xs font-medium text-slate-500 mb-1">{t('planning.banner.cause')}</div>
              <div className="text-sm font-semibold text-slate-800 leading-snug">{plan.confirmedCause}</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-xs font-medium text-blue-600 mb-1">
                {lang === 'ja' ? '推奨修理内容' : 'Recommended Repair'}
              </div>
              <div className="text-sm font-bold text-blue-800 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
                {plan.repairDescription}
              </div>
            </div>
          </section>

          <button
            onClick={handleCreatePlan}
            disabled={generating}
            className={`
              w-full flex items-center justify-center gap-3 font-bold py-4 rounded-2xl text-base transition-all shadow-lg
              ${generating
                ? 'bg-blue-100 text-blue-400 cursor-wait'
                : 'bg-brand-blue text-white hover:bg-blue-700 hover:shadow-xl active:scale-95'}
            `}
          >
            <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? t('planning.creating') : t('planning.create-btn')}
          </button>

          {!generating && (
            <p className="text-center text-xs text-slate-400 leading-relaxed">
              {lang === 'ja'
                ? 'e-library Next が診断結果に基づき、手順・部品・工具・注意事項を自動で整理します'
                : 'e-library Next will automatically organize the procedure, parts, tools, and precautions based on your diagnosis result'}
            </p>
          )}
        </div>

      ) : (
        /* ════════════════════════════════════════════════════════════════════
            PHASE 2 — Work Plan created: 3-column layout
        ════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-12 gap-5 items-start">

          {/* ══ LEFT col-span-3: Diagnosis summary + Ready Check ════════════ */}
          <div className="col-span-3 space-y-4">

            {/* Diagnosis compact */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                {t('planning.diagnosis-result')}
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 mb-2.5 flex items-center gap-2">
                <div className="text-2xl font-black text-orange-800">{workCtx.dtc}</div>
                <div className="text-xs text-orange-700 leading-snug">{workCtx.dtcTitle}</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">{plan.confirmedCause}</p>
              <div className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                <Wrench className="w-3 h-3 flex-shrink-0" />
                {plan.repairDescription}
              </div>
            </section>

            {/* ── Ready Check ──────────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                  {t('planning.ready-check')}
                </h2>
                <span className={`text-base font-black ${
                  isFullyReady ? 'text-green-600' :
                  blockerType === 'waitingParts' ? 'text-blue-500' :
                  blockerType === 'sst' ? 'text-amber-500' :
                  'text-red-500'
                }`}>
                  {readinessPct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFullyReady ? 'bg-green-500' :
                    blockerType === 'waitingParts' ? 'bg-blue-400' :
                    blockerType === 'sst' ? 'bg-amber-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: `${readinessPct}%` }}
                />
              </div>

              {/* Status badge */}
              {isFullyReady ? (
                <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('planning.all-ready')}
                </div>
              ) : blockerType === 'waitingParts' ? (
                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                  <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                  {lang === 'ja' ? '部品発注済み — 到着待ち' : 'Parts ordered — waiting for arrival'}
                </div>
              ) : blockerType === 'sst' ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {lang === 'ja' ? 'SST工具の準備確認が必要です' : 'Confirm SST tool availability to proceed'}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {lang === 'ja' ? '在庫切れ部品あり — 発注が必要です' : 'Out-of-stock parts — order required'}
                </div>
              )}

              {/* ── Check groups: Parts / Tools / Info ───────────────────── */}
              {(['parts', 'tools', 'info'] as const).map(category => {
                const items = readyItems.filter(i => i.category === category);
                const allOk = category === 'parts'
                  ? items.every(i => i.ok || orderedParts.has(i.id))
                  : items.every(i => i.ok);
                const catLabel =
                  category === 'parts' ? t('planning.parts') :
                  category === 'tools' ? t('planning.tools') :
                  (lang === 'ja' ? '情報' : 'Information');

                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className={`text-xs font-bold mb-1.5 flex items-center gap-1 ${
                      allOk ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {allOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {catLabel}
                    </div>
                    <div className="space-y-1.5">
                      {items.map(item => {

                        /* ── Out-of-stock part ─── */
                        if (item.category === 'parts' && !item.ok) {
                          const isOrdered = orderedParts.has(item.id);
                          const isExpanded = expandedOrderPart === item.id;
                          const part = item.partRef!;
                          const arrival = arrivalLabel(item.id);

                          if (isOrdered) {
                            /* Post-order state: shipping indicator */
                            return (
                              <div key={item.id} className="rounded-xl border border-blue-200 bg-blue-50 p-2.5">
                                <div className="flex items-center gap-2 mb-1">
                                  <Truck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                  <span className="text-xs font-bold text-blue-700">{t('planning.parts.ordered-label')}</span>
                                </div>
                                <p className="text-xs text-blue-800 font-medium leading-snug mb-1">{item.label}</p>
                                <div className="text-xs font-mono text-blue-400 mb-1.5">{item.id}</div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                                    <Truck className="w-2.5 h-2.5" />
                                    {t('planning.parts.shipping')}
                                  </span>
                                  <span className="text-xs text-blue-600 font-medium">
                                    {arrival} {t('planning.parts.arrives')}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          /* Not yet ordered */
                          return (
                            <div key={item.id} className="rounded-xl border border-red-200 bg-red-50 overflow-hidden">
                              {/* Row */}
                              <button
                                className="w-full text-left p-2.5 flex items-start gap-2 group"
                                onClick={() => setExpandedOrderPart(isExpanded ? null : item.id)}
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-red-700 mb-0.5">{t('planning.parts.out-of-stock')}</div>
                                  <div className="text-xs text-red-800 leading-snug font-medium">{item.label}</div>
                                  <div className="text-xs font-mono text-red-400 mt-0.5">{item.id}</div>
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold text-red-600 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                              </button>

                              {/* Expanded order panel */}
                              {isExpanded && (
                                <div className="border-t border-red-200 bg-white p-3">
                                  <div className="text-xs font-bold text-slate-700 mb-2.5">
                                    {lang === 'ja' ? '発注情報' : 'Order Details'}
                                  </div>
                                  <div className="space-y-1.5 mb-3">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">{t('planning.parts.unit-price')}</span>
                                      <span className="font-bold text-slate-900">
                                        {part.unitPrice ? `¥${part.unitPrice.toLocaleString()}` : '—'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">{t('planning.parts.qty')}</span>
                                      <span className="font-bold text-slate-900">{part.quantity}</span>
                                    </div>
                                    <div className="flex justify-between text-xs border-t border-slate-100 pt-1.5">
                                      <span className="text-slate-500">{t('planning.parts.unit-price')} 合計</span>
                                      <span className="font-bold text-slate-900">
                                        {part.unitPrice ? `¥${(part.unitPrice * part.quantity).toLocaleString()}` : '—'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500">{t('planning.parts.min-arrival')}</span>
                                      <span className="font-bold text-blue-700">{arrival}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setExpandedOrderPart(null)}
                                      className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-500 border border-slate-200 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" /> {t('planning.parts.cancel')}
                                    </button>
                                    <button
                                      onClick={() => orderPart(item.id)}
                                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-brand-blue text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <ShoppingCart className="w-3.5 h-3.5" />
                                      {t('planning.parts.order-btn')}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }

                        /* ── Normal item (ok or SST toggleable) ─── */
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 ${
                              item.ok
                                ? 'bg-slate-50 text-slate-600'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span className={`flex-shrink-0 font-bold ${item.ok ? 'text-green-500' : 'text-amber-500'}`}>
                              {item.ok ? '✓' : '⚠'}
                            </span>
                            <span className="flex-1 leading-snug">{item.label}</span>
                            {item.toggleable && !item.ok && (
                              <button
                                onClick={() => setSstConfirmed(true)}
                                className="flex-shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2"
                              >
                                {lang === 'ja' ? '確認' : 'Confirm'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Estimated time */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{t('planning.est-time')}</span>
              <span className="font-bold text-slate-900 ml-auto">{plan.estimatedTime} min</span>
            </div>
          </div>

          {/* ══ CENTER col-span-5: Recommended Work Plan (timeline) ══════════ */}
          <div className="col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-blue-500" />
                  {t('planning.work-plan')}
                </h2>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {plan.estimatedTime} min
                </span>
              </div>

              {/* Key precautions banner */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" /> {t('planning.precautions')}
                </div>
                <ul className="space-y-1.5">
                  {plan.precautions.slice(0, 4).map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-orange-700 leading-relaxed">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step timeline (accordion) */}
              <ol className="space-y-0.5">
                {plan.procedure.map((step, i) => {
                  const isOpen = expandedStep === step.id;
                  return (
                    <li key={step.id}>
                      <button
                        className={`
                          w-full text-left rounded-xl transition-all px-3.5 py-3 border-2
                          ${isOpen
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}
                        `}
                        onClick={() => setExpandedStep(isOpen ? null : step.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`
                            w-7 h-7 rounded-full text-sm font-black flex items-center justify-center flex-shrink-0 transition-colors
                            ${isOpen ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}
                          `}>
                            {step.stepNumber}
                          </span>
                          <span className={`text-sm font-semibold flex-1 leading-snug transition-colors ${
                            isOpen ? 'text-blue-800' : 'text-slate-700'
                          }`}>
                            {step.title}
                          </span>
                          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 text-blue-400' : 'text-slate-300'
                          }`} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mx-2 mb-3 mt-1 border-l-2 border-blue-200 pl-4 ml-7 space-y-3">
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                              {t('planning.step-detail.procedure')}
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{step.description}</p>
                          </div>

                          {step.specifications && step.specifications.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                {t('planning.step-detail.spec')}
                              </div>
                              <ul className="space-y-1">
                                {step.specifications.map((s, si) => (
                                  <li key={si} className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 font-mono border border-slate-200">
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.torqueValues && step.torqueValues.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                              <div className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                                🔩 {t('planning.step-detail.spec')}
                                <span className="font-normal text-blue-500 ml-1">OEM</span>
                              </div>
                              {step.torqueValues.map(tv => (
                                <div key={tv.location}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-blue-700">{tv.location}</span>
                                    <span className="font-mono font-black text-blue-900 text-lg leading-none">
                                      {tv.value} <span className="text-sm font-normal">{tv.unit}</span>
                                    </span>
                                  </div>
                                  <div className="text-xs text-blue-500 mt-1">📄 {tv.source}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {step.warnings && step.warnings.length > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                              <div className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {t('planning.step-detail.precaution')}
                              </div>
                              {step.warnings.map((w, wi) => (
                                <p key={wi} className="text-xs text-orange-800 leading-relaxed mb-1 last:mb-0">{w}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {i < plan.procedure.length - 1 && (
                        <div className="flex justify-start ml-6 my-0.5">
                          <div className="w-px h-3 bg-slate-200" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              {/* Parts + Tools summary */}
              <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> {t('planning.parts')}
                  </div>
                  {plan.requiredParts.map(p => {
                    const isOrdered = orderedParts.has(p.partNumber);
                    return (
                      <div key={p.partNumber} className="flex items-start gap-1.5 text-xs mb-2">
                        {p.available ? (
                          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-1" />
                        ) : isOrdered ? (
                          <Truck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div>
                          <div className="text-slate-700 leading-snug font-medium">{p.name.slice(0, 30)}</div>
                          <div className="text-slate-400 font-mono">{p.partNumber}</div>
                          {!p.available && isOrdered && (
                            <div className="text-blue-500 font-medium mt-0.5">
                              {t('planning.parts.shipping')} · {arrivalLabel(p.partNumber)} {t('planning.parts.arrives')}
                            </div>
                          )}
                          {!p.available && !isOrdered && (
                            <div className="text-red-500 font-medium mt-0.5">{t('planning.parts.out-of-stock')}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> {t('planning.tools')}
                  </div>
                  {plan.requiredTools.map(tool => (
                    <div key={tool.toolNumber} className="flex items-start gap-1.5 text-xs mb-2">
                      <span className={`
                        px-1 py-0.5 rounded text-xs font-bold flex-shrink-0 leading-none mt-0.5
                        ${tool.type === 'sst' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}
                      `}>
                        {tool.type === 'sst' ? 'SST' : 'STD'}
                      </span>
                      <span className="text-slate-700 leading-snug">{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT col-span-4: Things to Watch Out For (step-linked) ════ */}
          <div className="col-span-4 space-y-4">

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {t('planning.watch-out')}
                </h2>
                <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
                  ✦ {t('badge.ai-generated')}
                </span>
              </div>

              {expandedStep ? (() => {
                const activeStepObj = plan.procedure.find(s => s.id === expandedStep);
                const activeItems = watchOutItems.filter(wo => wo.steps.includes(expandedStep));
                return (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                        {activeStepObj?.stepNumber}
                      </span>
                      {activeStepObj?.title}
                    </div>

                    {activeItems.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {activeItems.map(wo => (
                          <div key={wo.id} className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-amber-900 leading-relaxed">{wo.text}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-6 flex-wrap">
                              <span className="text-xs text-amber-600 font-medium">📄 {wo.source}</span>
                              <span className="text-xs text-amber-400">·</span>
                              <span className="text-xs text-amber-500">
                                {wo.caseCount} {lang === 'ja' ? '件の類似事例' : 'similar cases'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-green-300 mb-2" />
                        <p className="text-sm font-medium text-slate-500">
                          {lang === 'ja' ? 'このステップ固有の注意事項はありません' : 'No specific cautions for this step'}
                        </p>
                      </div>
                    )}

                    {activeItems.length > 0 && (
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-3.5">
                        <div className="text-xs font-bold text-violet-700 mb-1.5 flex items-center gap-1.5">
                          <span>✦</span> {t('planning.watch-why')}
                        </div>
                        <p className="text-xs text-violet-800 leading-relaxed">
                          {lang === 'ja'
                            ? 'このステップに関連する類似修理事例（TIE・Q&A）から抽出。マニュアルに記載のない現場知見が含まれます。'
                            : 'Extracted from similar repair cases (TIE / Q&A) relevant to this step. Includes field knowledge not in the standard manual.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-200 mb-3" />
                  <p className="text-sm font-semibold text-slate-500 mb-1">
                    {lang === 'ja' ? 'ステップを選択してください' : 'Select a step to view cautions'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[180px]">
                    {lang === 'ja'
                      ? '中央の作業計画でステップを選択すると、そのステップに関連する注意事項が表示されます'
                      : 'Click any step in the Work Plan to see field-case cautions specific to that step'}
                  </p>
                </div>
              )}
            </section>

            {/* Torque specs */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                🔩 {t('planning.torque-specs')}
                <span className="ml-auto text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  ✓ {lang === 'ja' ? 'OEM公式' : 'OEM Official'}
                </span>
              </div>
              {plan.torqueValues.map(tv => (
                <div key={tv.location} className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{tv.location}</span>
                  <span className="font-mono font-black text-slate-900 text-xl">
                    {tv.value} <span className="text-sm font-normal text-slate-500">{tv.unit}</span>
                  </span>
                </div>
              ))}
              <div className="text-xs text-blue-500 mt-2">📄 {plan.torqueValues[0].source}</div>
            </section>

          </div>
        </div>
      )}

      {/* ── CTA Footer ────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="text-sm">
          {!planCreated ? (
            <span className="text-slate-400">
              {lang === 'ja' ? '作業計画を作成すると修理を開始できます' : 'Create the work plan to proceed to repair'}
            </span>
          ) : isFullyReady ? (
            <span className="text-green-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t('planning.all-ready')}
            </span>
          ) : blockerType === 'waitingParts' ? (
            <span className="text-blue-600 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>
                <div className="font-semibold">
                  {lang === 'ja' ? '部品到着待ち' : 'Waiting for parts'}
                </div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">
                  {orderedNotArrived.map(i => arrivalLabel(i.id)).join(', ')} {t('planning.parts.arrives')}
                </div>
              </span>
            </span>
          ) : blockerType === 'sst' ? (
            <span className="text-amber-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {lang === 'ja' ? 'SST工具の準備確認後に修理を開始できます' : 'Confirm SST tool availability to enable Start Repair'}
            </span>
          ) : (
            <span className="text-red-600 flex items-center gap-2">
              <Ban className="w-4 h-4" />
              {lang === 'ja' ? '在庫切れ部品を発注してください' : 'Order out-of-stock parts to proceed'}
            </span>
          )}
        </div>

        <button
          onClick={() => router.push(`/job/${jobId}/repair`)}
          disabled={!planCreated || !isFullyReady}
          className={`
            flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all shadow-md
            ${planCreated && isFullyReady
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          {t('planning.cta')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-20" />
    </div>
  );
}
