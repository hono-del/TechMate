// Mock queue for AI output + field-knowledge Human Review (SR-040, SYS-046).
// Fictional demo data only.

export type ReviewKind = 'ai' | 'field';
export type ReviewTrigger = 'flag' | 'low' | 'pending';
export type ReviewVerdict = 'correct' | 'partial' | 'incorrect' | null;
export type RootCause = 'search' | 'content' | 'generation' | null;

export interface ReviewItem {
  id: string;
  kind: ReviewKind;
  trigger: ReviewTrigger;
  title: string;
  query: string;
  answer: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  jobId: string;
  technician: string;
  dealer: string;
  queuedAt: string;
  hoursOpen: number;
  why: string;
}

export const REVIEW_QUEUE: ReviewItem[] = [
  {
    id: 'rv-001',
    kind: 'ai',
    trigger: 'flag',
    title: 'P0420 — “replace catalyst first”',
    query: 'P0420 on Corolla Cross 2022 after sensor replacement — next step?',
    answer:
      'Replace the catalytic converter. P0420 after an O2 sensor job almost always means the catalyst is damaged.',
    sources: ['SM §EC-4 (sensor diagnosis only)', 'TIE #12841 (2022)'],
    confidence: 'medium',
    jobId: 'RO-2026-10-0042',
    technician: 'Kenji Yamamoto',
    dealer: 'Tokyo Central Toyota',
    queuedAt: '2026-10-16 09:12',
    hoursOpen: 18,
    why: 'Technician marked Not helpful / Information appears incorrect.',
  },
  {
    id: 'rv-002',
    kind: 'ai',
    trigger: 'low',
    title: 'P0300 misfire — Yaris Cross 2021',
    query: 'Random misfire P0300 after battery disconnect. Ignition or injector?',
    answer:
      'A battery disconnect can unset I/M monitors. Clear DTCs and complete a drive cycle before replacing ignition parts.',
    sources: ['SM §IG-2 (general misfire, not this MY)'],
    confidence: 'low',
    jobId: 'RO-2026-10-0039',
    technician: 'Taro Tanaka',
    dealer: 'Tokyo Central Toyota',
    queuedAt: '2026-10-16 11:40',
    hoursOpen: 4,
    why: 'Confidence below threshold — auto-queued for expert review.',
  },
  {
    id: 'rv-003',
    kind: 'field',
    trigger: 'pending',
    title: 'Q&A — connector oxidation best practice',
    query: 'Connector oxidation causing intermittent DTC — best practice?',
    answer:
      'Electrical contact cleaner, then dielectric grease. Confirm the lock clicks twice — a half-seated connector fails after one heat cycle.',
    sources: ['Field Exchange #qa-003 (unapproved)'],
    confidence: 'medium',
    jobId: 'RO-2026-10-0028',
    technician: 'R. Ito',
    dealer: 'Singapore Toyota',
    queuedAt: '2026-10-14 16:05',
    hoursOpen: 46,
    why: 'Field knowledge cannot receive an approved label until Human Review.',
  },
];
