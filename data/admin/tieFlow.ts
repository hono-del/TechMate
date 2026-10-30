export type TieApprovalStatus =
  | 'submitted'
  | 'dealer-approved'
  | 'changes-requested'
  | 'rejected'
  | 'published';

export interface TieTemplate {
  id: string;
  name: string;
  nameJa: string;
  active: boolean;
  fields: string[];
}

export interface TieSubmission {
  id: string;
  title: string;
  model: string;
  year: string;
  system: string;
  faultType: string;
  dtc: string;
  chapter: string;
  body: string;
  author: string;
  dealer: string;
  submittedAt: string;
  status: TieApprovalStatus;
  templateId: string;
}

export const TIE_TEMPLATES: TieTemplate[] = [
  {
    id: 'tpl-recurring',
    name: 'Recurring DTC / field fix',
    nameJa: '再発DTC / 現場処置',
    active: true,
    fields: ['Model / MY', 'DTC', 'System', 'Symptom', 'Tried procedures', 'Proposed fix', 'Manual chapter'],
  },
  {
    id: 'tpl-safety',
    name: 'Safety-related observation',
    nameJa: '安全関連の観察',
    active: true,
    fields: ['Model / MY', 'Hazard', 'When it occurs', 'Workaround', 'Photos (optional)'],
  },
  {
    id: 'tpl-noise',
    name: 'NVH / noise & vibration',
    nameJa: '異音・振動',
    active: false,
    fields: ['Model / MY', 'Speed / condition', 'Location', 'Similar cases'],
  },
];

export const INITIAL_TIE_QUEUE: TieSubmission[] = [
  {
    id: 'tie-sub-001',
    title: 'P0420 returns after O2 sensor — post-repair check missing',
    model: 'Corolla Cross',
    year: '2022',
    system: 'Engine / Exhaust',
    faultType: 'Recurring DTC',
    dtc: 'P0420',
    chapter: 'SM §EC-4 / Verify',
    body: 'After sensor replacement the light returned at 150 km. Connector seating is not in the current TIE. Propose a post-repair verification step.',
    author: 'Kenji Yamamoto',
    dealer: 'Tokyo Central Toyota',
    submittedAt: '2026-10-28 16:40',
    status: 'submitted',
    templateId: 'tpl-recurring',
  },
  {
    id: 'tie-sub-002',
    title: 'Bluetooth drop on Android 14 — field workaround',
    model: 'RAV4',
    year: '2023',
    system: 'Audio / HU',
    faultType: 'Connectivity',
    dtc: '—',
    chapter: 'OM Multimedia',
    body: 'Re-pair after HU sleep cycle. Request a published TIE so shops stop replacing HU first.',
    author: 'Kenji Yamamoto',
    dealer: 'Tokyo Central Toyota',
    submittedAt: '2026-10-21 09:12',
    status: 'dealer-approved',
    templateId: 'tpl-recurring',
  },
];

const KEY = 'techmate-tie-queue';

export function readTieQueue(): TieSubmission[] {
  if (typeof window === 'undefined') return INITIAL_TIE_QUEUE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return INITIAL_TIE_QUEUE;
    const parsed = JSON.parse(raw) as TieSubmission[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TIE_QUEUE;
  } catch {
    return INITIAL_TIE_QUEUE;
  }
}

export function writeTieQueue(items: TieSubmission[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}
