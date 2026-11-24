'use client';

import { CmcLogo } from '@/components/common/CmcLogo';

export function AppTopBar({
  title,
  kicker,
  children,
  homeHref = '/',
}: {
  title?: string;
  kicker?: string;
  children?: React.ReactNode;
  homeHref?: string;
}) {
  return (
    <header className="header-cmc sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <CmcLogo href={homeHref} />
        {(kicker || title) && (
          <div className="min-w-0 hidden sm:block pl-3 border-l border-[var(--line-dark)]">
            {kicker && <div className="eyebrow leading-none mb-1">{kicker}</div>}
            {title && <div className="text-base font-bold text-slate-900 truncate leading-tight">{title}</div>}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 flex-wrap">{children}</div>
    </header>
  );
}
