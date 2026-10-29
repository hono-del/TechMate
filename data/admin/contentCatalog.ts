// Mock catalog for Content ingest / tagging / lifecycle (SR-037, SR-038, SYS-038).
// Fictional demo data only.

export type ContentStatus = 'draft' | 'published' | 'superseded' | 'withdrawn';
export type ContentKind = 'manual' | 'tie' | 'qa';

export interface ContentTag {
  id: string;
  label: string;
  required: boolean;
  present: boolean;
  aiSuggested?: boolean;
}

export interface CatalogUnit {
  id: string;
  sourceId: string;
  kind: ContentKind;
  title: string;
  version: string;
  effectiveDate: string;
  status: ContentStatus;
  replaces?: string;
  models: string;
  dtc: string;
  region: string;
  language: string;
  system: string;
  step: string;
  tags: ContentTag[];
  autoRecommend: boolean;
}

export const INGEST_META = {
  lastRun: '2026-10-16 08:40',
  source: 'OEM Technical Information DB + Q&A DB',
  updated: 4,
  errors: 1,
};

export const CATALOG_UNITS: CatalogUnit[] = [
  {
    id: 'cu-sm-ec12',
    sourceId: 'SM-LC300-EC-12',
    kind: 'manual',
    title: 'SM §EC-12 — P0420 both-bank O2 waveforms',
    version: '2023.03',
    effectiveDate: '2023-03-12',
    status: 'published',
    models: 'Land Cruiser 300 2022–2023',
    dtc: 'P0420',
    region: 'Asia Pacific',
    language: 'EN / JA',
    system: 'Engine / Exhaust',
    step: 'Diagnosis',
    autoRecommend: true,
    tags: [
      { id: 'model', label: 'Model / MY', required: true, present: true },
      { id: 'dtc', label: 'DTC', required: true, present: true },
      { id: 'region', label: 'Region', required: true, present: true },
      { id: 'lang', label: 'Language', required: true, present: true },
      { id: 'ver', label: 'Version', required: true, present: true },
    ],
  },
  {
    id: 'cu-tie-214',
    sourceId: 'TIE-2023-214',
    kind: 'tie',
    title: 'TIE-2023-214 — RH downstream harness vs heat shield',
    version: '1.0',
    effectiveDate: '2023-08-04',
    status: 'published',
    models: 'Land Cruiser 300 2023',
    dtc: 'P0420',
    region: 'Asia Pacific',
    language: 'EN / JA',
    system: 'Engine / Exhaust',
    step: 'Diagnosis; Repair',
    autoRecommend: true,
    tags: [
      { id: 'model', label: 'Model / MY', required: true, present: true },
      { id: 'dtc', label: 'DTC', required: true, present: true },
      { id: 'region', label: 'Region', required: true, present: true },
      { id: 'lang', label: 'Language', required: true, present: true },
      { id: 'ver', label: 'Version', required: true, present: true },
    ],
  },
  {
    id: 'cu-tie-188-r1',
    sourceId: 'TIE-2022-0188',
    kind: 'tie',
    title: 'TIE-2022-0188 Rev.1 — Sensor-first P0420 (superseded)',
    version: 'Rev.1',
    effectiveDate: '2022-04-18',
    status: 'superseded',
    replaces: 'Rev.2 (2024-01)',
    models: 'Corolla Cross 2021–2022',
    dtc: 'P0420',
    region: 'Asia Pacific',
    language: 'EN',
    system: 'Engine / Exhaust',
    step: 'Diagnosis',
    autoRecommend: false,
    tags: [
      { id: 'model', label: 'Model / MY', required: true, present: true },
      { id: 'dtc', label: 'DTC', required: true, present: true },
      { id: 'region', label: 'Region', required: true, present: true },
      { id: 'lang', label: 'Language', required: true, present: true },
      { id: 'ver', label: 'Version', required: true, present: true },
    ],
  },
  {
    id: 'cu-tie-p0420-draft',
    sourceId: 'TIE-CAND-P0420-POST',
    kind: 'tie',
    title: 'TIE candidate — P0420 post-repair verification',
    version: 'Draft 0.3',
    effectiveDate: '—',
    status: 'draft',
    models: 'Corolla Cross / RAV4',
    dtc: '',
    region: 'Asia Pacific',
    language: 'EN / JA',
    system: 'Engine / Exhaust',
    step: 'Repair; Check & Verify',
    autoRecommend: false,
    tags: [
      { id: 'model', label: 'Model / MY', required: true, present: true },
      { id: 'dtc', label: 'DTC', required: true, present: false, aiSuggested: true },
      { id: 'region', label: 'Region', required: true, present: true },
      { id: 'lang', label: 'Language', required: true, present: true },
      { id: 'ver', label: 'Version', required: true, present: true },
    ],
  },
  {
    id: 'cu-faq-bt',
    sourceId: 'FAQ-BT-2024',
    kind: 'qa',
    title: 'FAQ — Bluetooth dropout on Android 14+',
    version: '2024.08',
    effectiveDate: '2024-08-12',
    status: 'published',
    models: 'RAV4 2023; Corolla Cross 2022',
    dtc: '—',
    region: 'Asia Pacific',
    language: 'EN / JA',
    system: 'Audio / HU',
    step: 'Diagnosis',
    autoRecommend: true,
    tags: [
      { id: 'model', label: 'Model / MY', required: true, present: true },
      { id: 'dtc', label: 'DTC', required: false, present: true },
      { id: 'region', label: 'Region', required: true, present: true },
      { id: 'lang', label: 'Language', required: true, present: true },
      { id: 'ver', label: 'Version', required: true, present: true },
    ],
  },
  {
    id: 'cu-faq-bt-old',
    sourceId: 'FAQ-BT-2019',
    kind: 'qa',
    title: 'FAQ — Bluetooth pairing (2019, withdrawn)',
    version: '2019.02',
    effectiveDate: '2019-02-01',
    status: 'withdrawn',
    models: 'RAV4 2019',
    dtc: '—',
    region: 'Asia Pacific',
    language: 'EN',
    system: 'Audio / HU',
    step: 'Diagnosis',
    autoRecommend: false,
    tags: [
      { id: 'model', label: 'Model / MY', required: true, present: true },
      { id: 'dtc', label: 'DTC', required: false, present: true },
      { id: 'region', label: 'Region', required: true, present: true },
      { id: 'lang', label: 'Language', required: true, present: true },
      { id: 'ver', label: 'Version', required: true, present: true },
    ],
  },
];
