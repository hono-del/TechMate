'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { UserMenu } from '@/components/common/UserMenu';
import { Search, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

interface TieEntry {
  id: string;
  title: string;
  titleJa: string;
  model: string;
  year: string;
  dtc: string;
  system: string;
  systemJa: string;
  publishedAt: string;
}

const TIE_LIST: TieEntry[] = [
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
  },
  {
    id: 'TIE-2023-089',
    title: 'Bluetooth drop on Android 14 — HU sleep cycle workaround',
    titleJa: 'Android 14でBluetooth切断 — HUスリープサイクルの回避手順',
    model: 'RAV4',
    year: '2023',
    dtc: '—',
    system: 'Audio / HU',
    systemJa: 'オーディオ / HU',
    publishedAt: '2023-09-28',
  },
  {
    id: 'TIE-2024-011',
    title: 'P0300 random misfire — carbon buildup on intake port injectors',
    titleJa: 'P0300 ランダムミスファイア — 吸気ポートインジェクターのカーボン堆積',
    model: 'Camry',
    year: '2022–2024',
    dtc: 'P0300',
    system: 'Engine / Fuel',
    systemJa: 'エンジン / 燃料',
    publishedAt: '2024-02-13',
  },
  {
    id: 'TIE-2024-055',
    title: 'TPMS false alarm after tire rotation — ID re-registration procedure',
    titleJa: 'タイヤローテーション後のTPMS誤警告 — ID再登録手順',
    model: 'Land Cruiser 300',
    year: '2022–2024',
    dtc: 'C2111',
    system: 'Chassis / TPMS',
    systemJa: 'シャシー / TPMS',
    publishedAt: '2024-04-03',
  },
  {
    id: 'TIE-2024-102',
    title: 'P0171 lean code — evap purge valve sticking open at low temp',
    titleJa: 'P0171 リーンコード — 低温時にEvapパージバルブが開固着',
    model: 'Yaris Cross',
    year: '2021–2023',
    dtc: 'P0171',
    system: 'Engine / Exhaust',
    systemJa: 'エンジン / 排気',
    publishedAt: '2024-06-19',
  },
  {
    id: 'TIE-2024-178',
    title: 'Rear camera black screen — connector oxidation behind rear finisher',
    titleJa: 'バックカメラ黒画面 — リアフィニッシャー裏コネクターの酸化',
    model: 'Corolla Cross',
    year: '2021–2023',
    dtc: 'U0126',
    system: 'Body / Camera',
    systemJa: 'ボディ / カメラ',
    publishedAt: '2024-08-07',
  },
  {
    id: 'TIE-2025-033',
    title: 'A/C not cooling — EXV calibration lost after 12V battery drop',
    titleJa: 'エアコン冷えない — 12Vバッテリー低下後にEXVキャリブレーション喪失',
    model: 'RAV4 PHEV',
    year: '2023–2024',
    dtc: 'B2799',
    system: 'HVAC / Electrical',
    systemJa: '空調 / 電気',
    publishedAt: '2025-01-22',
  },
  {
    id: 'TIE-2025-091',
    title: 'Lane departure false trigger on curved expressway — camera recalibration note',
    titleJa: '高速カーブでレーン逸脱誤警告 — カメラ再調整に関する注意',
    model: 'Camry',
    year: '2023–2024',
    dtc: '—',
    system: 'ADAS / Camera',
    systemJa: 'ADAS / カメラ',
    publishedAt: '2025-05-14',
  },
  {
    id: 'TIE-2025-144',
    title: 'P0136 — O2 sensor post-repair verification step missing from SM EC-4',
    titleJa: 'P0136 — SM EC-4の修理後確認手順の欠落',
    model: 'Corolla Cross',
    year: '2022',
    dtc: 'P0136',
    system: 'Engine / Exhaust',
    systemJa: 'エンジン / 排気',
    publishedAt: '2025-10-01',
  },
];

const ALL_MODELS = ['All', ...Array.from(new Set(TIE_LIST.map(t => t.model)))];
const ALL_SYSTEMS_EN = ['All', ...Array.from(new Set(TIE_LIST.map(t => t.system)))];
const ALL_SYSTEMS_JA = ['すべて', ...Array.from(new Set(TIE_LIST.map(t => t.systemJa)))];

export default function TieListPage() {
  const { t, lang, toggleLang } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [filterModel, setFilterModel] = useState('All');
  const [filterSystem, setFilterSystem] = useState('All');

  const filtered = useMemo(() => {
    const kw = keyword.toLowerCase();
    return TIE_LIST.filter(tie => {
      if (filterModel !== 'All' && tie.model !== filterModel) return false;
      if (filterSystem !== 'All' && tie.system !== filterSystem) return false;
      if (kw) {
        const haystack = [tie.id, tie.title, tie.titleJa, tie.dtc, tie.model, tie.system, tie.systemJa].join(' ').toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [keyword, filterModel, filterSystem]);

  const systemOptions = lang === 'ja' ? ALL_SYSTEMS_JA : ALL_SYSTEMS_EN;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-lg font-bold">{t('tie.list.title')}</div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tie/submit" className="text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg">
            {t('tie.nav.submit')}
          </Link>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue mb-5">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ja' ? 'ホームへ' : 'Home'}
        </Link>

        <p className="text-sm text-slate-500 mb-6">{t('tie.list.subtitle')}</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Keyword search */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-56">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder={t('tie.list.search.ph')}
              className="text-sm flex-1 outline-none bg-transparent"
            />
          </div>
          {/* Model filter */}
          <select
            value={filterModel}
            onChange={e => setFilterModel(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700"
          >
            {ALL_MODELS.map(m => (
              <option key={m} value={m}>
                {m === 'All' ? (lang === 'ja' ? 'すべての車種' : 'All models') : m}
              </option>
            ))}
          </select>
          {/* System filter */}
          <select
            value={filterSystem}
            onChange={e => setFilterSystem(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700"
          >
            {ALL_SYSTEMS_EN.map((sys, i) => (
              <option key={sys} value={sys}>
                {sys === 'All' ? (lang === 'ja' ? 'すべての系統' : 'All systems') : (lang === 'ja' ? ALL_SYSTEMS_JA[i] : sys)}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{t('tie.list.empty')}</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-bold uppercase text-slate-400 tracking-wide px-4 py-3">{t('tie.list.col.id')}</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 tracking-wide px-4 py-3">{t('tie.list.col.title')}</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 tracking-wide px-4 py-3">{t('tie.list.col.model')}</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 tracking-wide px-4 py-3">{t('tie.list.col.dtc')}</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 tracking-wide px-4 py-3">{t('tie.list.col.system')}</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 tracking-wide px-4 py-3">{t('tie.list.col.date')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(tie => (
                  <tr key={tie.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-slate-600">{tie.id}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
                        {lang === 'ja' ? tie.titleJa : tie.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-700 font-medium">{tie.model}</div>
                      <div className="text-xs text-slate-400">{tie.year}</div>
                    </td>
                    <td className="px-4 py-3">
                      {tie.dtc !== '—' ? (
                        <span className="inline-block bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold px-2 py-0.5 rounded">
                          {tie.dtc}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">
                        {lang === 'ja' ? tie.systemJa : tie.system}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{tie.publishedAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/tie/${tie.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-blue-700"
                      >
                        {lang === 'ja' ? '詳細' : 'View'} <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
              {filtered.length} / {TIE_LIST.length} {lang === 'ja' ? '件' : 'results'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
