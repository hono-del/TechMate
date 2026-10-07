'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, Search, Sparkles, Loader2, ChevronRight, Lightbulb, SlidersHorizontal,
  FileText, ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getAllLocalizedKnowledge } from '@/data/localizedData';
import { InfoDrawer } from '@/components/knowledge/InfoDrawer';
import { InfoClassBadge } from '@/components/common/Badge';
import type { KnowledgeItem } from '@/types';
import type { TranslationKey } from '@/lib/translations';

type Mode = 'idle' | 'searching' | 'results';
type DocKind = 'om' | 'sm' | 'tie' | 'qa';

const MODELS = ['Corolla Cross', 'RAV4', 'Camry', 'Yaris Cross', 'Land Cruiser 300'] as const;
const YEARS = ['2021', '2022', '2023'] as const;
const DOC_KINDS: { id: DocKind; labelKey: TranslationKey }[] = [
  { id: 'om',  labelKey: 'aisearch.doc.om' },
  { id: 'sm',  labelKey: 'aisearch.doc.sm' },
  { id: 'tie', labelKey: 'aisearch.doc.tie' },
  { id: 'qa',  labelKey: 'aisearch.doc.qa' },
];

function getDocKind(item: KnowledgeItem): DocKind | 'other' {
  if (item.id.startsWith('extra-om') || /owner'?s manual|\bOM\b|取扱説明書/i.test(item.source + item.title)) return 'om';
  if (item.type === 'manual') return 'sm';
  if (item.type === 'tie') return 'tie';
  if (item.type === 'qa' || item.type === 'case') return 'qa';
  return 'other';
}

function itemModelNames(item: KnowledgeItem): string[] {
  return item.vehicleModels.map(m => m.replace(/\s+20\d{2}/g, '').trim());
}

function itemYears(item: KnowledgeItem): string[] {
  return item.vehicleModels.flatMap(m => m.match(/20\d{2}/g) ?? []);
}

function matchesFilters(
  item: KnowledgeItem,
  model: string,
  year: string,
  docTypes: DocKind[],
): boolean {
  if (model !== 'all') {
    const names = itemModelNames(item);
    if (!names.some(n => n.toLowerCase() === model.toLowerCase() || n.toLowerCase().includes(model.toLowerCase()))) {
      return false;
    }
  }
  if (year !== 'all') {
    const years = itemYears(item);
    if (years.length > 0 && !years.includes(year)) return false;
  }
  if (docTypes.length > 0) {
    const kind = getDocKind(item);
    if (!docTypes.includes(kind as DocKind)) return false;
  }
  return true;
}

function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/p420/g, 'p0420');
}

const LC_STORY_IDS = ['lc-sm-p0420', 'lc-tie-p0420', 'lc-qa-p0420'] as const;

function isLcP420Story(query: string, model: string, year: string, docTypes: DocKind[]): boolean {
  const blob = `${query} ${model} ${year} ${docTypes.join(' ')}`.toLowerCase();
  return /p0?420/.test(blob) && /land cruiser|ランクル/.test(blob) && blob.includes('2023');
}

function scoreItem(item: KnowledgeItem, query: string): number {
  const q = normalizeQuery(query);
  const terms = q.split(/\s+/).filter(t => t.length >= 2);
  if (terms.length === 0) return 1;
  const hay = [
    item.title, item.summary, item.source,
    item.dtcs?.join(' ') ?? '', item.content ?? '',
    item.vehicleModels.join(' '),
  ].join(' ').toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 3;
    if (item.title.toLowerCase().includes(term)) score += 4;
    if (item.dtcs?.some(d => d.toLowerCase().includes(term) || term === 'p0420' && d === 'P0420')) score += 6;
  }
  if (item.relevance === 'high') score += 1;
  if (/land cruiser/.test(q) && item.vehicleModels.some(m => /land cruiser/i.test(m))) score += 16;
  if (q.includes('2023') && itemYears(item).includes('2023')) score += 8;
  return score;
}

const PAGE_CITATIONS: Record<string, { section: string; page: string; highlightJa: string; highlightEn: string }> = {
  'k-001': {
    section: 'TIE-2022-0188 Rev.2',
    page: 'p.3',
    highlightJa: '約94%の確定事例で、根本原因は下流O2センサー（B1S2）の信号劣化でした。',
    highlightEn: 'In ~94% of confirmed cases, the root cause was degraded downstream O2 sensor (B1S2) signal quality.',
  },
  'k-002': {
    section: 'SM §EC-4',
    page: 'p.12',
    highlightJa: '検出条件：下流O2センサーのスイッチング周波数が上流に近づいた場合にP0420を記憶。',
    highlightEn: 'Detection: P0420 is stored when downstream O2 switching frequency approaches the upstream sensor.',
  },
  'k-003': {
    section: '問題交流 #4521',
    page: '回答 1',
    highlightJa: '触媒交換後のP0420再発は、ほぼ全ての場合で下流O2センサー交換の見落としが原因です。',
    highlightEn: 'P0420 returning after catalyst replacement is almost always a missed downstream O2 sensor.',
  },
  'k-004': {
    section: 'SM §EM-47',
    page: 'p.47',
    highlightJa: '締付トルク 40 N·m。最初の2山には焼付防止剤を塗布しないこと。SST 09224-00010を使用。',
    highlightEn: 'Tightening torque 40 N·m. Do not apply anti-seize to the first 2 threads. Use SST 09224-00010.',
  },
  'k-005': {
    section: 'SM §IN-HV',
    page: 'p.8',
    highlightJa: '排気作業前にREADY消灯を確認。電源OFF後5分待機。オレンジ色ケーブルに触れない。',
    highlightEn: 'Confirm READY is OFF before exhaust work. Wait 5 minutes after power-off. Do not touch orange cables.',
  },
  'k-006': {
    section: 'TIE / GTS Procedure',
    page: 'p.2',
    highlightJa: 'GTSで触媒効率とO2センサー波形を確認。正常波形と劣化波形を比較する。',
    highlightEn: 'Use GTS to confirm catalyst efficiency and O2 sensor waveform — compare normal vs degraded.',
  },
  'k-007': {
    section: 'Parts Catalog',
    page: 'p.64',
    highlightJa: 'A/Fセンサー Assy（B1S2）部品番号 89465-12760。',
    highlightEn: 'A/F Sensor Assy (B1S2) Part No. 89465-12760.',
  },
  'k-008': {
    section: 'FC-2026-0082',
    page: 'p.1',
    highlightJa: '同型・同DTC。センサー交換後、30日フォローで再発なし。',
    highlightEn: 'Same model and DTC. After sensor replacement, no recurrence at 30-day follow-up.',
  },
  'k-009': {
    section: 'SM §IN-12',
    page: 'p.18',
    highlightJa: '排出ガス関連DTC修理後は、DTC消去・I/Mレディネス・ロードテストが必須。',
    highlightEn: 'After emission-related DTC repairs: clear DTCs, complete I/M readiness, and road test.',
  },
  'extra-om-001': {
    section: 'OM §4-2',
    page: 'p.142',
    highlightJa: 'チェックエンジンランプ点灯時は安全な場所に停車し、販売店へ連絡してください。',
    highlightEn: 'If the check engine light stays on, stop in a safe place and contact a dealer.',
  },
  'extra-om-002': {
    section: 'OM §1-1',
    page: 'p.24',
    highlightJa: 'READYランプ消灯後も高電圧が残る場合があります。',
    highlightEn: 'High voltage may remain after the READY lamp turns off.',
  },
  'extra-corr': {
    section: 'T-SER-2024-089',
    page: 'p.5',
    highlightJa: 'ピン抵抗 >0.5Ω をコネクタ交換の基準とする。清掃後に絶縁グリスを塗布。',
    highlightEn: 'Pin resistance >0.5 Ω is the replacement threshold. Apply dielectric grease after cleaning.',
  },
  'extra-im': {
    section: '問題交流 #4810',
    page: '回答',
    highlightJa: '触媒モニターがCompleteになる前に納車するとP0420が再セットされます。',
    highlightEn: 'Returning the vehicle before the catalyst monitor shows Complete stores P0420 again.',
  },
  'lc-sm-p0420': {
    section: 'SM §EC-12',
    page: 'p.28',
    highlightJa: '触媒を断定する前に、B1S2／B2S2の波形応答を確認する。V8は両バンクを比較すること。',
    highlightEn: 'Before condemning the catalyst, confirm B1S2 / B2S2 waveform response. On V8, compare both banks.',
  },
  'lc-tie-p0420': {
    section: 'TIE-2023-214',
    page: 'p.4',
    highlightJa: '2023年式 Land Cruiser 300：右側下流O2ハーネスが遮熱板と接触し、P0420が誤判定される。',
    highlightEn: '2023 Land Cruiser 300: RH downstream O2 harness contacts the heat shield and can falsely store P0420.',
  },
  'lc-qa-p0420': {
    section: '問題交流 #5203',
    page: '回答 1',
    highlightJa: '触媒交換後150kmでP0420再発。遮熱板とのハーネス接触を直しただけで再発なし。',
    highlightEn: 'P0420 returned 150 km after catalyst replacement. Fixing heat-shield harness contact resolved it — no recurrence.',
  },
};

function citationFor(item: KnowledgeItem, lang: 'en' | 'ja') {
  const meta = PAGE_CITATIONS[item.id];
  if (meta) {
    return {
      section: meta.section,
      page: meta.page,
      highlight: lang === 'ja' ? meta.highlightJa : meta.highlightEn,
    };
  }
  const sectionMatch = `${item.source} ${item.title}`.match(/§[A-Z0-9-]+/i);
  return {
    section: sectionMatch?.[0] ?? item.source,
    page: 'p.1',
    highlight: item.summary,
  };
}

function pickSources(query: string, hits: KnowledgeItem[], catalog: KnowledgeItem[]): KnowledgeItem[] {
  const q = query.toLowerCase();
  const preferred: string[] = [];
  if (hits.some(h => LC_STORY_IDS.includes(h.id as typeof LC_STORY_IDS[number]))) {
    preferred.push(...LC_STORY_IDS);
  }
  if (q.includes('腐食') || q.includes('corrosion') || q.includes('connector')) preferred.push('extra-corr', 'k-001');
  if (q.includes('トルク') || q.includes('torque')) preferred.push('k-004', 'k-007');
  if (q.includes('i/m') || q.includes('readiness') || q.includes('レディネス')) preferred.push('extra-im', 'k-009');
  if ((q.includes('p0420') || q.includes('p420') || q.includes('診断') || q.includes('diagnosis')) && preferred.length === 0) {
    preferred.push('k-001', 'k-002');
  }

  const found: KnowledgeItem[] = [];
  for (const id of preferred) {
    const item = catalog.find(i => i.id === id) ?? hits.find(i => i.id === id);
    if (item && !found.some(f => f.id === item.id)) found.push(item);
  }
  for (const item of hits) {
    if (!found.some(f => f.id === item.id)) found.push(item);
  }
  return found.slice(0, 3);
}

function extraItems(lang: 'en' | 'ja'): KnowledgeItem[] {
  return [
    {
      id: 'extra-om-001',
      type: 'manual',
      informationClass: 'oem-official',
      title: lang === 'ja'
        ? 'OM: 警告灯の見方 — チェックエンジンランプ（Corolla Cross）'
        : 'OM: Understanding Warning Lights — Check Engine (Corolla Cross)',
      summary: lang === 'ja'
        ? 'チェックエンジンランプ点灯時は、直ちに安全な場所に停車し、販売店へ連絡してください。走行を続けると触媒やエンジンを損傷する場合があります。'
        : 'If the check engine light stays on, stop in a safe place and contact a dealer. Continued driving may damage the catalyst or engine.',
      source: lang === 'ja' ? '取扱説明書（OM）— Corolla Cross 2022 §4-2' : "Owner's Manual (OM) — Corolla Cross 2022 §4-2",
      relevance: 'medium',
      whyRecommended: lang === 'ja' ? '顧客説明・OM参照用' : 'For customer explanation and OM reference',
      vehicleModels: ['Corolla Cross 2021', 'Corolla Cross 2022'],
      workflowSteps: ['reception', 'handover'],
      approved: true,
    },
    {
      id: 'extra-om-002',
      type: 'manual',
      informationClass: 'oem-official',
      title: lang === 'ja'
        ? 'OM: ハイブリッドシステムのREADYランプ'
        : 'OM: Hybrid READY Indicator',
      summary: lang === 'ja'
        ? 'READYランプ消灯後も高電圧は残る場合があります。整備作業は販売店の手順に従ってください。'
        : 'High voltage may remain after the READY lamp turns off. Follow dealer procedures before service work.',
      source: lang === 'ja' ? '取扱説明書（OM）— Corolla Cross 2022 §1-1' : "Owner's Manual (OM) — Corolla Cross 2022 §1-1",
      relevance: 'medium',
      whyRecommended: lang === 'ja' ? 'HV安全の顧客向け説明' : 'Customer-facing HV safety explanation',
      vehicleModels: ['Corolla Cross 2022', 'RAV4 2023'],
      workflowSteps: ['reception', 'repair'],
      approved: true,
    },
    {
      id: 'extra-corr',
      type: 'tie',
      informationClass: 'oem-official',
      title: lang === 'ja'
        ? 'T-SER-2024-089: O2センサーハーネス コネクタ腐食 — 清掃・処置'
        : 'T-SER-2024-089: O2 Sensor Harness Connector Corrosion — Cleaning & Treatment',
      summary: lang === 'ja'
        ? '白・緑の粉状腐食は排気トンネル部の水分侵入が原因です。コネクタ交換の前にCRC QD電子クリーナーと絶縁グリスを使用。ピン抵抗 >0.5Ω を交換基準とします。'
        : 'White or green powdery corrosion is caused by moisture in the exhaust tunnel. Use CRC QD Electronic Cleaner and dielectric grease before replacing the connector. Pin resistance >0.5 Ω is the replacement threshold.',
      source: 'T-SER-2024-089 | Corolla, Camry, RAV4 | 2ZR / A25A',
      relevance: 'high',
      whyRecommended: lang === 'ja' ? 'コネクタ腐食の公式処置手順' : 'Official procedure for connector corrosion',
      vehicleModels: ['Corolla Cross 2022', 'Camry 2021', 'RAV4 2022'],
      dtcs: ['P0420'],
      workflowSteps: ['repair', 'diagnosis'],
      content: lang === 'ja'
        ? 'コネクタ腐食はO2センサー交換後のP0420再発の二次原因です。清掃・絶縁処理を先に実施し、ライブデータで再確認してください。'
        : 'Connector corrosion is a secondary cause of P0420 after sensor replacement. Clean and treat first, then recheck live data.',
      approved: true,
    },
    {
      id: 'extra-im',
      type: 'qa',
      informationClass: 'field-knowledge',
      title: lang === 'ja'
        ? '問題交流: I/Mレディネス未完了のまま納車するとP0420が再発する'
        : 'Field Exchange: Incomplete I/M readiness causes P0420 to return after handover',
      summary: lang === 'ja'
        ? 'DTC消去後にドライブサイクルを完了せず納車すると、触媒モニターが未完了のまま戻り、P0420が再セットされます。全モニターCompleteを確認してからジョブを閉じてください。'
        : 'If the vehicle is returned before the drive cycle completes, the catalyst monitor stays incomplete and P0420 is stored again. Confirm all monitors show Complete before closing the job.',
      source: lang === 'ja' ? '問題交流 #4810 — ベストアンサー（11名）' : 'Q&A #4810 — Best Answer selected by 11 technicians',
      relevance: 'high',
      whyRecommended: lang === 'ja' ? '検証漏れの典型事例' : 'Typical missed verification case',
      vehicleModels: ['Corolla Cross 2022'],
      dtcs: ['P0420'],
      workflowSteps: ['check-verify', 'handover'],
      approved: true,
    },
    {
      id: 'lc-sm-p0420',
      type: 'manual',
      informationClass: 'oem-official',
      title: lang === 'ja'
        ? 'SM §EC-12: P0420 — 触媒システム効率（Land Cruiser 300）'
        : 'SM §EC-12: P0420 — Catalyst System Efficiency (Land Cruiser 300)',
      summary: lang === 'ja'
        ? 'Land Cruiser 300（2023）のP0420公式診断。触媒を断定する前に、両バンク下流O2センサー（B1S2／B2S2）の波形応答を確認する。V8はバンク間比較が必須。'
        : 'Official P0420 diagnosis for Land Cruiser 300 (2023). Confirm downstream O2 waveform on both banks (B1S2 / B2S2) before condemning the catalyst. V8 requires bank-to-bank comparison.',
      source: lang === 'ja'
        ? 'サービスマニュアル — Land Cruiser 300 2023 §EC-12'
        : 'Service Manual — Land Cruiser 300 2023 §EC-12',
      relevance: 'high',
      whyRecommended: lang === 'ja' ? '車種・年式・DTCが一致するOEM公式診断手順' : 'OEM official diagnosis matching model, year, and DTC',
      vehicleModels: ['Land Cruiser 300 2023'],
      dtcs: ['P0420'],
      workflowSteps: ['reception', 'diagnosis'],
      content: lang === 'ja'
        ? `サービスマニュアル §EC-12 — DTC P0420（Land Cruiser 300 2023）

DTC: P0420 — 触媒システム効率低下（バンク1）
関連: P0430（バンク2）

適用: Land Cruiser 300 (FJA300 / VJA300) 2023 MY
エンジン: 3UR-FE V8

診断の要点:
1. GTSでP0420／P0430を確認。他の燃料トリム・ミスファイアDTCがないこと
2. フリーズフレーム — 燃料トリムが ±10% 以内か
3. B1S2 と B2S2 のライブ波形を同時に確認する（V8は両バンク比較が必須）
4. 下流センサーが上流に近い高速スイッチングを示す場合、センサーまたはハーネスを先に疑う
5. センサー応答が正常で、かつ両バンクに効率低下がある場合のみ触媒を検討

⚠ 触媒交換の前に、下流O2センサーとハーネスの状態を必ず確認すること。`
        : `SERVICE MANUAL §EC-12 — DTC P0420 (Land Cruiser 300 2023)

DTC: P0420 — Catalyst System Efficiency Below Threshold (Bank 1)
Related: P0430 (Bank 2)

APPLICABLE: Land Cruiser 300 (FJA300 / VJA300) 2023 MY
ENGINE: 3UR-FE V8

DIAGNOSIS:
1. Confirm P0420 / P0430 on GTS with no fuel-trim or misfire DTCs
2. Freeze-frame — fuel trim within ±10%
3. Monitor B1S2 and B2S2 live waveforms together (V8 requires both banks)
4. If downstream switching approaches upstream frequency, inspect sensor and harness first
5. Consider the catalyst only if sensor response is normal and efficiency is low on both banks

⚠ Do not replace the catalyst before confirming downstream O2 sensor and harness condition.`,
      warnings: lang === 'ja'
        ? ['触媒を交換する前に、下流O2センサーとハーネスを確認してください']
        : ['Do not replace the catalyst before confirming downstream O2 sensor and harness condition'],
      approved: true,
    },
    {
      id: 'lc-tie-p0420',
      type: 'tie',
      informationClass: 'oem-official',
      title: lang === 'ja'
        ? 'TIE-2023-214: P0420 — 下流O2ハーネスの遮熱板接触（LC300 2023）'
        : 'TIE-2023-214: P0420 — Downstream O2 Harness Heat-Shield Contact (LC300 2023)',
      summary: lang === 'ja'
        ? '2023年式 Land Cruiser 300 で、右側下流O2センサーハーネスが排気遮熱板と接触し、断続的な信号異常からP0420が記憶される既知事象。触媒やセンサー交換の前にハーネス経路を点検する。'
        : 'Known 2023 Land Cruiser 300 issue: the RH downstream O2 harness contacts the exhaust heat shield, causing intermittent signal faults and P0420. Inspect harness routing before replacing catalyst or sensor.',
      source: 'TIE-2023-214 Rev.1 — Land Cruiser 300 2023 MY / VIN range FJA300-2XXXXX',
      relevance: 'high',
      whyRecommended: lang === 'ja' ? '2023年式LC300のP0420既知事象' : 'Known P0420 issue for 2023 LC300',
      vehicleModels: ['Land Cruiser 300 2023'],
      dtcs: ['P0420'],
      workflowSteps: ['diagnosis', 'repair'],
      content: lang === 'ja'
        ? `TECHNICAL INFORMATION (TIE-2023-214 Rev.1)

標題: DTC P0420 — 右側下流O2センサーハーネスの遮熱板接触

適用: Land Cruiser 300 2023 MY（FJA300）

症状: チェックエンジンランプ点灯。P0420記憶。走行条件により再現性が低い場合あり。

原因: 右側下流（Bank 1 Sensor 2）ハーネスが排気遮熱板と接触し、被覆損傷または熱による抵抗増加が発生。ECMが触媒効率低下と誤判定する。

処置:
1. 右側下流センサーハーネスの経路を目視確認（遮熱板との隙間）
2. 接触・擦れ・被覆溶けがないか確認し、写真撮影
3. ハーネスをクリップ P/N 82711-60A90 で再固定し、遮熱板から 15 mm 以上離す
4. ピン抵抗が 0.5Ω を超える場合はハーネスAssy交換
5. DTC消去後、ドライブサイクルを実施しI/Mレディネス完了を確認`
        : `TECHNICAL INFORMATION (TIE-2023-214 Rev.1)

TITLE: DTC P0420 — RH downstream O2 harness contact with exhaust heat shield

APPLICABLE: Land Cruiser 300 2023 MY (FJA300)

SYMPTOM: Check engine light. P0420 stored. May be intermittent.

CAUSE: RH downstream (B1S2) harness contacts the exhaust heat shield. Insulation damage or heat-related resistance increase causes the ECM to misread catalyst efficiency.

ACTION:
1. Visually inspect RH downstream harness routing vs heat shield clearance
2. Photograph any contact, abrasion, or melted insulation
3. Reroute and secure with clip P/N 82711-60A90 — keep ≥15 mm from the heat shield
4. Replace harness assembly if pin resistance exceeds 0.5 Ω
5. Clear DTCs, complete drive cycle, confirm I/M readiness Complete`,
      warnings: lang === 'ja'
        ? ['センサー／触媒を交換する前に、ハーネスと遮熱板の接触を必ず点検してください']
        : ['Inspect harness-to-heat-shield contact before replacing the sensor or catalyst'],
      approved: true,
    },
    {
      id: 'lc-qa-p0420',
      type: 'qa',
      informationClass: 'field-knowledge',
      title: lang === 'ja'
        ? '問題交流 #5203: LC300 2023 — 触媒交換後にP0420が再発'
        : 'Field Exchange #5203: LC300 2023 — P0420 returned after catalyst replacement',
      summary: lang === 'ja'
        ? '「触媒を交換したが150kmでP0420が戻った。」ベストアンサー: 2023年式はTIE-2023-214の遮熱板接触が先。ハーネスを再固定しただけで再発なし。触媒は不要だった。'
        : '"Replaced the catalyst but P0420 returned after 150 km." Best answer: On 2023 MY, check TIE-2023-214 heat-shield contact first. Rerouting the harness resolved it — the catalyst was not needed.',
      source: lang === 'ja' ? '問題交流 #5203 — ベストアンサー（14名）' : 'Q&A #5203 — Best Answer selected by 14 technicians',
      relevance: 'high',
      whyRecommended: lang === 'ja' ? '同じ車種・年式・DTCの再修理防止事例' : 'Same model, year, and DTC — prevents repeat repair',
      vehicleModels: ['Land Cruiser 300 2023'],
      dtcs: ['P0420'],
      workflowSteps: ['diagnosis', 'work-planning'],
      content: lang === 'ja'
        ? `問題交流 #5203

Q: 2023 Land Cruiser 300、P0420。触媒交換後150kmで再発。センサー波形は交換前からやや乱れあり。

ベストアンサー:
TIE-2023-214を先に当たってください。右側下流ハーネスが遮熱板に当たっている事例が2023年式で複数出ています。
当店では触媒を戻し、ハーネスをクリップで離して再固定。DTC消去・ドライブサイクル後、2週間フォローで再発なし。
SM §EC-12の「触媒断定の前にセンサー／ハーネス」を省略すると、高額部品の無駄になります。`
        : `Field Exchange #5203

Q: 2023 Land Cruiser 300, P0420. Returned 150 km after catalyst replacement. Sensor waveform was slightly noisy before the repair.

BEST ANSWER:
Read TIE-2023-214 first. Multiple 2023 MY cases show the RH downstream harness against the heat shield.
We reversed the catalyst, clipped the harness clear, cleared DTCs, completed the drive cycle — no return at 2-week follow-up.
Skipping SM §EC-12 (sensor/harness before catalyst) wastes an expensive part.`,
      approved: true,
    },
  ];
}

function aiAnswer(
  query: string,
  top: KnowledgeItem | undefined,
  hits: KnowledgeItem[],
  lang: 'en' | 'ja',
): { finding: string; action: string[] } {
  const q = query.toLowerCase();
  const isLcStory = hits.some(h => LC_STORY_IDS.includes(h.id as typeof LC_STORY_IDS[number]));
  if (isLcStory) {
    return lang === 'ja'
      ? {
          finding:
            'Land Cruiser 300（2023）のP0420は、触媒故障と断定する前に下流O2センサーとハーネスを確認する必要があります。SM §EC-12は両バンク（B1S2／B2S2）の波形比較を求めています。TIE-2023-214では、2023年式で右側下流ハーネスが遮熱板と接触しP0420が誤判定される既知事象が示されています。問題交流 #5203では、触媒交換後150kmで再発し、ハーネス再固定のみで解決した事例があります。',
          action: [
            'SM §EC-12 p.28：触媒交換前にB1S2／B2S2波形を確認する',
            'TIE-2023-214 p.4：右側下流ハーネスと遮熱板の接触を目視確認する',
            '問題交流 #5203：ハーネス再固定で再発が止まっているため、高額部品交換は最後にする',
          ],
        }
      : {
          finding:
            'P0420 on Land Cruiser 300 (2023) should not be treated as a catalyst failure first. SM §EC-12 requires comparing B1S2 / B2S2 waveforms on both banks. TIE-2023-214 documents a 2023 MY known issue: the RH downstream harness contacts the exhaust heat shield and can falsely store P0420. Field Exchange #5203 reports P0420 returning 150 km after catalyst replacement, resolved only by rerouting the harness.',
          action: [
            'SM §EC-12 p.28: confirm B1S2 / B2S2 waveforms before replacing the catalyst',
            'TIE-2023-214 p.4: inspect RH downstream harness vs heat-shield contact',
            'Field Exchange #5203: rerouting the harness stopped recurrence — replace expensive parts last',
          ],
        };
  }
  if (q.includes('腐食') || q.includes('corrosion') || q.includes('connector')) {
    return lang === 'ja'
      ? {
          finding: 'コネクタ腐食はO2センサー周辺でよく見られる二次故障です。センサー交換だけでは再発しやすいため、端子清掃と抵抗確認を先に実施してください。',
          action: [
            '清掃前に写真を残す（保証記録）',
            'CRC QD電子クリーナーで端子を清掃',
            'ピン抵抗が 0.5Ω を超える場合はコネクタ交換',
            '再接続前に絶縁グリスを塗布',
          ],
        }
      : {
          finding: 'Connector corrosion is a common secondary failure around O2 sensors. Replacing the sensor alone often leads to repeat DTCs — clean and check resistance first.',
          action: [
            'Photograph before cleaning (warranty record)',
            'Clean terminals with CRC QD Electronic Cleaner',
            'Replace the connector if pin resistance exceeds 0.5 Ω',
            'Apply dielectric grease before reconnection',
          ],
        };
  }
  if (q.includes('トルク') || q.includes('torque') || q.includes('40')) {
    return lang === 'ja'
      ? {
          finding: '下流O2センサー（B1S2）の規定締付トルクは 40 N·m です。焼付防止剤は先端側2山には塗布しないでください。',
          action: [
            'SST 09224-00010（O2センサーレンチ）を使用',
            '締付トルク 40 N·m をトルクレンチで確認',
            'コネクタがカチッとロックされるまで押し込む',
            'ハーネスが排気管に接触していないことを目視確認',
          ],
        }
      : {
          finding: 'Downstream O2 sensor (B1S2) tightening torque is 40 N·m. Do not apply anti-seize to the first 2 threads near the sensor tip.',
          action: [
            'Use SST 09224-00010 (O2 sensor wrench)',
            'Confirm 40 N·m with a torque wrench',
            'Push the connector until an audible click confirms lock',
            'Visually confirm the harness is clear of the exhaust pipe',
          ],
        };
  }
  if (q.includes('i/m') || q.includes('readiness') || q.includes('レディネス')) {
    return lang === 'ja'
      ? {
          finding: 'P0420修理後はI/Mレディネスの触媒モニターがCompleteになるまでジョブを閉じないでください。未完了のまま納車するとコードが再セットされます。',
          action: [
            'DTCを消去する',
            '規定のドライブサイクルを実施する',
            'GTSで触媒モニター／O2センサーモニターがCompleteであることを確認',
            'ロードテスト後に新規DTCがないことを再確認',
          ],
        }
      : {
          finding: 'After a P0420 repair, do not close the job until the catalyst I/M readiness monitor shows Complete. Returning the vehicle early often stores the code again.',
          action: [
            'Clear DTCs',
            'Perform the prescribed drive cycle',
            'Confirm catalyst and O2 sensor monitors show Complete in GTS',
            'Recheck that no new DTCs appear after the road test',
          ],
        };
  }
  if (top) {
    return lang === 'ja'
      ? {
          finding: top.summary,
          action: [
            '関連資料を開いて公式手順を確認する',
            '選択した車種・年式・ドキュメントタイプに合うか確認する',
            'OEM公式ソースと照合してから作業する',
          ],
        }
      : {
          finding: top.summary,
          action: [
            'Open the related document and follow the official procedure',
            'Confirm it matches the selected model, year, and document type',
            'Verify against OEM sources before acting',
          ],
        };
  }
  return lang === 'ja'
    ? {
        finding: '該当する公式資料は見つかりませんでした。フィルターを緩めるか、キーワードを変えて再検索してください。',
        action: ['車種・年式・ドキュメントタイプの条件を見直す', '症状やDTCを付けて再検索する'],
      }
    : {
        finding: 'No official documents matched. Relax the filters or try a different keyword.',
        action: ['Review model, year, and document type filters', 'Search again with a symptom or DTC'],
      };
}

function DocKindBadge({ kind, label }: { kind: DocKind | 'other'; label: string }) {
  const cls: Record<string, string> = {
    om: 'bg-slate-100 text-slate-700',
    sm: 'bg-blue-100 text-blue-800',
    tie: 'bg-indigo-100 text-indigo-800',
    qa: 'bg-teal-100 text-teal-800',
    other: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls[kind] ?? cls.other}`}>
      {label}
    </span>
  );
}

interface Props {
  onClose: () => void;
}

export function GlobalAISearchModal({ onClose }: Props) {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [model, setModel] = useState('all');
  const [year, setYear] = useState('all');
  const [docTypes, setDocTypes] = useState<DocKind[]>([]);
  const [mode, setMode] = useState<Mode>('idle');
  const [hits, setHits] = useState<KnowledgeItem[]>([]);
  const [drawerItem, setDrawerItem] = useState<KnowledgeItem | null>(null);
  const [citedPage, setCitedPage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const catalog = useMemo(
    () => [...getAllLocalizedKnowledge(lang), ...extraItems(lang)],
    [lang],
  );

  const hasFilters = model !== 'all' || year !== 'all' || docTypes.length > 0;
  const canSearch = query.trim().length > 0 || hasFilters;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const toggleDocType = (kind: DocKind) => {
    setDocTypes(prev => prev.includes(kind) ? prev.filter(k => k !== kind) : [...prev, kind]);
  };

  const runSearch = (q: string, opts?: { model?: string; year?: string; docTypes?: DocKind[] }) => {
    const nextModel = opts?.model ?? model;
    const nextYear = opts?.year ?? year;
    const nextDocs = opts?.docTypes ?? docTypes;
    if (opts?.model !== undefined) setModel(opts.model);
    if (opts?.year !== undefined) setYear(opts.year);
    if (opts?.docTypes !== undefined) setDocTypes(opts.docTypes);
    const trimmed = q.trim();
    if (!trimmed && nextModel === 'all' && nextYear === 'all' && nextDocs.length === 0) return;
    setQuery(trimmed);
    setMode('searching');
    setTimeout(() => {
      if (isLcP420Story(trimmed, nextModel, nextYear, nextDocs)) {
        const story = LC_STORY_IDS
          .map(id => catalog.find(i => i.id === id))
          .filter((item): item is KnowledgeItem => !!item);
        setHits(story);
        setMode('results');
        return;
      }
      const ranked = catalog
        .filter(item => matchesFilters(item, nextModel, nextYear, nextDocs))
        .map(item => ({ item, score: scoreItem(item, trimmed) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(r => r.item);
      setHits(ranked);
      setMode('results');
    }, 800);
  };

  const lcStoryOpts = { model: 'Land Cruiser 300', year: '2023', docTypes: ['sm'] as DocKind[] };
  const chips: { key: TranslationKey; q: string; opts?: { model: string; year: string; docTypes: DocKind[] } }[] =
    lang === 'ja'
      ? [
          { key: 'aisearch.chip.lc', q: 'P420', opts: lcStoryOpts },
          { key: 'aisearch.chip.torque', q: 'O2センサー トルク' },
          { key: 'aisearch.chip.corr', q: 'コネクタ腐食' },
          { key: 'aisearch.chip.im', q: 'I/Mレディネス' },
        ]
      : [
          { key: 'aisearch.chip.lc', q: 'P420', opts: lcStoryOpts },
          { key: 'aisearch.chip.torque', q: 'O2 sensor torque' },
          { key: 'aisearch.chip.corr', q: 'connector corrosion' },
          { key: 'aisearch.chip.im', q: 'I/M readiness' },
        ];

  const answer = mode === 'results' ? aiAnswer(query, hits[0], hits, lang) : null;
  const sources = mode === 'results' && hits.length > 0 ? pickSources(query, hits, catalog) : [];
  const openCitation = (item: KnowledgeItem) => {
    const cite = citationFor(item, lang);
    setCitedPage(`${cite.section}  ${cite.page}`);
    setDrawerItem(item);
  };

  const kindLabel = (kind: DocKind | 'other') => {
    if (kind === 'om') return t('aisearch.doc.om');
    if (kind === 'sm') return t('aisearch.doc.sm');
    if (kind === 'tie') return t('aisearch.doc.tie');
    if (kind === 'qa') return t('aisearch.doc.qa');
    return lang === 'ja' ? 'その他' : 'Other';
  };

  const selectCls = 'w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-8 mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[calc(100vh-4rem)] animate-slide-up">
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-violet-50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 text-violet-800 font-bold">
              <Sparkles className="w-4 h-4" />
              {t('aisearch.title')}
            </div>
            <p className="text-xs text-violet-600 mt-1">{t('aisearch.subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-violet-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          className="px-6 py-4 border-b border-slate-100 space-y-3"
          onSubmit={e => {
            e.preventDefault();
            runSearch(query);
          }}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('home.ai-search.placeholder')}
                className="w-full text-sm border border-violet-300 rounded-xl pl-9 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <button
              type="submit"
              disabled={!canSearch || mode === 'searching'}
              className="bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-violet-700 disabled:opacity-50"
            >
              {t('btn.search')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t('aisearch.filter.model')}</span>
              <select value={model} onChange={e => setModel(e.target.value)} className={`${selectCls} mt-1`}>
                <option value="all">{t('aisearch.filter.all')}</option>
                {MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t('aisearch.filter.year')}</span>
              <select value={year} onChange={e => setYear(e.target.value)} className={`${selectCls} mt-1`}>
                <option value="all">{t('aisearch.filter.all')}</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                {t('aisearch.filter.doc')}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {DOC_KINDS.map(d => {
                  const on = docTypes.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDocType(d.id)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                        on
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      {d.id === 'om' ? 'OM' : d.id === 'sm' ? 'SM' : d.id === 'tie' ? 'TIE' : (lang === 'ja' ? '問題交流' : 'Q&A')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">{t('aisearch.examples')}</span>
            {chips.map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={() => runSearch(chip.q, chip.opts)}
                className="text-xs bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-700 text-slate-600 px-2.5 py-1 rounded-full"
              >
                {t(chip.key)}
              </button>
            ))}
          </div>
        </form>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {mode === 'idle' && (
            <div className="text-center py-10 text-sm text-slate-500">
              <Lightbulb className="w-8 h-8 text-violet-300 mx-auto mb-3" />
              {t('aisearch.empty')}
            </div>
          )}

          {mode === 'searching' && (
            <div className="flex flex-col items-center py-12 gap-3 text-slate-500">
              <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
              <span className="text-sm font-medium">{t('aisearch.searching')}</span>
            </div>
          )}

          {mode === 'results' && answer && (
            <>
              {hasFilters && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-violet-600">{t('aisearch.filtered')}</span>
                  {model !== 'all' && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{model}</span>}
                  {year !== 'all' && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{year}</span>}
                  {docTypes.map(d => (
                    <span key={d} className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{kindLabel(d)}</span>
                  ))}
                </div>
              )}

              <section className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">✦ {t('aisearch.ai-answer')}</div>
                <p className="text-sm text-slate-800 leading-relaxed">{answer.finding}</p>
                {sources.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-bold text-violet-700 mb-2">{t('aisearch.sources')}</div>
                    <div className="space-y-1.5">
                      {sources.map(item => {
                        const cite = citationFor(item, lang);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openCitation(item)}
                            className="w-full flex items-start gap-2.5 text-left bg-white border border-violet-200 hover:border-violet-400 hover:bg-violet-50 rounded-xl px-3 py-2.5 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="text-xs font-bold text-slate-800">{cite.section}</span>
                                <span className="text-xs font-semibold text-violet-700 underline underline-offset-2">
                                  {cite.page}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cite.highlight}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <ul className="mt-3 space-y-1.5">
                  {answer.action.map(step => (
                    <li key={step} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-violet-400">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-violet-500 mt-3">✦ {t('ai.disclaimer')}</p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  {t('aisearch.results')}
                  <span className="ml-2 text-xs font-normal text-slate-400">{hits.length}</span>
                </h3>
                {hits.length === 0 ? (
                  <p className="text-sm text-slate-500">{t('aisearch.no-results')}</p>
                ) : (
                  <div className="space-y-2">
                    {hits.map(item => {
                      const kind = getDocKind(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => openCitation(item)}
                          className="w-full text-left border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 rounded-xl p-4 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-1.5 mb-1.5">
                                <DocKindBadge kind={kind} label={kindLabel(kind)} />
                                <InfoClassBadge cls={item.informationClass} />
                              </div>
                              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</p>
                              <p className="text-[11px] text-slate-400 mt-1">{item.vehicleModels.join(' · ')}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      <InfoDrawer
        item={drawerItem}
        citedPage={citedPage}
        onClose={() => {
          setDrawerItem(null);
          setCitedPage(null);
        }}
      />
    </>
  );
}
