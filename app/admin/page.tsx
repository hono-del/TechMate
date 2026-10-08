'use client';

import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Zap,
  BookOpen,
  FileText,
  MessageCircle,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Target,
} from 'lucide-react';
import {
  KPI_SUMMARY,
  TOP_ISSUES,
  TECHNICIAN_FRICTION,
  KNOWLEDGE_USAGE,
  KNOWLEDGE_GAP_ALERT,
  type ServiceIssue,
  type KnowledgeUsageItem,
  type FrictionCard,
} from '@/data/admin/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

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
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
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

function TrendIcon({ trend }: { trend: ServiceIssue['trend'] }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-orange-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-teal" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function ResolutionBar({ rate }: { rate: number }) {
  const color = rate >= 85 ? 'bg-teal' : rate >= 75 ? 'bg-brand-blue' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{rate}%</span>
    </div>
  );
}

function KnowledgeTypeIcon({ type }: { type: KnowledgeUsageItem['type'] }) {
  if (type === 'manual') return <FileText className="w-4 h-4 text-brand-blue" />;
  if (type === 'tie') return <Zap className="w-4 h-4 text-orange-500" />;
  if (type === 'qa') return <MessageCircle className="w-4 h-4 text-violet-500" />;
  return <BookOpen className="w-4 h-4 text-teal" />;
}

function KnowledgeTypeLabel({ type }: { type: KnowledgeUsageItem['type'] }) {
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

export default function AdminDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { canAccess } = useAuth();

  const navigateToKnowledge = (issueId?: string) => {
    if (issueId) {
      router.push(`/admin/knowledge?issue=${issueId}`);
    } else {
      router.push('/admin/knowledge');
    }
  };

  const loopSteps = [
    { label: t('admin.loop.field'),   sub: t('admin.loop.field-sub') },
    { label: t('admin.loop.gap'),     sub: t('admin.loop.gap-sub') },
    { label: t('admin.loop.improve'), sub: t('admin.loop.improve-sub') },
    { label: t('admin.loop.rec'),     sub: t('admin.loop.rec-sub') },
    { label: t('admin.loop.better'),  sub: t('admin.loop.better-sub') },
  ];

  return (
    <div className="px-8 py-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('admin.dash.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('admin.dash.subtitle')}</p>
      </div>

      {/* ── KPI Summary ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-4">
        <KpiCard label={t('admin.kpi.active')}    value={KPI_SUMMARY.activeJobs}           icon={Activity}      color="bg-navy" />
        <KpiCard label={t('admin.kpi.completed')} value={KPI_SUMMARY.completedJobs}         icon={CheckCircle2}  color="bg-teal" />
        <KpiCard label={t('admin.kpi.diag-time')} value={KPI_SUMMARY.avgDiagnosisTime}      unit={t('admin.kpi.min')} icon={Clock} color="bg-brand-blue" />
        <KpiCard label={t('admin.kpi.ftr')}       value={KPI_SUMMARY.firstTimeResolution}   unit="%" icon={Target}      color="bg-teal" />
        <KpiCard label={t('admin.kpi.unresolved')}value={KPI_SUMMARY.unresolvedJobs}         icon={AlertTriangle} color="bg-orange-500" />
        <KpiCard label={t('admin.kpi.rec-usage')} value={KPI_SUMMARY.recommendationUsage}   unit="%" icon={Zap}         color="bg-violet-600" />
      </div>

      {/* ── Knowledge Gap Alert ─────────────────────────────────────────────── */}
      <div
        className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-6 py-4 flex items-start gap-4 cursor-pointer hover:border-orange-400 transition-colors group"
        onClick={() => navigateToKnowledge(KNOWLEDGE_GAP_ALERT.issueId)}
        role="button"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">{t('admin.gap.label')}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{KNOWLEDGE_GAP_ALERT.message}</p>
          <p className="text-xs text-slate-500 mt-1">
            {t('admin.gap.search-prefix')} &ldquo;{KNOWLEDGE_GAP_ALERT.searchTerm}&rdquo; — {KNOWLEDGE_GAP_ALERT.searchCount} {t('admin.gap.by')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-orange-600 transition-colors flex-shrink-0">
          {t('admin.gap.review')}
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* ── Main Content Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Top Issues */}
        <div className="col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('admin.issues.title')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('admin.issues.subtitle')}</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {TOP_ISSUES.map((issue, idx) => (
              <div
                key={issue.id}
                className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                onClick={() => navigateToKnowledge(issue.id)}
                role="button"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <span className="text-lg font-bold text-slate-200 w-6 text-center">{idx + 1}</span>

                  {/* Issue info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">{issue.title}</span>
                      {issue.id === 'p0420' && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">{t('admin.issues.priority')}</span>
                      )}
                      <TrendIcon trend={issue.trend} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span><b className="text-slate-700">{issue.caseCount}</b> {t('admin.issues.cases')}</span>
                      <span><b className="text-orange-600">{issue.additionalSearches}</b> {t('admin.issues.searches')}</span>
                      <span><b className="text-red-500">{issue.unresolvedCount}</b> {t('admin.issues.unresolved')}</span>
                      <span><Clock className="w-3 h-3 inline mr-0.5" />{issue.avgDiagnosisTime} {t('admin.kpi.min')}</span>
                    </div>
                  </div>

                  {/* Resolution rate */}
                  <div className="w-32">
                    <div className="text-[10px] text-slate-400 mb-1 text-right">{t('admin.issues.resolution')}</div>
                    <ResolutionBar rate={issue.resolutionRate} />
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-5 space-y-5">
          {/* Technician Friction */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">{t('admin.friction.title')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('admin.friction.subtitle')}</p>
            </div>
            <div className="divide-y divide-slate-50">
              {TECHNICIAN_FRICTION.map((card: FrictionCard) => (
                <div
                  key={card.id}
                  className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigateToKnowledge(card.id)}
                  role="button"
                >
                  <div className="font-semibold text-sm text-slate-800 mb-2">{card.issue}</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <div className="text-xs text-slate-500">
                      <span className="font-bold text-slate-700">{card.jobs}</span> {t('admin.friction.jobs')}
                    </div>
                    {card.additionalSearches != null && (
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-orange-600">{card.additionalSearches}</span> {t('admin.issues.searches')}
                      </div>
                    )}
                    {card.qaViews != null && (
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-violet-600">{card.qaViews}</span> {t('admin.friction.qa')}
                      </div>
                    )}
                    <div className="text-xs text-slate-500">
                      <span className="font-bold text-red-500">{card.unresolved}</span> {t('admin.issues.unresolved')}
                    </div>
                    <div className="text-xs text-slate-500">
                      <Clock className="w-3 h-3 inline mr-0.5 text-slate-400" />
                      <span className="font-bold text-slate-700">{card.avgDiagnosisTime}</span> {t('admin.kpi.min')}
                    </div>
                  </div>
                  {card.id === 'p0420' && (
                    <div className="mt-2 text-xs text-orange-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t('admin.friction.insight')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Most Used Knowledge */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{t('admin.knowledge.title')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('admin.knowledge.subtitle')}</p>
              </div>
              {canAccess('/admin/recommendations') && (
                <button
                  onClick={() => router.push('/admin/recommendations')}
                  className="text-xs text-brand-blue font-medium flex items-center gap-0.5 hover:underline"
                >
                  {t('admin.knowledge.perf')} <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {KNOWLEDGE_USAGE.map((item, idx) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-200 w-5">{idx + 1}</span>
                  <KnowledgeTypeIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{item.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <KnowledgeTypeLabel type={item.type} />
                      <span className="text-xs text-slate-400">{item.usageCount} {t('admin.knowledge.uses')}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-teal">{item.helpfulRate}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loop visualization */}
      <div className="bg-navy rounded-xl px-6 py-5">
        <div className="text-white/50 text-xs uppercase tracking-widest mb-3 font-semibold">{t('admin.loop.title')}</div>
        <div className="flex items-center gap-0">
          {loopSteps.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex-1 text-center">
                <div className="text-white text-xs font-bold">{step.label}</div>
                <div className="text-white/40 text-[10px] mt-0.5">{step.sub}</div>
              </div>
              {i < 4 && <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
