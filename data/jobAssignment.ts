import type { Role } from '@/data/users';

export function jobOpenHref(jobId: string, currentStep: string, role: Role): string {
  let step = currentStep === 'work-planning' ? 'repair' : currentStep;
  if (role === 'technician' && step === 'reception') step = 'diagnosis';
  if (role === 'technician' && step === 'handover') step = 'explanation-note';
  if (role === 'service-advisor' && ['diagnosis', 'repair', 'check-verify'].includes(step)) {
    step = 'reception';
  }
  if (role === 'service-advisor' && step === 'explanation-note') {
    step = 'handover';
  }
  return `/job/${jobId}/${step}`;
}

export interface JobAssignment {
  technicianId: string | null;
  technicianName: string | null;
  technicianNameJa: string | null;
  sentForAssignment: boolean;
}

const KEY = 'techmate-job-assignments';

const INITIAL: Record<string, JobAssignment> = {
  'job-001': {
    technicianId: 'u-tech',
    technicianName: 'Kenji Yamamoto',
    technicianNameJa: '山本 健司',
    sentForAssignment: true,
  },
  'job-002': {
    technicianId: null,
    technicianName: null,
    technicianNameJa: null,
    sentForAssignment: true,
  },
  'job-003': {
    technicianId: 'u-tech',
    technicianName: 'Kenji Yamamoto',
    technicianNameJa: '山本 健司',
    sentForAssignment: true,
  },
  'job-004': {
    technicianId: null,
    technicianName: null,
    technicianNameJa: null,
    sentForAssignment: true,
  },
};

export function readAssignments(): Record<string, JobAssignment> {
  if (typeof window === 'undefined') return { ...INITIAL };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...INITIAL };
    const parsed = JSON.parse(raw) as Record<string, JobAssignment>;
    return { ...INITIAL, ...parsed };
  } catch {
    return { ...INITIAL };
  }
}

export function writeAssignments(map: Record<string, JobAssignment>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function getAssignment(jobId: string): JobAssignment {
  return readAssignments()[jobId] ?? {
    technicianId: null,
    technicianName: null,
    technicianNameJa: null,
    sentForAssignment: false,
  };
}

export function assignTechnician(
  jobId: string,
  technician: { id: string; name: string; nameJa: string }
) {
  const map = readAssignments();
  map[jobId] = {
    technicianId: technician.id,
    technicianName: technician.name,
    technicianNameJa: technician.nameJa,
    sentForAssignment: true,
  };
  writeAssignments(map);
  return map[jobId];
}

export function sendForAssignment(jobId: string) {
  const map = readAssignments();
  map[jobId] = {
    technicianId: null,
    technicianName: null,
    technicianNameJa: null,
    sentForAssignment: true,
  };
  writeAssignments(map);
  return map[jobId];
}

export function isUnassigned(jobId: string): boolean {
  const a = getAssignment(jobId);
  return a.sentForAssignment && !a.technicianId;
}
