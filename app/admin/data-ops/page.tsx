'use client';

import { useState } from 'react';
import { CheckCircle2, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { useLanguage } from '@/context/LanguageContext';

type Tab = 'file' | 'map' | 'dtc';

const FILE_ROWS = [
  { row: 2, entity: 'Job', key: 'RO-2026-10-0042', status: 'ok', detail: 'VIN ABC1234567890' },
  { row: 3, entity: 'Job', key: 'RO-2026-10-0043', status: 'error', detail: 'VIN checksum failed' },
  { row: 4, entity: 'Vehicle', key: 'JTEBU17R…', status: 'ok', detail: 'LC300 2023' },
  { row: 5, entity: 'DTC', key: 'P0420-00', status: 'ok', detail: 'Normalized → P0420' },
  { row: 6, entity: 'History', key: 'VIN ABC123… / 2025-03', status: 'ok', detail: 'O2 sensor job' },
];

const MAP_ROWS = [
  { id: 'map-1', kind: 'VIN', source: 'ABC1234567890', target: 'JTEBU17R0N0000001', status: 'unmapped' },
  { id: 'map-2', kind: 'DTC', source: 'P0420-00', target: 'P0420', status: 'mapped' },
  { id: 'map-3', kind: 'Dealer', source: 'TKY-CTR', target: 'dl-tokyo', status: 'mapped' },
  { id: 'map-4', kind: 'RO', source: '0042', target: 'RO-2026-10-0042', status: 'unmapped' },
];

export default function DataOpsPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('file');
  const [ingested, setIngested] = useState(false);
  const [maps, setMaps] = useState(MAP_ROWS);
  const [dtcIn, setDtcIn] = useState('P0420-00');
  const [dtcOut, setDtcOut] = useState<null | { norm: string; hit: boolean }>(null);

  const normalize = () => {
    const raw = dtcIn.trim().toUpperCase();
    if (raw.startsWith('P9999')) setDtcOut({ norm: raw, hit: false });
    else setDtcOut({ norm: raw.replace(/-\d+$/, ''), hit: true });
  };

  return (
    <div className="px-8 py-6 max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t('admin.dataops.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('admin.dataops.subtitle')}</p>
      </div>

      <AdminTabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'file', label: t('admin.dataops.tab.file') },
          { id: 'map', label: t('admin.dataops.tab.map') },
          { id: 'dtc', label: t('admin.dataops.tab.dtc') },
        ]}
      />

      {tab === 'file' && (
        <>
          <div className="border-2 border-dashed border-slate-200 rounded-xl px-6 py-8 text-center bg-white">
            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{t('admin.dataops.drop')}</p>
            <button
              type="button"
              onClick={() => setIngested(true)}
              className="mt-3 bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2 rounded-lg"
            >
              {t('admin.dataops.run')}
            </button>
          </div>
          {ingested && (
            <p className="text-sm text-teal font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {t('admin.dataops.done')}
            </p>
          )}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-2">{t('admin.dataops.col.row')}</th>
                  <th className="px-4 py-2">{t('admin.dataops.col.entity')}</th>
                  <th className="px-4 py-2">{t('admin.dataops.col.key')}</th>
                  <th className="px-4 py-2">{t('admin.dataops.col.status')}</th>
                  <th className="px-4 py-2">{t('admin.dataops.col.detail')}</th>
                </tr>
              </thead>
              <tbody>
                {FILE_ROWS.map((r) => (
                  <tr key={r.row} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs">{r.row}</td>
                    <td className="px-4 py-2">{r.entity}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.key}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        r.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status === 'ok' ? t('admin.dataops.ok') : t('admin.dataops.error')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {tab === 'map' && (
        <>
          <p className="text-sm text-slate-500">{t('admin.dataops.map-body')}</p>
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-2">{t('admin.dataops.col.kind')}</th>
                  <th className="px-4 py-2">{t('admin.dataops.col.source')}</th>
                  <th className="px-4 py-2">{t('admin.dataops.col.target')}</th>
                  <th className="px-4 py-2">{t('admin.dataops.col.status')}</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {maps.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{r.kind}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.source}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.target}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        r.status === 'mapped' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'mapped' ? t('admin.dataops.mapped') : t('admin.dataops.unmapped')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {r.status === 'unmapped' && (
                        <button
                          type="button"
                          onClick={() => setMaps((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'mapped' } : x)))}
                          className="text-xs font-bold text-violet-700 hover:underline"
                        >
                          {t('admin.dataops.resolve')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {tab === 'dtc' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-lg">
          <p className="text-sm text-slate-500">{t('admin.dataops.dtc-body')}</p>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('admin.dataops.dtc-in')}</span>
            <input
              value={dtcIn}
              onChange={(e) => setDtcIn(e.target.value)}
              className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono"
            />
          </label>
          <button
            type="button"
            onClick={normalize}
            className="bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2 rounded-lg"
          >
            {t('admin.dataops.normalize')}
          </button>
          {dtcOut && (
            <div className={`rounded-lg px-3 py-2.5 text-sm ${dtcOut.hit ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
              {dtcOut.hit
                ? t('admin.dataops.dtc-hit').replace('{code}', dtcOut.norm)
                : t('admin.dataops.dtc-miss').replace('{code}', dtcOut.norm)}
            </div>
          )}
          {!dtcOut?.hit && dtcOut && (
            <p className="text-xs text-amber-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> {t('admin.dataops.dtc-flag')}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
