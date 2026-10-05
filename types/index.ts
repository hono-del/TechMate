export type WorkflowStep =
  | 'reception'
  | 'diagnosis'
  | 'work-planning'
  | 'repair'
  | 'check-verify'
  | 'handover';

export type InformationClass = 'oem-official' | 'field-knowledge' | 'ai-generated';
export type KnowledgeItemType = 'manual' | 'tie' | 'qa' | 'warning' | 'checklist' | 'parts' | 'tools' | 'case';
export type JobStatus = 'scheduled' | 'in-progress' | 'completed' | 'on-hold';
export type Relevance = 'high' | 'medium' | 'low';

export interface Vehicle {
  vin: string;
  model: string;
  year: number;
  grade: string;
  mileage: number;
  engine: string;
  color: string;
}

export interface Technician {
  id: string;
  name: string;
  role: 'technician' | 'service-advisor';
  level: 'junior' | 'senior' | 'master';
}

export interface ServiceHistory {
  id: string;
  date: string;
  mileage: number;
  description: string;
  dtcs: string[];
  parts: string[];
  result: string;
}

export interface KnowledgeItem {
  id: string;
  type: KnowledgeItemType;
  informationClass: InformationClass;
  title: string;
  summary: string;
  source: string;
  relevance: Relevance;
  whyRecommended: string;
  vehicleModels: string[];
  dtcs?: string[];
  workflowSteps: WorkflowStep[];
  content?: string;
  warnings?: string[];
  approved?: boolean;
}

export interface PossibleCause {
  id: string;
  description: string;
  probability: 'high' | 'medium' | 'low';
  evidence: string;
  relatedDTCs: string[];
}

export interface Part {
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  available: boolean;
  /** For out-of-stock parts: estimated arrival date string e.g. "10/8（木）" */
  estimatedArrival?: string;
}

export interface Tool {
  toolNumber: string;
  name: string;
  type: 'standard' | 'sst';
}

export interface TorqueValue {
  location: string;
  value: string;
  unit: string;
  source: string;
}

export interface WorkStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  torqueValues?: TorqueValue[];
  warnings?: string[];
  specifications?: string[];
}

export interface WorkPlan {
  repairDescription: string;
  confirmedCause: string;
  procedure: WorkStep[];
  requiredParts: Part[];
  requiredTools: Tool[];
  torqueValues: TorqueValue[];
  estimatedTime: number;
  precautions: string[];
  similarCases?: string[];
}

export interface VerificationItem {
  id: string;
  category: string;
  description: string;
  required: boolean;
  status: 'pending' | 'passed' | 'failed' | 'na';
  value?: string;
}

export interface DiagnosisResult {
  confirmedCause: string;
  possibleCauses: PossibleCause[];
  diagnosticFlow: string[];
  recommendedRepair: string;
}

export interface Job {
  id: string;
  roNumber: string;
  vehicle: Vehicle;
  customerConcern: string;
  symptoms: string[];
  dtcs: string[];
  currentStep: WorkflowStep;
  status: JobStatus;
  technician: Technician;
  serviceAdvisor: Technician;
  scheduledDate: string;
  estimatedCompletion: string;
  serviceHistory: ServiceHistory[];
  diagnosis?: DiagnosisResult;
  workPlan?: WorkPlan;
}

export interface FieldNote {
  id: string;
  type: 'observation' | 'problem' | 'solution' | 'tip';
  content: string;
  workflowStep: WorkflowStep;
  timestamp: string;
}

export interface ExplanationNote {
  customerConcern: string;
  cause: string;
  whatWeDid: string;
  result: string;
  whatYouShouldKnow: string;
  nextRecommendation: string;
}

export const WORKFLOW_STEPS: { id: WorkflowStep; label: string; shortLabel: string }[] = [
  { id: 'reception', label: 'Reception', shortLabel: 'Reception' },
  { id: 'diagnosis', label: 'Diagnosis', shortLabel: 'Diagnosis' },
  { id: 'work-planning', label: 'Work Planning', shortLabel: 'Planning' },
  { id: 'repair', label: 'Repair', shortLabel: 'Repair' },
  { id: 'check-verify', label: 'Check & Verify', shortLabel: 'Verify' },
  { id: 'handover', label: 'Handover', shortLabel: 'Handover' },
];
