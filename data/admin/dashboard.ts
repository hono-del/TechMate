// Mock data for Admin — Service Intelligence Dashboard
// All data is fictional and for demonstration purposes only.

export interface ServiceIssue {
  id: string;
  title: string;
  dtc?: string;
  symptom: string;
  caseCount: number;
  unresolvedCount: number;
  additionalSearches: number;
  avgDiagnosisTime: number; // minutes
  resolutionRate: number; // %
  trend: 'up' | 'down' | 'stable';
}

export interface KpiSummary {
  activeJobs: number;
  completedJobs: number;
  avgDiagnosisTime: number;
  firstTimeResolution: number;
  unresolvedJobs: number;
  recommendationUsage: number;
}

export interface KnowledgeUsageItem {
  id: string;
  title: string;
  type: 'manual' | 'tie' | 'qa' | 'checklist';
  usageCount: number;
  helpfulRate: number;
}

export interface FrictionCard {
  id: string;
  issue: string;
  jobs: number;
  additionalSearches?: number;
  qaViews?: number;
  unresolved: number;
  avgDiagnosisTime: number;
}

export const KPI_SUMMARY: KpiSummary = {
  activeJobs: 128,
  completedJobs: 1248,
  avgDiagnosisTime: 18,
  firstTimeResolution: 82,
  unresolvedJobs: 46,
  recommendationUsage: 76,
};

export const TOP_ISSUES: ServiceIssue[] = [
  {
    id: 'p0420',
    title: 'P0420 / Warning Light',
    dtc: 'P0420',
    symptom: 'Catalytic converter efficiency below threshold',
    caseCount: 32,
    unresolvedCount: 9,
    additionalSearches: 18,
    avgDiagnosisTime: 27,
    resolutionRate: 72,
    trend: 'up',
  },
  {
    id: 'bluetooth',
    title: 'Bluetooth Connection',
    symptom: 'Audio Bluetooth disconnects intermittently',
    caseCount: 24,
    unresolvedCount: 5,
    additionalSearches: 16,
    avgDiagnosisTime: 14,
    resolutionRate: 79,
    trend: 'stable',
  },
  {
    id: 'battery',
    title: 'Battery Warning',
    symptom: 'Battery charge warning light illuminated',
    caseCount: 18,
    unresolvedCount: 3,
    additionalSearches: 8,
    avgDiagnosisTime: 12,
    resolutionRate: 83,
    trend: 'down',
  },
  {
    id: 'brake-noise',
    title: 'Brake Noise',
    symptom: 'Squealing noise during braking',
    caseCount: 14,
    unresolvedCount: 2,
    additionalSearches: 5,
    avgDiagnosisTime: 16,
    resolutionRate: 86,
    trend: 'stable',
  },
  {
    id: 'ac-perf',
    title: 'AC Performance',
    symptom: 'Air conditioning output insufficient',
    caseCount: 11,
    unresolvedCount: 2,
    additionalSearches: 4,
    avgDiagnosisTime: 22,
    resolutionRate: 82,
    trend: 'down',
  },
];

export const TECHNICIAN_FRICTION: FrictionCard[] = [
  {
    id: 'p0420',
    issue: 'P0420 / Warning Light',
    jobs: 32,
    additionalSearches: 18,
    unresolved: 9,
    avgDiagnosisTime: 27,
  },
  {
    id: 'bluetooth',
    issue: 'Bluetooth Connection',
    jobs: 24,
    qaViews: 16,
    unresolved: 5,
    avgDiagnosisTime: 14,
  },
  {
    id: 'ac-perf',
    issue: 'AC Performance',
    jobs: 11,
    additionalSearches: 9,
    unresolved: 2,
    avgDiagnosisTime: 22,
  },
];

export const KNOWLEDGE_USAGE: KnowledgeUsageItem[] = [
  { id: 'mu-1', title: 'P0420 Diagnostic Procedure', type: 'manual', usageCount: 320, helpfulRate: 89 },
  { id: 'tie-1', title: 'TIE #12841 — Sensor-related warning light', type: 'tie', usageCount: 210, helpfulRate: 88 },
  { id: 'qa-1', title: 'Q&A #3021 — Recurring DTC after replacement', type: 'qa', usageCount: 160, helpfulRate: 85 },
  { id: 'mu-2', title: 'Brake System Inspection Procedure', type: 'manual', usageCount: 142, helpfulRate: 91 },
  { id: 'tie-2', title: 'TIE #11230 — AC Compressor Noise Check', type: 'tie', usageCount: 98, helpfulRate: 82 },
];

export const KNOWLEDGE_GAP_ALERT = {
  issueId: 'p0420',
  message: '12 technicians searched for the same issue, but no relevant TIE was available.',
  searchCount: 12,
  searchTerm: 'P0420 after sensor replacement',
};
