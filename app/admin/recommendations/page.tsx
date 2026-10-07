'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  FileText,
  Zap,
  MessageCircle,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  X,
  Info,
  BarChart2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  REC_KPI,
  TOP_RECOMMENDATIONS,
  LOW_PERFORMING,
  WORKFLOW_PERFORMANCE,
  type RecommendationMetric,
  type WorkflowStep,
} from '@/data/admin/recommendations';
import { useLanguage } from '@/context/LanguageContext';

function KpiCard({ label, value, unit, icon: Icon, color }: {
  label: string;
  value: number;
  unit?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</span>
        {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function TypeIcon({ type }: { type: RecommendationMetric['type'] }) {
  if (type === 'manual') return <FileText className="w-4 h-4 text-brand-blue" />;
  if (type === 'tie') return <Zap className="w-4 h-4 text-orange-500" />;
  if (type === 'qa') return <MessageCircle className="w-4 h-4 text-violet-500" />;
  return <BookOpen className="w-4 h-4 text-teal" />;
}

function TypeBadge({ type }: { type: RecommendationMetric['type'] }) {
  const map = { manual: 'Manual', tie: 'TIE', qa: 'Q&A', checklist: 'Checklist' };
  const colors = {
    manual: 'bg-blue-50 text-brand-blue',
    tie: 'bg-orange-50 text-orange-600',
    qa: 'bg-violet-50 text-violet-600',
    checklist: 'bg-teal-light text-teal',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${colors[type]}`}>
      {map[type]}
    </span>
  );
}

function RateBar({ rate, color }: { rate: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-10 text-right">{rate}%</span>
    </div>
  );
}

function DetailDrawer({ rec, onClose }: { rec: RecommendationMetric; onClose: () => void }) {
  const { t } = useLanguage();
  const openRate = Math.round((rec.opened / rec.shown) * 100);
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div
        className="w-full max-w-md bg-white overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <TypeIcon type={rec.type} />
            <span className="font-bold text-sm text-slate-900 leading-tight">{rec.title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Context */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('admin.rec.drawer.context')}</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-slate-400">{t('admin.rec.drawer.type')}</div>
                <div className="flex items-center gap-1.5 mt-0.5"><TypeBadge type={rec.type} /></div>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-slate-400">{t('admin.rec.drawer.step')}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{rec.workflowStep}</div>
              </div>
              {rec.dtc && (
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-400">{t('admin.rec.drawer.dtc')}</div>
                  <div className="text-xs font-semibold text-brand-blue mt-0.5">{rec.dtc}</div>
                </div>
              )}
              {rec.vehicleModels && (
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-400">{t('admin.rec.drawer.vehicles')}</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">{rec.vehicleModels.join(', ')}</div>
                </div>
              )}
            </div>
            {rec.symptomContext && (
              <div className="text-xs text-slate-500 italic px-1">{rec.symptomContext}</div>
            )}
          </div>

          {/* Why Recommended */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t('admin.rec.drawer.why')}</div>
            <div className="space-y-1.5">
              {rec.whyRecommended.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Performance metrics */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{t('admin.rec.drawer.perf')}</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{t('admin.rec.drawer.open')}</span>
                  <span className="font-semibold">{openRate}%</span>
                </div>
                <RateBar rate={openRate} color="bg-brand-blue" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{t('admin.rec.drawer.helpful')}</span>
                  <span className="font-semibold">{rec.helpfulRate}%</span>
                </div>
                <RateBar rate={rec.helpfulRate} color="bg-teal" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{t('admin.rec.drawer.resolved')}</span>
                  <span className="font-semibold">{rec.resolvedJobRate}%</span>
                </div>
                <RateBar rate={rec.resolvedJobRate} color="bg-teal" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{t('admin.rec.drawer.extra')}</span>
                  <span className="font-semibold text-orange-600">{rec.additionalSearchRate}%</span>
                </div>
                <RateBar rate={rec.additionalSearchRate} color="bg-orange-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { labelKey: 'admin.rec.drawer.shown',  value: rec.shown },
              { labelKey: 'admin.rec.drawer.opened', value: rec.opened },
              { labelKey: 'admin.rec.drawer.helpful',value: `${rec.helpfulRate}%` },
            ].map((m) => (
              <div key={m.labelKey} className="bg-slate-50 rounded-lg px-3 py-3 text-center">
                <div className="text-lg font-bold text-slate-900">{m.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t(m.labelKey as Parameters<typeof t>[0])}</div>
              </div>
            ))}
          </div>

          {rec.performanceNote && (
            <div className="bg-teal-light border border-teal/20 rounded-lg px-4 py-3 text-xs text-teal font-medium flex items-start gap-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {rec.performanceNote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { t } = useLanguage();
  const [selectedRec, setSelectedRec] = useState<RecommendationMetric | null>(null);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | 'All'>('All');

  const filteredTop = selectedStep === 'All'
    ? TOP_RECOMMENDATIONS
    : TOP_RECOMMENDATIONS.filter((r) => r.workflowStep === selectedStep);

  const steps: (WorkflowStep | 'All')[] = [
    'All', 'Reception', 'Diagnosis', 'Work Planning', 'Repair Execution', 'Check & Verify', 'Handover',
  ];

  const maxHelpful = Math.max(...WORKFLOW_PERFORMANCE.map((w) => w.helpfulRate));

  return (
    <div className="px-8 py-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('admin.rec.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('admin.rec.subtitle')}</p>
      </div>

      {/* ── KPI Summary ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label={t('admin.rec.kpi.shown')}    value={REC_KPI.shown}                    icon={BarChart2}    color="bg-navy" />
        <KpiCard label={t('admin.rec.kpi.open')}     value={REC_KPI.openRate}     unit="%"     icon={ArrowUpRight} color="bg-brand-blue" />
        <KpiCard label={t('admin.rec.kpi.helpful')}  value={REC_KPI.helpfulRate}  unit="%"     icon={CheckCircle2} color="bg-teal" />
        <KpiCard label={t('admin.rec.kpi.resolved')} value={REC_KPI.usedInResolvedJobs} unit="%" icon={TrendingUp} color="bg-teal" />
        <KpiCard label={t('admin.rec.kpi.extra')}    value={REC_KPI.additionalSearchAfterRec} unit="%" icon={TrendingDown} color="bg-orange-500" />
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Top Performing */}
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('admin.rec.top.title')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('admin.rec.top.subtitle')}</p>
            </div>
            {/* Workflow filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {steps.map((step) => (
                <button
                  key={step}
                  onClick={() => setSelectedStep(step)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    selectedStep === step
                      ? 'bg-navy text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {step === 'All' ? t('admin.rec.filter.all') : step}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('admin.rec.col.knowledge')}</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('admin.rec.col.shown')}</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('admin.rec.col.opened')}</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('admin.rec.col.helpful')}</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('admin.rec.col.resolved')}</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('admin.rec.col.step')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTop.map((rec) => {
                  const openRate = Math.round((rec.opened / rec.shown) * 100);
                  const isNew = rec.id === 'rec-new-p0420';
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${isNew ? 'bg-violet-50/40' : ''}`}
                      onClick={() => setSelectedRec(rec)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <TypeIcon type={rec.type} />
                          <div>
                            <div className="font-medium text-slate-900 text-sm leading-tight">{rec.title}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <TypeBadge type={rec.type} />
                              {isNew && (
                                <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center text-sm font-semibold text-slate-700">{rec.shown}</td>
                      <td className="px-3 py-3.5 text-center">
                        <div className="text-sm font-semibold text-slate-700">{rec.opened}</div>
                        <div className="text-[10px] text-slate-400">{openRate}%</div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`text-sm font-bold ${rec.helpfulRate >= 85 ? 'text-teal' : rec.helpfulRate >= 70 ? 'text-brand-blue' : 'text-orange-500'}`}>
                          {rec.helpfulRate}%
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-semibold text-slate-700">{rec.resolvedJobRate}%</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                          {rec.workflowStep}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-5">
          {/* Workflow Performance */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">{t('admin.rec.workflow.title')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('admin.rec.workflow.sub')}</p>
            </div>
            <div className="p-4 space-y-3">
              {WORKFLOW_PERFORMANCE.map((wp) => (
                <div key={wp.step}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{wp.step}</span>
                    <span className="font-bold text-slate-800">{wp.helpfulRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        wp.helpfulRate >= 88 ? 'bg-teal' : wp.helpfulRate >= 80 ? 'bg-brand-blue' : 'bg-orange-400'
                      }`}
                      style={{ width: `${(wp.helpfulRate / maxHelpful) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Performing */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-50 bg-red-50/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-slate-900">{t('admin.rec.low.title')}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t('admin.rec.low.sub')}</p>
            </div>
            <div className="divide-y divide-slate-50">
              {LOW_PERFORMING.map((rec) => (
                <div
                  key={rec.id}
                  className="px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRec(rec)}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <TypeIcon type={rec.type} />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{rec.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TypeBadge type={rec.type} />
                        <span className="text-xs text-slate-400">{rec.workflowStep}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center bg-slate-50 rounded px-2 py-1">
                      <div className="text-sm font-bold text-red-500">{rec.helpfulRate}%</div>
                      <div className="text-[10px] text-slate-400">{t('admin.rec.col.helpful')}</div>
                    </div>
                    <div className="text-center bg-slate-50 rounded px-2 py-1">
                      <div className="text-sm font-bold text-red-500">{Math.round((rec.opened / rec.shown) * 100)}%</div>
                      <div className="text-[10px] text-slate-400">{t('admin.rec.kpi.open')}</div>
                    </div>
                    <div className="text-center bg-slate-50 rounded px-2 py-1">
                      <div className="text-sm font-bold text-orange-500">{rec.additionalSearchRate}%</div>
                      <div className="text-[10px] text-slate-400">{t('admin.rec.kpi.extra')}</div>
                    </div>
                  </div>
                  {rec.performanceNote && (
                    <div className="text-xs text-slate-500 italic mb-2">{rec.performanceNote}</div>
                  )}
                  <button
                    className="text-xs font-bold text-brand-blue flex items-center gap-0.5 hover:underline"
                    onClick={(e) => { e.stopPropagation(); setSelectedRec(rec); }}
                  >
                    {t('admin.rec.review')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loop Closure Message */}
      <div className="bg-gradient-to-r from-navy to-navy-light rounded-xl px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-teal" />
          </div>
          <div>
            <div className="text-white font-bold text-base mb-1">Field → Knowledge → Improvement → Better Service</div>
            <div className="text-white/60 text-sm leading-relaxed">
              {t('admin.rec.loop.body')}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedRec && <DetailDrawer rec={selectedRec} onClose={() => setSelectedRec(null)} />}
    </div>
  );
}
