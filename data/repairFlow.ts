export type RepairPathId = 'sensor' | 'harness';

export interface RepairFindingDef {
  id: string;
  path?: RepairPathId;
  rediagnose?: boolean;
  labelKey: 'repair.finding.sensor' | 'repair.finding.harness' | 'repair.finding.wrong';
  hintKey: 'repair.finding.sensor.hint' | 'repair.finding.harness.hint' | 'repair.finding.wrong.hint';
}

/** P0420 demo: inspection result changes the remaining procedure. */
export const REPAIR_BRANCH_STEP_ID = 'step-002';

export const REPAIR_PATHS: Record<RepairPathId, string[]> = {
  sensor: ['step-001', 'step-002', 'step-003', 'step-004', 'step-005'],
  harness: ['step-001', 'step-002', 'step-h1', 'step-h2', 'step-005'],
};

export const REPAIR_FINDINGS: RepairFindingDef[] = [
  {
    id: 'sensor',
    path: 'sensor',
    labelKey: 'repair.finding.sensor',
    hintKey: 'repair.finding.sensor.hint',
  },
  {
    id: 'harness',
    path: 'harness',
    labelKey: 'repair.finding.harness',
    hintKey: 'repair.finding.harness.hint',
  },
  {
    id: 'wrong',
    rediagnose: true,
    labelKey: 'repair.finding.wrong',
    hintKey: 'repair.finding.wrong.hint',
  },
];
