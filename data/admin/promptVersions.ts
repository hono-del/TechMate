// Mock catalog for prompt / model versioning (SYS-027).
// Fictional demo data only — no real LLM deploy.

export type PromptStatus = 'active' | 'candidate' | 'previous' | 'retired';

export interface PromptVersion {
  id: string;
  promptId: string;
  version: string;
  status: PromptStatus;
  modelId: string;
  region: string;
  topK: number;
  minScore: number;
  index: string;
  evalGate: 'passed' | 'pending' | 'failed';
  activatedAt: string | null;
  author: string;
  summary: string;
  summaryJa: string;
  promptExcerpt: string;
  promptExcerptJa: string;
}

export const ACTIVE_VERSION_KEY = 'techmate-prompt-version-id';

export const PROMPT_VERSIONS: PromptVersion[] = [
  {
    id: 'pv-1.5',
    promptId: 'prompt-qa-apac',
    version: '1.5',
    status: 'candidate',
    modelId: 'tm-rag-apac-03',
    region: 'Asia Pacific',
    topK: 6,
    minScore: 0.72,
    index: 'elib-chunks-2026-10',
    evalGate: 'pending',
    activatedAt: null,
    author: 'A. Chen',
    summary: 'Stricter refuse threshold. Fewer catalyst-first answers on P0420.',
    summaryJa: '拒否しきい値を上げ、P0420 で触媒先行回答を減らす候補。',
    promptExcerpt:
      'Answer only from retrieved Manual / TIE chunks. If top score < 0.72, refuse. Never invent torque or procedure steps.',
    promptExcerptJa:
      '取得した Manual / TIE チャンクだけを根拠にする。top score が 0.72 未満なら回答しない。トルクや手順は生成しない。',
  },
  {
    id: 'pv-1.4',
    promptId: 'prompt-qa-apac',
    version: '1.4',
    status: 'active',
    modelId: 'tm-rag-apac-02',
    region: 'Asia Pacific',
    topK: 8,
    minScore: 0.62,
    index: 'elib-chunks-2026-09',
    evalGate: 'passed',
    activatedAt: '2026-09-18 11:20',
    author: 'A. Chen',
    summary: 'Current production. Cited Q&A with refuse below 0.62.',
    summaryJa: '現行本番。出典付き Q&A。0.62 未満は回答拒否。',
    promptExcerpt:
      'You are a service knowledge assistant. Cite Manual / TIE. If evidence is below 0.62, do not answer. Do not generate repair procedures.',
    promptExcerptJa:
      'サービスナレッジのアシスタント。Manual / TIE を出典にする。根拠が 0.62 未満なら回答しない。修理手順は生成しない。',
  },
  {
    id: 'pv-1.3',
    promptId: 'prompt-qa-apac',
    version: '1.3',
    status: 'previous',
    modelId: 'tm-rag-apac-02',
    region: 'Asia Pacific',
    topK: 8,
    minScore: 0.55,
    index: 'elib-chunks-2026-08',
    evalGate: 'passed',
    activatedAt: '2026-08-02 09:40',
    author: 'A. Chen',
    summary: 'Previous production. Lower refuse threshold — more answers, more flags.',
    summaryJa: '直前の本番。拒否しきい値が低く、回答は多いがフラグも増えた。',
    promptExcerpt:
      'Cite retrieved sources. Prefer a synthesized answer when any related chunk exists.',
    promptExcerptJa:
      '取得ソースを出典にする。関連チャンクがあれば合成回答を優先する。',
  },
  {
    id: 'pv-1.2',
    promptId: 'prompt-qa-apac',
    version: '1.2',
    status: 'retired',
    modelId: 'tm-rag-apac-01',
    region: 'Asia Pacific',
    topK: 12,
    minScore: 0.40,
    index: 'elib-chunks-2026-06',
    evalGate: 'failed',
    activatedAt: '2026-06-11 14:05',
    author: 'A. Chen',
    summary: 'Retired after eval fail on golden set (SYS-030). Kept for audit.',
    summaryJa: 'ゴールデンセット評価不合格のため廃止（SYS-030）。監査用に残す。',
    promptExcerpt:
      'Answer the technician question using workshop knowledge. Citations optional.',
    promptExcerptJa:
      '現場知識を使ってテクニシャンの質問に答える。出典は任意。',
  },
];

export const SAMPLE_AI_LOGS = [
  {
    id: 'log-01',
    at: '2026-10-28 14:12',
    jobId: 'RO-2026-10-0042',
    query: 'P0420 after O2 sensor replacement — next step?',
    promptVersion: '1.4',
    modelId: 'tm-rag-apac-02',
    outcome: 'answered',
  },
  {
    id: 'log-02',
    at: '2026-10-28 13:48',
    jobId: 'RO-2026-10-0042',
    query: 'P9999 turbo wastegate',
    promptVersion: '1.4',
    modelId: 'tm-rag-apac-02',
    outcome: 'refused',
  },
  {
    id: 'log-03',
    at: '2026-10-27 16:05',
    jobId: 'RO-2026-10-0038',
    query: 'C1241 highway vibration',
    promptVersion: '1.4',
    modelId: 'tm-rag-apac-02',
    outcome: 'answered',
  },
];

export const DEFAULT_ACTIVE_ID = 'pv-1.4';

export function getVersion(id: string): PromptVersion | undefined {
  return PROMPT_VERSIONS.find((v) => v.id === id);
}

export function readActiveVersionId(): string {
  if (typeof window === 'undefined') return DEFAULT_ACTIVE_ID;
  try {
    return localStorage.getItem(ACTIVE_VERSION_KEY) ?? DEFAULT_ACTIVE_ID;
  } catch {
    return DEFAULT_ACTIVE_ID;
  }
}

export function writeActiveVersionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_VERSION_KEY, id);
  } catch {
    /* ignore */
  }
}

export function getActiveVersion(): PromptVersion {
  return getVersion(readActiveVersionId()) ?? PROMPT_VERSIONS.find((v) => v.status === 'active') ?? PROMPT_VERSIONS[1];
}
