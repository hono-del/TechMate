'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp, Car, AlertCircle, Clock, User, Wrench } from 'lucide-react';
import type { Job } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedJob } from '@/data/localizedData';
import { CmcLogo } from '@/components/common/CmcLogo';

const labelCls = 'text-[10px] font-bold uppercase tracking-[0.6px] text-slate-500';
const dividerCls = 'w-px h-8 bg-[var(--line-dark)]';

export function ContextHeader({ job: _job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();
  const job = getLocalizedJob(lang);
  const showDtc = !pathname?.includes('/reception') && !pathname?.includes('/diagnosis');

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-[var(--line-dark)]">
      <div className="px-6 min-h-[72px] py-3 flex items-center gap-5">
        <CmcLogo />

        <div className={dividerCls} />

        <div className="flex items-center gap-2 min-w-0">
          <Car className="w-4 h-4 text-brand-purple flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">
              {job.vehicle.year} {job.vehicle.model}
            </div>
            <div className="text-xs text-slate-500">{job.vehicle.grade}</div>
          </div>
        </div>

        <div className={`${dividerCls} hidden sm:block`} />

        <div className="hidden md:block min-w-0">
          <div className={labelCls}>{t('header.vin')}</div>
          <div className="text-xs font-mono text-slate-800">{job.vehicle.vin}</div>
        </div>

        <div className={`${dividerCls} hidden md:block`} />

        <div className="flex-1 min-w-0 hidden lg:block">
          <div className={labelCls}>{t('header.concern')}</div>
          <div className="text-sm text-slate-800 truncate">{job.customerConcern}</div>
        </div>

        <div className={`${dividerCls} hidden lg:block`} />

        {showDtc && job.dtcs.length > 0 && (
          <>
            <div className="flex-shrink-0">
              <div className={labelCls}>{t('header.dtc')}</div>
              <div className="flex gap-1">
                {job.dtcs.map(d => (
                  <span key={d} className="bg-warning text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className={dividerCls} />
          </>
        )}

        <div className="flex-shrink-0 hidden xl:block">
          <div className={labelCls}>{t('header.technician')}</div>
          <div className="text-sm text-slate-800 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" />
            {job.technician.name}
          </div>
        </div>

        <div className="flex-shrink-0 hidden xl:block">
          <div className={labelCls}>{t('header.ro')}</div>
          <div className="text-xs font-mono text-slate-600">{job.roNumber}</div>
        </div>

        <button
          onClick={toggleLang}
          className="flex-shrink-0 btn-ghost select-none"
          title={lang === 'en' ? '日本語に切替' : 'Switch to English'}
        >
          <span className="text-sm">{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
          <span>{lang === 'en' ? '日本語' : 'English'}</span>
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors text-xs"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="hidden sm:inline">{expanded ? t('header.less') : t('header.more')}</span>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[var(--line-dark)] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-[var(--surface-paper)]">
          <div>
            <div className={`${labelCls} mb-1`}>{t('header.vehicle')}</div>
            <div className="text-slate-800 space-y-0.5">
              <div>{t('vehicle.engine')}: {job.vehicle.engine}</div>
              <div>{t('vehicle.color')}: {job.vehicle.color}</div>
              <div>{t('vehicle.mileage')}: {job.vehicle.mileage.toLocaleString()} km</div>
            </div>
          </div>
          <div>
            <div className={`${labelCls} mb-1`}>{t('header.symptoms')}</div>
            <ul className="text-slate-800 space-y-0.5">
              {job.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className={`${labelCls} mb-1`}>{t('header.schedule')}</div>
            <div className="text-slate-800 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                {t('header.received')}: {job.scheduledDate}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-verified" />
                {t('header.est-done')}: {job.estimatedCompletion}
              </div>
            </div>
          </div>
          <div>
            <div className={`${labelCls} mb-1`}>{t('header.team')}</div>
            <div className="text-slate-800 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3 h-3 text-slate-500" />
                {job.technician.name} ({job.technician.level})
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-500" />
                {t('header.sa')}: {job.serviceAdvisor.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
