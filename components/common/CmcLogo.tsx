import Link from 'next/link';

export function CmcLogo({
  href = '/',
  wordmark = 'TechMate',
  inverted = false,
}: {
  href?: string | null;
  wordmark?: string;
  inverted?: boolean;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2.5 min-w-0">
      <span className="logo-mark" aria-hidden>
        C
      </span>
      <span className={`logo-text truncate ${inverted ? 'logo-text--inverse' : ''}`}>{wordmark}</span>
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="flex-shrink-0 rounded-[10px]">
      {inner}
    </Link>
  );
}
