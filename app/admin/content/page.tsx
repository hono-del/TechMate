'use client';

import { useState } from 'react';
import {
  FileText,
  Zap,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Tag,
} from 'lucide-react';
import { CATALOG_UNITS, INGEST_META, type CatalogUnit, type ContentStatus } from '@/data/admin/contentCatalog';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

const STATUS_KEY: Record<ContentStatus, TranslationKey> = {
  draft: 'admin.content.status.draft',
  published: 'admin.content.status.published',
  superseded: 'admin.content.status.superseded',
  withdrawn: 'admin.content.status.withdrawn',
};

const STATUS_COLOR: Record<ContentStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-green-100 text-green-700',
  superseded: 'bg-orange-100 text-orange-700',
  withdrawn: 'bg-red-100 text-red-700',
};

function KindIcon({ kind }: { kind: CatalogUnit['kind'] }) {
  if (kind === 'manual') return <FileText className="w-4 h-4 text-brand-blue" />;
  if (kind === 'tie') return <Zap className="w-4 h-4 text-orange-500" />;
  return <MessageCircle className="w-4 h-4 text-violet-500" />;
}

export default function ContentCatalogPage() {
  const { t } = useLanguage();
  const [units, setUnits] = useState(CATALOG_UNITS);
  const [selectedId, setSelectedId] = useState(CATALOG_UNITS[3].id);
  const [ingestMsg, setIngestMsg] = useState(false);
  const [pipeline, setPipeline] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const selected = units.find((u) => u.id === selectedId) ?? units[0];
  const missingRequired = selected.tags.filter((tag) => tag.required && !tag.present);
  const canPublish = selected.status === 'draft' && missingRequired.length === 0;

  const patchUnit = (id: string, patch: Partial<CatalogUnit>) => {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const approveTag = (tagId: string) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== selected.id) return u;
        const tags = u.tags.map((tag) =>
          tag.id === tagId ? { ...tag, present: true, aiSuggested: false } : tag,
        );
        const stillMissing = tags.some((tag) => tag.required && !tag.present);
        return {
          ...u,
          tags,
          dtc: tagId === 'dtc' ? 'P0420' : u.dtc,
          autoRecommend: u.status === 'published' && !stillMissing,
        };
      }),
    );
    setActionMsg(t('admin.content.approved-tag'));
  };

  const publish = () => {
    if (!canPublish) return;
    patchUnit(selected.id, { status: 'published', autoRecommend: true, version: '1.0', effectiveDate: '2026-10-16' });
    setActionMsg(t('admin.content.published'));
  };

  const supersede = () => {
    patchUnit(selected.id, { status: 'superseded', autoRecommend: false });
    setActionMsg(t('admin.content.superseded-note'));
  };

  const withdraw = () => {
    patchUnit(selected.id, { status: 'withdrawn', autoRecommend: false });
  };

  return (
    <div className="flex h-full">
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('admin.content.queue')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{units.length} units</p>
        </div>
        <div className="divide-y divide-slate-50">
          {units.map((unit) => {
            const active = unit.id === selected.id;
            const blocked = !unit.autoRecommend;
            return (
              <button
                key={unit.id}
                className={`w-full text-left px-4 py-3.5 transition-colors ${
                  active ? 'bg-brand-blue/5 border-r-2 border-brand-blue' : 'hover:bg-slate-50'
                }`}
                onClick={() => {
                  setSelectedId(unit.id);
                  setActionMsg(null);
                }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <KindIcon kind={unit.kind} />
                  <span className={`text-sm font-semibold leading-snug ${active ? 'text-brand-blue' : 'text-slate-800'}`}>
                    {unit.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${STATUS_COLOR[unit.status]}`}>
                    {t(STATUS_KEY[unit.status])}
                  </span>
                  {blocked && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                      {t('admin.content.auto.no')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 max-w-4xl space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('admin.content.title')}</h1>
              <p className="text-sm text-slate-500 mt-1">{t('admin.content.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPipeline(true);
                setIngestMsg(true);
                setTimeout(() => setIngestMsg(false), 4000);
              }}
              className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-bold px-3.5 py-2 rounded-lg"
            >
              <Upload className="w-4 h-4" />
              {t('admin.content.ingest')}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600 flex items-center justify-between gap-3">
            <span>
              {t('admin.content.last')}: {INGEST_META.lastRun} · {t('admin.content.source')}
            </span>
            <span className="text-orange-600 font-medium">1 error in report</span>
          </div>
          {ingestMsg && (
            <div className="bg-teal/10 border border-teal/20 rounded-lg px-4 py-2.5 text-sm text-teal font-medium">
              {t('admin.content.ingested')}
            </div>
          )}
          {pipeline && (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">{t('admin.content.pipeline')} · SYS-037</div>
              <div className="grid grid-cols-4 gap-2">
                {([
                  ['admin.content.stage.pull', 'ok'],
                  ['admin.content.stage.split', 'ok'],
                  ['admin.content.stage.embed', 'ok'],
                  ['admin.content.stage.index', 'err'],
                ] as const).map(([key, st]) => (
                  <div key={key} className={`rounded-lg px-2 py-2 text-center text-[11px] font-bold ${
                    st === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <div>{t(key)}</div>
                    <div className="font-medium mt-0.5">{st === 'ok' ? t('admin.content.stage.ok') : t('admin.content.stage.err')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <KindIcon kind={selected.kind} />
                  <h2 className="text-base font-bold text-slate-900">{selected.title}</h2>
                </div>
                <p className="text-xs text-slate-400">
                  {selected.sourceId} · {t('admin.content.version')} {selected.version}
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLOR[selected.status]}`}>
                {t(STATUS_KEY[selected.status])}
              </span>
            </div>

            {selected.status === 'superseded' && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 text-xs text-orange-800">
                {t('admin.content.superseded-note')} {t('admin.content.replaces')}: {selected.replaces}
              </div>
            )}

            {missingRequired.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {t('admin.content.missing')}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Meta label={t('admin.content.models')} value={selected.models} />
              <Meta label={t('admin.content.dtc')} value={selected.dtc || '—'} />
              <Meta label={t('admin.content.region')} value={selected.region} />
              <Meta label={t('admin.content.lang')} value={selected.language} />
              <Meta label={t('admin.content.system')} value={selected.system} />
              <Meta label={t('admin.content.step')} value={selected.step} />
              <Meta label={t('admin.content.effective')} value={selected.effectiveDate} />
              <Meta
                label={t('admin.content.auto')}
                value={selected.autoRecommend ? t('admin.content.auto.yes') : t('admin.content.blocked')}
              />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> {t('admin.content.meta')}
              </div>
              <div className="space-y-2">
                {selected.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm text-slate-800">{tag.label}</span>
                      {tag.required && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">{t('admin.content.required')}</span>
                      )}
                      {tag.aiSuggested && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-violet-600">{t('admin.content.ai-tags')}</span>
                      )}
                    </div>
                    {tag.present ? (
                      <span className="text-xs text-teal font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> OK
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => approveTag(tag.id)}
                        className="text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg"
                      >
                        {t('admin.content.approve-tag')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {selected.status === 'draft' && (
                <button
                  type="button"
                  disabled={!canPublish}
                  onClick={publish}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-bold px-3.5 py-2 rounded-lg"
                >
                  {t('admin.content.publish')}
                </button>
              )}
              {selected.status === 'published' && (
                <button
                  type="button"
                  onClick={supersede}
                  className="border border-orange-200 text-orange-700 text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-orange-50"
                >
                  {t('admin.content.supersede')}
                </button>
              )}
              {selected.status !== 'withdrawn' && (
                <button
                  type="button"
                  onClick={withdraw}
                  className="text-sm text-slate-400 hover:text-slate-700 px-2 py-2"
                >
                  {t('admin.content.withdraw')}
                </button>
              )}
            </div>
            {actionMsg && (
              <p className="text-sm text-teal font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {actionMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-sm text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}
