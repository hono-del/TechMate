import type {
  Job, KnowledgeItem, WorkStep, VerificationItem, ExplanationNote
} from '@/types';

// ─── Demo Job ────────────────────────────────────────────────────────────────
export const DEMO_JOB: Job = {
  id: 'job-001',
  roNumber: 'RO-2026-10-0042',
  vehicle: {
    vin: 'ABC1234567890',
    model: 'Corolla Cross',
    year: 2022,
    grade: 'Z (Hybrid)',
    mileage: 25430,
    engine: '2ZR-FXE Hybrid',
    color: 'Platinum White Pearl',
  },
  customerConcern: 'Warning light came on while driving. Light is still on.',
  symptoms: ['Check Engine Light ON', 'No noticeable performance issue', 'Light appeared during highway driving'],
  dtcs: ['P0420'],
  currentStep: 'reception',
  status: 'in-progress',
  technician: {
    id: 'tech-001',
    name: 'Kenji Yamamoto',
    role: 'technician',
    level: 'senior',
  },
  serviceAdvisor: {
    id: 'sa-001',
    name: 'Haruka Sato',
    role: 'service-advisor',
    level: 'senior',
  },
  scheduledDate: '2026-10-01',
  estimatedCompletion: '2026-10-01 17:00',
  serviceHistory: [
    {
      id: 'sh-001',
      date: '2025-04-15',
      mileage: 18200,
      description: '12-month scheduled maintenance',
      dtcs: [],
      parts: ['Oil Filter', 'Engine Oil', 'Air Filter'],
      result: 'Completed — no issues found',
    },
    {
      id: 'sh-002',
      date: '2024-10-03',
      mileage: 11500,
      description: 'Customer reported engine noise at idle',
      dtcs: ['P0171'],
      parts: ['MAF Sensor Cleaner'],
      result: 'Resolved — MAF sensor cleaned, DTC cleared',
    },
  ],
  diagnosis: {
    confirmedCause: 'Catalyst efficiency below threshold — oxygen sensor signal degraded',
    possibleCauses: [
      {
        id: 'pc-001',
        description: 'Catalytic converter efficiency below OEM threshold',
        probability: 'high',
        evidence: 'P0420 confirmed, O2 sensor waveform degraded, 25,430 km — within known failure window',
        relatedDTCs: ['P0420'],
      },
      {
        id: 'pc-002',
        description: 'Downstream O2 sensor (bank 1 sensor 2) malfunction',
        probability: 'medium',
        evidence: 'Sensor response slower than specification in freeze-frame data',
        relatedDTCs: ['P0420', 'P0136'],
      },
      {
        id: 'pc-003',
        description: 'Exhaust leak upstream of catalyst',
        probability: 'low',
        evidence: 'No exhaust odour reported by customer, visual inspection pending',
        relatedDTCs: ['P0420'],
      },
    ],
    diagnosticFlow: [
      'Confirm DTC P0420 — Bank 1 Catalyst System Efficiency Below Threshold',
      'Check freeze-frame data and O2 sensor waveform with GTS',
      'Inspect exhaust system for leaks upstream of TWC',
      'Compare upstream vs downstream O2 sensor switching frequency',
      'Confirm catalytic converter temperature and conversion efficiency',
    ],
    recommendedRepair: 'Replace downstream oxygen sensor (Bank 1 Sensor 2)',
  },
  workPlan: {
    repairDescription: 'Oxygen Sensor Replacement — Bank 1, Sensor 2 (downstream)',
    confirmedCause: 'Catalytic converter efficiency below threshold due to degraded downstream O2 sensor signal',
    procedure: [
      {
        id: 'step-001',
        stepNumber: 1,
        title: 'Preparation & Safety',
        description: 'Park vehicle on level surface. Apply parking brake. Allow exhaust to cool (min. 30 min). Disconnect the negative battery terminal if required by local regulation. Gather all required tools and parts.',
        warnings: ['Exhaust components reach extreme temperatures. Allow minimum 30 minutes cool-down.', 'Hybrid system — follow HV safety procedures. Do not touch orange HV cables.'],
        specifications: ['Wait time before touching exhaust: 30 min minimum'],
      },
      {
        id: 'step-002',
        stepNumber: 2,
        title: 'Locate O2 Sensor (Bank 1 Sensor 2)',
        description: 'Raise vehicle on hoist. Locate the downstream oxygen sensor on the exhaust pipe after the catalytic converter (Bank 1, Sensor 2). Connector is located near the transmission tunnel. Disconnect the electrical connector and remove protective heat shield if present.',
        warnings: ['Confirm correct sensor location — Bank 1 Sensor 2 (downstream/post-catalyst). Do not confuse with Bank 1 Sensor 1 (upstream/pre-catalyst).'],
      },
      {
        id: 'step-003',
        stepNumber: 3,
        title: 'Remove Old O2 Sensor',
        description: 'Apply penetrating oil to sensor threads. Wait 5 minutes. Using O2 sensor socket (22mm), loosen sensor counter-clockwise. Remove sensor completely. Inspect sensor tip for contamination (oil, coolant, carbon). Inspect sensor bung for damage.',
        torqueValues: [],
        specifications: ['Penetrating oil soak time: 5 min minimum'],
        warnings: ['Apply penetrating oil before removal to avoid damaging threads. Damaged threads require exhaust pipe section replacement.'],
      },
      {
        id: 'step-004',
        stepNumber: 4,
        title: 'Install New O2 Sensor',
        description: 'Apply anti-seize compound to new sensor threads (do not apply to first 2 threads). Thread new sensor by hand first to avoid cross-threading. Torque to specification using O2 sensor socket.',
        torqueValues: [
          { location: 'O2 Sensor (Bank 1 Sensor 2)', value: '40', unit: 'N·m', source: 'Service Manual §EM-47 v2022' },
        ],
        warnings: ['Do not apply anti-seize to first 2 threads — sensor tip contamination will occur.', 'Hand-tighten first to confirm threads are not cross-threaded.'],
        specifications: ['Torque: 40 N·m', 'Anti-seize: apply to threads except first 2'],
      },
      {
        id: 'step-005',
        stepNumber: 5,
        title: 'Reconnect & Verify',
        description: 'Route sensor cable away from exhaust heat. Reconnect electrical connector — confirm click/lock. Reinstall heat shield. Lower vehicle. Reconnect battery if disconnected. Clear DTC P0420 using GTS. Start engine and warm to operating temperature. Verify readiness monitors complete.',
        warnings: ['Route cable clear of exhaust pipe to prevent heat damage to insulation.'],
        specifications: ['Readiness monitor: I/M Readiness must show complete after drive cycle'],
      },
    ],
    requiredParts: [
      { partNumber: '89465-12760', name: 'Oxygen Sensor Assy, Air Fuel Ratio (Bank 1 Sensor 2)', quantity: 1, unitPrice: 18500, available: false, estimatedArrival: '10/8（Thu）' },
      { partNumber: '90119-06197', name: 'Bolt, Exhaust Pipe Support', quantity: 2, unitPrice: 320, available: true },
    ],
    requiredTools: [
      { toolNumber: 'SST 09224-00010', name: 'O2 Sensor Socket, 22mm', type: 'sst' },
      { toolNumber: '09816-00010', name: 'Torque Wrench (0–50 N·m)', type: 'standard' },
      { toolNumber: 'GTS', name: 'Techstream Diagnostic Tool', type: 'standard' },
    ],
    torqueValues: [
      { location: 'O2 Sensor (Bank 1 Sensor 2)', value: '40', unit: 'N·m', source: 'Service Manual §EM-47 v2022' },
    ],
    estimatedTime: 75,
    precautions: [
      'HV safety: Confirm "Ready" light is OFF before working on exhaust',
      'Exhaust heat: 30-minute minimum cool-down before touching sensor',
      'Thread care: apply penetrating oil before removal to prevent thread damage',
      'Anti-seize: apply to threads but NOT to first 2 threads near sensor tip',
    ],
    similarCases: [
      'TIE-2022-0188: P0420 on Corolla Cross (2021–2022) — O2 sensor replacement resolved in 94% of cases',
      'TIE-2021-0315: Catalyst efficiency below threshold — diagnosis procedure (GTS required)',
    ],
  },
};

// ─── Additional jobs for Job List ─────────────────────────────────────────────
export const ALL_JOBS: Job[] = [
  DEMO_JOB,
  {
    id: 'job-002',
    roNumber: 'RO-2026-10-0041',
    vehicle: { vin: 'XYZ9876543210', model: 'RAV4', year: 2023, grade: 'Hybrid G', mileage: 12800, engine: '2AR-FXE', color: 'Super White' },
    customerConcern: 'AC not cooling effectively',
    symptoms: ['AC weak', 'Compressor noise'],
    dtcs: [],
    currentStep: 'diagnosis',
    status: 'in-progress',
    technician: { id: 'tech-002', name: 'Taro Tanaka', role: 'technician', level: 'master' },
    serviceAdvisor: { id: 'sa-001', name: 'Haruka Sato', role: 'service-advisor', level: 'senior' },
    scheduledDate: '2026-10-01',
    estimatedCompletion: '2026-10-01 15:00',
    serviceHistory: [],
  },
  {
    id: 'job-003',
    roNumber: 'RO-2026-10-0039',
    vehicle: { vin: 'DEF1122334455', model: 'Yaris Cross', year: 2023, grade: 'G', mileage: 8500, engine: 'M15A-FKS', color: 'Emotional Red' },
    customerConcern: 'Scheduled 6-month maintenance',
    symptoms: [],
    dtcs: [],
    currentStep: 'handover',
    status: 'in-progress',
    technician: { id: 'tech-001', name: 'Kenji Yamamoto', role: 'technician', level: 'senior' },
    serviceAdvisor: { id: 'sa-002', name: 'Yuki Kimura', role: 'service-advisor', level: 'junior' },
    scheduledDate: '2026-10-01',
    estimatedCompletion: '2026-10-01 11:30',
    serviceHistory: [],
  },
  {
    id: 'job-004',
    roNumber: 'RO-2026-10-0038',
    vehicle: { vin: 'GHI5566778899', model: 'Land Cruiser 300', year: 2022, grade: 'ZX', mileage: 45200, engine: '3UR-FE V8', color: 'Dark Blue Mica' },
    customerConcern: 'Vibration felt at highway speed — steering wheel shakes',
    symptoms: ['Steering vibration >100km/h', 'Worse on acceleration'],
    dtcs: ['C1241'],
    currentStep: 'work-planning',
    status: 'in-progress',
    technician: { id: 'tech-002', name: 'Taro Tanaka', role: 'technician', level: 'master' },
    serviceAdvisor: { id: 'sa-001', name: 'Haruka Sato', role: 'service-advisor', level: 'senior' },
    scheduledDate: '2026-10-01',
    estimatedCompletion: '2026-10-01 18:00',
    serviceHistory: [],
  },
];

export function getJob(id: string): Job | undefined {
  return ALL_JOBS.find(j => j.id === id);
}

// ─── Knowledge Items ──────────────────────────────────────────────────────────
export const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  // Reception
  {
    id: 'k-001',
    type: 'tie',
    informationClass: 'oem-official',
    title: 'TIE-2022-0188: P0420 — Catalyst Efficiency (Corolla Cross 2021–2022)',
    summary: 'P0420 on Corolla Cross 2021–2022 may be caused by degraded downstream O2 sensor before catalyst failure. Replace Sensor 2 first before condemning catalyst.',
    source: 'TIE #2022-0188 (Rev.2) — Applicable: Corolla Cross 2021–2022 / VIN range up to ABCXXXXXX',
    relevance: 'high',
    whyRecommended: 'Exact model + year match for DTC P0420',
    vehicleModels: ['Corolla Cross 2021', 'Corolla Cross 2022'],
    dtcs: ['P0420'],
    workflowSteps: ['reception', 'diagnosis', 'work-planning', 'repair'],
    content: `TECHNICAL INFORMATION (TIE-2022-0188 Rev.2)

TITLE: DTC P0420 — Catalyst System Efficiency Below Threshold

APPLICABLE MODELS: Corolla Cross (MXPJ10, MXPJ15) 2021 MY, 2022 MY
VIN RANGE: All vehicles up to production date Dec 2022

SYMPTOM: Check engine light illuminated. DTC P0420 stored.

ROOT CAUSE ANALYSIS: In approximately 94% of confirmed cases, the root cause was degraded downstream oxygen sensor (Bank 1, Sensor 2) signal quality, causing the ECM to incorrectly calculate catalyst efficiency. The catalytic converter itself was within specification.

DIAGNOSIS PROCEDURE:
1. Connect GTS and confirm P0420 (no other DTCs related to fuel trim or misfire)
2. Record freeze-frame data — check bank 1 fuel trim
3. Monitor O2 sensor waveform: upstream (fast switching) vs downstream (slow/flat)
4. If downstream sensor shows erratic or slow response → replace sensor
5. If downstream sensor response is normal → inspect catalyst and exhaust for contamination

REPAIR:
Replace Air Fuel Ratio Sensor Assy (Bank 1 Sensor 2): Part No. 89465-12760

VERIFICATION: Clear DTC, perform drive cycle, confirm I/M readiness complete.

⚠ NOTE: Do not replace catalytic converter before confirming O2 sensor condition. Incorrect catalyst replacement will not resolve the DTC if sensor is the root cause.`,
    warnings: ['Do not replace catalyst before confirming O2 sensor condition'],
    approved: true,
  },
  {
    id: 'k-002',
    type: 'manual',
    informationClass: 'oem-official',
    title: 'Service Manual §EC-4: P0420 — Catalyst System Efficiency (Bank 1)',
    summary: 'Official diagnostic procedure for P0420. Includes DTC description, OBD-II monitoring conditions, freeze-frame analysis, and step-by-step diagnosis flow.',
    source: 'Service Manual — Corolla Cross 2022 §EC-4 (Rev.A)',
    relevance: 'high',
    whyRecommended: 'OEM official diagnostic procedure for confirmed DTC P0420',
    vehicleModels: ['Corolla Cross 2022'],
    dtcs: ['P0420'],
    workflowSteps: ['reception', 'diagnosis'],
    content: `SERVICE MANUAL §EC-4 — DTC P0420

DTC: P0420 — Catalyst System Efficiency Below Threshold (Bank 1)

DETECTION CONDITION:
The ECM monitors the oxygen storage capacity of the three-way catalytic converter (TWC) using the downstream O2 sensor (Bank 1, Sensor 2). DTC P0420 is stored when the downstream sensor switching frequency approaches the upstream sensor frequency, indicating the catalyst is no longer storing and releasing oxygen effectively.

MONITORING CONDITIONS:
• Engine coolant temp: ≥75°C
• Engine speed: 1,500–3,500 rpm
• Vehicle speed: ≥40 km/h
• Fuel system in closed loop
• No active fuel trim or misfire DTCs

POSSIBLE CAUSES:
1. Catalyst internal damage or contamination
2. Downstream O2 sensor (B1S2) malfunction
3. Exhaust system leak upstream of catalyst
4. Engine oil or coolant contamination of catalyst

DIAGNOSIS FLOWCHART:
Step 1: Confirm DTC, check for other active DTCs
Step 2: Check freeze-frame — fuel trim within ±10%?
Step 3: Monitor O2 sensor live data — B1S2 waveform analysis
Step 4: Check exhaust for leaks (visual + smoke test if needed)
Step 5: Compare catalyst efficiency against spec

RELATED DTCs: P0136 (B1S2 circuit low), P0137 (B1S2 circuit high)`,
    approved: true,
  },
  {
    id: 'k-003',
    type: 'qa',
    informationClass: 'field-knowledge',
    title: 'Q: P0420 returned after catalyst replacement on 2022 Corolla Cross',
    summary: '"Replaced catalyst but P0420 came back within 200 km." Answer: P0420 re-occurrence after catalyst replacement is almost always caused by a missed downstream O2 sensor replacement.',
    source: 'Q&A #4521 — Best Answer selected by 8 technicians',
    relevance: 'high',
    whyRecommended: 'Exact same vehicle + symptom scenario — prevents repeat repair',
    vehicleModels: ['Corolla Cross 2022'],
    dtcs: ['P0420'],
    workflowSteps: ['reception', 'diagnosis'],
    approved: true,
  },
  // Diagnosis
  {
    id: 'k-004',
    type: 'manual',
    informationClass: 'oem-official',
    title: 'Service Manual §EM-47: O2 Sensor Removal/Installation',
    summary: 'Step-by-step procedure for removing and installing oxygen sensors. Includes torque specification (40 N·m), anti-seize application guidance, and precautions for hybrid exhaust systems.',
    source: 'Service Manual — Corolla Cross 2022 §EM-47',
    relevance: 'high',
    whyRecommended: 'Required procedure for confirmed O2 sensor replacement repair',
    vehicleModels: ['Corolla Cross 2022'],
    dtcs: ['P0420'],
    workflowSteps: ['work-planning', 'repair'],
    content: `SERVICE MANUAL §EM-47 — AIR FUEL RATIO SENSOR REMOVAL/INSTALLATION

⚠ WARNING — HYBRID VEHICLE:
• Confirm the "READY" indicator is OFF before working on exhaust components.
• Do not touch orange high-voltage cables or connectors.

⚠ WARNING — HOT EXHAUST:
• Allow minimum 30 minutes cool-down before touching exhaust components.
• Exhaust manifold can exceed 400°C during operation.

PART LOCATION:
Bank 1 Sensor 2 (downstream) is located on the exhaust pipe approximately 300 mm downstream of the catalytic converter outlet.

REMOVAL:
1. Raise and support vehicle on hoist.
2. Disconnect the Air Fuel Ratio Sensor connector.
3. Apply penetrating oil to sensor threads. Wait minimum 5 minutes.
4. Using SST 09224-00010 (22 mm O2 sensor socket), remove sensor.
5. Inspect bung threads for damage.

INSTALLATION:
1. Clean bung threads.
2. Apply anti-seize compound to new sensor threads.
   ⚠ IMPORTANT: Do NOT apply anti-seize to first 2 threads near sensor tip.
3. Thread sensor by hand — do not cross-thread.
4. Torque to specification.

TORQUE SPECIFICATION:
Air Fuel Ratio Sensor: 40 N·m {408 kgf·cm, 30 ft·lbf}
SOURCE: Service Manual §EM-47, 2022 MY Corolla Cross (Rev.A)

⚠ This value is quoted directly from OEM official documentation. Do not use AI-generated or estimated values.

POST-INSTALLATION:
• Route cable away from exhaust pipe — use factory clip positions.
• Clear DTC and perform drive cycle to confirm I/M readiness.`,
    warnings: [
      'Allow 30+ min exhaust cool-down before touching sensor',
      'Do NOT apply anti-seize to first 2 threads',
      'HV: confirm READY indicator is OFF',
    ],
    approved: true,
  },
  {
    id: 'k-005',
    type: 'warning',
    informationClass: 'oem-official',
    title: '⚠ HYBRID SAFETY: HV System — Exhaust Work Precautions',
    summary: 'Before working on exhaust system of hybrid vehicles: (1) Turn power OFF, confirm READY indicator is off. (2) Wait 5 minutes after power off before touching HV components. (3) Do not touch orange cables.',
    source: 'Service Manual — Hybrid System Safety §HV-1',
    relevance: 'high',
    whyRecommended: 'Vehicle is hybrid — HV safety protocol required for exhaust work',
    vehicleModels: ['Corolla Cross 2022'],
    workflowSteps: ['work-planning', 'repair'],
    warnings: [
      'Confirm "READY" indicator is OFF before starting exhaust work',
      'Wait minimum 5 minutes after power OFF before approaching HV components',
      'NEVER cut, disconnect, or modify orange high-voltage cables',
    ],
    approved: true,
  },
  {
    id: 'k-006',
    type: 'tie',
    informationClass: 'oem-official',
    title: 'TIE-2021-0315: P0420 Diagnosis — GTS Waveform Analysis Procedure',
    summary: 'How to use Techstream (GTS) to confirm catalyst efficiency and O2 sensor condition. Includes waveform screenshots showing normal vs degraded sensor patterns.',
    source: 'TIE #2021-0315 — All models with TWC monitoring, 2019–present',
    relevance: 'medium',
    whyRecommended: 'Confirmed DTC P0420 — GTS procedure required for root cause confirmation',
    vehicleModels: ['Corolla Cross 2022', 'RAV4 2022', 'Camry 2021'],
    dtcs: ['P0420'],
    workflowSteps: ['diagnosis'],
    approved: true,
  },
  {
    id: 'k-007',
    type: 'parts',
    informationClass: 'oem-official',
    title: 'Required Parts: O2 Sensor 89465-12760 (Bank 1 Sensor 2)',
    summary: 'Air Fuel Ratio Sensor Assembly for Bank 1, Sensor 2 (downstream/post-catalyst). Part No. 89465-12760. Available in stock.',
    source: 'Parts Catalog — Corolla Cross 2022',
    relevance: 'high',
    whyRecommended: 'Required part for confirmed O2 sensor replacement',
    vehicleModels: ['Corolla Cross 2022'],
    workflowSteps: ['work-planning', 'repair'],
    approved: true,
  },
  {
    id: 'k-008',
    type: 'case',
    informationClass: 'field-knowledge',
    title: 'Field Case: P0420 — Corolla Cross 2022, resolved with sensor replacement',
    summary: 'Similar case at Northbridge. DTC P0420, 23,800 km. Downstream O2 sensor replaced (89465-12760). Resolved — DTC clear, readiness monitor complete, no recurrence at 30-day follow-up.',
    source: 'Field Case #FC-2026-0082 — Approved by Technical Support',
    relevance: 'high',
    whyRecommended: 'Same vehicle, same DTC, similar mileage — confirmed resolution path',
    vehicleModels: ['Corolla Cross 2022'],
    dtcs: ['P0420'],
    workflowSteps: ['diagnosis', 'work-planning'],
    approved: true,
  },
  {
    id: 'k-009',
    type: 'checklist',
    informationClass: 'oem-official',
    title: 'Post-Repair Verification Checklist: Emission-Related DTC',
    summary: 'Required verification steps after completing emission-related DTC repairs: DTC clear, readiness monitors, road test, functional check.',
    source: 'Service Manual §IN-12: Post-Repair Verification Procedures',
    relevance: 'high',
    whyRecommended: 'P0420 is emissions-related — post-repair verification required',
    vehicleModels: ['Corolla Cross 2022'],
    dtcs: ['P0420'],
    workflowSteps: ['check-verify'],
    approved: true,
  },
];

export function getKnowledgeForStep(
  step: string,
  dtcs: string[] = [],
  model: string = ''
): KnowledgeItem[] {
  return KNOWLEDGE_ITEMS.filter(k => {
    const stepMatch = k.workflowSteps.includes(step as never);
    return stepMatch;
  }).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.relevance] - order[b.relevance];
  });
}

// ─── Verification Items ────────────────────────────────────────────────────────
export const VERIFICATION_ITEMS: VerificationItem[] = [
  { id: 'v-001', category: 'DTC Status', description: 'Clear DTC P0420 using GTS', required: true, status: 'pending' },
  { id: 'v-002', category: 'DTC Status', description: 'Confirm no new DTCs after clearing', required: true, status: 'pending' },
  { id: 'v-003', category: 'Functional Check', description: 'Start engine — confirm no check engine light', required: true, status: 'pending' },
  { id: 'v-004', category: 'Functional Check', description: 'Monitor O2 sensor B1S2 live data — confirm normal response', required: true, status: 'pending' },
  { id: 'v-005', category: 'Road Test', description: 'Road test: drive >40 km/h for minimum 5 minutes in closed-loop condition', required: true, status: 'pending' },
  { id: 'v-006', category: 'Road Test', description: 'Confirm Check Engine Light remains OFF during and after road test', required: true, status: 'pending' },
  { id: 'v-007', category: 'I/M Readiness', description: 'Confirm Catalyst Monitor shows COMPLETE in GTS I/M Readiness', required: true, status: 'pending' },
  { id: 'v-008', category: 'I/M Readiness', description: 'Confirm O2 Sensor Monitor shows COMPLETE in GTS I/M Readiness', required: true, status: 'pending' },
  { id: 'v-009', category: 'Visual Inspection', description: 'Inspect sensor connector — confirm secure, no damage', required: true, status: 'pending' },
  { id: 'v-010', category: 'Visual Inspection', description: 'Confirm cable routing — clear of exhaust heat', required: true, status: 'pending' },
  { id: 'v-011', category: 'Torque Verification', description: 'Sensor torque confirmed at 40 N·m (per §EM-47)', required: true, status: 'pending' },
  { id: 'v-012', category: 'Documentation', description: 'Record actual repair and parts used in job record', required: true, status: 'pending' },
];

// ─── Handover Explanation Note ────────────────────────────────────────────────
export const EXPLANATION_NOTE: ExplanationNote = {
  customerConcern: 'Warning light (Check Engine) came on while driving and has remained on.',
  cause: 'The vehicle\'s emission system sensor (oxygen sensor, Bank 1 Sensor 2) was giving an incorrect reading, causing the engine control system to detect that the catalytic converter was not working at full efficiency. This triggered the warning light (DTC P0420).',
  whatWeDid: 'We replaced the oxygen sensor located after the catalytic converter (Bank 1, Sensor 2, Part No. 89465-12760). After replacement, we cleared the stored fault code, performed a road test, and confirmed all emission monitors passed.',
  result: 'The Check Engine Light is now OFF. All emission system monitors confirmed as COMPLETE. No new fault codes detected. Road test completed without issue.',
  whatYouShouldKnow: 'The vehicle is operating normally. The catalytic converter was inspected and is in good condition — only the sensor required replacement. The oxygen sensor is a wear item that can degrade over time, particularly in stop-and-go driving conditions.',
  nextRecommendation: 'No immediate action required. Next scheduled maintenance due at 30,000 km or 12 months, whichever comes first. If the Check Engine Light illuminates again before the next service, please return for inspection.',
};

// ─── Work Steps (for repair page) ─────────────────────────────────────────────
export const REPAIR_STEPS: WorkStep[] = DEMO_JOB.workPlan!.procedure;
