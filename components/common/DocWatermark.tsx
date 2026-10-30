'use client';

import { useLanguage } from '@/context/LanguageContext';

export function DocWatermark() {
  const { t } = useLanguage();
  const label = t('watermark.label');
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(-28deg, transparent 0 72px, transparent 72px 160px)`,
        }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-[-10%] right-[-10%] text-center text-2xl font-black tracking-[0.35em] text-slate-700 uppercase whitespace-nowrap"
          style={{ top: `${8 + i * 12}%`, transform: 'rotate(-24deg)' }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

export function RestrictBanner() {
  const { t } = useLanguage();
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
      {t('watermark.restrict')}
    </span>
  );
}
