// Mock data for Admin — Knowledge Improvement
// All data is fictional and for demonstration purposes only.

export type GapStatus = 'new' | 'under-review' | 'candidate' | 'approved' | 'published';
export type GapPriority = 'high' | 'medium' | 'low';

export interface FieldNote {
  id: string;
  author: string;
  date: string;
  text: string;
  jobId: string;
}

export interface SearchPattern {
  term: string;
  count: number;
}

export interface QAReply {
  id: string;
  author: string;
  dealer: string;
  date: string;
  text: string;
  isBestAnswer?: boolean;
  helpfulCount: number;
}

export interface RelatedQA {
  id: string;
  question: string;
  body: string;
  author: string;
  dealer: string;
  date: string;
  answered: boolean;
  views: number;
  replies: QAReply[];
}

export interface RelatedKnowledge {
  id: string;
  title: string;
  type: 'manual' | 'tie' | 'faq';
  coverageNote: string;
}

export interface KnowledgeGap {
  id: string;
  issueId: string;
  issue: string;
  dtc?: string;
  symptom: string;
  vehicleModels: string[];
  caseCount: number;
  unresolvedCount: number;
  additionalSearches: number;
  resolutionRate: number;
  avgDiagnosisTime: number;
  priority: GapPriority;
  status: GapStatus;
  fieldNotes: FieldNote[];
  searchPatterns: SearchPattern[];
  relatedQA: RelatedQA[];
  existingKnowledge: RelatedKnowledge[];
  suggestedImprovement: {
    title: string;
    body: string;
    reasons: string[];
  };
}

export const KNOWLEDGE_GAPS: KnowledgeGap[] = [
  {
    id: 'gap-p0420',
    issueId: 'p0420',
    issue: 'P0420 / Warning Light',
    dtc: 'P0420',
    symptom: 'Catalytic converter efficiency below threshold — recurring after repair',
    vehicleModels: ['Corolla Cross', 'RAV4', 'Corolla'],
    caseCount: 32,
    unresolvedCount: 9,
    additionalSearches: 18,
    resolutionRate: 72,
    avgDiagnosisTime: 27,
    priority: 'high',
    status: 'new',
    fieldNotes: [
      {
        id: 'fn-1',
        author: 'T. Yamamoto',
        date: '2026-09-28',
        jobId: 'RO-2026-09-0318',
        text: 'Connector lock was extremely stiff and difficult to remove. Required special tool not mentioned in current SM. DTC recurred 3 days after initial repair.',
      },
      {
        id: 'fn-2',
        author: 'K. Suzuki',
        date: '2026-09-30',
        jobId: 'RO-2026-09-0329',
        text: 'Rechecking the O2 sensor connector after road test prevented repeat DTC. The existing procedure does not include this post-repair verification step.',
      },
      {
        id: 'fn-3',
        author: 'H. Nakamura',
        date: '2026-10-01',
        jobId: 'RO-2026-10-0012',
        text: 'Related wiring harness required additional inspection. Found micro-abrasion on insulation near heat shield bracket — not mentioned in current TIE.',
      },
      {
        id: 'fn-4',
        author: 'A. Tanaka',
        date: '2026-10-03',
        jobId: 'RO-2026-10-0028',
        text: 'Customer reported DTC reappeared one week after repair. Traced to upstream O2 sensor connector with oxidized terminals. Post-repair connector cleaning step added by technician on own initiative.',
      },
      {
        id: 'fn-5',
        author: 'R. Ito',
        date: '2026-10-05',
        jobId: 'RO-2026-10-0041',
        text: 'Heat shield contact causing intermittent contact issue. Current SM procedure resolves initial DTC but does not address physical root cause.',
      },
    ],
    searchPatterns: [
      { term: 'P0420 after sensor replacement', count: 12 },
      { term: 'connector inspection O2 sensor', count: 8 },
      { term: 'warning light returns after repair', count: 7 },
      { term: 'P0420 recurring catalytic', count: 6 },
      { term: 'O2 sensor connector oxidation', count: 5 },
      { term: 'heat shield contact DTC', count: 4 },
    ],
    relatedQA: [
      {
        id: 'qa-001',
        question: 'P0420 recurred 3 days after O2 sensor replacement — what to check?',
        body: 'Replaced the upstream O2 sensor on a Corolla Cross 2022. MIL came back after three days. The connector lock was extremely stiff. Has anyone seen this pattern?',
        author: 'T. Yamamoto',
        dealer: 'Tokyo Central Toyota',
        date: '2026-09-28',
        answered: true,
        views: 47,
        replies: [
          {
            id: 'qa-001-a1',
            author: 'K. Suzuki',
            dealer: 'Tokyo Central Toyota',
            date: '2026-09-29',
            text: 'We had the same comeback. Recheck the O2 sensor connector after the road test — oxidized terminals were the real cause, not the sensor itself. Cleaning the terminals and confirming lock engagement stopped the recurrence.',
            isBestAnswer: true,
            helpfulCount: 14,
          },
          {
            id: 'qa-001-a2',
            author: 'H. Nakamura',
            dealer: 'Osaka Bay Toyota',
            date: '2026-09-30',
            text: 'Also inspect the harness near the heat shield. We found micro-abrasion on the insulation that the SM procedure never mentions. Rerouting the harness fixed two repeat jobs last month.',
            helpfulCount: 8,
          },
        ],
      },
      {
        id: 'qa-002',
        question: 'Post-repair road test checklist for P0420?',
        body: 'After sensor replacement the DTC clears, but we keep getting comebacks. Is anyone using a post-repair checklist that actually catches this before the customer leaves?',
        author: 'A. Tanaka',
        dealer: 'Tokyo Central Toyota',
        date: '2026-10-02',
        answered: false,
        views: 31,
        replies: [],
      },
      {
        id: 'qa-003',
        question: 'Connector oxidation causing intermittent DTC — best practice?',
        body: 'We keep finding oxidized terminals on the upstream O2 connector. What cleaning method and torque / lock check are you using in the field?',
        author: 'R. Ito',
        dealer: 'Singapore Toyota',
        date: '2026-10-03',
        answered: true,
        views: 28,
        replies: [
          {
            id: 'qa-003-a1',
            author: 'M. Kato',
            dealer: 'Tokyo Central Toyota',
            date: '2026-10-04',
            text: 'Electrical contact cleaner, then dielectric grease on the seals. Confirm the lock clicks twice — a half-seated connector looks fine on the bench and fails after one heat cycle. We added this to our shop note.',
            isBestAnswer: true,
            helpfulCount: 11,
          },
        ],
      },
    ],
    existingKnowledge: [
      {
        id: 'ek-sm',
        title: 'SM — P0420 Diagnostic Procedure (§EC-4)',
        type: 'manual',
        coverageNote: 'Covers sensor diagnosis and replacement, but does not include post-repair verification or connector inspection steps.',
      },
      {
        id: 'ek-tie',
        title: 'TIE #12841 — Sensor-related warning light (2022)',
        type: 'tie',
        coverageNote: 'Addresses initial DTC conditions. Does not cover recurring DTC scenarios or wiring harness contact issues.',
      },
    ],
    suggestedImprovement: {
      title: 'Create TIE: Post-repair verification for recurring P0420',
      body: 'Create a TIE covering post-repair connector verification and recurring DTC checks after O2 sensor replacement — including heat shield inspection and terminal oxidation prevention.',
      reasons: [
        '12 similar field notes referencing connector / recurring DTC',
        '18 additional searches beyond standard SM procedure',
        '9 unresolved jobs with same symptom pattern',
        'Existing manual does not include post-repair verification step',
        'Multiple technicians independently added verification steps not in official documentation',
      ],
    },
  },
  {
    id: 'gap-bluetooth',
    issueId: 'bluetooth',
    issue: 'Bluetooth Connection',
    symptom: 'Audio Bluetooth disconnects intermittently',
    vehicleModels: ['RAV4', 'Corolla Cross'],
    caseCount: 24,
    unresolvedCount: 5,
    additionalSearches: 16,
    resolutionRate: 79,
    avgDiagnosisTime: 14,
    priority: 'medium',
    status: 'under-review',
    fieldNotes: [
      {
        id: 'fn-bt-1',
        author: 'M. Kato',
        date: '2026-10-02',
        jobId: 'RO-2026-10-0022',
        text: 'Bluetooth dropout occurs specifically with Android 14+ devices. Current FAQ does not mention OS version compatibility.',
      },
    ],
    searchPatterns: [
      { term: 'Bluetooth disconnect Android', count: 9 },
      { term: 'audio pairing fails', count: 7 },
    ],
    relatedQA: [
      {
        id: 'qa-bt-1',
        question: 'Bluetooth drops on Android 14 — firmware update available?',
        body: 'RAV4 2023, customer Android 14 phone. Pairing works, then audio drops after about 10 minutes. Current FAQ only covers pairing steps. Has anyone seen a firmware or HU update that actually fixes this?',
        author: 'M. Kato',
        dealer: 'Tokyo Central Toyota',
        date: '2026-10-02',
        answered: true,
        views: 22,
        replies: [
          {
            id: 'qa-bt-1-a1',
            author: 'S. Lim',
            dealer: 'Singapore Toyota',
            date: '2026-10-03',
            text: 'Yes — HU firmware 24.08.12 stopped the 10-minute dropout on three Android 14 jobs here. Ask the customer to forget the device, update the HU, then pair again. iOS customers on the same HU were fine without the update.',
            isBestAnswer: true,
            helpfulCount: 9,
          },
          {
            id: 'qa-bt-1-a2',
            author: 'Y. Park',
            dealer: 'Osaka Bay Toyota',
            date: '2026-10-04',
            text: 'If the update is not on your GTS yet, a workaround is to disable Absolute Volume on the phone. Not a root-cause fix, but it got the customer through the weekend.',
            helpfulCount: 4,
          },
        ],
      },
      {
        id: 'qa-bt-2',
        question: 'Audio pairing fails after battery disconnect — any reset sequence?',
        body: 'After 12V battery replacement, Bluetooth will not pair until we do a long reset. The FAQ does not mention this. What sequence are other shops using?',
        author: 'J. Chen',
        dealer: 'Singapore Toyota',
        date: '2026-10-05',
        answered: false,
        views: 14,
        replies: [],
      },
    ],
    existingKnowledge: [
      {
        id: 'ek-bt-faq',
        title: 'FAQ — Bluetooth Pairing Procedure',
        type: 'faq',
        coverageNote: 'General pairing steps. Does not address OS version-specific compatibility issues.',
      },
    ],
    suggestedImprovement: {
      title: 'Update FAQ: Android 14+ Bluetooth Compatibility',
      body: 'Add OS version compatibility notes and workaround steps for Android 14+ Bluetooth connectivity issues.',
      reasons: [
        '9 searches for Android-specific Bluetooth issues',
        '5 unresolved jobs with same OS version pattern',
        'Current FAQ does not mention Android 14 compatibility',
      ],
    },
  },
];
