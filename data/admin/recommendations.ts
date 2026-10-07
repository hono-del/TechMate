// Mock data for Admin — Recommendation Performance
// All data is fictional and for demonstration purposes only.

export type WorkflowStep = 'Reception' | 'Diagnosis' | 'Work Planning' | 'Repair Execution' | 'Check & Verify' | 'Handover';

export interface RecommendationMetric {
  id: string;
  knowledgeId: string;
  title: string;
  type: 'manual' | 'tie' | 'qa' | 'checklist';
  workflowStep: WorkflowStep;
  shown: number;
  opened: number;
  helpfulRate: number;    // %
  resolvedJobRate: number; // %
  additionalSearchRate: number; // %
  whyRecommended: string[];
  vehicleModels?: string[];
  dtc?: string;
  symptomContext?: string;
  performanceNote?: string;
}

export interface KpiSummary {
  shown: number;
  openRate: number;
  helpfulRate: number;
  usedInResolvedJobs: number;
  additionalSearchAfterRec: number;
}

export interface WorkflowPerformance {
  step: WorkflowStep;
  helpfulRate: number;
  openRate: number;
  shown: number;
}

export const REC_KPI: KpiSummary = {
  shown: 4280,
  openRate: 78,
  helpfulRate: 86,
  usedInResolvedJobs: 72,
  additionalSearchAfterRec: 21,
};

export const TOP_RECOMMENDATIONS: RecommendationMetric[] = [
  {
    id: 'rec-001',
    knowledgeId: 'sm-p0420',
    title: 'P0420 Diagnostic Procedure',
    type: 'manual',
    workflowStep: 'Diagnosis',
    shown: 320,
    opened: 280,
    helpfulRate: 92,
    resolvedJobRate: 84,
    additionalSearchRate: 12,
    whyRecommended: ['Same DTC (P0420)', 'Same Workflow Step (Diagnosis)', 'Same Vehicle Model'],
    vehicleModels: ['Corolla Cross', 'RAV4'],
    dtc: 'P0420',
    symptomContext: 'Warning light / catalytic converter efficiency',
  },
  {
    id: 'rec-002',
    knowledgeId: 'tie-12841',
    title: 'TIE #12841 — Sensor-related warning light',
    type: 'tie',
    workflowStep: 'Diagnosis',
    shown: 210,
    opened: 170,
    helpfulRate: 88,
    resolvedJobRate: 79,
    additionalSearchRate: 15,
    whyRecommended: ['Same DTC range (P04xx)', 'Similar Symptom (warning light)', 'Same Workflow Step'],
    vehicleModels: ['Corolla Cross', 'Corolla', 'RAV4'],
    dtc: 'P0420',
    symptomContext: 'O2 sensor warning light scenarios',
  },
  {
    id: 'rec-003',
    knowledgeId: 'qa-3021',
    title: 'Q&A #3021 — Recurring DTC after replacement',
    type: 'qa',
    workflowStep: 'Repair Execution',
    shown: 160,
    opened: 120,
    helpfulRate: 85,
    resolvedJobRate: 76,
    additionalSearchRate: 18,
    whyRecommended: ['Recurring DTC pattern detected', 'Same repair step (sensor replacement)', 'Similar Field Notes'],
    vehicleModels: ['Corolla Cross'],
    dtc: 'P0420',
    symptomContext: 'Post-repair DTC recurrence',
  },
  {
    id: 'rec-004',
    knowledgeId: 'sm-brake',
    title: 'Brake System Inspection Procedure',
    type: 'manual',
    workflowStep: 'Diagnosis',
    shown: 142,
    opened: 118,
    helpfulRate: 91,
    resolvedJobRate: 88,
    additionalSearchRate: 9,
    whyRecommended: ['Same Vehicle Model', 'Same Symptom Category (Brake Noise)', 'Same Workflow Step'],
    vehicleModels: ['Corolla Cross', 'RAV4'],
    symptomContext: 'Brake noise / squealing',
  },
  {
    id: 'rec-new-p0420',
    knowledgeId: 'tie-candidate-p0420',
    title: 'TIE — Post-repair Connector Verification for P0420 (New)',
    type: 'tie',
    workflowStep: 'Check & Verify',
    shown: 120,
    opened: 94,
    helpfulRate: 88,
    resolvedJobRate: 81,
    additionalSearchRate: 14,
    whyRecommended: ['P0420 recurring pattern', 'Post-repair step', 'Connector inspection field notes'],
    vehicleModels: ['Corolla Cross', 'RAV4', 'Corolla'],
    dtc: 'P0420',
    symptomContext: 'Recurring DTC after O2 sensor replacement',
    performanceNote: 'Recently published — showing strong initial adoption.',
  },
];

export const LOW_PERFORMING: RecommendationMetric[] = [
  {
    id: 'rec-low-001',
    knowledgeId: 'tie-10024',
    title: 'TIE #10024 — General Emission System Check',
    type: 'tie',
    workflowStep: 'Reception',
    shown: 85,
    opened: 19,
    helpfulRate: 31,
    resolvedJobRate: 24,
    additionalSearchRate: 68,
    whyRecommended: ['DTC category match (P04xx)', 'Vehicle model match'],
    dtc: 'P0420',
    symptomContext: 'General emission warning',
    performanceNote: 'Content may not match the current workflow step. Shown at Reception but most useful at Diagnosis or Repair.',
  },
  {
    id: 'rec-low-002',
    knowledgeId: 'faq-bt-old',
    title: 'FAQ — Bluetooth Initial Setup (2021)',
    type: 'qa',
    workflowStep: 'Reception',
    shown: 62,
    opened: 14,
    helpfulRate: 22,
    resolvedJobRate: 18,
    additionalSearchRate: 72,
    whyRecommended: ['Bluetooth symptom keyword match'],
    symptomContext: 'Bluetooth connectivity issues',
    performanceNote: 'Outdated content. Does not cover Android 14+ compatibility. Should be replaced with updated FAQ.',
  },
];

export const WORKFLOW_PERFORMANCE: WorkflowPerformance[] = [
  { step: 'Reception', helpfulRate: 74, openRate: 68, shown: 820 },
  { step: 'Diagnosis', helpfulRate: 91, openRate: 84, shown: 1240 },
  { step: 'Work Planning', helpfulRate: 87, openRate: 79, shown: 680 },
  { step: 'Repair Execution', helpfulRate: 89, openRate: 82, shown: 940 },
  { step: 'Check & Verify', helpfulRate: 88, openRate: 78, shown: 380 },
  { step: 'Handover', helpfulRate: 78, openRate: 71, shown: 220 },
];
