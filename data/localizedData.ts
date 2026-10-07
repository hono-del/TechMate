/**
 * Helper functions that return mock data localized to the given language.
 * English (default) comes from mockData.ts; Japanese overrides from mockDataJa.ts.
 */
import type { Language } from '@/lib/translations';
import {
  DEMO_JOB,
  ALL_JOBS,
  KNOWLEDGE_ITEMS,
  VERIFICATION_ITEMS,
  EXPLANATION_NOTE,
  getKnowledgeForStep as _getKnowledgeForStep,
} from './mockData';
import {
  JA_JOB001,
  JA_ALL_JOBS,
  JA_KNOWLEDGE,
  JA_VERIFICATION_ITEMS,
  JA_EXPLANATION_NOTE,
  JA_CUSTOMER_QUESTIONS,
  EN_CUSTOMER_QUESTIONS,
} from './mockDataJa';
import type { Job, KnowledgeItem, VerificationItem, ExplanationNote } from '@/types';

// Deep-merge helper (shallow per-level is enough for mock data)
function mergeDeep<T>(base: T, override: Partial<T>): T {
  const result: T = { ...base };
  for (const key of Object.keys(override) as Array<keyof T>) {
    const o = override[key];
    if (o !== undefined && o !== null) {
      (result as Record<string, unknown>)[key as string] = o;
    }
  }
  return result;
}

// ─── Job ─────────────────────────────────────────────────────────────────────

export function getLocalizedJob(lang: Language): Job {
  if (lang === 'en') return DEMO_JOB;

  const ja = JA_JOB001;
  const base = DEMO_JOB;

  // Rebuild procedure steps with Japanese text
  const localizedProcedure = base.workPlan!.procedure.map(step => {
    const jaStep = ja.workPlan.procedure[step.id as keyof typeof ja.workPlan.procedure];
    if (!jaStep) return step;
    return {
      ...step,
      title: jaStep.title ?? step.title,
      description: jaStep.description ?? step.description,
      warnings: jaStep.warnings ?? step.warnings,
      specifications: (jaStep as { specifications?: string[] }).specifications ?? step.specifications,
    };
  });

  // Rebuild required parts with Japanese names
  const localizedParts = base.workPlan!.requiredParts.map(part => {
    const jaName = ja.workPlan.requiredParts[part.partNumber as keyof typeof ja.workPlan.requiredParts]?.name;
    return jaName ? { ...part, name: jaName } : part;
  });

  // Rebuild required tools with Japanese names
  const localizedTools = base.workPlan!.requiredTools.map(tool => {
    const jaName = ja.workPlan.requiredTools[tool.toolNumber as keyof typeof ja.workPlan.requiredTools]?.name;
    return jaName ? { ...tool, name: jaName } : tool;
  });

  return {
    ...base,
    customerConcern: ja.customerConcern,
    symptoms: ja.symptoms,
    vehicle: {
      ...base.vehicle,
      grade: ja.vehicle.grade,
      color: ja.vehicle.color,
    },
    serviceHistory: base.serviceHistory.map(sh => {
      const jaShKey = sh.id as keyof typeof ja.serviceHistory;
      const jaSh = ja.serviceHistory[jaShKey];
      return jaSh ? { ...sh, description: jaSh.description, result: jaSh.result } : sh;
    }),
    diagnosis: base.diagnosis
      ? {
          ...base.diagnosis,
          confirmedCause: ja.diagnosis.confirmedCause,
          diagnosticFlow: ja.diagnosis.diagnosticFlow,
          possibleCauses: base.diagnosis.possibleCauses.map(pc => {
            const jaPc = ja.diagnosis.possibleCauses[pc.id as keyof typeof ja.diagnosis.possibleCauses];
            return jaPc ? { ...pc, description: jaPc.description, evidence: jaPc.evidence } : pc;
          }),
        }
      : base.diagnosis,
    workPlan: base.workPlan
      ? {
          ...base.workPlan,
          repairDescription: ja.workPlan.repairDescription,
          confirmedCause: ja.workPlan.confirmedCause,
          precautions: ja.workPlan.precautions,
          similarCases: ja.workPlan.similarCases,
          procedure: localizedProcedure,
          requiredParts: localizedParts,
          requiredTools: localizedTools,
        }
      : base.workPlan,
  };
}

// ─── All Jobs ─────────────────────────────────────────────────────────────────

export function getLocalizedAllJobs(lang: Language): Job[] {
  if (lang === 'en') return ALL_JOBS;
  return ALL_JOBS.map(job => {
    const jaJob = JA_ALL_JOBS[job.id as keyof typeof JA_ALL_JOBS];
    if (!jaJob) return job;
    return { ...job, customerConcern: jaJob.customerConcern, symptoms: jaJob.symptoms };
  });
}

// ─── Knowledge Items ──────────────────────────────────────────────────────────

export function getLocalizedKnowledge(step: string, dtcs: string[], model: string, lang: Language): KnowledgeItem[] {
  const items = _getKnowledgeForStep(step, dtcs, model);
  if (lang === 'en') return items;
  return items.map(item => {
    const ja = JA_KNOWLEDGE[item.id];
    if (!ja) return item;
    return {
      ...item,
      title: ja.title ?? item.title,
      summary: ja.summary ?? item.summary,
      whyRecommended: ja.whyRecommended ?? item.whyRecommended,
      warnings: ja.warnings ?? item.warnings,
    };
  });
}

export function getAllLocalizedKnowledge(lang: Language): KnowledgeItem[] {
  if (lang === 'en') return KNOWLEDGE_ITEMS;
  return KNOWLEDGE_ITEMS.map(item => {
    const ja = JA_KNOWLEDGE[item.id];
    if (!ja) return item;
    return {
      ...item,
      title: ja.title ?? item.title,
      summary: ja.summary ?? item.summary,
      whyRecommended: ja.whyRecommended ?? item.whyRecommended,
      warnings: ja.warnings ?? item.warnings,
    };
  });
}

// ─── Verification Items ────────────────────────────────────────────────────────

export function getLocalizedVerificationItems(lang: Language): VerificationItem[] {
  if (lang === 'en') return VERIFICATION_ITEMS;
  return VERIFICATION_ITEMS.map(item => {
    const ja = JA_VERIFICATION_ITEMS[item.id];
    return ja ? { ...item, category: ja.category, description: ja.description } : item;
  });
}

// ─── Explanation Note ─────────────────────────────────────────────────────────

export function getLocalizedExplanationNote(lang: Language): ExplanationNote {
  return lang === 'ja' ? JA_EXPLANATION_NOTE : EXPLANATION_NOTE;
}

// ─── Customer Confirmation Questions ─────────────────────────────────────────

export function getCustomerQuestions(lang: Language) {
  return lang === 'ja' ? JA_CUSTOMER_QUESTIONS : EN_CUSTOMER_QUESTIONS;
}

// ─── Cause Probability Adjustment ─────────────────────────────────────────────
// Based on reception answer indices (language-independent)
// Questions:
//   cq-2: light behavior  (0=continuous, 1=on-off, 2=once, 3=unknown)
//   cq-3: driving cond.   (0=highway, 1=city, 2=idling, 3=other/unknown)
//   cq-4: symptoms        (0=yes noticed, 1=nothing, 2=slight, 3=unknown)
//   cq-5: fuel economy    (0=worse, 1=no change, 2=slight, 3=unknown)
//   cq-7: driving pattern (0=highway, 1=city, 2=50-50)
//   cq-8: service elsewhere (0=yes, 1=no, 2=unknown)

export type CauseKey = 'catalyst' | 'o2sensor' | 'exhaust';

export interface AdjustedCause {
  id: string;
  probability: 'high' | 'medium' | 'low';
  score: number;
  delta: number; // change from base
}

export function adjustCauseProbabilities(
  answers: Record<string, number>
): Record<CauseKey, AdjustedCause> {
  const base: Record<CauseKey, number> = { catalyst: 70, o2sensor: 50, exhaust: 20 };
  const scores: Record<CauseKey, number> = { ...base };

  // cq-2: light behavior
  const lightBehavior = answers['cq-2'];
  if (lightBehavior === 0) { scores.catalyst += 15; }                       // continuous → catalyst
  if (lightBehavior === 1) { scores.o2sensor += 20; scores.catalyst -= 10; } // on/off → sensor
  if (lightBehavior === 2) { scores.o2sensor += 25; scores.catalyst -= 15; } // once → sensor

  // cq-3: driving when it occurred
  const driving = answers['cq-3'];
  if (driving === 0) { scores.catalyst += 15; }       // highway → catalyst
  if (driving === 1) { scores.o2sensor += 15; }       // city → sensor
  if (driving === 2) { scores.exhaust += 25; }        // idling → exhaust

  // cq-4: unusual symptoms
  const symptoms = answers['cq-4'];
  if (symptoms === 0) { scores.exhaust += 35; }       // yes noticed → exhaust strongly
  if (symptoms === 1) { scores.exhaust -= 10; }       // nothing → exhaust less likely
  if (symptoms === 2) { scores.exhaust += 10; }       // slight concern → mild exhaust

  // cq-5: fuel economy
  const fuelEcon = answers['cq-5'];
  if (fuelEcon === 0) { scores.catalyst += 15; }      // worse → catalyst
  if (fuelEcon === 1) { scores.o2sensor += 10; scores.catalyst -= 5; } // no change → sensor

  // cq-7: driving pattern
  const pattern = answers['cq-7'];
  if (pattern === 0) { scores.catalyst += 10; }       // mostly highway → catalyst
  if (pattern === 1) { scores.o2sensor += 10; }       // mostly city → sensor

  // cq-8: service elsewhere
  const elsewhere = answers['cq-8'];
  if (elsewhere === 0) { scores.exhaust += 25; }      // yes → exhaust (bad repair)

  const toProbability = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 75) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  };

  return {
    catalyst: { id: 'pc-001', score: scores.catalyst, probability: toProbability(scores.catalyst), delta: scores.catalyst - base.catalyst },
    o2sensor: { id: 'pc-002', score: scores.o2sensor, probability: toProbability(scores.o2sensor), delta: scores.o2sensor - base.o2sensor },
    exhaust:  { id: 'pc-003', score: scores.exhaust,  probability: toProbability(scores.exhaust),  delta: scores.exhaust  - base.exhaust },
  };
}

// ─── Diagnostic Flow Steps ────────────────────────────────────────────────────

export interface SimilarCaseRef {
  id: string;
  type: 'tie' | 'qa';
  displayId: string;
  meta: string;
  resolution: string;
  hasBestAnswer?: boolean;
  // Drawer content
  symptoms: string;
  cause: string;
  action: string;
  result: string;
  whyRecommended: string;
}

export interface ManualRef {
  title: string;
  section: string;
  source: string;
  /** Brief description of what this manual section covers */
  overview: string;
  /** Key information bullets */
  keyPoints: string[];
  /** Optional step-by-step procedure */
  procedure?: string[];
  /** Optional specifications / measurement values */
  spec?: { label: string; value: string }[];
  /** Optional caution/warning note */
  warning?: string;
}

export interface DiagFlowStep {
  id: string;
  title: string;
  whatToCheck: string[];
  relevantManual: ManualRef[];
  similarCases: SimilarCaseRef[];
  precautions: string[];
}

export function getDiagnosticFlowSteps(lang: Language): DiagFlowStep[] {
  const ja = lang === 'ja';
  return [
    {
      id: 'flow-1',
      title: ja ? '関連DTCを確認する' : 'Check for related DTCs',
      whatToCheck: ja ? [
        'GTSを接続してP0420を含む全DTC（現在・保留）を記録する',
        'P0136 / P0137（O2センサー回路）などの関連DTCを確認する',
        'フリーズフレームデータ（燃料トリム・エンジン回転数・車速）を記録する',
      ] : [
        'Connect GTS and record all active/pending DTCs including P0420',
        'Check for related DTCs: P0136 / P0137 (O2 sensor circuit)',
        'Record freeze-frame data: fuel trim, engine speed, vehicle speed',
      ],
      relevantManual: [
        {
          title: ja ? 'Service Manual §EC-4: P0420 診断フロー' : 'Service Manual §EC-4: P0420 Diagnostic Flow',
          section: 'EC-4',
          source: 'Service Manual — Corolla Cross 2022',
          overview: ja
            ? 'DTC P0420「触媒システム効率低下（Bank 1）」のOBD診断手順。P0420の根本原因は触媒本体の劣化ではなく、ダウンストリームO2センサー（B1S2）の信号品質劣化である場合が大半を占める。'
            : 'OBD diagnostic procedure for DTC P0420 "Catalyst System Efficiency Below Threshold (Bank 1)". In most cases the root cause is downstream O2 sensor (B1S2) signal degradation, not catalyst failure.',
          keyPoints: ja ? [
            'P0420は、一定の監視期間にわたって触媒効率がしきい値を下回ると設定される',
            '根本原因の多くはダウンストリームO2センサー（B1S2）の劣化（触媒本体ではない）',
            'P0136・P0137・P0171など関連DTCが存在する場合は先に対処すること',
            'フリーズフレームデータ（燃料トリム・エンジン回転数・車速）は診断に不可欠',
            'DTC消去後にドライブサイクルを実施し、P0420の再発有無を確認する',
          ] : [
            'P0420 is set when catalyst efficiency drops below threshold over a defined monitoring window',
            'Root cause is most often O2 sensor (B1S2) degradation — not catalyst failure',
            'Address any related DTCs (P0136, P0137, P0171) before diagnosing P0420',
            'Freeze frame data (fuel trim, RPM, VSS) is essential for accurate diagnosis',
            'After clearing, perform a complete drive cycle to confirm DTC does not return',
          ],
          procedure: ja ? [
            'GTSを接続し、現在・保留中のDTCをすべて記録する',
            'P0420のフリーズフレームデータを記録する（燃料トリム・エンジン回転数・車速）',
            '関連DTC（P0136 / P0137 / P0171）を確認し、存在する場合は先に対処する',
            'DTC消去後、ドライブサイクルを実施してP0420の再発を確認する',
            '再発した場合はStep 2（排気系統点検）へ進む',
          ] : [
            'Connect GTS and record all active and pending DTCs',
            'Record freeze frame data for P0420 (fuel trim, engine speed, vehicle speed)',
            'Identify related DTCs (P0136 / P0137 / P0171) and resolve them first if present',
            'Clear DTCs and perform drive cycle to confirm whether P0420 returns',
            'If P0420 returns, proceed to Step 2 (exhaust system inspection)',
          ],
          warning: ja
            ? 'O2センサーの状態を確認する前に触媒を交換しないこと。94%のケースでセンサー交換のみで解決する（TIE #2022-0188参照）。'
            : 'Do not replace the catalyst before confirming O2 sensor condition. 94% of cases resolve with sensor replacement only (ref. TIE #2022-0188).',
        },
      ],
      similarCases: [
        {
          id: 'sc-1-1',
          type: 'tie',
          displayId: 'TIE #2022-0188',
          meta: ja ? '同一車種 / 同一DTC' : 'Same model / Same DTC',
          resolution: ja ? '解決方法: O2センサー交換' : 'Resolved by: O2 sensor replacement',
          symptoms: ja
            ? 'チェックエンジンランプが点灯。DTC P0420 が記録されている。走行性能に目立った変化なし。'
            : 'Check engine light on. DTC P0420 stored. No noticeable performance issue.',
          cause: ja
            ? 'ダウンストリームO2センサー（B1S2）の信号品質劣化により、ECMが触媒効率を誤判定。触媒本体は正常範囲内。'
            : 'Degraded downstream O2 sensor (B1S2) signal quality causes ECM to miscalculate catalyst efficiency. Catalyst itself is within spec.',
          action: ja
            ? 'O2センサー（B1S2）を交換（Part No. 89465-12760）。DTC消去後にドライブサイクルを実施してI/Mレディネスを確認。'
            : 'Replace O2 sensor (B1S2) (Part No. 89465-12760). Clear DTC and perform drive cycle to confirm I/M readiness.',
          result: ja
            ? '94%のケースでP0420が再発しなかった。触媒本体の交換は不要だった。'
            : 'P0420 did not recur in 94% of cases. Catalyst replacement was not required.',
          whyRecommended: ja
            ? '同一車種（Corolla Cross 2022）＋同一DTC（P0420）'
            : 'Same model (Corolla Cross 2022) + same DTC (P0420)',
        },
      ],
      precautions: ja ? [
        '燃料トリムや失火に関連するDTCが併存する場合は先に対処し、P0420を再診断すること',
      ] : [
        'If fuel trim or misfire DTCs are also active, address those first before diagnosing P0420',
      ],
    },
    {
      id: 'flow-2',
      title: ja ? '排気系統を点検する' : 'Inspect exhaust system',
      whatToCheck: ja ? [
        '目視点検：触媒前後の排気管・フランジ部の排気漏れを確認',
        'コネクター状態：O2センサーカプラーの腐食・損傷・ピン変形を確認',
        'センサー取付部：緩み・錆による損傷・ネジ山状態を確認',
      ] : [
        'Visual inspection: exhaust pipe and flanges upstream/downstream of catalyst for leaks',
        'Connector condition: check O2 sensor connector for corrosion, damage, or bent pins',
        'Sensor mounting: inspect for looseness or rust damage on threads',
      ],
      relevantManual: [
        {
          title: ja ? 'Service Manual §EM-47: O2センサー 取外し/取付' : 'Service Manual §EM-47: O2 Sensor Removal/Installation',
          section: 'EM-47',
          source: 'Service Manual — Corolla Cross 2022',
          overview: ja
            ? 'Corolla Cross 2022 ハイブリッド ダウンストリームO2センサー（Bank 1 Sensor 2）の取外し・取付手順。コネクターの腐食やネジ山の固着が多発するため、浸透剤の使用と専用工具の準備が必須。'
            : 'Removal and installation procedure for the downstream O2 sensor (Bank 1 Sensor 2) on Corolla Cross 2022 Hybrid. Connector corrosion and thread seizure are common — penetrating oil and SST are required.',
          keyPoints: ja ? [
            '浸透剤（ラスペネ等）を塗布し、最低10分浸透させてから取外しを試みること',
            '専用工具 SST 09224-00010（O2センサーソケット）を使用してセンサーを取り外す',
            '取付前にネジ山に焼付防止剤（アンチシーズ）を塗布する（センサーチップ部分には塗布不可）',
            '取付トルクは規定値40 N·mを厳守すること',
            'コネクターロックが確実に「カチッ」と固定されていることを確認する',
          ] : [
            'Apply penetrating oil and allow minimum 10 minutes soak before attempting removal',
            'Use Toyota SST 09224-00010 (O2 sensor socket wrench) to remove sensor without damage',
            'Apply anti-seize compound to sensor threads before installation — not on sensor tip',
            'Torque to specification: 40 N·m — do not over-tighten',
            'Confirm connector lock clicks securely into place after installation',
          ],
          procedure: ja ? [
            '排気系を最低30分冷却させる（ハイブリッド: READYランプ消灯確認）',
            'センサーカプラーを外す（ロックタブを押しながらまっすぐ引き抜く）',
            '浸透剤をセンサーネジ部に塗布し、10分以上待つ',
            'SST 09224-00010 を使用してセンサーを取り外す（力は一方向に）',
            '新品センサーのネジ山に焼付防止剤を塗布する（チップ部分は不可）',
            '手締めで数回転入れてからSST使用、40 N·mでトルク締め',
            'カプラーを接続し、ロック固定を確認する',
          ] : [
            'Allow exhaust to cool for minimum 30 minutes (Hybrid: confirm READY lamp is OFF)',
            'Disconnect sensor connector (press lock tab and pull straight out)',
            'Apply penetrating oil to sensor threads and wait at least 10 minutes',
            'Use SST 09224-00010 to remove sensor — apply force in one direction only',
            'Apply anti-seize to new sensor threads — keep tip free of compound',
            'Hand-thread a few turns, then torque to 40 N·m using SST',
            'Reconnect connector and confirm lock is seated',
          ],
          spec: [
            { label: ja ? '締付トルク' : 'Tightening Torque', value: '40 N·m' },
            { label: 'SST', value: '09224-00010' },
            { label: ja ? '使用剤' : 'Compound', value: ja ? '焼付防止剤（ネジ山部のみ）' : 'Anti-seize (threads only)' },
          ],
          warning: ja
            ? '排気系は高温になる。最低30分冷却してから作業すること。ハイブリッド車はREADYランプが消灯していることを必ず確認する。'
            : 'Exhaust components reach extreme temperatures. Allow minimum 30 minutes cooling before working. For hybrid vehicles, always confirm the READY lamp is OFF.',
        },
      ],
      similarCases: [
        {
          id: 'sc-2-1',
          type: 'qa',
          displayId: 'Q&A #67890',
          meta: ja ? '類似症状 / ベストアンサーあり' : 'Similar symptom / Best Answer available',
          resolution: ja ? '解決方法: O2センサー追加交換' : 'Resolved by: Additional O2 sensor replacement',
          hasBestAnswer: true,
          symptoms: ja
            ? 'P0420が触媒交換後200km以内に再発した。点検不足だった。'
            : 'P0420 returned within 200 km after catalyst replacement. Insufficient inspection.',
          cause: ja
            ? 'O2センサーの交換を見落としたことで再発。触媒だけ交換しても根本原因を解消できなかった。'
            : 'O2 sensor was not replaced alongside the catalyst, leaving the root cause unresolved.',
          action: ja
            ? 'O2センサー（B1S2）を追加交換。DTC消去・ドライブサイクル実施。'
            : 'Additionally replaced O2 sensor (B1S2). Cleared DTC and performed drive cycle.',
          result: ja
            ? 'P0420再発なし。排気系統の目視点検を最初に実施することで防げた事例。'
            : 'No recurrence of P0420. Could have been prevented with thorough exhaust inspection upfront.',
          whyRecommended: ja
            ? '類似症状（P0420 再発）＋排気系統点検の重要性を示す事例'
            : 'Similar symptom (P0420 recurrence) + illustrates importance of exhaust inspection',
        },
      ],
      precautions: ja ? [
        '排気系は高温になる。点検前に最低30分冷却すること',
        'ハイブリッド車：READYランプが消灯していることを確認してから作業する',
      ] : [
        'Exhaust components reach extreme temperatures — cool down minimum 30 minutes before inspection',
        'Hybrid vehicle: confirm "READY" indicator is OFF before working on exhaust',
      ],
    },
    {
      id: 'flow-3',
      title: ja ? 'センサーデータを確認する' : 'Check sensor data',
      whatToCheck: ja ? [
        'GTSでO2センサーライブデータをモニタリングする',
        'アップストリーム（B1S1）：高速スイッチングが確認できれば正常',
        'ダウンストリーム（B1S2）：緩やか/フラット → センサー正常 / 活発なスイッチング → 触媒劣化',
        '燃料トリム（短期・長期）が±10%以内かを確認する',
      ] : [
        'Monitor O2 sensor live data with GTS diagnostic tool',
        'Upstream (B1S1): should show fast switching — confirms normal behavior',
        'Downstream (B1S2): slow/flat waveform → sensor normal; active switching → catalyst degraded',
        'Confirm short-term and long-term fuel trim within ±10%',
      ],
      relevantManual: [
        {
          title: ja ? 'Service Manual §EC-4: O2センサー波形分析' : 'Service Manual §EC-4: O2 Sensor Waveform Analysis',
          section: 'EC-4',
          source: 'Service Manual — Corolla Cross 2022',
          overview: ja
            ? 'GTSを使用したO2センサーライブ波形の読み取り方法。アップストリーム（B1S1）とダウンストリーム（B1S2）の波形パターンを比較することで、センサー劣化と触媒劣化を判別する。'
            : 'How to read O2 sensor live waveforms using GTS. Comparing upstream (B1S1) and downstream (B1S2) patterns distinguishes sensor degradation from catalyst failure.',
          keyPoints: ja ? [
            'アップストリーム（B1S1）: 高速スイッチング（≥0.5 Hz、0.1〜0.9 V）が正常',
            'ダウンストリーム（B1S2）: 緩やか・平坦（0.45〜0.70 V）= 触媒・センサーとも正常',
            'ダウンストリーム（B1S2）: B1S1と同様の高速スイッチング = 触媒劣化またはセンサー故障',
            '燃料トリム（短期・長期）が±10%を超える場合、波形評価の前に燃料系を先に診断する',
            'エンジン暖機後（冷却水温75°C以上・クローズドループ確認）のデータのみ有効',
          ] : [
            'Upstream (B1S1): fast switching ≥0.5 Hz, 0.1–0.9 V = normal operation',
            'Downstream (B1S2): slow / flat waveform at 0.45–0.70 V = catalyst and sensor both normal',
            'Downstream (B1S2): rapid switching similar to B1S1 = catalyst degraded or sensor fault',
            'If fuel trim (short or long-term) exceeds ±10%, diagnose fuel system before interpreting O2 data',
            'Only evaluate waveforms after engine warm-up: coolant ≥75°C, closed-loop confirmed',
          ],
          spec: [
            { label: ja ? 'B1S1 スイッチング周波数' : 'B1S1 Switching Freq', value: '≥ 0.5 Hz' },
            { label: ja ? 'B1S1 電圧範囲' : 'B1S1 Voltage Range', value: '0.1 – 0.9 V' },
            { label: ja ? 'B1S2 電圧（正常）' : 'B1S2 Voltage (Normal)', value: '0.45 – 0.70 V (steady)' },
            { label: ja ? '燃料トリム許容範囲' : 'Fuel Trim Tolerance', value: '±10%' },
          ],
          warning: ja
            ? 'クローズドループ移行前（冷間始動時・暖機中）のデータは無効。必ず暖機完了後に評価すること。'
            : 'Data collected before closed-loop (cold start / warm-up) is invalid. Always evaluate after full warm-up.',
        },
      ],
      similarCases: [
        {
          id: 'sc-3-1',
          type: 'tie',
          displayId: 'TIE #2021-0315',
          meta: ja ? '同一DTC / GTS診断手順' : 'Same DTC / GTS diagnostic procedure',
          resolution: ja ? '解決方法: GTS波形診断で原因特定' : 'Resolved by: GTS waveform diagnosis',
          symptoms: ja
            ? 'P0420。燃料トリム正常。O2センサー（B1S2）の波形が断続的・不規則。'
            : 'P0420. Fuel trim normal. O2 sensor (B1S2) waveform intermittent and irregular.',
          cause: ja
            ? 'ダウンストリームO2センサー劣化。触媒は正常範囲内。GTS波形分析で判別可能。'
            : 'Downstream O2 sensor degraded. Catalyst within spec. Distinguishable via GTS waveform analysis.',
          action: ja
            ? 'O2センサー（B1S2）のみを交換。触媒交換は不要と判断。'
            : 'Replaced O2 sensor (B1S2) only. Catalyst replacement was determined to be unnecessary.',
          result: ja
            ? 'P0420解決。触媒交換を回避してコスト削減。'
            : 'P0420 resolved. Catalyst replacement avoided, reducing repair cost.',
          whyRecommended: ja
            ? '同一DTC（P0420）＋GTS必須の診断フロー一致'
            : 'Same DTC (P0420) + matching GTS-required diagnostic procedure',
        },
      ],
      precautions: ja ? [
        'エンジン暖機後（冷却水温75°C以上・クローズドループ確認）にセンサーデータを取得すること',
        '燃料トリムや失火DTCが存在する場合は先に解消してからO2波形を評価する',
      ] : [
        'Collect sensor data after engine warm-up (coolant temp ≥75°C, closed-loop confirmed)',
        'Resolve any fuel trim or misfire DTCs before interpreting O2 sensor waveforms',
      ],
    },
    {
      id: 'flow-4',
      title: ja ? '関連部品を点検する' : 'Inspect related component',
      whatToCheck: ja ? [
        'O2センサー（B1S2）のセンサーチップ汚染を確認（オイル・クーラント・カーボン付着）',
        '触媒担体（ハニカム）の損傷・融着・詰まりを確認',
        'センサーカプラーのピン状態・ハーネス断線・被覆損傷を確認',
      ] : [
        'Inspect O2 sensor (B1S2) tip for contamination: oil, coolant, or carbon deposits',
        'Inspect catalyst substrate (honeycomb) for physical damage, melting, or blockage',
        'Check sensor connector pin condition and harness for breaks or insulation damage',
      ],
      relevantManual: [
        {
          title: ja ? 'Service Manual §EM-47: センサー点検基準' : 'Service Manual §EM-47: Sensor Inspection Criteria',
          section: 'EM-47',
          source: 'Service Manual — Corolla Cross 2022',
          overview: ja
            ? 'O2センサーの外観・電気的特性の点検基準。センサーチップの状態から汚染の原因を推定し、交換判断を行うための基準を定義する。'
            : 'Inspection criteria for O2 sensor physical condition and electrical characteristics. Defines thresholds for determining contamination source and replacement decisions.',
          keyPoints: ja ? [
            'センサーチップの色: 白/グレー=正常、黒(カーボン)=過リッチ疑い、油膜付着=エンジン油漏れ疑い',
            '抵抗測定（冷間）: 10〜100 Ω が正常範囲（ヒーター付きタイプ）',
            'コネクター点検: 緑色腐食（水分浸入）・ピン変形・ロック不良を確認',
            'ハーネス経路: ヒートシールド近傍の擦れ・被覆損傷・固定クリップの脱落を確認',
            '触媒担体: ハニカム目視確認（損傷・溶損・詰まり）',
          ] : [
            'Sensor tip color: white/gray = normal; black carbon = rich condition suspected; oily = engine oil leak suspected',
            'Resistance (cold): 10–100 Ω is normal range (for heated sensor type)',
            'Connector: check for green corrosion (moisture ingress), bent pins, and loose lock',
            'Harness routing: inspect for chafing near heat shield, insulation damage, missing retaining clips',
            'Catalyst substrate: visual check of honeycomb for physical damage, melting, or blockage',
          ],
          spec: [
            { label: ja ? 'ヒーター抵抗（冷間）' : 'Heater Resistance (Cold)', value: '10 – 100 Ω' },
            { label: ja ? '信号電圧範囲' : 'Signal Voltage Range', value: '0 – 1.0 V' },
            { label: ja ? '応答時間（暖機後）' : 'Response Time (Warm)' , value: '< 300 ms' },
          ],
          warning: ja
            ? 'センサーチップには絶対に触れないこと。皮脂汚染により測定値が誤判定される。点検は視覚のみで行うこと。'
            : 'Never touch the sensor tip. Skin oil contamination causes false readings. Inspection must be visual only.',
        },
      ],
      similarCases: [
        {
          id: 'sc-4-1',
          type: 'qa',
          displayId: 'Q&A #4521',
          meta: ja ? '同一車種 / 同一症状' : 'Same model / Same symptom',
          resolution: ja ? '解決方法: センサー先交換で触媒交換を回避' : 'Resolved by: Sensor-first avoids catalyst replacement',
          hasBestAnswer: true,
          symptoms: ja
            ? '触媒交換後P0420再発。O2センサーの状態確認を漏らしていた。'
            : 'P0420 returned after catalyst replacement. O2 sensor condition check was missed.',
          cause: ja
            ? 'O2センサー（B1S2）の汚染・劣化が根本原因。触媒だけを交換しても再発する。'
            : 'O2 sensor (B1S2) contamination/degradation is the root cause. Catalyst replacement alone causes recurrence.',
          action: ja
            ? '触媒交換前にO2センサーを点検・交換する。センサーチップの汚染確認が重要。'
            : 'Inspect and replace O2 sensor before condemning the catalyst. Sensor tip contamination check is essential.',
          result: ja
            ? 'P0420再発なし。修理コスト削減。センサー優先確認の手順が8名のテクニシャンに支持。'
            : 'No P0420 recurrence. Repair cost reduced. Sensor-first procedure endorsed by 8 technicians.',
          whyRecommended: ja
            ? '同一車種（Corolla Cross）＋類似症状＋O2センサー点検漏れ防止のベストアンサー'
            : 'Same model (Corolla Cross) + similar symptom + Best Answer preventing missed sensor check',
        },
      ],
      precautions: ja ? [
        '触媒を廃棄する前に必ずO2センサーの状態を確認すること（参照: TIE #2022-0188）',
        'センサーチップへの接触・衝撃厳禁（汚染状態の誤判定につながる）',
      ] : [
        'Always confirm O2 sensor condition before condemning the catalyst (ref. TIE #2022-0188)',
        'Do not touch or impact the sensor tip — it can cause misdiagnosis of contamination',
      ],
    },
    {
      id: 'flow-5',
      title: ja ? '診断を確定する' : 'Confirm diagnosis',
      whatToCheck: ja ? [
        '全点検結果をまとめ、最も可能性の高い原因を特定する',
        'O2センサー交換で解決可能か、触媒本体の交換が必要かを判断する',
        '修理計画（必要部品・工数・費用）を確定して作業計画へ移行する',
      ] : [
        'Summarize all inspection results and identify the most probable root cause',
        'Determine if O2 sensor replacement resolves the issue or if catalyst replacement is needed',
        'Confirm repair plan (parts, labor, cost) and proceed to Work Planning',
      ],
      relevantManual: [],
      similarCases: [
        {
          id: 'sc-5-1',
          type: 'tie',
          displayId: 'TIE #2022-0188',
          meta: ja ? '同一車種 / 同一DTC / 解決方針確認' : 'Same model / Same DTC / Solution confirmed',
          resolution: ja ? '解決方法: センサー交換で94%解決' : 'Resolved by: Sensor replacement (94% of cases)',
          symptoms: ja
            ? 'P0420。O2センサー（B1S2）波形劣化。燃料トリム正常範囲内。'
            : 'P0420. O2 sensor (B1S2) waveform degraded. Fuel trim within normal range.',
          cause: ja
            ? 'O2センサー（B1S2）劣化が真の原因。触媒は正常範囲内。ECMが誤ってP0420を検出。'
            : 'O2 sensor (B1S2) degradation is the root cause. Catalyst within spec. ECM incorrectly detects P0420.',
          action: ja
            ? 'O2センサー（B1S2）交換。DTC消去。ドライブサイクル実施。I/Mレディネス完了確認。'
            : 'Replace O2 sensor (B1S2). Clear DTC. Perform drive cycle. Confirm I/M readiness complete.',
          result: ja
            ? '94%のケースで解決。触媒交換は最終手段。コスト・納期の最適化が可能。'
            : 'Resolved in 94% of cases. Catalyst replacement is a last resort. Optimizes cost and turnaround time.',
          whyRecommended: ja
            ? '同一車種＋同一DTC＋最終確認のチェックポイント一致'
            : 'Same model + same DTC + matching final confirmation checkpoints',
        },
      ],
      precautions: ja ? [
        'O2センサーを先に交換し、効果がなければ触媒交換を検討する（コスト最小化）',
        '顧客への修理内容説明は引渡し工程で実施する',
      ] : [
        'Replace O2 sensor first; consider catalyst replacement only if DTC persists afterward',
        'Customer explanation of repair is handled in the Handover step — proceed to Work Planning',
      ],
    },
  ];
}

// Maps which customer questions contributed to a specific cause shift
export function getAnswerInsights(answers: Record<string, number>, lang: Language): string[] {
  const insights: string[] = [];
  const ja = lang === 'ja';

  const lightBehavior = answers['cq-2'];
  if (lightBehavior === 0) insights.push(ja ? '警告灯が継続点灯中 → 触媒劣化の可能性を高く評価' : 'Light on continuously → catalyst degradation more likely');
  if (lightBehavior === 1 || lightBehavior === 2) insights.push(ja ? '警告灯が断続的または一時的 → O2センサー誤検知の可能性を高く評価' : 'Intermittent light → O2 sensor malfunction more likely');

  const driving = answers['cq-3'];
  if (driving === 0) insights.push(ja ? '高速走行中に点灯 → 触媒の熱劣化に関連する可能性' : 'Occurred during highway driving → thermal catalyst degradation possible');
  if (driving === 1) insights.push(ja ? '市街地走行中に点灯 → 頻繁なリッチ/リーン切替によるO2センサー誤作動の可能性' : 'City driving → rich/lean cycling may be causing O2 sensor misread');
  if (driving === 2) insights.push(ja ? 'アイドリング中に点灯 → 排気漏れの可能性を考慮' : 'Occurred while idling → exhaust leak worth inspecting');

  const symptoms = answers['cq-4'];
  if (symptoms === 0) insights.push(ja ? '異音・異臭あり → 排気漏れの可能性が高い' : 'Unusual sounds/smells → exhaust leak probability elevated significantly');
  if (symptoms === 1) insights.push(ja ? '異音・異臭なし → 排気漏れの可能性は低い' : 'No unusual symptoms → exhaust leak less likely');

  const fuelEcon = answers['cq-5'];
  if (fuelEcon === 0) insights.push(ja ? '燃費悪化あり → 触媒効率低下に関連' : 'Fuel economy worsened → consistent with catalyst efficiency drop');
  if (fuelEcon === 1) insights.push(ja ? '燃費変化なし → O2センサー単独故障の可能性' : 'No fuel economy change → isolated O2 sensor malfunction possible');

  const elsewhere = answers['cq-8'];
  if (elsewhere === 0) insights.push(ja ? '他店での整備履歴あり → 不適切な修理による排気漏れを除外が必要' : 'Recent third-party service → rule out exhaust leak from repair');

  return insights;
}

// ─── Per-Job Work Context ─────────────────────────────────────────────────────

export interface WorkCautionItem {
  id: string;
  steps: string[];
  text: string;
  source: string;
  caseCount: number;
}

export interface JobWorkContext {
  dtc: string;
  dtcTitle: string;
  plan: import('@/types').WorkPlan;
  cautionItems: WorkCautionItem[];
}

/**
 * Returns the full work-planning context for a given job.
 * - job-004 (Land Cruiser 300): all parts in stock, wheel-balance plan
 * - all others fall back to the Corolla Cross / DEMO_JOB plan
 */
export function getJobWorkContext(jobId: string, lang: Language): JobWorkContext {
  const ja = lang === 'ja';

  /* ── Land Cruiser 300 (job-004) — all parts in stock ─────────────────── */
  if (jobId === 'job-004') {
    return {
      dtc: 'C1241',
      dtcTitle: ja
        ? '電源電圧低下（VDIM / ABS）'
        : 'Low Battery Positive Voltage (VDIM / ABS)',
      plan: {
        repairDescription: ja
          ? '全4輪ホイールバランス調整 + バッテリー電圧確認'
          : 'Wheel Balance (All 4 Wheels) + Battery Voltage Check',
        confirmedCause: ja
          ? '高速走行時のハンドル振動の主因は全4輪のホイールバランス不良による共振。DTC C1241（電圧低下）はバッテリー劣化を示す可能性があり、別途確認が必要。'
          : 'Primary cause of highway steering vibration is wheel imbalance on all 4 wheels causing resonance. DTC C1241 (voltage low) may indicate battery degradation — requires separate check.',
        estimatedTime: 90,
        requiredParts: [
          {
            partNumber: 'WW-STD-60G',
            name: ja ? 'ホイールバランスウェイトセット（60g × 4輪分）' : 'Wheel Balancing Weight Set (60g × 4 wheels)',
            quantity: 4,
            unitPrice: 1200,
            available: true,
          },
          {
            partNumber: '28800-31600',
            name: ja ? 'バッテリー 12V 80Ah（C1241 電圧確認・交換用）' : 'Battery 12V 80Ah (for C1241 voltage check / replacement)',
            quantity: 1,
            unitPrice: 24800,
            available: true,
          },
        ],
        requiredTools: [
          { toolNumber: 'WB-001', name: ja ? 'コンピューターホイールバランサー' : 'Computer Wheel Balancer', type: 'standard' },
          { toolNumber: 'TW-200', name: ja ? 'トルクレンチ（0–200 N·m）' : 'Torque Wrench (0–200 N·m)', type: 'standard' },
          { toolNumber: '09816-00010', name: ja ? 'TPMSセンサーリセットツール' : 'TPMS Sensor Reset Tool', type: 'sst' },
        ],
        procedure: [
          {
            id: 'lc-step-001',
            stepNumber: 1,
            title: ja ? '車両準備・ホイール取り外し' : 'Vehicle Preparation & Wheel Removal',
            description: ja
              ? '車両をリフトアップし、全4輪を取り外す。ホイール位置（FL/FR/RL/RR）を記録。外傷・変形・タイヤ摩耗状態を目視確認。'
              : 'Hoist vehicle. Remove all 4 wheels. Mark positions (FL/FR/RL/RR). Visually inspect for damage, deformation, and tire wear.',
            warnings: ja
              ? ['リフト定格荷重を超えないこと', 'TPMSセンサーのバルブ位置を記録してから取り外すこと']
              : ['Do not exceed hoist rated capacity', 'Note TPMS sensor valve position before removal'],
            specifications: ja
              ? ['ラグナット締付トルク: 120 N·m', 'TPMSバルブナット最大トルク: 4 N·m']
              : ['Lug nut torque: 120 N·m', 'TPMS valve nut max: 4 N·m'],
          },
          {
            id: 'lc-step-002',
            stepNumber: 2,
            title: ja ? '動的バランス調整（全4輪）' : 'Dynamic Balance — All 4 Wheels',
            description: ja
              ? '各ホイールをバランサーにセットし動的バランスを測定する。指示量の接着式ウェイトを貼付。目標：各プレーン5g未満のアンバランス。'
              : 'Mount each wheel on balancer. Run dynamic balance. Apply adhesive weights as indicated. Target: < 5g imbalance per plane.',
            specifications: ja
              ? ['バランス許容値: 各プレーン5g未満', 'アルミホイール: 接着前にリム内面を脱脂・清拭すること', 'OEM品質の接着式ウェイトを使用']
              : ['Balance tolerance: < 5g per plane', 'Aluminium wheels: degrease rim surface before applying adhesive weights', 'Use OEM-grade adhesive weights'],
          },
          {
            id: 'lc-step-003',
            stepNumber: 3,
            title: ja ? 'ホイール再取付・ラグナットトルク締め' : 'Reinstall Wheels & Torque Lug Nuts',
            description: ja
              ? 'ホイールを元の位置に取り付け。手締めで数回転入れた後、星形パターンで120 N·mまでトルク締め。車両を降ろす。'
              : 'Reinstall wheels in original positions. Hand-thread, then torque to 120 N·m in star pattern. Lower vehicle.',
            torqueValues: [
              { location: ja ? 'ラグナット' : 'Lug Nuts', value: '120', unit: 'N·m', source: 'Service Manual — Land Cruiser 300 2022 §WI-3' },
            ],
          },
          {
            id: 'lc-step-004',
            stepNumber: 4,
            title: ja ? 'TPMSリセット・バッテリー電圧確認' : 'TPMS Reset & Battery Voltage Check',
            description: ja
              ? 'SST（09816-00010）でTPMSをリセット。エンジン停止30分後のバッテリー電圧を確認（12.4–12.6V正常）。電圧正常であればC1241をGTSで消去する。'
              : 'Reset TPMS with SST (09816-00010). Measure battery voltage after 30-min engine-off rest (normal: 12.4–12.6V). If voltage normal, clear C1241 with GTS.',
            specifications: ja
              ? ['バッテリー電圧（エンジン停止30分後）: 12.4–12.6V', 'C1241消去条件: 電圧 > 12.0V', 'TPMS初期化: 全輪15分以上走行後に自動学習完了']
              : ['Battery voltage (30-min engine-off): 12.4–12.6V', 'C1241 clear condition: voltage > 12.0V', 'TPMS: auto-learns after 15+ min driving all wheels'],
          },
          {
            id: 'lc-step-005',
            stepNumber: 5,
            title: ja ? '路上テスト・振動確認' : 'Road Test — Verify Vibration Resolved',
            description: ja
              ? '高速走行テスト（100–120 km/h で5分以上）。ハンドル振動が解消されていることを確認。GTSで全DTC再確認。'
              : 'Test drive at 100–120 km/h for minimum 5 minutes. Confirm steering vibration is resolved. Re-check all DTCs with GTS.',
            specifications: ja
              ? ['テスト速度: 100–120 km/h、5分以上', 'GTS確認: アクティブDTCなし', '振動再現なし確認']
              : ['Test speed: 100–120 km/h, min 5 min', 'GTS: no active DTCs', 'Confirm no vibration recurrence'],
          },
        ],
        torqueValues: [
          { location: ja ? 'ラグナット' : 'Lug Nuts', value: '120', unit: 'N·m', source: 'Service Manual — Land Cruiser 300 2022 §WI-3' },
        ],
        precautions: ja ? [
          'ホイール取り外し時はTPMSセンサーのバルブステムを傷つけないよう注意すること',
          'アルミリムに接着式ウェイトを貼付する前に、リム内面を必ず脱脂・清拭すること',
          'ラグナットは星形パターンで120 N·mに締め付けること（一方向締めは禁止）',
          'C1241確認: エンジン停止30分後のバッテリー電圧が12.4V未満の場合はバッテリー交換を推奨',
        ] : [
          'Handle TPMS sensors carefully — do not damage valve stems during wheel removal',
          'Degrease aluminium rim surface before applying adhesive balance weights',
          'Torque lug nuts to 120 N·m in star pattern — never tighten in sequence around the wheel',
          'C1241: if battery voltage < 12.4V after 30-min rest, recommend battery replacement',
        ],
        similarCases: ja ? [
          'TIE-2023-0044: Land Cruiser 300 高速振動 — ホイールバランス不良が主因（44,000 km）',
          'Q&A #8821: C1241 繰り返し点灯 — バッテリー交換で解決（45,000 km、5年目）',
        ] : [
          'TIE-2023-0044: Land Cruiser 300 highway vibration — wheel imbalance root cause at 44,000 km',
          'Q&A #8821: C1241 recurring — resolved by battery replacement (45,000 km, year 5)',
        ],
      },
      cautionItems: [
        {
          id: 'lc-wo-1',
          steps: ['lc-step-001', 'lc-step-003'],
          text: ja
            ? 'TPMSセンサーのバルブステムに工具が当たると損傷する事例があります。ホイール着脱時はバルブ位置を確認してから作業してください'
            : 'TPMS valve stems are easily damaged if tools contact them. Always confirm valve position before mounting/dismounting wheels',
          source: 'TIE #2023-0044',
          caseCount: 3,
        },
        {
          id: 'lc-wo-2',
          steps: ['lc-step-002'],
          text: ja
            ? 'アルミリム表面の油脂が残った状態でウェイトを貼付すると、走行中に剥離する事例があります。接着前に脱脂スプレーで清拭してください'
            : 'Balance weights applied to oily aluminium rims detach during driving. Always degrease rim surface before applying adhesive weights',
          source: 'Q&A #8821',
          caseCount: 2,
        },
        {
          id: 'lc-wo-3',
          steps: ['lc-step-003'],
          text: ja
            ? 'ラグナットの締め付け順序が一方向になると偏芯が発生します。必ず星形パターンで対角線上に均等締めしてください'
            : 'Sequential tightening of lug nuts causes wheel eccentricity. Always use star pattern — tighten diagonally opposite nuts in sequence',
          source: 'Service Manual §WI-3',
          caseCount: 1,
        },
        {
          id: 'lc-wo-4',
          steps: ['lc-step-004', 'lc-step-005'],
          text: ja
            ? 'C1241がバランス調整後も再点灯する場合、バッテリー劣化が根本原因の可能性があります。路上テスト後にGTSで再確認してください'
            : 'If C1241 reappears after balancing, battery degradation may be the root cause. Re-check with GTS after road test before completing the job',
          source: 'TIE #2023-0044',
          caseCount: 2,
        },
      ],
    };
  }

  /* ── Default: Corolla Cross / DEMO_JOB ───────────────────────────────── */
  const job = getLocalizedJob(lang);
  const plan = job.workPlan!;
  return {
    dtc: 'P0420',
    dtcTitle: ja
      ? '触媒システム効率低下 — Bank 1'
      : 'Catalyst System Efficiency Below Threshold — Bank 1',
    plan,
    cautionItems: [
      {
        id: 'wo-1',
        steps: ['step-001', 'step-002'],
        text: ja
          ? '類似修理事例でコネクターの腐食・損傷が報告されています。センサー位置確認時に必ず点検してください'
          : 'Connector corrosion/damage reported in similar repairs — inspect carefully when locating the sensor',
        source: 'TIE #2022-0188, TIE #2021-0315',
        caseCount: 2,
      },
      {
        id: 'wo-2',
        steps: ['step-003'],
        text: ja
          ? 'センサー取外し前に浸透油を塗布し、最低5分浸透させること。乾燥した状態での取外しはネジ山損傷の原因になります'
          : 'Apply penetrating oil and soak minimum 5 minutes before removal — thread damage is common without this step',
        source: 'TIE #2021-0315',
        caseCount: 3,
      },
      {
        id: 'wo-3',
        steps: ['step-004'],
        text: ja
          ? '焼付防止剤はセンサーチップ側の最初の2山には絶対に塗布しないこと。塗布するとセンサー汚染・誤作動の原因になります'
          : 'Do NOT apply anti-seize compound to first 2 threads near sensor tip — causes sensor contamination and incorrect readings',
        source: 'Service Manual §EM-47',
        caseCount: 2,
      },
      {
        id: 'wo-4',
        steps: ['step-004', 'step-005'],
        text: ja
          ? 'ハーネスのルーティングを必ず確認すること。排気管への接触がセンサーの二次故障につながる事例があります'
          : 'Verify harness routing after installation — contact with exhaust pipe is a secondary cause of sensor failure in similar cases',
        source: 'Q&A #4521',
        caseCount: 1,
      },
      {
        id: 'wo-5',
        steps: ['step-005'],
        text: ja
          ? 'ドライブサイクル後にI/Mレディネスが「完了」になることを必ず確認すること。未完了の場合はP0420が再点灯する可能性があります'
          : 'Confirm I/M readiness shows "complete" after drive cycle — incomplete readiness can cause P0420 to reappear',
        source: 'TIE #2022-0188',
        caseCount: 2,
      },
    ],
  };
}

// ─── Check & Verify: Repair-specific verification data ───────────────────────

export interface VerifyCheckItem {
  id: string;
  category: string;
  description: string;
  descriptionJa: string;
  required: boolean;
  status: 'pending' | 'passed' | 'failed' | 'na';
  failNote?: string;
  failNoteJa?: string;
}

export interface MissedCheckHint {
  id: string;
  text: string;
  textJa: string;
  source: string;
  isHighlighted?: boolean;
}

export interface RepairSummary {
  performed: string;
  performedJa: string;
  dtc: string;
  status: string;
  statusJa: string;
  partsReplaced: string[];
  partsReplacedJa: string[];
}

export function getVerifyCheckItems(lang: Language): VerifyCheckItem[] {
  const ja = lang === 'ja';
  return [
    // ── Post-Repair Checklist ──────────────────────────────────────
    {
      id: 'vc-01',
      category: ja ? 'Post-Repair チェックリスト' : 'Post-Repair Checklist',
      description: 'Connector securely locked and seated',
      descriptionJa: 'コネクタが確実にロックされ正しく装着されている',
      required: true,
      status: 'pending',
    },
    {
      id: 'vc-02',
      category: ja ? 'Post-Repair チェックリスト' : 'Post-Repair Checklist',
      description: 'Required torque confirmed (40 N·m)',
      descriptionJa: '規定トルク確認済み（40 N·m）',
      required: true,
      status: 'pending',
    },
    {
      id: 'vc-03',
      category: ja ? 'Post-Repair チェックリスト' : 'Post-Repair Checklist',
      description: 'Related wiring checked — no contact with exhaust',
      descriptionJa: '関連配線を確認 — 排気管への接触なし',
      required: true,
      status: 'pending',
    },
    {
      id: 'vc-04',
      category: ja ? 'Post-Repair チェックリスト' : 'Post-Repair Checklist',
      description: 'No warning light on dashboard',
      descriptionJa: 'ダッシュボードに警告灯なし',
      required: true,
      status: 'pending',
    },
    // ── Functional Check ──────────────────────────────────────────
    {
      id: 'vc-05',
      category: ja ? '機能確認' : 'Functional Check',
      description: 'Start engine — confirm normal idle',
      descriptionJa: 'エンジン始動 — 正常なアイドリングを確認',
      required: true,
      status: 'pending',
    },
    {
      id: 'vc-06',
      category: ja ? '機能確認' : 'Functional Check',
      description: 'Confirm O2 sensor response with live data',
      descriptionJa: 'ライブデータでO2センサーの応答を確認',
      required: true,
      status: 'pending',
    },
    {
      id: 'vc-07',
      category: ja ? '機能確認' : 'Functional Check',
      description: 'DTC cleared — confirm no new DTC stored',
      descriptionJa: 'DTC消去 — 新たなDTCが記録されていないことを確認',
      required: true,
      status: 'pending',
      failNote: 'P0420 detected again after clearing.',
      failNoteJa: 'DTC消去後にP0420が再検出されました。',
    },
    // ── Road Test ──────────────────────────────────────────────────
    {
      id: 'vc-08',
      category: ja ? 'ロードテスト' : 'Road Test',
      description: 'Perform required road test (min. 15 min highway speed)',
      descriptionJa: '規定のロードテストを実施（高速15分以上）',
      required: true,
      status: 'pending',
    },
    {
      id: 'vc-09',
      category: ja ? 'ロードテスト' : 'Road Test',
      description: 'Confirm no abnormal behavior during test',
      descriptionJa: 'テスト中に異常な動作がないことを確認',
      required: true,
      status: 'pending',
    },
    {
      id: 'vc-10',
      category: ja ? 'ロードテスト' : 'Road Test',
      description: 'Recheck DTC after road test — confirm I/M readiness complete',
      descriptionJa: 'ロードテスト後にDTCを再確認 — I/Mレディネス完了を確認',
      required: true,
      status: 'pending',
      failNote: 'I/M readiness not complete after road test.',
      failNoteJa: 'ロードテスト後もI/Mレディネスが完了していません。',
    },
  ];
}

export function getMissedCheckHints(lang: Language): MissedCheckHint[] {
  return [
    {
      id: 'mch-01',
      text: 'Similar repairs often missed connector recheck after road test — vibration can unseat the lock.',
      textJa: '類似修理では、ロードテスト後のコネクタ再確認が漏れやすい傾向があります — 振動によりロックが外れる場合があります。',
      source: 'TIE T-SER-2024-089',
      isHighlighted: true,
    },
    {
      id: 'mch-02',
      text: 'Related wiring should also be checked before completion — harness contact with exhaust is a secondary failure mode.',
      textJa: '完了前に関連配線も確認してください — ハーネスの排気管接触が二次故障の原因になります。',
      source: 'Q&A-0341',
    },
    {
      id: 'mch-03',
      text: 'I/M readiness monitor must show "complete" before closing the job — incomplete readiness causes P0420 re-occurrence.',
      textJa: 'ジョブクローズ前にI/Mレディネスモニターが「完了」になっていることを確認してください — 未完了の場合P0420が再発します。',
      source: 'TIE T-SER-2022-0188',
    },
  ];
}

export function getRepairSummary(lang: Language): RepairSummary {
  return {
    performed: 'Oxygen sensor replaced (Bank 1 Sensor 2 — downstream)',
    performedJa: 'O2センサー交換（バンク1センサー2 — ダウンストリーム）',
    dtc: 'P0420',
    status: 'Repair steps completed',
    statusJa: '修理ステップ完了',
    partsReplaced: ['Oxygen Sensor Assy, Air Fuel Ratio (B1S2)', 'Copper Crush Washer / Gasket'],
    partsReplacedJa: ['空燃比センサーAssyバンク1センサー2（O2センサー）', '銅製クラッシュワッシャー / ガスケット'],
  };
}
