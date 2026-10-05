'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLocalizedAllJobs } from '@/data/localizedData';
import { StatusBadge } from '@/components/common/Badge';
import { WORKFLOW_STEPS } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Car, AlertCircle, Clock, User, ChevronRight, LayoutDashboard, Bell } from 'lucide-react';
import type { TranslationKey } from '@/lib/translations';

const STEP_KEYS: Record<string, TranslationKey> = {
  reception:      'step.reception',
  diagnosis:      'step.diagnosis',
  'work-planning':'step.work-planning',
  repair:         'step.repair',
  'check-verify': 'step.check-verify',
  handover:       'step.handover',
};

export default function HomePage() {
  const { lang, toggleLang, t } = useLanguage();
  const [today, setToday] = useState('');
  const ALL_JOBS = getLocalizedAllJobs(lang);

  useEffect(() => {
    setToday(new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, [lang]);

  const inProgress = ALL_JOBS.filter(j => j.status === 'in-progress');
  const scheduled = ALL_JOBS.filter(j => j.status === 'scheduled');

  return (
    <div className="min-h-screen bg-surface">
      {/* Top navigation */}
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-lg font-bold text-white">{t('app.tagline')}</div>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-700 border border-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
            <span>{lang === 'en' ? '日本語' : 'English'}</span>
          </button>
          <button className="relative p-2 rounded-lg hover:bg-blue-800 transition-colors">
            <Bell className="w-5 h-5 text-blue-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full" />
          </button>
          <div className="flex items-center gap-2 bg-blue-800 rounded-lg px-3 py-1.5">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">KY</div>
            <div>
              <div className="text-xs text-blue-200 font-medium">Kenji Yamamoto</div>
              <div className="text-xs text-blue-300">{lang === 'ja' ? 'シニアテクニシャン' : 'Senior Technician'}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <LayoutDashboard className="w-4 h-4" />
              {t('home.title')}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{today}</h1>
          </div>
          <div className="flex gap-3">
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

        {/* In Progress */}
        {inProgress.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{t('home.in-progress')}</h2>
            <div className="space-y-3">
              {inProgress.map(job => (
                <Link
                  key={job.id}
                  href={`/job/${job.id}/${job.currentStep}`}
                  className="block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="p-5 flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                          {job.vehicle.year} {job.vehicle.model}
                        </span>
                        <StatusBadge status={job.status} />
                        {job.dtcs.length > 0 && (
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
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{job.technician.name}</span>
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
                  </div>

                  {/* Progress bar */}
                  <div className="px-5 pb-4">
                    <div className="flex gap-0.5">
                      {WORKFLOW_STEPS.map((step, idx) => {
                        const stepIndex = WORKFLOW_STEPS.findIndex(s => s.id === job.currentStep);
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
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Demo callout */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-violet-600 text-lg">✦</span>
          </div>
          <div>
            <div className="font-semibold text-violet-900 mb-1">{t('home.demo-mockup')}</div>
            <p className="text-sm text-violet-700">{t('home.demo-note')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
