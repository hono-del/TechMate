'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Car, AlertCircle, Clock, User, Wrench } from 'lucide-react';
import type { Job } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedJob } from '@/data/localizedData';

export function ContextHeader({ job: _job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const { lang, toggleLang, t } = useLanguage();
  // Use localized job data for translatable fields
  const job = getLocalizedJob(lang);

  return (
    <div className="bg-navy text-white shadow-lg">
      {/* Main header row */}
      <div className="px-6 py-3 flex items-center gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-xs text-blue-300 font-medium">{t('app.tagline')}</div>
        </div>

        <div className="w-px h-10 bg-blue-800" />

        {/* Vehicle */}
        <div className="flex items-center gap-2 min-w-0">
          <Car className="w-4 h-4 text-blue-300 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              {job.vehicle.year} {job.vehicle.model}
            </div>
            <div className="text-xs text-blue-200">{job.vehicle.grade}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-blue-800 hidden sm:block" />

        {/* VIN */}
        <div className="hidden md:block min-w-0">
          <div className="text-xs text-blue-300 font-medium uppercase tracking-wide">{t('header.vin')}</div>
          <div className="text-xs font-mono text-white">{job.vehicle.vin}</div>
        </div>

        <div className="w-px h-8 bg-blue-800 hidden md:block" />

        {/* Customer Concern */}
        <div className="flex-1 min-w-0 hidden lg:block">
          <div className="text-xs text-blue-300 font-medium uppercase tracking-wide">{t('header.concern')}</div>
          <div className="text-sm text-white truncate">{job.customerConcern}</div>
        </div>

        <div className="w-px h-8 bg-blue-800 hidden lg:block" />

        {/* DTC */}
        {job.dtcs.length > 0 && (
          <>
            <div className="flex-shrink-0">
              <div className="text-xs text-blue-300 font-medium uppercase tracking-wide">{t('header.dtc')}</div>
              <div className="flex gap-1">
                {job.dtcs.map(d => (
                  <span key={d} className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-px h-8 bg-blue-800" />
          </>
        )}

        {/* Technician */}
        <div className="flex-shrink-0 hidden xl:block">
          <div className="text-xs text-blue-300 font-medium uppercase tracking-wide">{t('header.technician')}</div>
          <div className="text-sm text-white flex items-center gap-1">
            <User className="w-3 h-3 text-blue-300" />
            {job.technician.name}
          </div>
        </div>

        {/* RO */}
        <div className="flex-shrink-0 hidden xl:block">
          <div className="text-xs text-blue-300 font-medium uppercase tracking-wide">{t('header.ro')}</div>
          <div className="text-xs font-mono text-blue-200">{job.roNumber}</div>
        </div>

        {/* Language toggle button */}
        <button
          onClick={toggleLang}
          className="flex-shrink-0 flex items-center gap-1.5 bg-blue-800 hover:bg-blue-700 border border-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors select-none"
          title={lang === 'en' ? '日本語に切替' : 'Switch to English'}
        >
          <span className="text-sm">{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
          <span>{lang === 'en' ? '日本語' : 'English'}</span>
        </button>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 flex items-center gap-1 text-blue-300 hover:text-white transition-colors text-xs"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="hidden sm:inline">{expanded ? t('header.less') : t('header.more')}</span>
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-blue-800 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-navy-light">
          <div>
            <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">{t('header.vehicle')}</div>
            <div className="text-white space-y-0.5">
              <div>{t('vehicle.engine')}: {job.vehicle.engine}</div>
              <div>{t('vehicle.color')}: {job.vehicle.color}</div>
              <div>{t('vehicle.mileage')}: {job.vehicle.mileage.toLocaleString()} km</div>
            </div>
          </div>
          <div>
            <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">{t('header.symptoms')}</div>
            <ul className="text-white space-y-0.5">
              {job.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">{t('header.schedule')}</div>
            <div className="text-white space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-blue-300" />
                {t('header.received')}: {job.scheduledDate}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-green-400" />
                {t('header.est-done')}: {job.estimatedCompletion}
              </div>
            </div>
          </div>
          <div>
            <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">{t('header.team')}</div>
            <div className="text-white space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3 h-3 text-blue-300" />
                {job.technician.name} ({job.technician.level})
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-blue-300" />
                {t('header.sa')}: {job.serviceAdvisor.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
