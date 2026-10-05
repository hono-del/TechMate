'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocalizedExplanationNote, getLocalizedJob } from '@/data/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import {
  Printer, Download, Mail, Smartphone, CheckCircle2,
  Edit3, Star, Sparkles, Loader2, ArrowRight,
  AlertCircle, Wrench, ShieldCheck, Stethoscope,
  ClipboardList, Calendar, Phone, Lightbulb, User,
} from 'lucide-react';

type Phase = 'idle' | 'generating' | 'generated';
type Level = 'simple' | 'standard' | 'detailed';

export default function HandoverPage() {
  const router = useRouter();
  const params = useParams();
  const { t, lang } = useLanguage();
  const [note, setNote] = useState(() => getLocalizedExplanationNote(lang));
  const [editing, setEditing] = useState<string | null>(null);
  const [jobCompleted, setJobCompleted] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState<Level>('standard');

  const job = getLocalizedJob(lang);

  // 言語切替時にnote・phaseをリセット
  useEffect(() => {
    setNote(getLocalizedExplanationNote(lang));
    setPhase('idle');
    setEditing(null);
  }, [lang]);

  const handleGenerate = () => {
    setPhase('generating');
    setTimeout(() => {
      setPhase('generated');
      setLevel('simple'); // 顧客プロファイルに基づきAI推奨レベルを自動選択
    }, 1400);
  };

  const startEdit = (field: string, value: string) => {
    setEditing(field);
    setEditValue(value);
  };

  const saveEdit = (field: string) => {
    setNote(prev => ({ ...prev, [field]: editValue }));
    setEditing(null);
  };

  // ── Information Chain ──────────────────────────────────────────────────────
  const chain = [
    {
      label: t('handover.chain.concern'),
      icon: <AlertCircle className="w-4 h-4" />,
      cardColor: 'border-blue-200 bg-blue-50',
      iconColor: 'bg-blue-100 text-blue-600',
      labelColor: 'text-blue-600',
      items: lang === 'ja'
        ? ['走行中に警告灯が点灯']
        : ['Warning light came on while driving'],
    },
    {
      label: t('handover.chain.diagnosis'),
      icon: <Stethoscope className="w-4 h-4" />,
      cardColor: 'border-orange-200 bg-orange-50',
      iconColor: 'bg-orange-100 text-orange-600',
      labelColor: 'text-orange-600',
      items: lang === 'ja'
        ? ['O2センサーの不具合']
        : ['Oxygen sensor issue'],
    },
    {
      label: t('handover.chain.repair'),
      icon: <Wrench className="w-4 h-4" />,
      cardColor: 'border-teal-200 bg-teal-50',
      iconColor: 'bg-teal-100 text-teal-600',
      labelColor: 'text-teal-600',
      items: lang === 'ja'
        ? ['O2センサーを交換']
        : ['Oxygen sensor replaced'],
    },
    {
      label: t('handover.chain.verification'),
      icon: <ShieldCheck className="w-4 h-4" />,
      cardColor: 'border-green-200 bg-green-50',
      iconColor: 'bg-green-100 text-green-600',
      labelColor: 'text-green-600',
      items: lang === 'ja'
        ? ['DTC クリア完了', '警告灯 消灯', 'ロードテスト 合格']
        : ['DTC cleared', 'Warning light off', 'Road test passed'],
    },
  ];

  // ── SA Guide Steps ─────────────────────────────────────────────────────────
  const saSteps = [
    { num: 1, text: t('handover.sa.1') },
    { num: 2, text: t('handover.sa.2') },
    { num: 3, text: t('handover.sa.3') },
    { num: 4, text: t('handover.sa.4') },
    { num: 5, text: t('handover.sa.5') },
  ];

  // ── Before (technical) content ─────────────────────────────────────────────
  const beforeItems = lang === 'ja'
    ? [
        { label: 'DTC',        value: 'P0420' },
        { label: '不具合',      value: 'O2センサー誤検知（B1S2）' },
        { label: '交換部品',    value: 'A/Fセンサー Assy（89465-12760）' },
        { label: 'DTC確認',     value: 'ロードテスト後 DTC なし' },
        { label: 'I/Mモニター', value: 'Complete（全完了）' },
      ]
    : [
        { label: 'DTC',        value: 'P0420' },
        { label: 'Fault',      value: 'Oxygen sensor malfunction (B1S2)' },
        { label: 'Part',       value: 'A/F sensor Assy replaced (89465-12760)' },
        { label: 'DTC check',  value: 'No DTC after road test' },
        { label: 'I/M status', value: 'All monitors: Complete' },
      ];

  // ── Explanation level content ──────────────────────────────────────────────
  const simpleContent = lang === 'ja'
    ? 'お車のセンサーのひとつが正常に作動していなかったため、警告灯が点灯しました。センサーを交換し、お車が正常に動作していることを確認しました。警告灯は現在消灯しています。'
    : 'We replaced a faulty sensor and confirmed the vehicle is operating normally. The warning light is now off.';

  const detailedContent = lang === 'ja'
    ? '車載診断システムに故障コードP0420が記録されました。これは後流側O2センサー（バンク1センサー2）によって検知された触媒コンバーター効率の低下を示しています。診断確認後、O2センサーアセンブリ（部品番号 89465-12760）を交換しました。修理後の検証には、DTCの消去、ドライブサイクルの実行、およびすべてのI/Mレディネスモニターの完了確認が含まれます。ロードテスト中に追加の故障コードは検出されませんでした。'
    : "The vehicle's on-board diagnostic system stored fault code P0420, indicating reduced catalytic converter efficiency detected by the downstream oxygen sensor (Bank 1, Sensor 2). Following diagnostic confirmation, the O2 sensor assembly (Part No. 89465-12760) was replaced. Post-repair verification included DTC clearance, drive cycle completion, and confirmation of all I/M readiness monitors showing Complete status. No additional fault codes were detected during the road test.";

  // ── Note fields (standard level) ──────────────────────────────────────────
  const fields = [
    { key: 'customerConcern',    labelKey: 'handover.field.concern'     as const, icon: '1', color: 'blue' },
    { key: 'cause',              labelKey: 'handover.field.cause'       as const, icon: '2', color: 'orange' },
    { key: 'whatWeDid',          labelKey: 'handover.field.what-we-did' as const, icon: '3', color: 'teal' },
    { key: 'result',             labelKey: 'handover.field.result'      as const, icon: '4', color: 'green' },
    { key: 'whatYouShouldKnow',  labelKey: 'handover.field.should-know' as const, icon: '5', color: 'slate' },
    { key: 'nextRecommendation', labelKey: 'handover.field.next-rec'    as const, icon: '6', color: 'violet' },
  ] as const;

  const fieldColorMap: Record<string, string> = {
    blue:   'border-blue-200 bg-blue-50',
    orange: 'border-orange-200 bg-orange-50',
    teal:   'border-teal-200 bg-teal-50',
    green:  'border-green-200 bg-green-50',
    slate:  'border-slate-200 bg-slate-50',
    violet: 'border-violet-200 bg-violet-50',
  };
  const iconColorMap: Record<string, string> = {
    blue:   'bg-blue-600 text-white',
    orange: 'bg-orange-500 text-white',
    teal:   'bg-teal-600 text-white',
    green:  'bg-green-600 text-white',
    slate:  'bg-slate-500 text-white',
    violet: 'bg-violet-600 text-white',
  };

  // ── Next actions ────────────────────────────────────────────────────────────
  const nextActions = [
    { icon: <Calendar className="w-4 h-4 text-blue-500" />,   text: t('handover.next-action.1') },
    { icon: <ClipboardList className="w-4 h-4 text-teal-500" />, text: t('handover.next-action.2') },
    { icon: <Lightbulb className="w-4 h-4 text-amber-500" />, text: t('handover.next-action.3') },
    { icon: <Phone className="w-4 h-4 text-slate-500" />,     text: t('handover.next-action.4') },
  ];

  // ── Output actions ─────────────────────────────────────────────────────────
  const outputActions = [
    { labelKey: 'handover.output.print' as const, subKey: 'handover.output.print.sub' as const, icon: <Printer className="w-4 h-4" /> },
    { labelKey: 'handover.output.pdf'   as const, subKey: 'handover.output.pdf.sub'   as const, icon: <Download className="w-4 h-4" /> },
    { labelKey: 'handover.output.email' as const, subKey: 'handover.output.email.sub' as const, icon: <Mail className="w-4 h-4" /> },
    { labelKey: 'handover.output.app'   as const, subKey: 'handover.output.app.sub'   as const, icon: <Smartphone className="w-4 h-4" /> },
  ];

  // ── Job Completed screen ───────────────────────────────────────────────────
  if (jobCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center max-w-md animate-slide-up">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('handover.completed.title')}</h1>
          <p className="text-slate-500 mb-1 font-mono text-sm">{job.roNumber}</p>
          <p className="text-slate-600 mb-8">{job.vehicle.year} {job.vehicle.model} — {job.customerConcern}</p>

          {/* Knowledge items logged */}
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-6 text-left space-y-2">
            <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" />
              {lang === 'ja' ? '記録された情報' : 'Logged to Knowledge Base'}
            </div>
            {[
              lang === 'ja' ? '✓ 診断結果' : '✓ Diagnosis result',
              lang === 'ja' ? '✓ 修理記録' : '✓ Repair result',
              lang === 'ja' ? '✓ 検証結果' : '✓ Verification result',
              lang === 'ja' ? '✓ 顧客説明文' : '✓ Customer explanation',
              lang === 'ja' ? '✓ 使用したナレッジ' : '✓ Used knowledge',
            ].map(item => (
              <div key={item} className="text-sm text-violet-700">{item}</div>
            ))}
          </div>

          <div className="text-xs text-violet-600 mb-8">
            <Star className="w-3.5 h-3.5 inline mr-1 text-violet-500" />
            {t('handover.completed.knowledge-note')}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-brand-blue text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            {t('handover.completed.return')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* ── Information Chain Banner ─────────────────────────────────────── */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[10px]">✓</span>
          {t('handover.chain.title')}
        </div>
        <div className="flex items-stretch gap-0">
          {chain.map((step, idx) => (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              <div className={`flex-1 rounded-xl border p-3 ${step.cardColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${step.iconColor}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wide ${step.labelColor}`}>{step.label}</span>
                </div>
                <ul className="space-y-0.5">
                  {step.items.map(item => (
                    <li key={item} className="text-xs text-slate-700 flex items-start gap-1">
                      <span className="text-slate-400 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {idx < chain.length - 1 && (
                <div className="flex-shrink-0 px-2 text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">

        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <div className="col-span-1 space-y-4">

          {/* SA Suggested Explanation */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-brand-blue" />
              <h2 className="text-sm font-bold text-slate-800">{t('handover.sa-guide.title')}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">{t('handover.sa-guide.subtitle')}</p>
            <div className="space-y-2">
              {saSteps.map(step => (
                <div key={step.num} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {step.num}
                  </span>
                  <span className="text-sm text-slate-700 leading-snug">{step.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Output Actions */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">{t('handover.output-title')}</h2>
            <div className="space-y-2">
              {outputActions.map(action => (
                <button
                  key={action.labelKey}
                  onClick={() => alert(`${t(action.labelKey)} — mock`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 flex-shrink-0">
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{t(action.labelKey)}</div>
                    <div className="text-xs text-slate-400">{t(action.subKey)}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Job Summary */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">{t('handover.summary-title')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('vehicle.model')}</span>
                <span className="font-medium text-slate-800">{job.vehicle.year} {job.vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('header.dtc')}</span>
                <span className="font-bold text-orange-700">P0420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('handover.summary.repair')}</span>
                <span className="font-medium text-slate-800 text-right max-w-[60%]">{job.workPlan!.repairDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('handover.summary.result')}</span>
                <span className="text-green-700 font-semibold">✓ {t('handover.summary.resolved')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('header.technician')}</span>
                <span className="text-slate-700">{job.technician.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('header.sa')}</span>
                <span className="text-slate-700">{job.serviceAdvisor.name}</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <div className="col-span-2 space-y-5">

          {/* ── Phase: IDLE ── Before card + Generate CTA ───────────────────── */}
          {phase === 'idle' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-navy text-white px-6 py-4">
                <div className="text-xs text-blue-200 uppercase tracking-wide font-semibold mb-1">{t('handover.note-title')}</div>
                <div className="text-base font-bold">{job.vehicle.year} {job.vehicle.model} — {job.roNumber}</div>
              </div>

              <div className="p-6 space-y-5">
                {/* Before card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('handover.generate.before-title')}</span>
                    <span className="text-xs text-slate-400 ml-1">— {t('handover.generate.before-note')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    {beforeItems.map(item => (
                      <div key={item.label} className="flex items-start gap-3 text-sm">
                        <span className="font-mono text-xs text-slate-400 w-20 flex-shrink-0 pt-0.5">{item.label}</span>
                        <span className="text-slate-600">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <div className="flex flex-col items-center">
                    <Sparkles className="w-5 h-5 text-violet-500 mb-0.5" />
                    <span className="text-xs text-violet-600 font-semibold">{t('handover.generate.subtitle')}</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Generate CTA */}
                <button
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-violet-600 to-brand-blue text-white font-bold text-base rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  {t('handover.generate.btn')}
                </button>
              </div>
            </div>
          )}

          {/* ── Phase: GENERATING ───────────────────────────────────────────── */}
          {phase === 'generating' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-navy text-white px-6 py-4">
                <div className="text-xs text-blue-200 uppercase tracking-wide font-semibold mb-1">{t('handover.note-title')}</div>
                <div className="text-base font-bold">{job.vehicle.year} {job.vehicle.model} — {job.roNumber}</div>
              </div>
              <div className="p-12 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
                </div>
                <div className="text-sm font-semibold text-slate-600">{t('handover.generate.loading')}</div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Phase: GENERATED ────────────────────────────────────────────── */}
          {phase === 'generated' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
              {/* Note header */}
              <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide font-semibold">{t('handover.note-title')}</div>
                  <div className="text-base font-bold">{job.vehicle.year} {job.vehicle.model} — {job.roNumber}</div>
                  <div className="text-xs text-blue-300 mt-0.5">{t('header.sa')}: {job.serviceAdvisor.name} · {job.scheduledDate}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-violet-500 px-2.5 py-1 rounded-full text-white font-medium">✦ {t('handover.ai-draft')}</span>
                </div>
              </div>

              {/* Explanation Level switcher — sticky so always visible while scrolling */}
              <div className="sticky top-0 z-10 bg-white px-6 pt-4 pb-3 border-b border-slate-100 shadow-sm">
                {/* Customer profile + AI recommendation */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1">
                      <span className="text-xs text-violet-500">✦</span>
                      <span className="text-xs font-bold text-violet-700">{t('handover.recommend.reason')}</span>
                    </div>
                    <span className="text-xs text-slate-400">{t('handover.recommend.basis')}</span>
                  </div>
                </div>

                {/* Level tabs with descriptions */}
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { lv: 'simple'   as Level, recommended: true,  descKey: 'handover.level.simple.desc'   as const },
                    { lv: 'standard' as Level, recommended: false, descKey: 'handover.level.standard.desc' as const },
                    { lv: 'detailed' as Level, recommended: false, descKey: 'handover.level.detailed.desc' as const },
                  ]).map(({ lv, recommended, descKey }) => (
                    <button
                      key={lv}
                      onClick={() => setLevel(lv)}
                      className={`relative flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                        level === lv
                          ? 'border-brand-blue bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      {recommended && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          ✦ {t('handover.level.recommended')}
                        </span>
                      )}
                      <span className={`text-sm font-bold mt-0.5 ${level === lv ? 'text-brand-blue' : 'text-slate-700'}`}>
                        {t(`handover.level.${lv}` as 'handover.level.simple' | 'handover.level.standard' | 'handover.level.detailed')}
                      </span>
                      <span className="text-[11px] text-slate-400 text-center leading-tight">{t(descKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level: SIMPLE */}
              {level === 'simple' && (
                <div className="p-6 animate-slide-up">
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-base text-slate-800 leading-relaxed font-medium">{simpleContent}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center">{t('handover.level.simple')} — {lang === 'ja' ? '2文で伝える簡潔な説明' : 'Concise 2-sentence summary'}</p>
                </div>
              )}

              {/* Level: STANDARD */}
              {level === 'standard' && (
                <div className="p-6 space-y-4 animate-slide-up">
                  {fields.map(field => (
                    <div key={field.key} className={`rounded-xl border p-4 ${fieldColorMap[field.color]}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${iconColorMap[field.color]}`}>
                          {field.icon}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{t(field.labelKey)}</span>
                        <button
                          onClick={() => startEdit(field.key, note[field.key as keyof typeof note])}
                          className="ml-auto p-1 rounded hover:bg-white/50 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {editing === field.key ? (
                        <div className="space-y-2">
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(field.key)}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              {t('btn.save')}
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="text-xs text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              {t('btn.cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 leading-relaxed">{note[field.key as keyof typeof note]}</p>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-400">✦ {t('handover.ai-draft')} · {t('header.sa')}: {job.serviceAdvisor.name}</div>
                    <div className="text-xs text-slate-400">e-library Next</div>
                  </div>
                </div>
              )}

              {/* Level: DETAILED */}
              {level === 'detailed' && (
                <div className="p-6 animate-slide-up">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t('handover.level.detailed')}</div>
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{lang === 'ja' ? '技術的詳細付き' : 'With technical detail'}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{detailedContent}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center">{t('handover.level.detailed')} — {lang === 'ja' ? 'DTC参照を含む詳細説明' : 'Comprehensive explanation with DTC reference'}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Recommended Next Action (shown after generated) ──────────────── */}
          {phase === 'generated' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-slide-up">
              <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-blue" />
                {t('handover.next-action.title')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {nextActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      {action.icon}
                    </div>
                    <span className="text-sm text-slate-700">{action.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Fixed Bottom CTA ────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        {/* Quick switch bar — visible only after generated */}
        {phase === 'generated' && (
          <div className="px-6 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">
              {t('handover.quick-switch')}
            </span>
            <div className="flex gap-1.5">
              {([
                { lv: 'simple'   as Level, recommended: true  },
                { lv: 'standard' as Level, recommended: false },
                { lv: 'detailed' as Level, recommended: false },
              ]).map(({ lv, recommended }) => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    level === lv
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-brand-blue'
                  }`}
                >
                  {recommended && <span className="text-[9px]">✦</span>}
                  {t(`handover.level.${lv}` as 'handover.level.simple' | 'handover.level.standard' | 'handover.level.detailed')}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 ml-1">
              {lang === 'ja'
                ? '— 顧客の質問に応じて即座に切替できます'
                : '— switch instantly based on customer questions'}
            </span>
          </div>
        )}

        <div className="px-6 py-4 flex items-center justify-between">
          {phase !== 'generated' ? (
            <div className="text-sm text-slate-500">
              {lang === 'ja'
                ? '「顧客説明書を生成」を押して引渡し準備を完了してください'
                : 'Press "Generate Explanation Note" to prepare for handover'}
            </div>
          ) : (
            <div className="text-sm text-slate-500">{t('handover.cta-label')}</div>
          )}
          <button
            onClick={() => setJobCompleted(true)}
            disabled={phase !== 'generated'}
            className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-colors shadow-md ${
              phase === 'generated'
                ? 'bg-verified text-white hover:bg-green-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('handover.cta')}
          </button>
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}
