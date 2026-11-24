export type TieApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'review-requested'
  | 'correction-requested'
  | 'approved'
  | 'rejected'
  | 'published';

export type TieDriveType = '' | '2WD' | '4WD';
export type TiePowertrain = '' | 'Gasoline' | 'Diesel' | 'Hybrid';
export type TieMediaKind = 'image' | 'video' | 'audio';

export interface TieTemplate {
  id: string;
  name: string;
  nameJa: string;
  active: boolean;
  fields: string[];
}

export interface TieAttachment {
  kind: TieMediaKind;
  name: string;
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
  problem: string;
  action: string;
  tags: string[];
  driveType: TieDriveType;
  powertrain: TiePowertrain;
  attachments: TieAttachment[];
  author: string;
  dealer: string;
  submittedAt: string;
  status: TieApprovalStatus;
  templateId?: string;
  /** @deprecated migrated into problem */
  body?: string;
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
    problem: 'After sensor replacement the MIL returned at 150 km. Connector seating is not in the current TIE. Observed lock not fully engaged after road test.',
    action: 'Propose a post-repair verification step: connector lock recheck after road test, then I/M readiness complete before return.',
    tags: ['P0420', 'O2 sensor', 'Post-repair'],
    driveType: '2WD',
    powertrain: 'Hybrid',
    attachments: [{ kind: 'image', name: 'connector-lock.jpg' }],
    author: 'Kenji Yamamoto',
    dealer: 'Tokyo Central Toyota',
    submittedAt: '2026-10-28 16:40',
    status: 'submitted',
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
    problem: 'Audio drops after HU sleep cycle on Android 14. Shops replace HU first.',
    action: 'Re-pair after HU sleep cycle. Request a published TIE so shops stop replacing HU first.',
    tags: ['Bluetooth', 'HU', 'Android'],
    driveType: '4WD',
    powertrain: 'Gasoline',
    attachments: [],
    author: 'Kenji Yamamoto',
    dealer: 'Tokyo Central Toyota',
    submittedAt: '2026-10-21 09:12',
    status: 'review-requested',
  },
];

const KEY = 'techmate-tie-queue';

export function normalizeTie(raw: Partial<TieSubmission> & { status?: string }): TieSubmission {
  const legacy = raw.status as string | undefined;
  const status = (legacy === 'dealer-approved' ? 'review-requested' : raw.status) as TieApprovalStatus;
  return {
    id: raw.id ?? `tie-sub-${Date.now()}`,
    title: raw.title ?? '',
    model: raw.model ?? '',
    year: raw.year ?? '',
    system: raw.system ?? '',
    faultType: raw.faultType ?? '',
    dtc: raw.dtc ?? '',
    chapter: raw.chapter ?? '',
    problem: raw.problem ?? raw.body ?? '',
    action: raw.action ?? '',
    tags: raw.tags ?? [],
    driveType: raw.driveType ?? '',
    powertrain: raw.powertrain ?? '',
    attachments: raw.attachments ?? [],
    author: raw.author ?? '',
    dealer: raw.dealer ?? '',
    submittedAt: raw.submittedAt ?? '',
    status: status || 'draft',
  };
}

export function suggestFromTitle(title: string): { tags: string[]; faultType: string } {
  const t = title.toLowerCase();
  const tags: string[] = [];
  if (/p0\d{3}|dtc|mil/.test(t)) tags.push('DTC');
  if (/p0420/.test(t)) tags.push('P0420');
  if (/o2|oxygen|sensor/.test(t)) tags.push('O2 sensor');
  if (/catalyst/.test(t)) tags.push('Catalyst');
  if (/harness|chaf/.test(t)) tags.push('Harness');
  if (/bluetooth|audio|hu/.test(t)) tags.push('Audio');
  if (/hybrid/.test(t)) tags.push('Hybrid');
  if (/post-repair|verify|verification/.test(t)) tags.push('Post-repair');
  const unique = [...new Set(tags)];
  const faultType = unique.includes('DTC') || unique.includes('P0420') ? 'Recurring DTC' : 'Field observation';
  return { tags: unique.length ? unique : ['Field report'], faultType };
}

export function readTieQueue(): TieSubmission[] {
  if (typeof window === 'undefined') return INITIAL_TIE_QUEUE.map(normalizeTie);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return INITIAL_TIE_QUEUE.map(normalizeTie);
    const parsed = JSON.parse(raw) as Partial<TieSubmission>[];
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TIE_QUEUE.map(normalizeTie);
    return parsed.map(normalizeTie);
  } catch {
    return INITIAL_TIE_QUEUE.map(normalizeTie);
  }
}

export function writeTieQueue(items: TieSubmission[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items.map(normalizeTie)));
}

export function upsertTie(item: TieSubmission) {
  const next = [normalizeTie(item), ...readTieQueue().filter(x => x.id !== item.id)];
  writeTieQueue(next);
  return next;
}
