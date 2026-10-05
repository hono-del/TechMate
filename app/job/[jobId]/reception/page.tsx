'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocalizedJob, getLocalizedKnowledge, getCustomerQuestions } from '@/data/localizedData';
import { RecommendationCard } from '@/components/knowledge/RecommendationCard';
import { InfoDrawer } from '@/components/knowledge/InfoDrawer';
import { useLanguage } from '@/context/LanguageContext';
import { useWorkflow } from '@/context/WorkflowContext';
import type { KnowledgeItem } from '@/types';
import {
  History, AlertCircle, Car,
  Calendar, Gauge, ArrowRight, Info, Search,
  Edit3, Check, X, Plus, Trash2, MessageSquare,
  CheckCircle2, ChevronDown, ChevronUp, Sparkles,
  Database, Loader2, Shield, BookMarked,
} from 'lucide-react';

export default function ReceptionPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();
  const { setReceptionAnswers } = useWorkflow();

  const job = getLocalizedJob(lang);
  const knowledgeItems = getLocalizedKnowledge('reception', job.dtcs, job.vehicle.model, lang);
  const customerQuestions = getCustomerQuestions(lang);

  // ── Customer Concern editable state ────────────────────────────────────────
  const [concern, setConcern] = useState(job.customerConcern);
  const [symptoms, setSymptoms] = useState<string[]>(job.symptoms);
  const [editingConcern, setEditingConcern] = useState(false);
  const [concernDraft, setConcernDraft] = useState(concern);
  const [newSymptom, setNewSymptom] = useState('');
  const [addingSymptom, setAddingSymptom] = useState(false);
  const concernRef = useRef<HTMLTextAreaElement>(null);

  // ── Answers: { questionId -> option index } ──────────────────────────────
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    [...new Set(customerQuestions.map(q => q.category))]
  );
  const [drawerItem, setDrawerItem] = useState<KnowledgeItem | null>(null);
  const [showAISearch, setShowAISearch] = useState(false);

  // ── Staged reveal ────────────────────────────────────────────────────────
  const [fetching, setFetching] = useState(false);
  const [contextAcquired, setContextAcquired] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleAcquireContext = () => {
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
      setContextAcquired(true);
      setTimeout(() => setShowQuestions(true), 900);
      setTimeout(() => setShowRecommendations(true), 1800);
    }, 1600);
  };

  // Sync concern/symptoms + categories when lang changes
  useEffect(() => {
    const localizedJob = getLocalizedJob(lang);
    setConcern(localizedJob.customerConcern);
    setSymptoms(localizedJob.symptoms);
    const qs = getCustomerQuestions(lang);
    setExpandedCategories([...new Set(qs.map(q => q.category))]);
    setAnswers({});
  }, [lang]);

  const warningItems = knowledgeItems.filter(k => k.type === 'warning');
  const primaryItems = knowledgeItems.filter(k => k.type !== 'warning');

  const categories = [...new Set(customerQuestions.map(q => q.category))];
  const answeredCount = Object.keys(answers).length;
  const totalQ = customerQuestions.length;

  // ── Service History relevance ────────────────────────────────────────────
  // Flag entries whose DTCs share the fuel/emissions domain as the current issue
  const relatedDTCSet = new Set(['P0420', 'P0136', 'P0137', 'P0171', 'P0300', 'P0301', 'P0302']);
  const isRelevantHistory = (sh: typeof job.serviceHistory[0]) =>
    sh.dtcs.some(d => relatedDTCSet.has(d));

  // ── Known Issues & Campaigns mock data ──────────────────────────────────
  const knownIssues = useMemo(() => {
    const ja = lang === 'ja';
    return [
      {
        id: 'ki-1',
        type: 'tie' as const,
        severity: 'warning' as const,
        title: 'TIE #2022-0188',
        subtitle: ja
          ? 'P0420 — Corolla Cross 2021–2022'
          : 'P0420 — Corolla Cross 2021–2022',
        body: ja
          ? '94%のケースでO2センサー（Bank 1 Sensor 2）交換により解決。触媒交換前にセンサーを先に確認すること。'
          : '94% of cases resolved by O2 sensor (B1S2) replacement. Confirm sensor before condemning catalyst.',
        applicability: ja
          ? '対象: Corolla Cross 2021–2022 / DTC P0420'
          : 'Applicable: Corolla Cross 2021–2022 / DTC P0420',
        badge: ja ? 'OEM確認済み' : 'OEM Confirmed',
      },
      {
        id: 'ki-2',
        type: 'campaign' as const,
        severity: 'ok' as const,
        title: ja ? 'キャンペーン・リコール確認' : 'Campaign / Recall Check',
        subtitle: ja ? 'このVINに対する確認' : 'Check for this VIN',
        body: ja
          ? 'このVINに対するアクティブなサービスキャンペーンおよびリコールはありません。'
          : 'No active service campaigns or recalls found for this VIN.',
        applicability: `VIN: ${job.vehicle.vin}`,
        badge: ja ? '確認完了' : 'Verified',
      },
    ];
  }, [lang, job.vehicle.vin]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const saveConcern = () => {
    setConcern(concernDraft.trim() || concern);
    setEditingConcern(false);
  };
  const cancelConcern = () => {
    setConcernDraft(concern);
    setEditingConcern(false);
  };
  const startEditConcern = () => {
    setConcernDraft(concern);
    setEditingConcern(true);
    setTimeout(() => concernRef.current?.focus(), 50);
  };
  const addSymptom = () => {
    const s = newSymptom.trim();
    if (s) setSymptoms(prev => [...prev, s]);
    setNewSymptom('');
    setAddingSymptom(false);
  };
  const removeSymptom = (idx: number) => {
    setSymptoms(prev => prev.filter((_, i) => i !== idx));
  };
  const selectAnswer = (qId: string, optionIdx: number) => {
    setAnswers(prev =>
      prev[qId] === optionIdx
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== qId))
        : { ...prev, [qId]: optionIdx }
    );
  };
  const handleStartDiagnosis = () => {
    setReceptionAnswers(answers);
    router.push(`/job/${jobId}/diagnosis`);
  };
  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* Purpose banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-blue-900 text-sm">{t('reception.banner.title')}</div>
          <div className="text-sm text-blue-700 mt-0.5">{t('reception.banner.body')}</div>
        </div>
      </div>

      {/* ══ PHASE 1: Acquire card ══════════════════════════════════════════════ */}
      {!contextAcquired ? (
        <div className="max-w-lg mx-auto">
          <section className="bg-white rounded-2xl border-2 border-dashed border-blue-300 shadow-sm p-8 text-center">
            <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center ${
              fetching ? 'bg-blue-100 animate-pulse' : 'bg-slate-100'
            }`}>
              {fetching
                ? <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                : <Database className="w-10 h-10 text-slate-400" />
              }
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">{t('reception.acquire.title')}</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t('reception.acquire.subtitle')}</p>
            <button
              onClick={handleAcquireContext}
              disabled={fetching}
              className={`
                w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all text-base
                ${fetching
                  ? 'bg-blue-100 text-blue-400 cursor-wait'
                  : 'bg-brand-blue text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
                }
              `}
            >
              <Database className={`w-5 h-5 ${fetching ? 'animate-pulse' : ''}`} />
              {fetching ? t('reception.acquire.loading') : t('reception.acquire.btn')}
            </button>
          </section>
        </div>

      ) : (
      /* ══ PHASE 2: Context revealed ════════════════════════════════════════ */
      <>
        {/* "No blank start" context-ready banner */}
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-3.5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-green-800 text-sm">{t('reception.context-ready')}</div>
            <div className="text-xs text-green-600 mt-0.5">{t('reception.context-connected')}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── LEFT col-span-1: Vehicle · Concern · Service History · Known Issues ── */}
          <div className="col-span-1 space-y-4">

            {/* Vehicle & Job Summary */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Car className="w-3.5 h-3.5" /> {t('reception.vehicle-summary')}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('vehicle.model')}</span>
                  <span className="font-semibold text-slate-900">{job.vehicle.year} {job.vehicle.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('vehicle.grade')}</span>
                  <span className="font-medium text-slate-700">{job.vehicle.grade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('header.vin')}</span>
                  <span className="font-mono text-slate-600 text-xs">{job.vehicle.vin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> {t('vehicle.mileage')}
                  </span>
                  <span className="font-semibold text-slate-900">{job.vehicle.mileage.toLocaleString('en-US')} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {t('header.received')}
                  </span>
                  <span className="text-slate-700">{job.scheduledDate}</span>
                </div>
                {job.dtcs.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <div className="text-xs text-slate-500 mb-1">{t('header.dtc')}</div>
                    <div className="flex flex-wrap gap-1">
                      {job.dtcs.map(d => (
                        <span key={d} className="bg-orange-100 text-orange-800 border border-orange-300 text-sm font-bold px-2.5 py-0.5 rounded-lg">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Customer Concern (editable) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" /> {t('header.concern')}
                </h2>
                {!editingConcern && (
                  <button onClick={startEditConcern} className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-blue transition-colors">
                    <Edit3 className="w-3 h-3" /> {t('reception.concern.edit')}
                  </button>
                )}
              </div>

              {editingConcern ? (
                <div className="space-y-2">
                  <textarea
                    ref={concernRef}
                    value={concernDraft}
                    onChange={e => setConcernDraft(e.target.value)}
                    rows={3}
                    placeholder={t('reception.concern.placeholder')}
                    className="w-full text-sm border border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-blue-50 leading-relaxed"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveConcern} className="flex items-center gap-1 text-xs bg-brand-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-semibold">
                      <Check className="w-3.5 h-3.5" /> {t('reception.concern.save')}
                    </button>
                    <button onClick={cancelConcern} className="flex items-center gap-1 text-xs text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100">
                      <X className="w-3.5 h-3.5" /> {t('reception.concern.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <p onClick={startEditConcern} className="text-sm font-medium text-slate-900 leading-relaxed mb-2 cursor-text hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors border border-transparent hover:border-slate-200">
                  &ldquo;{concern}&rdquo;
                </p>
              )}

              {/* Symptoms */}
              <div className="space-y-1.5">
                {symptoms.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                    <span className="text-sm text-slate-600 flex-1">{s}</span>
                    <button onClick={() => removeSymptom(i)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {addingSymptom ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      autoFocus
                      value={newSymptom}
                      onChange={e => setNewSymptom(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addSymptom(); if (e.key === 'Escape') setAddingSymptom(false); }}
                      placeholder={t('reception.symptoms.placeholder')}
                      className="flex-1 text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button onClick={addSymptom} className="text-xs bg-slate-700 text-white px-2 py-1 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setAddingSymptom(false); setNewSymptom(''); }} className="text-xs text-slate-400 px-2 py-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => setAddingSymptom(true)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-blue transition-colors mt-0.5">
                    <Plus className="w-3.5 h-3.5" /> {t('reception.symptoms.add')}
                  </button>
                )}
              </div>
            </section>

            {/* ③ Service History — with relevance highlighting */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> {t('reception.service-history')}
              </h2>
              <div className="space-y-2.5">
                {job.serviceHistory.map(sh => {
                  const relevant = isRelevantHistory(sh);
                  return (
                    <div key={sh.id} className={`rounded-xl p-3 border transition-colors ${
                      relevant
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}>
                      {/* Relevance badge */}
                      {relevant && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {t('reception.history.relevant')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">{sh.date}</span>
                        <span className="text-xs text-slate-400">{sh.mileage.toLocaleString('en-US')} km</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-1">{sh.description}</p>
                      {sh.dtcs.length > 0 && (
                        <div className="flex gap-1 mb-1">
                          {sh.dtcs.map(d => (
                            <span key={d} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">{d}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-green-700 font-medium">✓ {sh.result}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ④ Known Issues & Campaigns */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-500" /> {t('reception.known-issues')}
              </h2>
              <p className="text-xs text-slate-400 mb-3">{t('reception.known-issues.subtitle')}</p>
              <div className="space-y-2.5">
                {knownIssues.map(ki => (
                  <div key={ki.id} className={`rounded-xl p-3 border ${
                    ki.severity === 'warning'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {ki.type === 'tie'
                          ? <span className="text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded-full">TIE</span>
                          : <span className="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full">
                              {lang === 'ja' ? 'キャンペーン' : 'Campaign'}
                            </span>
                        }
                        <span className={`text-xs font-semibold ${ki.severity === 'warning' ? 'text-blue-800' : 'text-green-800'}`}>
                          {ki.title}
                        </span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        ki.severity === 'warning'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {ki.severity === 'ok' ? '✓ ' : ''}{ki.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{ki.subtitle}</p>
                    <p className={`text-sm leading-relaxed ${ki.severity === 'warning' ? 'text-blue-800' : 'text-green-800'}`}>
                      {ki.body}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">{ki.applicability}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT col-span-2: First Checks + Recommended Info ───────────── */}
          <div className="col-span-2 space-y-5">

            {!showQuestions ? (
              <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center p-8">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                <p className="text-slate-500 font-medium">{t('reception.acquire.wait-guidance')}</p>
              </div>
            ) : (
              <>
                {/* ⑤ Recommended First Checks — reframed customer Q&A */}
                <section className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">{t('reception.first-checks')}</div>
                        <div className="text-blue-100 text-xs mt-0.5">{t('reception.first-checks.subtitle')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white text-sm font-bold">{answeredCount}/{totalQ}</div>
                        <div className="text-blue-200 text-xs">{t('reception.confirm-q.progress')}</div>
                      </div>
                      <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${(answeredCount / totalQ) * 100}%` }}
                        />
                      </div>
                      <span className="bg-violet-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {t('reception.confirm-q.badge')}
                      </span>
                    </div>
                  </div>

                  {/* Questions by category */}
                  <div className="divide-y divide-slate-100">
                    {categories.map(cat => {
                      const qs = customerQuestions.filter(q => q.category === cat);
                      const catAnswered = qs.filter(q => answers[q.id] !== undefined).length;
                      const isExpanded = expandedCategories.includes(cat);
                      const allDone = catAnswered === qs.length;

                      return (
                        <div key={cat}>
                          <button
                            onClick={() => toggleCategory(cat)}
                            className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-700">{cat}</span>
                              {allDone && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> {t('reception.confirm-q.checked')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{catAnswered}/{qs.length}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="divide-y divide-slate-50">
                              {qs.map(q => {
                                const isAnswered = answers[q.id] !== undefined;
                                return (
                                  <div key={q.id} className={`px-5 py-4 transition-colors ${isAnswered ? 'bg-green-50' : 'bg-white'}`}>
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        {isAnswered
                                          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                          : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                        }
                                      </div>
                                      <span className={`text-sm leading-relaxed font-medium ${isAnswered ? 'text-green-900' : 'text-slate-800'}`}>
                                        {q.question}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 ml-8">
                                      {q.options.map((opt: string, idx: number) => {
                                        const isSelected = answers[q.id] === idx;
                                        return (
                                          <button
                                            key={opt}
                                            onClick={() => selectAnswer(q.id, idx)}
                                            className={`
                                              text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150
                                              ${isSelected
                                                ? 'bg-green-500 border-green-500 text-white shadow-sm scale-105'
                                                : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                                              }
                                            `}
                                          >
                                            {isSelected && <span className="mr-1">✓</span>}
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {isAnswered && (
                                      <div className="ml-8 mt-2 text-xs text-green-700 font-medium">
                                        {lang === 'ja' ? '回答：' : 'Answer: '}
                                        <span className="bg-green-100 px-2 py-0.5 rounded-full">{q.options[answers[q.id]]}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {lang === 'ja'
                        ? '車両情報・DTC・整備履歴・既知事例から自動生成。選択肢をタップして顧客の回答を記録してください。'
                        : 'Auto-generated from vehicle info, DTCs, service history, and known issues. Tap an option to record the answer.'}
                    </span>
                  </div>
                </section>

                {/* Recommended Information */}
                {showRecommendations ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-slate-900">{t('reception.recommended-info')}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full font-medium">
                          ✦ {t('reception.auto-matched')}: {job.vehicle.model} + DTC {job.dtcs.join(', ')}
                        </span>
                        <button
                          onClick={() => setShowAISearch(!showAISearch)}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-blue border border-slate-200 rounded-lg px-3 py-1.5 hover:border-blue-300 transition-colors"
                        >
                          <Search className="w-3.5 h-3.5" />
                          {t('reception.need-more')}
                        </button>
                      </div>
                    </div>

                    {showAISearch && (
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-violet-600 text-sm font-bold">✦ {t('ai.search-fallback')}</span>
                          <span className="text-xs text-violet-500">{t('ai.context-applied')}</span>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" placeholder={t('ai.placeholder')} className="flex-1 text-sm border border-violet-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400" />
                          <button className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">{t('btn.search')}</button>
                        </div>
                        <p className="text-xs text-violet-500 mt-2">✦ {t('ai.disclaimer')}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {warningItems.map(item => (
                        <RecommendationCard key={item.id} item={item} onOpen={setDrawerItem} />
                      ))}
                      {primaryItems.map(item => (
                        <RecommendationCard key={item.id} item={item} onOpen={setDrawerItem} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center p-8">
                    <Sparkles className="w-8 h-8 text-violet-300 mb-3 animate-pulse" />
                    <p className="text-slate-500 font-medium">{t('reception.recommended-info')}</p>
                    <p className="text-xs text-slate-400 mt-1">{t('reception.acquire.wait-guidance')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </>
      )}

      {/* ⑥ CTA — "Start Diagnosis, context carries forward" */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="text-sm">
          {!contextAcquired ? (
            <span className="text-slate-400">
              {lang === 'ja' ? 'まず受付を開始してください' : 'Start reception first to proceed'}
            </span>
          ) : !showRecommendations ? (
            <span className="text-slate-400">{t('reception.acquire.wait-guidance')}</span>
          ) : answeredCount === totalQ && totalQ > 0 ? (
            <span className="text-green-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {lang === 'ja' ? `全${totalQ}件の確認事項に回答済み` : `All ${totalQ} first checks answered`}
            </span>
          ) : (
            <div>
              <div className="font-medium text-slate-700">{t('reception.cta-label')}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('reception.cta.context-carry')}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleStartDiagnosis}
          disabled={!contextAcquired || !showRecommendations}
          className={`
            flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-colors shadow-md
            ${contextAcquired && showRecommendations
              ? 'bg-brand-blue text-white hover:bg-blue-700'
              : 'bg-blue-200 text-blue-400 cursor-not-allowed'}
          `}
        >
          {t('reception.cta')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-20" />
      <InfoDrawer item={drawerItem} onClose={() => setDrawerItem(null)} />
    </div>
  );
}
