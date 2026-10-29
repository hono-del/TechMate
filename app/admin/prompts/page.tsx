'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, GitBranch, RotateCcw, ShieldAlert } from 'lucide-react';
import {
  PROMPT_VERSIONS,
  SAMPLE_AI_LOGS,
  DEFAULT_ACTIVE_ID,
  readActiveVersionId,
  writeActiveVersionId,
  type PromptStatus,
  type PromptVersion,
} from '@/data/admin/promptVersions';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

const STATUS_KEY: Record<PromptStatus, TranslationKey> = {
  active: 'admin.prompt.status.active',
  candidate: 'admin.prompt.status.candidate',
  previous: 'admin.prompt.status.previous',
  retired: 'admin.prompt.status.retired',
};

const STATUS_COLOR: Record<PromptStatus, string> = {
  active: 'bg-green-100 text-green-700',
  candidate: 'bg-violet-100 text-violet-700',
  previous: 'bg-orange-100 text-orange-700',
  retired: 'bg-slate-100 text-slate-500',
};

type AuditRow = { at: string; action: string; version: string; by: string };

export default function PromptVersionsPage() {
  const { t, lang } = useLanguage();
  const [versions, setVersions] = useState(PROMPT_VERSIONS);
  const [activeId, setActiveId] = useState(DEFAULT_ACTIVE_ID);
  const [selectedId, setSelectedId] = useState(DEFAULT_ACTIVE_ID);
  const [msg, setMsg] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([
    { at: '2026-09-18 11:20', action: 'activate', version: '1.4', by: 'A. Chen' },
    { at: '2026-08-02 09:40', action: 'activate', version: '1.3', by: 'A. Chen' },
  ]);

  useEffect(() => {
    const id = readActiveVersionId();
    setActiveId(id);
    setSelectedId(id);
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        status:
          v.id === id
            ? 'active'
            : v.status === 'active'
              ? 'previous'
              : v.status,
      })),
    );
  }, []);

  const selected = versions.find((v) => v.id === selectedId) ?? versions[0];
  const serving = versions.find((v) => v.id === activeId) ?? selected;

  const stamp = () =>
    new Date().toISOString().slice(0, 16).replace('T', ' ');

  const setServing = (id: string, kind: 'activate' | 'rollback') => {
    const target = versions.find((v) => v.id === id);
    if (!target || target.status === 'retired') return;
    writeActiveVersionId(id);
    setActiveId(id);
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, status: 'active' as const, activatedAt: stamp(), evalGate: v.evalGate === 'pending' ? v.evalGate : 'passed' };
        }
        if (v.status === 'active') return { ...v, status: 'previous' as const };
        return v;
      }),
    );
    setAudit((prev) => [
      { at: stamp(), action: kind, version: target.version, by: 'A. Chen' },
      ...prev,
    ]);
    setMsg(kind === 'rollback' ? t('admin.prompt.rolled') : t('admin.prompt.activated'));
  };

  const markEvalPass = () => {
    setVersions((prev) =>
      prev.map((v) => (v.id === selected.id ? { ...v, evalGate: 'passed' } : v)),
    );
  };

  const canActivate =
    selected.status === 'candidate' && selected.evalGate === 'passed' && selected.id !== activeId;
  const canRollback = selected.status === 'previous' && selected.evalGate === 'passed';

  return (
    <div className="flex h-full">
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('admin.prompt.catalog')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{versions.length} · {serving.promptId}</p>
        </div>
        <div className="divide-y divide-slate-50">
          {versions.map((v) => {
            const on = v.id === selected.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedId(v.id);
                  setMsg(null);
                }}
                className={`w-full text-left px-4 py-3 ${on ? 'bg-violet-50 border-l-2 border-violet-600' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${on ? 'text-violet-800' : 'text-slate-800'}`}>
                    {v.promptId} v{v.version}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${STATUS_COLOR[v.status]}`}>
                    {t(STATUS_KEY[v.status])}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">{v.modelId}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('admin.prompt.title')}</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">{t('admin.prompt.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 bg-navy text-white rounded-xl px-4 py-3">
          <GitBranch className="w-4 h-4 text-white/80 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-white/60 mr-2">{t('admin.prompt.serving')}</span>
            <span className="font-bold">{serving.promptId} v{serving.version}</span>
            <span className="text-white/70 mx-2">·</span>
            <span className="font-mono text-xs">{serving.modelId}</span>
          </div>
        </div>

        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {selected.promptId} v{selected.version}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {lang === 'ja' ? selected.summaryJa : selected.summary}
              </p>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${STATUS_COLOR[selected.status]}`}>
              {t(STATUS_KEY[selected.status])}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Meta label={t('admin.prompt.model')} value={selected.modelId} mono />
            <Meta label={t('admin.prompt.region')} value={selected.region} />
            <Meta label={t('admin.prompt.author')} value={selected.author} />
            <Meta label={t('admin.prompt.activatedAt')} value={selected.activatedAt ?? '—'} />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">{t('admin.prompt.retrieval')}</div>
            <div className="flex flex-wrap gap-2">
              <Chip>{t('admin.prompt.topk')} {selected.topK}</Chip>
              <Chip>{t('admin.prompt.minscore')} {selected.minScore}</Chip>
              <Chip>{t('admin.prompt.index')} {selected.index}</Chip>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{t('admin.prompt.excerpt')}</div>
            <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed">
              {lang === 'ja' ? selected.promptExcerptJa : selected.promptExcerpt}
            </pre>
          </div>

          <div className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2.5">
            <div>
              <div className="text-xs font-bold text-slate-700">{t('admin.prompt.eval')}</div>
              <div className={`text-xs mt-0.5 ${
                selected.evalGate === 'passed' ? 'text-teal' : selected.evalGate === 'failed' ? 'text-red-600' : 'text-orange-600'
              }`}>
                {t(`admin.prompt.eval.${selected.evalGate}` as TranslationKey)}
              </div>
            </div>
            {selected.evalGate === 'pending' && (
              <button
                type="button"
                onClick={markEvalPass}
                className="text-xs font-bold bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700"
              >
                {t('admin.prompt.eval.mark')}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canActivate && (
              <button
                type="button"
                onClick={() => setServing(selected.id, 'activate')}
                className="bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2 rounded-lg"
              >
                {t('admin.prompt.activate')}
              </button>
            )}
            {canRollback && (
              <button
                type="button"
                onClick={() => setServing(selected.id, 'rollback')}
                className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('admin.prompt.rollback')}
              </button>
            )}
            {selected.status === 'retired' && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                {t('admin.prompt.cannot')}
              </p>
            )}
            {selected.status === 'active' && (
              <p className="text-xs text-teal font-medium">{t('admin.prompt.serving')}</p>
            )}
            {selected.status === 'candidate' && selected.evalGate !== 'passed' && (
              <p className="text-xs text-orange-600">{t('admin.prompt.eval.pending')}</p>
            )}
          </div>

          {msg && (
            <p className="text-sm text-teal font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {msg}
            </p>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-bold text-slate-900">{t('admin.prompt.audit')}</h2>
          <ul className="mt-3 space-y-2">
            {audit.map((row, i) => (
              <li key={`${row.at}-${i}`} className="flex items-baseline justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-700">
                  <span className="font-mono text-xs text-slate-400 mr-2">{row.at}</span>
                  {t(row.action === 'rollback' ? 'admin.prompt.audit.rollback' : 'admin.prompt.audit.activate')} v{row.version}
                </span>
                <span className="text-xs text-slate-400">{row.by}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-bold text-slate-900">{t('admin.prompt.logs')}</h2>
          <p className="text-xs text-slate-500 mt-1">{t('admin.prompt.logs-body')}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase text-slate-400 text-left">
                  <th className="pb-2 pr-3">{t('admin.prompt.log.time')}</th>
                  <th className="pb-2 pr-3">{t('admin.prompt.log.job')}</th>
                  <th className="pb-2 pr-3">{t('admin.prompt.log.query')}</th>
                  <th className="pb-2 pr-3">{t('admin.prompt.log.prompt')}</th>
                  <th className="pb-2 pr-3">{t('admin.prompt.log.model')}</th>
                  <th className="pb-2">{t('admin.prompt.log.result')}</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_AI_LOGS.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3 font-mono text-xs text-slate-500 whitespace-nowrap">{log.at}</td>
                    <td className="py-2 pr-3 text-xs text-slate-600 whitespace-nowrap">{log.jobId}</td>
                    <td className="py-2 pr-3 text-slate-800">{log.query}</td>
                    <td className="py-2 pr-3 font-mono text-xs">v{log.promptVersion}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-slate-500">{log.modelId}</td>
                    <td className="py-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        log.outcome === 'refused' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'
                      }`}>
                        {t(log.outcome === 'refused' ? 'admin.prompt.log.outcome.refused' : 'admin.prompt.log.outcome.answered')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border border-slate-100 rounded-lg px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className={`text-sm text-slate-800 mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
      {children}
    </span>
  );
}
