'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getVerifyCheckItems,
  getMissedCheckHints,
  getRepairSummary,
  type VerifyCheckItem,
} from '@/data/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircle2, XCircle, MinusCircle, ArrowRight,
  ShieldCheck, AlertTriangle, Wrench, ChevronRight, ChevronDown,
  RotateCcw, BookOpen, FileSearch, ArrowLeft, X,
  Lightbulb, ExternalLink, List, Wrench as WrenchIcon, FlaskConical,
} from 'lucide-react';

type ItemStatus = 'pending' | 'passed' | 'failed' | 'na';

export default function CheckVerifyPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();
  const ja = lang === 'ja';

  const initialItems = useMemo(() => getVerifyCheckItems(lang), [lang]);
  const [items, setItems] = useState<VerifyCheckItem[]>(initialItems);
  const missedHints = useMemo(() => getMissedCheckHints(lang), [lang]);
  const repairSummary = useMemo(() => getRepairSummary(lang), [lang]);
  const [showRelatedInfo, setShowRelatedInfo] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const toggleCard = (id: string) => setExpandedCard(prev => prev === id ? null : id);

  const updateStatus = (id: string, status: ItemStatus) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: item.status === status ? 'pending' : status } : item
    ));
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const totalCount   = items.length;
  const passedCount  = items.filter(i => i.status === 'passed').length;
  const failedCount  = items.filter(i => i.status === 'failed').length;
  const pendingRequired = items.filter(i => i.required && i.status === 'pending').length;
  const allRequiredPassed = items.filter(i => i.required).every(i => i.status === 'passed' || i.status === 'na');
  const failedItems  = items.filter(i => i.status === 'failed');

  const completionStatus: 'in-progress' | 'additional-check' | 'ready' =
    failedCount > 0 ? 'additional-check' :
    allRequiredPassed  ? 'ready' :
    'in-progress';

  const categories = [...new Set(items.map(i => i.category))];

  // ── Status button ──────────────────────────────────────────────────────────
  const StatusButton = ({
    item, status, icon, label, activeClass,
  }: {
    item: VerifyCheckItem; status: ItemStatus;
    icon: React.ReactNode; label: string; activeClass: string;
  }) => (
    <button
      onClick={() => updateStatus(item.id, status)}
      className={`
        flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all
        ${item.status === status ? activeClass : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
      `}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* ── ① Repair Completed banner ──────────────────────────────────── */}
      <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Performed Repair */}
            <div>
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                {t('verify.performed')}
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {ja ? repairSummary.performedJa : repairSummary.performed}
              </div>
            </div>
            {/* Related DTC */}
            <div>
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                {t('verify.related-dtc')}
              </div>
              <div className="text-sm font-mono font-bold text-slate-800">{repairSummary.dtc}</div>
            </div>
            {/* Repair Status */}
            <div>
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                {t('verify.repair-status')}
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-green-800">
                  {ja ? repairSummary.statusJa : repairSummary.status}
                </span>
              </div>
            </div>
            {/* Parts Replaced */}
            <div>
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                {t('verify.parts-replaced')}
              </div>
              <ul className="space-y-0.5">
                {(ja ? repairSummary.partsReplacedJa : repairSummary.partsReplaced).map((p, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                    <span className="text-green-500 flex-shrink-0">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* ④/⑤ distinction */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs bg-green-200 text-green-900 px-2.5 py-1 rounded-full font-medium">
            ✓ {t('verify.distinction.repair')}
          </span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium border border-blue-200">
            → {t('verify.distinction.verify')}
          </span>
        </div>
      </div>

      {/* ── Fail: Additional Check Required alert ──────────────────────── */}
      {completionStatus === 'additional-check' && (
        <div className="mb-6 bg-orange-50 border-2 border-orange-400 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-orange-900 text-base">{t('verify.status.additional-check')}</div>
              <div className="text-sm text-orange-700 mt-1">
                {failedItems.map(item => (
                  <div key={item.id} className="flex items-start gap-2 mt-1">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{ja ? item.descriptionJa : item.description}</span>
                      {item.failNote && (
                        <span className="ml-2 text-red-700">
                          — {ja ? item.failNoteJa : item.failNote}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-orange-200 pt-4">
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-3">
              {t('verify.fail.action-title')}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push(`/job/${jobId}/diagnosis`)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-300 rounded-xl text-sm font-semibold text-orange-800 hover:bg-orange-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('verify.fail.return-diag')}
              </button>
              <button
                onClick={() => setShowRelatedInfo(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                <FileSearch className="w-4 h-4" />
                {t('verify.fail.review-info')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ready for Handover banner ──────────────────────────────────── */}
      {completionStatus === 'ready' && (
        <div className="mb-6 bg-verified/10 border-2 border-verified rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-verified flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-black text-green-800 mb-1">{t('verify.ready.title')}</div>
          <div className="text-sm text-green-700">{t('verify.ready.sub')}</div>
          <div className="mt-3 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block font-medium">
            ✓ {passedCount}/{totalCount} {t('verify.items-verified')}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left: Status + Progress + Hints ───────────────────────────── */}
        <div className="col-span-1 space-y-4">

          {/* Progress card */}
          <section className={`
            rounded-2xl border-2 shadow-sm p-5
            ${completionStatus === 'ready'             ? 'border-green-400  bg-green-50' :
              completionStatus === 'additional-check'  ? 'border-orange-400 bg-orange-50' :
              'border-blue-300 bg-blue-50'}
          `}>
            <div className="text-xs font-bold uppercase tracking-wide mb-1 text-slate-500">
              {t('verify.progress')}
            </div>
            <div className="text-3xl font-black text-slate-800 mb-1">
              {passedCount} <span className="text-slate-400 text-xl font-normal">/ {totalCount}</span>
            </div>
            <div className="bg-white rounded-full h-3 overflow-hidden border border-slate-200 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionStatus === 'additional-check' ? 'bg-orange-400' : 'bg-verified'
                }`}
                style={{ width: `${(passedCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-green-700 font-medium">✓ {passedCount} {t('verify.passed')}</span>
              {failedCount > 0 && (
                <span className="text-red-600 font-medium">✗ {failedCount} {t('verify.failed')}</span>
              )}
              {pendingRequired > 0 && (
                <span className="text-slate-500">{pendingRequired} {t('verify.required-pending')}</span>
              )}
            </div>
          </section>

          {/* Quick actions */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">{t('verify.quick-actions')}</div>
            <div className="space-y-2">
              <button
                onClick={() => setItems(prev => prev.map(i => ({ ...i, status: 'passed' as ItemStatus })))}
                className="w-full text-xs font-medium py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                ✓ {t('verify.mark-all-passed')}
              </button>
              <button
                onClick={() => setItems(getVerifyCheckItems(lang))}
                className="flex items-center gap-1.5 w-full justify-center text-xs font-medium py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> {t('verify.reset-all')}
              </button>
            </div>
          </section>

          {/* ── Common Missed Checks ──────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-800">{t('verify.missed-checks')}</span>
            </div>
            <div className="divide-y divide-amber-100">
              {missedHints.map(hint => (
                <div key={hint.id} className={`p-4 ${hint.isHighlighted ? 'bg-amber-50/60' : ''}`}>
                  <p className="text-sm text-slate-700 leading-relaxed mb-2">
                    <span className="text-amber-600 font-bold mr-1">⚠</span>
                    {ja ? hint.textJa : hint.text}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-amber-600">
                    <BookOpen className="w-3 h-3" />
                    <span className="font-semibold">{t('verify.missed-why')}</span>
                    <span className="text-slate-400">·</span>
                    <span>{t('verify.missed-source')}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono">{hint.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right: Checklist ───────────────────────────────────────────── */}
        <div className="col-span-2 space-y-4">
          {/* Title + auto-generation note */}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('verify.checklist-title')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('verify.checklist-subtitle')}</p>
          </div>

          {categories.map(category => {
            const catItems = items.filter(i => i.category === category);
            const catPassed = catItems.filter(i => i.status === 'passed').length;
            return (
              <section key={category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700">{category}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {catPassed}/{catItems.length}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      className={`
                        px-5 py-4 transition-colors
                        ${item.status === 'passed' ? 'bg-green-50' :
                          item.status === 'failed' ? 'bg-red-50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        {/* Status icon */}
                        <div className="flex-shrink-0 w-6">
                          {item.status === 'passed' ? <CheckCircle2 className="w-5 h-5 text-verified" /> :
                           item.status === 'failed' ? <XCircle className="w-5 h-5 text-red-500" /> :
                           item.status === 'na'     ? <MinusCircle className="w-5 h-5 text-slate-400" /> :
                           <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
                        </div>

                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${
                            item.status === 'passed' ? 'text-green-800' :
                            item.status === 'failed' ? 'text-red-800' :
                            'text-slate-800'
                          }`}>
                            {ja ? item.descriptionJa : item.description}
                            {item.required && (
                              <span className="ml-2 text-xs text-red-500 font-bold">{t('verify.required-label')}</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <StatusButton
                            item={item} status="passed"
                            activeClass="bg-green-500 text-white"
                            label={t('verify.pass')}
                            icon={<CheckCircle2 className="w-3 h-3" />}
                          />
                          <StatusButton
                            item={item} status="failed"
                            activeClass="bg-red-500 text-white"
                            label={t('verify.fail')}
                            icon={<XCircle className="w-3 h-3" />}
                          />
                          <StatusButton
                            item={item} status="na"
                            activeClass="bg-slate-500 text-white"
                            label={t('verify.na')}
                            icon={<MinusCircle className="w-3 h-3" />}
                          />
                        </div>
                      </div>

                      {/* Fail note */}
                      {item.status === 'failed' && item.failNote && (
                        <div className="mt-2 ml-10 flex items-start gap-2 bg-red-100 rounded-lg px-3 py-2">
                          <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-red-800 font-medium">
                            {ja ? item.failNoteJa : item.failNote}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ── Fixed CTA ─────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg no-print">
        <div className="flex items-center gap-2 text-sm">
          {completionStatus === 'ready' && (
            <span className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> {t('verify.cta-ready')}
            </span>
          )}
          {completionStatus === 'additional-check' && (
            <span className="flex items-center gap-2 text-orange-700 font-semibold">
              <AlertTriangle className="w-4 h-4" /> {failedCount} {t('verify.cta-failed')}
            </span>
          )}
          {completionStatus === 'in-progress' && (
            <span className="text-slate-500">{pendingRequired} {t('verify.cta-pending')}</span>
          )}
        </div>
        <button
          onClick={() => router.push(`/job/${jobId}/handover`)}
          disabled={completionStatus !== 'ready'}
          className={`
            flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-colors shadow-md
            ${completionStatus === 'ready'
              ? 'bg-verified text-white hover:bg-green-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          {t('verify.cta')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-24" />

      {/* ── Related Information Drawer ─────────────────────────────────── */}
      {showRelatedInfo && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setShowRelatedInfo(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">

            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-orange-50 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <FileSearch className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-orange-900 text-base">{t('verify.fail.review-info')}</h2>
                  <p className="text-xs text-orange-700 mt-0.5">
                    {ja
                      ? '以下の情報を参照して問題を解決してください'
                      : 'Review the following to resolve the failed check'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRelatedInfo(false)}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-orange-200 text-orange-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Failed items summary */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
                  {ja ? '不合格項目' : 'Failed Items'}
                </div>
                {failedItems.map(item => (
                  <div key={item.id} className="flex items-start gap-2 text-sm text-red-800 mt-1">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{ja ? item.descriptionJa : item.description}</span>
                      {item.failNote && (
                        <div className="text-xs text-red-600 mt-0.5">{ja ? item.failNoteJa : item.failNote}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Related Manual — expandable */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-700">
                    {ja ? '関連マニュアル' : 'Related Manual'}
                  </span>
                </div>
                <div className="space-y-2">
                  {([
                    {
                      id: 'manual-EM47',
                      section: 'Service Manual §EM-47',
                      title:   ja ? 'O2センサー取り外し・取り付け手順' : 'O2 Sensor Removal / Installation Procedure',
                      overview: ja
                        ? 'バンク1センサー2（下流）のO2センサー取り外し・取り付けに関する公式手順です。トルク規定値・ハーネスルーティング・コネクタ接続を含みます。'
                        : 'Official removal and installation procedure for Bank 1 Sensor 2 (downstream) O2 sensor, including torque spec, harness routing, and connector lock procedure.',
                      keyPoints: ja ? [
                        '必ずエンジンと排気系を完全に冷却してから作業を開始すること',
                        'センサーレンチ SST 09224-00010 を使用すること',
                        'センサーチップ先端2山以内には焼付防止剤を塗布しないこと',
                        'コネクタは「カチッ」とロック音が確認できるまで確実に押し込むこと',
                        '取り付け後にハーネスが排気管に接触していないことを目視確認すること',
                      ] : [
                        'Allow engine and exhaust to cool completely before starting work',
                        'Use SST 09224-00010 (O2 sensor wrench) for removal and installation',
                        'Do NOT apply anti-seize to first 2 threads near sensor tip',
                        'Push connector until audible click confirms lock is engaged',
                        'Visually confirm harness is not contacting exhaust pipe after installation',
                      ],
                      specs: [
                        { label: ja ? '締め付けトルク' : 'Tightening Torque', value: '40 N·m' },
                        { label: 'SST', value: '09224-00010' },
                        { label: ja ? 'コネクタ抵抗' : 'Connector Resistance', value: '< 0.5 Ω' },
                      ],
                      warning: ja
                        ? '排気系は非常に高温になります。作業前に必ず30分以上冷却してください。ハイブリッド車はREADYランプ消灯後も高電圧が残存する場合があります。'
                        : 'Exhaust components reach extreme temperatures. Allow minimum 30 min cool-down before work. On hybrid vehicles, high voltage may remain after READY lamp off.',
                    },
                    {
                      id: 'manual-EC4',
                      section: 'Service Manual §EC-4',
                      title:   ja ? 'P0420 診断フロー — 修理後確認手順' : 'P0420 Diagnostic Flow — Post-Repair Verification',
                      overview: ja
                        ? 'P0420修理完了後のDTC消去・ドライブサイクル・I/Mレディネス確認の公式手順です。この手順を省略すると修理後にP0420が再点灯する可能性があります。'
                        : 'Official procedure for DTC clearing, drive cycle, and I/M readiness verification after P0420 repair. Skipping this may cause P0420 to re-occur after repair.',
                      keyPoints: ja ? [
                        'DTCを消去する前に必ずフリーズフレームデータを記録すること',
                        'DTC消去後は所定のドライブサイクル（高速15分以上）を実施すること',
                        'I/MレディネスモニターがすべてCOMPLETEになっていることを確認すること',
                        'ライブデータでO2センサーの応答波形を必ず確認すること',
                        'P0420が再検出された場合は触媒システムの再評価が必要',
                      ] : [
                        'Record freeze frame data before clearing DTC',
                        'Complete prescribed drive cycle (highway 15 min min.) after clearing',
                        'Confirm all I/M readiness monitors show COMPLETE status',
                        'Verify O2 sensor response waveform with live data',
                        'If P0420 is re-detected, catalyst system re-evaluation is required',
                      ],
                      specs: [
                        { label: ja ? 'B1S1 電圧' : 'B1S1 Voltage', value: '0.1 – 0.9 V (switching)' },
                        { label: ja ? 'B1S2 電圧' : 'B1S2 Voltage', value: '0.5 – 0.7 V (stable)' },
                        { label: ja ? 'ドライブサイクル' : 'Drive Cycle', value: ja ? '高速15分以上' : '15+ min highway' },
                      ],
                      warning: ja
                        ? 'ドライブサイクル中はエンジンが完全に暖機された状態で行うこと。冷間始動直後のデータはI/Mレディネス判定に使用できません。'
                        : 'Perform drive cycle only with engine fully warmed up. Data immediately after cold start is not valid for I/M readiness evaluation.',
                    },
                  ] as const).map(m => {
                    const isOpen = expandedCard === m.id;
                    return (
                      <div key={m.id} className="border border-blue-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleCard(m.id)}
                          className="w-full flex items-start gap-3 p-4 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-mono text-blue-600 mb-0.5">{m.section}</div>
                            <div className="text-sm font-semibold text-slate-800">{m.title}</div>
                          </div>
                          {isOpen
                            ? <ChevronDown className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            : <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-blue-100">
                            {/* Overview */}
                            <div className="p-4 bg-slate-50">
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                                {ja ? '概要' : 'Overview'}
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{m.overview}</p>
                            </div>
                            {/* Key Points */}
                            <div className="p-4 bg-white">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
                                <List className="w-3.5 h-3.5" />
                                {ja ? 'ポイント' : 'Key Points'}
                              </div>
                              <ol className="space-y-1.5">
                                {m.keyPoints.map((kp, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    <span>{kp}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                            {/* Specs */}
                            <div className="p-4 bg-white">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
                                <FlaskConical className="w-3.5 h-3.5" />
                                {ja ? '規定値' : 'Specifications'}
                              </div>
                              <div className="rounded-lg overflow-hidden border border-slate-200">
                                {m.specs.map((sp, i) => (
                                  <div key={i} className={`flex items-center justify-between px-3 py-2 text-sm ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                    <span className="text-slate-600">{sp.label}</span>
                                    <span className="font-mono font-bold text-slate-800">{sp.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Warning */}
                            <div className="p-4 bg-orange-50 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-orange-800 leading-relaxed">{m.warning}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Similar TIE — expandable */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-slate-700">
                    {ja ? '類似TIE事例' : 'Similar TIE Cases'}
                  </span>
                </div>
                <div className="space-y-2">
                  {([
                    {
                      id: 'tie-2022-0188',
                      badge: 'TIE',
                      displayId: 'TIE-2022-0188',
                      title:    ja ? 'P0420 — Corolla Cross 2021–2022 触媒効率低下' : 'P0420 — Catalyst Efficiency Below Threshold (Corolla Cross 2021–2022)',
                      meta:     ja ? '2022年3月発行 | Corolla Cross 2021–2022 | 2ZR-FXE' : 'Published Mar 2022 | Corolla Cross 2021–2022 | 2ZR-FXE',
                      symptoms: ja ? 'O2センサー交換後にP0420が再点灯。走行距離・センサー波形は正常範囲内。' : 'P0420 re-occurs after O2 sensor replacement. Mileage and sensor waveform within normal range.',
                      cause:    ja ? 'DTC消去後のドライブサイクルが不完全で、I/Mレディネスが未完了のまま車両を返却。' : 'Incomplete drive cycle after DTC clearing; vehicle returned with I/M readiness not complete.',
                      action:   ja ? '規定のドライブサイクルを再実施し、I/MレディネスがすべてCOMPLETEになったことを確認してから車両を返却する。' : 'Re-perform prescribed drive cycle and confirm all I/M readiness monitors are COMPLETE before vehicle return.',
                      result:   ja ? 'ドライブサイクル完了後にP0420は再点灯せず。以降の報告なし。' : 'No P0420 re-occurrence after completing drive cycle. No subsequent reports.',
                    },
                    {
                      id: 'tie-T-SER-2024-089',
                      badge: 'TIE',
                      displayId: 'T-SER-2024-089',
                      title:    ja ? 'O2センサーハーネス コネクタ腐食 — 清掃・処置手順' : 'O2 Sensor Harness Connector Corrosion — Cleaning & Treatment',
                      meta:     ja ? '2024年3月発行 | Corolla, Camry, RAV4 | 2ZR / A25A' : 'Published Mar 2024 | Corolla, Camry, RAV4 | 2ZR / A25A',
                      symptoms: ja ? 'O2センサー交換後にP0420またはP0136が再発。コネクタに白・緑の粉状腐食物が確認された。' : 'P0420 or P0136 re-occurs after sensor replacement. White/green powdery corrosion found on connector.',
                      cause:    ja ? '排気トンネル付近の水分侵入によるコネクタ端子の腐食。高抵抗（>0.5Ω）がセンサー劣化と誤認される。' : 'Moisture intrusion near exhaust tunnel causing terminal corrosion. High resistance (>0.5Ω) mimics sensor degradation.',
                      action:   ja ? 'CRC QD電子クリーナーで端子を清掃し、テスターでピン抵抗を確認（基準値<0.5Ω）。重症の場合はコネクタシールキット P/N 82999-52020 を使用。' : 'Clean terminals with CRC QD Electronic Cleaner, verify pin resistance (<0.5Ω). If severe, apply Connector Seal Kit P/N 82999-52020.',
                      result:   ja ? '清掃後にDTCが消去され再発なし。コネクタ保護処置を行った車両の再発報告なし。' : 'DTC cleared after cleaning with no re-occurrence. No repeat reports on vehicles with connector protection applied.',
                    },
                  ] as const).map(tie => {
                    const isOpen = expandedCard === tie.id;
                    const colorMap = {
                      symptoms: { bg: 'bg-slate-50',  border: 'border-slate-200',  label: 'text-slate-500',  arrow: false },
                      cause:    { bg: 'bg-orange-50', border: 'border-orange-200', label: 'text-orange-600', arrow: true  },
                      action:   { bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'text-blue-600',   arrow: true  },
                      result:   { bg: 'bg-green-50',  border: 'border-green-200',  label: 'text-green-600',  arrow: true  },
                    };
                    return (
                      <div key={tie.id} className="border border-amber-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleCard(tie.id)}
                          className="w-full flex items-start gap-3 p-4 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-xs font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">{tie.badge}</span>
                              <span className="text-xs font-mono text-amber-700">{tie.displayId}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-800 leading-snug">{tie.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{tie.meta}</div>
                          </div>
                          {isOpen
                            ? <ChevronDown className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                            : <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />}
                        </button>

                        {isOpen && (
                          <div className="p-4 bg-white space-y-2">
                            {(['symptoms', 'cause', 'action', 'result'] as const).map(key => {
                              const c = colorMap[key];
                              const labelMap = {
                                symptoms: ja ? '症状' : 'Symptoms',
                                cause:    ja ? '原因' : 'Cause',
                                action:   ja ? '処置' : 'Action',
                                result:   ja ? '結果' : 'Result',
                              };
                              return (
                                <div key={key}>
                                  {c.arrow && <div className="text-slate-300 text-xl ml-3 -mt-1 mb-2 leading-none">↓</div>}
                                  <div className={`rounded-xl p-3 border ${c.bg} ${c.border}`}>
                                    <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${c.label}`}>{labelMap[key]}</div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{tie[key]}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Return to Repair Step */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">
                    {ja ? '前の工程に戻る' : 'Return to Previous Step'}
                  </span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => { setShowRelatedInfo(false); router.push(`/job/${jobId}/repair`); }}
                    className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-left group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {ja ? '④ 修理 — 作業手順に戻る' : '④ Repair — Return to Work Procedure'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {ja ? 'O2センサー交換の手順を再確認する' : 'Re-check O2 sensor replacement procedure'}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => { setShowRelatedInfo(false); router.push(`/job/${jobId}/diagnosis`); }}
                    className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-left group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {ja ? '② 診断 — 根本原因の再確認' : '② Diagnosis — Re-confirm Root Cause'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {ja ? 'P0420の診断フローを再確認する' : 'Review P0420 diagnostic flow again'}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <button
                onClick={() => setShowRelatedInfo(false)}
                className="w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
              >
                {ja ? '閉じる' : 'Close'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
