'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, PenLine, Search, Sparkles, FileText,
  AlertTriangle, CheckCircle2, ChevronRight, Loader2,
  Lightbulb, BookOpen, MessageSquare,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// ─── Mock search result data ──────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: 'tie' | 'qa';
  displayId: string;
  title: string;
  titleJa: string;
  meta: string;
  summary: string;
  summaryJa: string;
  hasBestAnswer?: boolean;
  keywords: string[];
}

const SEARCH_RESULTS: SearchResult[] = [
  {
    id: 'tie-corr-001',
    type: 'tie',
    displayId: 'T-SER-2024-089',
    title: 'Connector Corrosion on O2 Sensor Harness — Cleaning & Treatment',
    titleJa: 'O2センサーハーネス コネクタ腐食 — 清掃・処置手順',
    meta: 'Published 2024-03-15 | Corolla, Camry, RAV4 | 2ZR / A25A',
    summary:
      'White or green powdery corrosion on O2 sensor connectors is caused by moisture in the exhaust tunnel area. Use CRC QD Electronic Cleaner and dielectric grease before considering connector replacement. Check pin resistance >0.5 Ω as replacement threshold.',
    summaryJa:
      'O2センサーコネクタの白・緑の粉状腐食は排気トンネル部の水分侵入が原因です。コネクタ交換を検討する前に、CRC QD電子クリーナーと絶縁グリスを使用してください。ピン抵抗 >0.5Ω を交換の基準値とします。',
    keywords: ['corrosion', 'connector', 'corrode', '腐食', 'コネクタ', 'o2', 'sensor'],
  },
  {
    id: 'qa-corr-001',
    type: 'qa',
    displayId: 'Q&A-0341',
    title: 'B1S2 O2 sensor connector corrosion causing intermittent P0420',
    titleJa: 'B1S2 O2センサーコネクタ腐食によるP0420断続発生',
    meta: 'Answered 2024-01-08 | Corolla Cross 2022 | 2 verified helpful',
    summary:
      'High resistance caused by corrosion mimics sensor degradation — DTC P0420 may not be a catalyst or sensor issue at all. Clean the connector and retest with live data before replacing any parts. Replacing sensor without fixing connector leads to repeat failure within 6 months.',
    summaryJa:
      '腐食による高抵抗がセンサー劣化と誤認させます。P0420が触媒やセンサーの問題ではない可能性があります。部品交換前にコネクタを清掃してライブデータで再テストしてください。コネクタを修正せずにセンサー交換すると6ヶ月以内に再発します。',
    hasBestAnswer: true,
    keywords: ['corrosion', 'connector', 'p0420', '腐食', 'コネクタ', 'o2', 'sensor'],
  },
  {
    id: 'tie-heat-001',
    type: 'tie',
    displayId: 'T-SER-2023-156',
    title: 'Unexpected Connector Wear in High-Temperature Exhaust Zones',
    titleJa: '高温排気領域でのコネクタ予期せぬ劣化',
    meta: 'Published 2023-11-02 | All hybrid / ICE models',
    summary:
      'Connectors adjacent to exhaust show accelerated aging. If visual corrosion is found: (1) photograph before cleaning, (2) apply connector seal kit P/N 82999-52020, (3) document in service record with photo. This is a warranty-eligible finding when properly documented.',
    summaryJa:
      '排気系に隣接するコネクタは経年劣化が加速します。目視腐食が確認された場合：①清掃前に撮影、②コネクタシールキット P/N 82999-52020を適用、③写真とともに整備記録に記載。適切に記録された場合、保証対象となる場合があります。',
    keywords: ['corrosion', 'connector', 'unexpected', 'wear', '腐食', 'コネクタ', '劣化', '予期'],
  },
  {
    id: 'qa-vibration-001',
    type: 'qa',
    displayId: 'Q&A-0289',
    title: 'Unusual vibration during O2 sensor removal',
    titleJa: 'O2センサー取り外し時の異常振動',
    meta: 'Answered 2023-09-22 | Corolla Cross 2022 | 1 verified helpful',
    summary:
      'If the sensor is seized due to corrosion, apply penetrating oil and allow 15 min soak before attempting removal. Using excessive force can strip the bung or crack the exhaust pipe. SST 09224-00010 with a breaker bar is recommended.',
    summaryJa:
      '腐食でセンサーが固着している場合は、浸透潤滑剤を塗布して15分待ってから取り外してください。過度な力を加えると、バングのネジ山をつぶしたり、排気管が割れる可能性があります。ブレーカーバーとSST 09224-00010の使用を推奨します。',
    keywords: ['vibration', 'seized', 'removal', '振動', '固着', '取り外し', 'o2'],
  },
  {
    id: 'tie-oil-001',
    type: 'tie',
    displayId: 'T-SER-2024-012',
    title: 'Oil contamination on exhaust components during O2 sensor work',
    titleJa: 'O2センサー作業中の排気部品への油汚染',
    meta: 'Published 2024-01-10 | 2ZR-FE / A25A-FXS',
    summary:
      'If oil is found on exhaust manifold or sensor area, check for valve cover gasket or turbo oil seal leaks before completing repair. Oil on hot exhaust creates smoke and potential fire risk. Document and address root cause.',
    summaryJa:
      '排気マニホールドやセンサー部分に油が見られる場合は、修理を完了する前にバルブカバーガスケットまたはターボオイルシールの漏れを確認してください。高温排気への油汚染は煙や発火リスクがあります。根本原因を記録・対処してください。',
    keywords: ['oil', 'leak', 'contamination', '油', '漏れ', '汚染', 'exhaust'],
  },
];

// ─── Mock AI response ─────────────────────────────────────────────────────────

const AI_RESPONSE = {
  en: [
    {
      type: 'finding' as const,
      label: 'Finding',
      text: 'Connector corrosion is a known failure mode in O2 sensor harnesses exposed to exhaust heat and moisture. This finding is significant and should be resolved before completing the repair.',
    },
    {
      type: 'action' as const,
      label: 'Recommended Actions',
      items: [
        'Photograph the corrosion before any cleaning (warranty documentation)',
        'Apply CRC QD Electronic Cleaner to all connector terminals',
        'Inspect pins for mechanical damage — replace if bent or broken',
        'Check pin-to-pin resistance with a multimeter (threshold: <0.5 Ω)',
        'Apply dielectric grease before final reconnection',
        'If severe, use Toyota Connector Seal Kit P/N 82999-52020',
      ],
    },
    {
      type: 'impact' as const,
      label: 'Impact on Current Repair',
      text: 'Connector corrosion may be a contributing cause of DTC P0420. If left untreated, replacing the O2 sensor alone may result in repeat failure within 6 months. Resolve the corrosion first, then recheck live sensor data.',
    },
    {
      type: 'reference' as const,
      label: 'References',
      text: 'TIE T-SER-2024-089 · Q&A-0341 · Toyota Service Bulletin TC-2024-0183',
    },
  ],
  ja: [
    {
      type: 'finding' as const,
      label: '発見事項',
      text: 'コネクタ腐食は排気熱と湿気にさらされるO2センサーハーネスでよく見られる故障モードです。この発見は重要であり、修理を完了する前に解決する必要があります。',
    },
    {
      type: 'action' as const,
      label: '推奨アクション',
      items: [
        '清掃前に腐食を撮影してください（保証書類用）',
        'CRC QD電子クリーナーをすべてのコネクタ端子に塗布',
        'ピンの機械的損傷を確認 — 曲がっている・折れている場合は交換',
        'テスターでピン間抵抗を確認（基準値：<0.5Ω）',
        '最終接続前に絶縁グリスを塗布',
        '腐食が激しい場合はトヨタコネクタシールキット P/N 82999-52020を使用',
      ],
    },
    {
      type: 'impact' as const,
      label: '現在の修理への影響',
      text: 'コネクタ腐食がDTC P0420の一因である可能性があります。放置した場合、O2センサーのみを交換しても6ヶ月以内に再発する可能性があります。まず腐食を解決し、センサーのライブデータを再確認してください。',
    },
    {
      type: 'reference' as const,
      label: '参考資料',
      text: 'TIE T-SER-2024-089 · Q&A-0341 · トヨタサービスブレティン TC-2024-0183',
    },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function scoreResult(result: SearchResult, query: string): number {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const kw of result.keywords) {
    for (const word of words) {
      if (kw.includes(word) || word.includes(kw)) score += 2;
    }
  }
  const titleText = (result.title + ' ' + result.titleJa).toLowerCase();
  for (const word of words) {
    if (titleText.includes(word)) score += 1;
  }
  return score;
}

// ─── Component ────────────────────────────────────────────────────────────────

type ModalMode = 'idle' | 'searching' | 'results' | 'ai-thinking' | 'ai-response' | 'saved';

interface Props {
  stepTitle: string;
  onClose: () => void;
  onAddFieldNote: () => void;
}

export function UnexpectedObservationModal({ stepTitle, onClose, onAddFieldNote }: Props) {
  const { t, lang } = useLanguage();
  const [observation, setObservation] = useState('');
  const [mode, setMode] = useState<ModalMode>('idle');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [savedObservations, setSavedObservations] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on open
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const hasInput = observation.trim().length > 0;

  const handleSearch = () => {
    if (!hasInput) return;
    setMode('searching');
    setExpandedResult(null);
    setTimeout(() => {
      const scored = SEARCH_RESULTS
        .map(r => ({ r, score: scoreResult(r, observation) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ r }) => r);
      setResults(scored.length > 0 ? scored : []);
      setMode('results');
    }, 900);
  };

  const handleAskAI = () => {
    if (!hasInput) return;
    setMode('ai-thinking');
    setExpandedResult(null);
    setTimeout(() => setMode('ai-response'), 1800);
  };

  const handleAddObservation = () => {
    if (!hasInput) return;
    setSavedObservations(prev => [...prev, observation.trim()]);
    setMode('saved');
    setTimeout(() => setMode('idle'), 2500);
  };

  const handleAddFieldNote = () => {
    onClose();
    onAddFieldNote();
  };

  const aiData = lang === 'ja' ? AI_RESPONSE.ja : AI_RESPONSE.en;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none">
        <div className="
          pointer-events-auto
          w-full max-w-2xl
          bg-white rounded-t-3xl sm:rounded-2xl
          shadow-2xl flex flex-col
          max-h-[90vh] sm:max-h-[85vh]
          animate-slide-up
        ">

          {/* ─── Header ─────────────────────────────────── */}
          <div className="flex-shrink-0 p-5 border-b border-slate-200 bg-amber-50 rounded-t-3xl sm:rounded-t-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-amber-900">{t('unexpected.modal.title')}</h2>
                  <p className="text-xs text-amber-700 mt-0.5">{t('unexpected.modal.subtitle')}</p>
                  <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <span className="font-medium">📍</span>
                    <span>{stepTitle}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-amber-200 text-amber-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ─── Scrollable body ─────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Observation input */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                {lang === 'ja' ? '気づいたことを記述してください' : 'What did you observe?'}
              </label>
              <textarea
                ref={textareaRef}
                value={observation}
                onChange={e => setObservation(e.target.value)}
                rows={3}
                placeholder={t('unexpected.placeholder')}
                className="
                  w-full rounded-xl border border-slate-300 bg-slate-50
                  px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                  resize-none transition-all
                "
              />
              {!hasInput && (
                <p className="text-xs text-slate-400 mt-1">{t('unexpected.input-hint')}</p>
              )}
            </div>

            {/* Saved observations list */}
            {savedObservations.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="text-xs font-bold text-green-700 mb-2">
                  ✓ {lang === 'ja' ? '記録済みの観察' : 'Saved Observations'}
                </div>
                <ul className="space-y-1">
                  {savedObservations.map((obs, i) => (
                    <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0 mt-0.5">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ─── Action buttons ─────────────────────────── */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Add Observation */}
              <button
                onClick={handleAddObservation}
                disabled={!hasInput || mode === 'saved'}
                className={`
                  flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all
                  ${mode === 'saved'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : hasInput
                      ? 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 hover:text-amber-800 shadow-sm hover:shadow'
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {mode === 'saved' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <PenLine className="w-4 h-4 flex-shrink-0" />
                )}
                <div>
                  <div className="text-sm font-semibold">
                    {mode === 'saved' ? t('unexpected.saved') : t('unexpected.action.add-obs')}
                  </div>
                  {mode === 'saved' && (
                    <div className="text-xs opacity-75">{t('unexpected.saved.sub')}</div>
                  )}
                </div>
              </button>

              {/* Search Related Cases */}
              <button
                onClick={handleSearch}
                disabled={!hasInput || mode === 'searching'}
                className={`
                  flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all
                  ${!hasInput
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    : mode === 'searching'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-800 shadow-sm hover:shadow'
                  }
                `}
              >
                {mode === 'searching' ? (
                  <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 flex-shrink-0" />
                )}
                <div className="text-sm font-semibold">{t('unexpected.action.search')}</div>
              </button>

              {/* Ask AI */}
              <button
                onClick={handleAskAI}
                disabled={!hasInput || mode === 'ai-thinking'}
                className={`
                  flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all
                  ${!hasInput
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    : mode === 'ai-thinking'
                      ? 'bg-violet-50 border-violet-300 text-violet-700'
                      : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 hover:text-violet-800 shadow-sm hover:shadow'
                  }
                `}
              >
                {mode === 'ai-thinking' ? (
                  <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                )}
                <div>
                  <div className="text-sm font-semibold">{t('unexpected.action.ask-ai')}</div>
                  {mode === 'ai-thinking' && (
                    <div className="text-xs opacity-75">{t('unexpected.ai.thinking')}</div>
                  )}
                </div>
              </button>

              {/* Add Field Note */}
              <button
                onClick={handleAddFieldNote}
                className="
                  flex items-center gap-2.5 p-3.5 rounded-xl border bg-white border-slate-200
                  hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-left
                  transition-all shadow-sm hover:shadow
                "
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <div className="text-sm font-semibold">{t('unexpected.action.field-note')}</div>
              </button>
            </div>

            {/* ─── Search results ─────────────────────────── */}
            {mode === 'results' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-700">{t('unexpected.results.title')}</span>
                  {results.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {results.length}
                    </span>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{t('unexpected.results.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map(r => (
                      <div key={r.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                          className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5 flex flex-col items-start gap-1">
                            {r.type === 'tie' ? (
                              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {t('unexpected.tie-label')}
                              </span>
                            ) : (
                              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                {t('unexpected.qa-label')}
                              </span>
                            )}
                            {r.hasBestAnswer && (
                              <span className="text-xs font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                ✓ {t('unexpected.best-answer')}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-mono text-slate-500 mb-0.5">{r.displayId}</div>
                            <div className="text-sm font-semibold text-slate-800 leading-snug">
                              {lang === 'ja' ? r.titleJa : r.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">{r.meta}</div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform ${expandedResult === r.id ? 'rotate-90' : ''}`}
                          />
                        </button>

                        {expandedResult === r.id && (
                          <div className="px-4 pb-4 border-t border-slate-100">
                            <div className="bg-slate-50 rounded-xl p-4 mt-3">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                <Lightbulb className="w-3.5 h-3.5" />
                                {lang === 'ja' ? '要点' : 'Key Finding'}
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {lang === 'ja' ? r.summaryJa : r.summary}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── AI response ─────────────────────────────── */}
            {mode === 'ai-thinking' && (
              <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                <Loader2 className="w-5 h-5 text-violet-600 animate-spin flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-violet-800">{t('unexpected.ai.thinking')}</div>
                  <div className="text-xs text-violet-600 mt-0.5">
                    {lang === 'ja'
                      ? 'TIEデータベース・Q&A・技術文書を参照中...'
                      : 'Searching TIE database, Q&A, and technical documents...'}
                  </div>
                </div>
              </div>
            )}

            {mode === 'ai-response' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-bold text-slate-700">{t('unexpected.ai.title')}</span>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">AI</span>
                </div>

                <div className="border border-violet-200 rounded-2xl overflow-hidden">
                  {/* AI disclaimer banner */}
                  <div className="bg-violet-50 px-4 py-2.5 border-b border-violet-200 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs text-violet-700">{t('unexpected.ai.disclaimer')}</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {aiData.map((section, i) => (
                      <div key={i} className={`p-4 ${
                        section.type === 'finding' ? 'bg-orange-50' :
                        section.type === 'action'  ? 'bg-white' :
                        section.type === 'impact'  ? 'bg-blue-50' :
                        'bg-slate-50'
                      }`}>
                        <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                          section.type === 'finding'   ? 'text-orange-700' :
                          section.type === 'action'    ? 'text-slate-600' :
                          section.type === 'impact'    ? 'text-blue-700' :
                          'text-slate-500'
                        }`}>
                          {section.type === 'finding'   && '⚠ '}
                          {section.type === 'action'    && '→ '}
                          {section.type === 'impact'    && '↯ '}
                          {section.type === 'reference' && '📎 '}
                          {section.label}
                        </div>

                        {'items' in section && section.items ? (
                          <ol className="space-y-1.5">
                            {section.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-bold">
                                  {j + 1}
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className={`text-sm leading-relaxed ${
                            section.type === 'reference' ? 'font-mono text-slate-600' : 'text-slate-800'
                          }`}>
                            {'text' in section ? section.text : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer ───────────────────────────────────── */}
          <div className="flex-shrink-0 border-t border-slate-200 p-4 bg-slate-50 rounded-b-3xl sm:rounded-b-2xl flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              {lang === 'ja'
                ? 'TIE・Q&A・AIはリファレンスとして提供されます'
                : 'TIE, Q&A, and AI are provided as reference only'}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {lang === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
