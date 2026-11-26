import type { Language } from '@/lib/translations';
import type { PossibleCause } from '@/types';
import {
  getDiagnosticFlowSteps,
  type DiagFlowStep,
  type SimilarCaseRef,
  type ManualRef,
} from '@/data/localizedData';

export type DiagnosisScenario = 'p0420' | 'rattle' | null;

export function normalizeDtc(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isP0420Dtc(raw: string): boolean {
  const n = normalizeDtc(raw);
  return n === 'P0420' || n === 'P420' || n.startsWith('P0420') || n.startsWith('P420');
}

export function isRattleSymptom(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  if (!t) return false;
  if (t.includes('ガタガタ') || t.includes('段差') || (t.includes('異音') && t.includes('前方'))) return true;
  const rattling = t.includes('rattling');
  const bump = t.includes('bump');
  const front = t.includes('front');
  const noDtc = t.includes('no dtc') || t.includes('no warning');
  return rattling && (bump || front || noDtc);
}

export function detectDiagnosisScenario(input: {
  dtc: string;
  symptom: string;
  findings?: string;
  result?: string;
}): DiagnosisScenario {
  if (isP0420Dtc(input.dtc)) return 'p0420';
  const blob = [input.symptom, input.findings ?? '', input.result ?? ''].join('\n');
  if (isRattleSymptom(blob) || isRattleSymptom(input.symptom)) return 'rattle';
  return null;
}

export function getScenarioCauses(scenario: DiagnosisScenario, lang: Language, p0420Fallback: PossibleCause[]): PossibleCause[] {
  if (scenario === 'p0420') return p0420Fallback;
  if (scenario === 'rattle') return getRattleCauses(lang);
  return [];
}

export function getScenarioFlow(scenario: DiagnosisScenario, lang: Language): DiagFlowStep[] {
  if (scenario === 'p0420') return getDiagnosticFlowSteps(lang);
  if (scenario === 'rattle') return getRattleFlowSteps(lang);
  return [];
}

function getRattleCauses(lang: Language): PossibleCause[] {
  const ja = lang === 'ja';
  return [
    {
      id: 'pc-r1',
      description: ja ? 'スタビライザーリンクまたはブッシュの摩耗' : 'Stabilizer link or bushing wear',
      probability: 'high',
      evidence: ja
        ? '段差通過時の前方ガタ音。警告灯なし・DTCなし。リンク／ブッシュ摩耗で再現しやすい。'
        : 'Front rattling over bumps, no warning light, no DTC. Worn stabilizer links/bushes commonly reproduce this.',
      relatedDTCs: [],
    },
    {
      id: 'pc-r2',
      description: ja ? 'ストラットマウントの劣化' : 'Strut mount deterioration',
      probability: 'medium',
      evidence: ja
        ? '前輪ストラット上部の劣化で、段差入力時に打音が出ることがある。'
        : 'Upper strut mount wear can knock on bump input without setting a DTC.',
      relatedDTCs: [],
    },
    {
      id: 'pc-r3',
      description: ja ? 'サスペンションブッシュの摩耗' : 'Suspension bushing wear',
      probability: 'medium',
      evidence: ja
        ? 'ロアアーム等のブッシュ摩耗で、段差時のみ異音になることがある。'
        : 'Control-arm / suspension bushings can rattle only over irregular surfaces.',
      relatedDTCs: [],
    },
    {
      id: 'pc-r4',
      description: ja ? 'サスペンション部品の緩み' : 'Loose suspension component',
      probability: 'medium',
      evidence: ja
        ? '取付ボルト・ナットの緩みはDTCを出さず、段差で間欠的に音が出る。'
        : 'Loose fasteners do not set DTCs and often sound intermittent over bumps.',
      relatedDTCs: [],
    },
    {
      id: 'pc-r5',
      description: ja ? 'アンダーカバー／シールド類の緩み' : 'Underbody / shield component looseness',
      probability: 'low',
      evidence: ja
        ? 'アンダーカバーや遮熱板のクリップ外れでも前方から異音に聞こえる。'
        : 'Loose undercovers or heat shields can sound like a front-end rattle.',
      relatedDTCs: [],
    },
  ];
}

function man(partial: ManualRef): ManualRef {
  return partial;
}

function sc(partial: SimilarCaseRef): SimilarCaseRef {
  return partial;
}

function getRattleFlowSteps(lang: Language): DiagFlowStep[] {
  const ja = lang === 'ja';
  const sm: ManualRef = man({
    title: ja ? 'Service Manual §SA-12: フロントサスペンション点検' : 'Service Manual §SA-12: Front Suspension Inspection',
    section: 'SA-12',
    source: ja ? 'Service Manual — Corolla Cross 2022' : 'Service Manual — Corolla Cross 2022',
    overview: ja
      ? '段差入力時の異音に対するフロントサスペンションの目視・手で揺すっての点検手順。'
      : 'Visual and hands-on inspection of the front suspension for bump-induced noise.',
    keyPoints: ja ? [
      'リフトアップ前に路上で発生条件を再現する',
      '左右を比較し、リンク・ブッシュ・マウントのガタを確認する',
      'アンダーカバー類のクリップも同時に見る',
    ] : [
      'Reproduce the condition on the road before hoisting',
      'Compare left vs right for play in links, bushes and mounts',
      'Check undercover clips at the same time',
    ],
  });

  const caseLink = sc({
    id: 'sc-r-1',
    type: 'tie',
    displayId: 'TIE #2023-1104',
    meta: ja ? '同一車種 / 段差時の前方異音 / DTCなし' : 'Same model / front bump rattle / no DTC',
    resolution: ja ? '解決方法: スタビライザーリンク交換' : 'Resolved by: stabilizer link replacement',
    symptoms: ja
      ? '段差を乗り越えると車両前方からガタガタ音。警告灯なし。DTCなし。'
      : 'Rattling from the front over bumps. No warning light. No DTC.',
    cause: ja
      ? 'スタビライザーリンクボールジョイントの摩耗による間欠的な打音。'
      : 'Worn stabilizer-link ball joint causing intermittent knock.',
    action: ja
      ? '左右スタビライザーリンクを交換。トルク規定値で締め付け。路上再現確認。'
      : 'Replaced both stabilizer links. Torqued to spec. Road-tested over similar bumps.',
    result: ja ? '異音は解消。再発なし。' : 'Noise gone. No recurrence.',
    whyRecommended: ja
      ? 'DTCなし・段差時前方異音という条件が一致'
      : 'Matches no-DTC front bump rattle conditions',
  });

  const caseBush = sc({
    id: 'sc-r-2',
    type: 'qa',
    displayId: 'Q&A #9044',
    meta: ja ? '類似症状 / ベストアンサーあり' : 'Similar symptom / Best Answer available',
    resolution: ja ? '解決方法: ロアアームブッシュ交換' : 'Resolved by: lower-arm bushing replacement',
    hasBestAnswer: true,
    symptoms: ja
      ? '低速の段差で前方からコツコツ音。MIL点灯なし。'
      : 'Low-speed bump clunk from the front. No MIL.',
    cause: ja ? 'フロントロアアームブッシュの亀裂。' : 'Cracked front lower-arm bushing.',
    action: ja ? 'ブッシュASSY交換後、アライメント実施。' : 'Replaced bushing assembly, then alignment.',
    result: ja ? '段差時の音が消えた。' : 'Bump noise eliminated.',
    whyRecommended: ja
      ? '警告灯なしの前方異音でサスペンション側を先に見る事例'
      : 'Shows why suspension is checked first when there is noise and no DTC',
  });

  return [
    {
      id: 'flow-r1',
      title: ja ? '症状を再現する' : 'Reproduce the symptom',
      whatToCheck: ja ? [
        '同様の路面・段差を走行し、音が出る条件を確認する',
        '速度、荷重（乗員）、ハンドル位置を変えて再現の有無を記録する',
        '警告灯・DTCが本当に出ないことをGTSで再確認する',
      ] : [
        'Drive over a similar road condition and confirm when the noise occurs.',
        'Note speed, load, and steering position when it happens.',
        'Re-check with GTS that no warning light or DTC is present.',
      ],
      relevantManual: [sm],
      similarCases: [caseLink],
      precautions: ja ? [
        '再現走行は安全な場所で行う。公共路で無理な段差走行をしない。',
      ] : [
        'Reproduce only where it is safe. Do not force the vehicle over hazards on public roads.',
      ],
    },
    {
      id: 'flow-r2',
      title: ja ? 'おおよその発生位置を特定する' : 'Identify the approximate location',
      whatToCheck: ja ? [
        '前左 / 前右 / 中央のどれに近いかを確認する',
        'ステアリング操作や制動で音が変わるかを確認する',
        '助手席・運転席で聞こえ方の差を記録する',
      ] : [
        'Confirm front left / front right / center.',
        'Check whether the noise changes with steering or braking.',
        'Compare how it sounds from driver vs passenger side.',
      ],
      relevantManual: [sm],
      similarCases: [caseLink],
      precautions: [],
    },
    {
      id: 'flow-r3',
      title: ja ? '目視点検を行う' : 'Perform visual inspection',
      whatToCheck: ja ? [
        'サスペンション部品、ブッシュ、取付部の損傷・緩みを見る',
        'スタビライザーリンクのブーツ破れ・ガタを左右比較する',
        'アンダーカバー・シールドのクリップ外れを確認する',
      ] : [
        'Check suspension components, bushings and mounting points for visible damage or looseness.',
        'Compare stabilizer links left vs right for torn boots or play.',
        'Inspect undercover / shield clips.',
      ],
      relevantManual: [sm],
      similarCases: [caseBush],
      precautions: ja ? [
        'リフト作業前に車両を安定させる。スプリングには不用意に手を入れない。',
      ] : [
        'Stabilize the vehicle before hoist work. Do not put hands into loaded springs.',
      ],
    },
    {
      id: 'flow-r4',
      title: ja ? '関連部品を点検する' : 'Check related components',
      whatToCheck: ja ? [
        '最も可能性の高い原因に関連する部品を重点点検する',
        'ストラットマウント、ブッシュ、取付トルクを確認する',
        '必要なら手で部品を動かしてガタの有無を確認する',
      ] : [
        'Inspect components related to the most likely causes.',
        'Check strut mounts, bushings, and fastener torque.',
        'Hand-feel for play where it is safe to do so.',
      ],
      relevantManual: [sm],
      similarCases: [caseLink, caseBush],
      precautions: [],
    },
    {
      id: 'flow-r5',
      title: ja ? '類似事例と照合する' : 'Compare findings with similar cases',
      whatToCheck: ja ? [
        '関連する TIE / Q&A / 過去修理事例を確認する',
        '同一車種・DTCなし・段差時前方異音の事例を優先する',
        '自分の所見と事例の原因が合うかを記録する',
      ] : [
        'Review relevant TIE / Q&A / past repair cases.',
        'Prefer same-model, no-DTC, front bump-rattle cases.',
        'Record whether your findings match the cited cause.',
      ],
      relevantManual: [],
      similarCases: [caseLink, caseBush],
      precautions: [],
    },
    {
      id: 'flow-r6',
      title: ja ? '最も可能性の高い原因を確定する' : 'Confirm the most likely cause',
      whatToCheck: ja ? [
        '整備士所見を記録する',
        '推定原因リストから根拠のある1件を選んで確定する',
        '確定後に Repair へ進む',
      ] : [
        'Record technician findings.',
        'Select the best-supported cause from the list and confirm it.',
        'Proceed to Repair after confirmation.',
      ],
      relevantManual: [],
      similarCases: [caseLink],
      precautions: ja ? [
        '点検前に原因を確定しない。フローの所見に基づいてカードを選ぶ。',
      ] : [
        'Do not confirm a cause before the checks. Pick the card from the findings.',
      ],
    },
  ];
}
