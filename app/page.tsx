'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { getLocalizedAllJobs } from '@/data/localizedData';
import { StatusBadge } from '@/components/common/Badge';
import { WORKFLOW_STEPS, type Job } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/common/UserMenu';
import { AppTopBar } from '@/components/common/AppTopBar';
import { Car, AlertCircle, Clock, User, ChevronRight, LayoutDashboard, Bell, Sparkles, Search, Settings, BookOpen, Plus, Zap } from 'lucide-react';
import { openWorkspace } from '@/components/common/WorkspaceChrome';
import { ManualBrowserCard, ManualBrowserModal } from '@/components/knowledge/ManualBrowser';
import { LatestNewsModal } from '@/components/common/LatestNewsModal';
import type { TranslationKey } from '@/lib/translations';
import { canAssignJobs, getTechnicians } from '@/data/users';
import {
  assignTechnician,
  isUnassigned,
  jobOpenHref,
  readAssignments,
  type JobAssignment,
} from '@/data/jobAssignment';

const STEP_KEYS: Record<string, TranslationKey> = {
  reception:      'step.reception',
  diagnosis:      'step.diagnosis',
  'work-planning':'step.repair',
  repair:         'step.repair',
  'check-verify': 'step.check-verify',
  'explanation-note': 'step.explanation-note',
  handover:       'step.handover',
};

export default function HomePage() {
  const { lang, toggleLang, t } = useLanguage();
  const { canAccess, user } = useAuth();
  const [today, setToday] = useState('');
  const [showManuals, setShowManuals] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [newsSeen, setNewsSeen] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, JobAssignment>>({});
  const [assignJob, setAssignJob] = useState<Job | null>(null);
  const [techId, setTechId] = useState(getTechnicians()[0]?.id ?? 'u-tech');
  const ALL_JOBS = getLocalizedAllJobs(lang);
  const techs = getTechnicians();
  const role = user?.role;

  useEffect(() => {
    setToday(new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, [lang]);

  useEffect(() => {
    setAssignments(readAssignments());
  }, []);

  const canAssign = role ? canAssignJobs(role) : false;
  const canCreateJob = role === 'service-advisor' || canAssign;

  const { newJobs, inProgress, scheduled } = useMemo(() => {
    const newJobs = ALL_JOBS.filter(j => isUnassigned(j.id));
    let visible = ALL_JOBS.filter(j => !isUnassigned(j.id));
    if (role === 'technician' && user) {
      visible = visible.filter(j => assignments[j.id]?.technicianId === user.id);
    }
    return {
      newJobs,
      inProgress: visible.filter(j => j.status === 'in-progress'),
      scheduled: visible.filter(j => j.status === 'scheduled'),
    };
  }, [ALL_JOBS, assignments, role, user]);

  const showNewQueue = role !== 'technician' && role !== 'manufacturer-approver';

  const confirmAssign = () => {
    if (!assignJob) return;
    const tech = techs.find(x => x.id === techId) ?? techs[0];
    if (!tech) return;
    assignTechnician(assignJob.id, { id: tech.id, name: tech.name, nameJa: tech.nameJa });
    setAssignments(readAssignments());
    setAssignJob(null);
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar kicker={t('app.name')} title={t('app.tagline')}>
          <button type="button" onClick={() => setShowManuals(true)} className="btn-ghost">
            <BookOpen className="w-3.5 h-3.5" />
            {t('home.manuals')}
          </button>
          {canCreateJob && (
            <Link href="/job/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              {t('home.new-job')}
            </Link>
          )}
          <Link href="/tie" className="btn-ghost">
            <Zap className="w-3.5 h-3.5" />
            {t('tie.nav.list')}
          </Link>
          <button type="button" onClick={() => openWorkspace('ai')} className="btn-ghost">
            <Sparkles className="w-3.5 h-3.5" />
            {t('home.ai-search')}
          </button>
          <button type="button" onClick={toggleLang} className="btn-ghost">
            <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
            <span>{lang === 'en' ? '日本語' : 'English'}</span>
          </button>
          {canAccess('/admin') ? (
            <Link href="/admin" className="btn-ghost">
              <Settings className="w-3.5 h-3.5" />
              Admin
            </Link>
          ) : canAccess('/admin/knowledge') ? (
            <Link href="/admin/knowledge" className="btn-ghost">
              <BookOpen className="w-3.5 h-3.5" />
              {t('admin.nav.knowledge')}
            </Link>
          ) : canAccess('/admin/tie-manufacturer') ? (
            <Link href="/admin/tie-manufacturer" className="btn-ghost">
              <Settings className="w-3.5 h-3.5" />
              {t('admin.nav.tie-mfr')}
            </Link>
          ) : canAccess('/admin/tie-approvals') ? (
            <Link href="/admin/tie-approvals" className="btn-ghost">
              <Settings className="w-3.5 h-3.5" />
              {t('admin.nav.tieq')}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setShowNews(true);
              setNewsSeen(true);
            }}
            title={t('news.open')}
            aria-label={t('news.open')}
            className="relative p-2 rounded-full hover:bg-[var(--surface-paper)] text-slate-600"
          >
            <Bell className="w-5 h-5" />
            {!newsSeen && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />
            )}
          </button>
          <UserMenu variant="light" />
      </AppTopBar>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <LayoutDashboard className="w-4 h-4" />
              {t('home.title')}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{today}</h1>
          </div>
          <div className="flex gap-3">
            {showNewQueue && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold text-orange-700">{newJobs.length}</div>
                <div className="text-xs text-orange-600 font-medium">{t('home.new-queue')}</div>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{inProgress.length}</div>
              <div className="text-xs text-blue-500 font-medium">{t('home.in-progress')}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold text-slate-700">{scheduled.length}</div>
              <div className="text-xs text-slate-500 font-medium">{t('home.scheduled')}</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => openWorkspace('ai')}
          className="w-full mb-8 card-cmc px-5 py-4 pr-36 sm:pr-5 flex items-center gap-4 text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500 group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900">{t('home.ai-search')}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t('home.ai-search.hint')}</div>
          </div>
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-400">
            <Search className="w-4 h-4" />
            {t('home.ai-search.placeholder')}
          </div>
        </button>

        <ManualBrowserCard />

        {showNewQueue && (
          <section className="mb-8">
            <h2 className="eyebrow mb-3">{t('home.new-queue')}</h2>
            {newJobs.length === 0 ? (
              <p className="text-sm text-slate-400">{t('home.empty-new')}</p>
            ) : (
              <div className="space-y-3">
                {newJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    hideDtc
                    href={jobOpenHref(job.id, job.currentStep, role ?? 'service-advisor')}
                    extra={
                      canAssign ? (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAssignJob(job); setTechId(techs[0]?.id ?? 'u-tech'); }}
                          className="btn-contact text-xs"
                        >
                          {t('home.assign')}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{t('home.unassigned')}</span>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {inProgress.length > 0 ? (
          <section className="mb-8">
            <h2 className="eyebrow mb-3">{t('home.in-progress')}</h2>
            <div className="space-y-3">
              {inProgress.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  hideDtc={job.currentStep === 'reception'}
                  href={jobOpenHref(job.id, job.currentStep, role ?? 'technician')}
                  assignee={assignments[job.id]}
                />
              ))}
            </div>
          </section>
        ) : role === 'technician' ? (
          <p className="text-sm text-slate-400 mb-8">{t('home.empty-tech')}</p>
        ) : null}

        <div className="card-static p-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'var(--grad-primary)' }}>
            <span className="text-lg" aria-hidden>✦</span>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-1">{t('home.demo-mockup')}</div>
            <p className="text-sm text-slate-600">{t('home.demo-note')}</p>
          </div>
        </div>
      </div>

      {assignJob && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setAssignJob(null)} />
          <div className="fixed inset-x-0 top-24 mx-auto w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <h2 className="text-base font-bold text-slate-900">{t('home.assign.title')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('home.assign.body')}</p>
            <p className="text-sm font-medium text-slate-800 mt-3">
              {assignJob.vehicle.year} {assignJob.vehicle.model} · {assignJob.roNumber}
            </p>
            <label className="block text-xs font-bold uppercase text-slate-400 mt-4">
              {t('jobnew.assign.ph')}
              <select
                value={techId}
                onChange={e => setTechId(e.target.value)}
                className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
              >
                {techs.map(tc => (
                  <option key={tc.id} value={tc.id}>
                    {lang === 'ja' ? tc.nameJa : tc.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={confirmAssign}
                className="flex-1 btn-primary"
              >
                {t('home.assign.confirm')}
              </button>
              <button
                type="button"
                onClick={() => setAssignJob(null)}
                className="px-4 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg"
              >
                {t('home.assign.cancel')}
              </button>
            </div>
          </div>
        </>
      )}

      {showManuals && <ManualBrowserModal onClose={() => setShowManuals(false)} />}
      {showNews && <LatestNewsModal onClose={() => setShowNews(false)} />}
    </div>
  );
}

function JobCard({
  job,
  href,
  hideDtc,
  extra,
  assignee,
}: {
  job: Job;
  href: string;
  hideDtc?: boolean;
  extra?: React.ReactNode;
  assignee?: JobAssignment;
}) {
  const { t, lang } = useLanguage();
  const techName = assignee?.technicianName
    ? (lang === 'ja' ? assignee.technicianNameJa : assignee.technicianName)
    : job.technician.name;

  return (
    <div className="card-cmc">
      <div className="p-5 flex items-center gap-5">
        <Link href={href} className="flex-1 min-w-0 flex items-center gap-5 group">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                {job.vehicle.year} {job.vehicle.model}
              </span>
              <StatusBadge status={job.status} />
              {!hideDtc && job.dtcs.length > 0 && (
                <div className="flex gap-1">
                  {job.dtcs.map(d => (
                    <span key={d} className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">{d}</span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 truncate mb-2">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              {job.customerConcern}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{techName ?? t('home.unassigned')}</span>
              <span className="font-mono">{job.roNumber}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Est. {job.estimatedCompletion}</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-slate-400 mb-1">{t('home.current-step')}</div>
            <div className="bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded-lg">
              {t(STEP_KEYS[job.currentStep] ?? 'step.reception')}
            </div>
            <div className="text-xs text-slate-400 mt-1">{job.vehicle.mileage.toLocaleString()} km</div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
        </Link>
        {extra && <div className="flex-shrink-0">{extra}</div>}
      </div>
      <div className="px-5 pb-4">
        <div className="flex gap-0.5">
          {WORKFLOW_STEPS.map((step, idx) => {
            const mapped = job.currentStep === 'work-planning' ? 'repair' : job.currentStep;
            const stepIndex = WORKFLOW_STEPS.findIndex(s => s.id === mapped);
            const isCompleted = idx < stepIndex;
            const isActive = idx === stepIndex;
            return (
              <div key={step.id} className={`flex-1 h-1.5 rounded-full ${isCompleted ? 'bg-verified' : isActive ? 'bg-brand-blue' : 'bg-slate-200'}`} />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-300 mt-1">
          <span>{t('step.reception')}</span>
          <span>{t('step.handover')}</span>
        </div>
      </div>
    </div>
  );
}
