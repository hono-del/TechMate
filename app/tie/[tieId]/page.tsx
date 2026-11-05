'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { UserMenu } from '@/components/common/UserMenu';
import { ArrowLeft, FileText, AlertTriangle, Wrench, CheckCircle2, BookOpen, ExternalLink } from 'lucide-react';

interface TieDetail {
  id: string;
  title: string;
  titleJa: string;
  model: string;
  year: string;
  dtc: string;
  system: string;
  systemJa: string;
  publishedAt: string;
  status: 'published';
  situation: string;
  situationJa: string;
  cause: string;
  causeJa: string;
  fix: string;
  fixJa: string;
  verify: string;
  verifyJa: string;
  chapter: string;
}

const TIE_DETAILS: TieDetail[] = [
  {
    id: 'TIE-2022-0188',
    title: 'P0420 — O2 sensor (B1S2) replacement before catalyst condemnation',
    titleJa: 'P0420 — 触媒交換前にO2センサー（B1S2）を先に確認',
    model: 'Corolla Cross',
    year: '2021–2022',
    dtc: 'P0420',
    system: 'Engine / Exhaust',
    systemJa: 'エンジン / 排気',
    publishedAt: '2022-11-04',
    status: 'published',
    situation: 'P0420 (Catalyst System Efficiency Below Threshold, Bank 1) is set after engine warm-up. Customer reports no drivability issues but MIL is on.',
    situationJa: 'エンジン暖機後にP0420（触媒システム効率低下 Bank 1）が設定。お客様に走行上の問題はないがMIL点灯。',
    cause: 'In 94% of field cases, the downstream O2 sensor (Bank 1, Sensor 2) is producing a steady voltage instead of cycling. The catalyst is typically within spec when sensor is replaced first.',
    causeJa: '現場事例の94%で、後流O2センサー（Bank 1 Sensor 2）の電圧が変動せず固定されている。センサーを先に交換すると触媒は基準内であることが多い。',
    fix: '1. Retrieve freeze-frame data and confirm P0420 is single-trip.\n2. Check downstream O2 sensor waveform with oscilloscope (should cycle 0.1–0.9 V).\n3. If voltage is steady at ≤0.2 V, replace O2 sensor (B1S2) first.\n4. Clear DTCs and perform drive cycle (SM EC-12).\n5. If P0420 returns after sensor replacement, proceed to catalyst evaluation.',
    fixJa: '1. フリーズフレームを確認し、P0420がシングルトリップであることを確認。\n2. オシロスコープで後流O2センサーの波形確認（0.1〜0.9Vの変動が正常）。\n3. 電圧が≤0.2Vで固定の場合はO2センサー（B1S2）を先に交換。\n4. DTCを消去してドライブサイクル実施（SM EC-12参照）。\n5. センサー交換後もP0420が再発する場合は触媒評価へ進む。',
    verify: 'After repair: perform SM §EC-12 drive cycle. Confirm P0420 does not reset. Check O2 sensor waveform again to confirm cycling behavior.',
    verifyJa: '修理後：SM §EC-12のドライブサイクルを実施。P0420がリセットされないことを確認。O2センサー波形を再確認し変動動作を確認。',
    chapter: 'SM §EC-12 — P0420 O2 waveform diagnostic',
  },
  {
    id: 'TIE-2023-214',
    title: 'RH downstream O2 harness chafing on heat shield — intermittent P0141',
    titleJa: 'RH下流O2ハーネスのヒートシールドへの擦れ — 断続的P0141',
    model: 'RAV4',
    year: '2022–2023',
    dtc: 'P0141',
    system: 'Engine / Exhaust',
    systemJa: 'エンジン / 排気',
    publishedAt: '2023-05-17',
    status: 'published',
    situation: 'Intermittent P0141 (O2 Heater Circuit Malfunction, Bank 1 Sensor 2). DTC sets after 20–30 min of driving and clears on restart.',
    situationJa: '走行20〜30分後にP0141（O2ヒーター回路異常 Bank 1 Sensor 2）が断続的に設定され、再起動でクリアされる。',
    cause: 'The right-hand downstream O2 sensor harness routes close to the heat shield bracket. Vibration causes intermittent chafing, breaking the heater circuit wire.',
    causeJa: 'RH後流O2センサーのハーネスがヒートシールドブラケットに近接しており、振動による断続的な擦れでヒーター回路の断線が発生。',
    fix: '1. Inspect RH downstream O2 harness routing near heat shield bracket.\n2. Look for abrasion marks on harness insulation.\n3. If chafing found: reroute harness using supplied clamp kit (Part# 90118-WA154) and add protective sleeve.\n4. Replace O2 sensor only if wire damage is extensive.',
    fixJa: '1. ヒートシールドブラケット付近のRH後流O2ハーネスの経路を確認。\n2. ハーネス絶縁体の擦り傷を確認。\n3. 擦れが確認された場合：付属クランプキット（Part# 90118-WA154）でハーネスを再経路指定し保護スリーブを追加。\n4. 配線の損傷が広範な場合のみO2センサーを交換。',
    verify: 'Road test for 30 min with oscilloscope on O2 heater circuit. Confirm no P0141 recurrence.',
    verifyJa: '走行30分間、オシロスコープでO2ヒーター回路を監視。P0141が再発しないことを確認。',
    chapter: 'SM §EC-14 — O2 Sensor Heater Circuit',
  },
];

// Fallback for TIEs without full detail
function getDetail(id: string): TieDetail | null {
  return TIE_DETAILS.find(d => d.id === id) ?? null;
}

export default function TieDetailPage() {
  const params = useParams();
  const tieId = decodeURIComponent(params.tieId as string);
  const { t, lang, toggleLang } = useLanguage();
  const detail = getDetail(tieId);

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-lg font-bold">{t('tie.list.title')}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-700 border border-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
            <span>{lang === 'en' ? '日本語' : 'English'}</span>
          </button>
          <UserMenu variant="dark" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/tie" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('tie.detail.back')}
        </Link>

        {!detail ? (
          /* ── No detail data: show header only ── */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">{lang === 'ja' ? 'TIEの詳細データがありません。' : 'No detail data for this TIE.'}</p>
            <p className="text-xs mt-1">{tieId}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-slate-500">{detail.id}</span>
                    <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                      {lang === 'ja' ? '公開済' : 'Published'}
                    </span>
                    <span className="text-xs text-slate-400">{detail.publishedAt}</span>
                  </div>
                  <h1 className="text-lg font-bold text-slate-900 leading-snug">
                    {lang === 'ja' ? detail.titleJa : detail.title}
                  </h1>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-0.5">{t('tie.list.col.model')}</div>
                  <div className="text-sm font-semibold text-slate-800">{detail.model} {detail.year}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-0.5">{t('tie.list.col.dtc')}</div>
                  {detail.dtc !== '—' ? (
                    <span className="inline-block bg-orange-100 text-orange-800 border border-orange-200 text-sm font-bold px-2.5 py-0.5 rounded">
                      {detail.dtc}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500">—</span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-0.5">{t('tie.list.col.system')}</div>
                  <div className="text-sm font-semibold text-slate-800">{lang === 'ja' ? detail.systemJa : detail.system}</div>
                </div>
              </div>
            </div>

            {/* Situation */}
            <Section icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} title={t('tie.detail.situation')} color="orange">
              <p className="text-sm text-slate-700 leading-relaxed">
                {lang === 'ja' ? detail.situationJa : detail.situation}
              </p>
            </Section>

            {/* Cause */}
            <Section icon={<FileText className="w-4 h-4 text-violet-500" />} title={t('tie.detail.cause')} color="violet">
              <p className="text-sm text-slate-700 leading-relaxed">
                {lang === 'ja' ? detail.causeJa : detail.cause}
              </p>
            </Section>

            {/* Fix procedure */}
            <Section icon={<Wrench className="w-4 h-4 text-brand-blue" />} title={t('tie.detail.fix')} color="blue">
              <ol className="space-y-2">
                {(lang === 'ja' ? detail.fixJa : detail.fix).split('\n').map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                    <span className="flex-shrink-0 font-bold text-brand-blue">{i + 1}.</span>
                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            </Section>

            {/* Verification */}
            <Section icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />} title={t('tie.detail.verify')} color="teal">
              <p className="text-sm text-slate-700 leading-relaxed">
                {lang === 'ja' ? detail.verifyJa : detail.verify}
              </p>
            </Section>

            {/* Related chapter */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-slate-400 font-medium mb-0.5">{t('tie.detail.chapter')}</div>
                <div className="text-sm font-semibold text-slate-800">{detail.chapter}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>

            {/* Submit similar */}
            <div className="text-center pt-2">
              <Link
                href="/tie/submit"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-blue-700 border border-brand-blue hover:border-blue-700 px-5 py-2.5 rounded-xl transition-colors"
              >
                {t('tie.detail.submit-similar')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: 'orange' | 'violet' | 'blue' | 'teal';
  children: React.ReactNode;
}) {
  const colorMap = {
    orange: 'border-orange-200 bg-orange-50',
    violet: 'border-violet-200 bg-violet-50',
    blue: 'border-blue-200 bg-blue-50',
    teal: 'border-teal-200 bg-teal-50',
  };
  const headerColor = {
    orange: 'text-orange-800',
    violet: 'text-violet-800',
    blue: 'text-blue-800',
    teal: 'text-teal-800',
  };
  return (
    <section className={`rounded-2xl border ${colorMap[color]} shadow-sm overflow-hidden`}>
      <div className="px-5 py-3 border-b border-current/10">
        <h2 className={`text-sm font-bold ${headerColor[color]} flex items-center gap-2`}>
          {icon}{title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
