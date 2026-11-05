'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocalizedJob } from '@/data/localizedData';
import { useLanguage } from '@/context/LanguageContext';
import { useWorkflow } from '@/context/WorkflowContext';
import { useAuth } from '@/context/AuthContext';
import {
  History, AlertCircle, Car,
  Calendar, Gauge, ArrowRight, Info,
  Edit3, Check, X, Plus, Trash2,
  CheckCircle2, Wrench, UserCheck,
} from 'lucide-react';

export default function ReceptionPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();
  const { setReceptionAnswers } = useWorkflow();
  const { user } = useAuth();

  const isSA = user?.role === 'service-advisor';
  const isTech = user?.role === 'technician' || user?.role === 'dealer-admin';

  const job = getLocalizedJob(lang);

  // ── Customer Concern editable state ───────────────────────────────────────
  const [concern, setConcern] = useState(job.customerConcern);
  const [symptoms, setSymptoms] = useState<string[]>(job.symptoms);
  const [editingConcern, setEditingConcern] = useState(false);
  const [concernDraft, setConcernDraft] = useState(concern);
  const [newSymptom, setNewSymptom] = useState('');
  const [addingSymptom, setAddingSymptom] = useState(false);
  const concernRef = useRef<HTMLTextAreaElement>(null);

  // ── VIN manual fallback ───────────────────────────────────────────────────
  const [vinFailed, setVinFailed] = useState(false);
  const [manualModel, setManualModel] = useState(job.vehicle.model);
  const [manualYear, setManualYear] = useState(String(job.vehicle.year));

  // ── Handoff state ─────────────────────────────────────────────────────────
  const [handedOff, setHandedOff] = useState(false);

  // Sync when lang changes
  useEffect(() => {
    const localizedJob = getLocalizedJob(lang);
    setConcern(localizedJob.customerConcern);
    setSymptoms(localizedJob.symptoms);
  }, [lang]);

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

  const handleHandoff = () => {
    setHandedOff(true);
  };

  const handleStartDiagnosis = () => {
    setReceptionAnswers({});
    router.push(`/job/${jobId}/diagnosis`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">

      {/* Purpose banner */}
      <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 border ${
        isSA
          ? 'bg-orange-50 border-orange-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        {isSA
          ? <UserCheck className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          : <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        }
        <div>
          <div className={`font-semibold text-sm ${isSA ? 'text-orange-900' : 'text-blue-900'}`}>
            {isSA ? t('reception.sa-banner.title') : t('reception.banner.title')}
          </div>
          <div className={`text-sm mt-0.5 ${isSA ? 'text-orange-700' : 'text-blue-700'}`}>
            {isSA ? t('reception.sa-banner.body') : t('reception.banner.body')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">

        {/* ── LEFT: Vehicle + Concern + Symptoms ──────────────────────────── */}
        <div className="col-span-2 space-y-4">

          {/* Vehicle Summary */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Car className="w-3.5 h-3.5" /> {t('reception.vehicle-summary')}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('vehicle.model')}</span>
                <span className="font-semibold text-slate-900">
                  {vinFailed ? `${manualYear} ${manualModel}` : `${job.vehicle.year} ${job.vehicle.model}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('vehicle.grade')}</span>
                <span className="font-medium text-slate-700">{job.vehicle.grade}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">{t('header.vin')}</span>
                <span className="font-mono text-slate-600 text-xs">{job.vehicle.vin}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">{t('reception.vin.decode')}</span>
                {vinFailed ? (
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{t('reception.vin.fail')}</span>
                ) : (
                  <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{t('reception.vin.ok')}</span>
                )}
              </div>
              {vinFailed && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 space-y-2">
                  <p className="text-xs text-amber-800">{t('reception.vin.help')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={manualModel}
                      onChange={e => setManualModel(e.target.value)}
                      className="text-xs border border-amber-200 rounded-md px-2 py-1.5 bg-white"
                    >
                      {['Corolla Cross', 'RAV4', 'Camry', 'Yaris Cross', 'Land Cruiser 300'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={manualYear}
                      onChange={e => setManualYear(e.target.value)}
                      className="text-xs border border-amber-200 rounded-md px-2 py-1.5 bg-white"
                    >
                      {['2021', '2022', '2023'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setVinFailed(v => !v)}
                className="w-full text-[11px] font-bold text-slate-500 hover:text-navy border border-slate-200 rounded-lg py-1.5"
              >
                {vinFailed ? t('reception.vin.restore') : t('reception.vin.simulate')}
              </button>
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
                  rows={4}
                  className="w-full text-sm border border-blue-300 rounded-lg px-3 py-2 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-2">
                  <button onClick={saveConcern} className="flex items-center gap-1 text-xs font-bold bg-brand-blue text-white px-3 py-1.5 rounded-lg">
                    <Check className="w-3 h-3" /> {t('reception.concern.save')}
                  </button>
                  <button onClick={cancelConcern} className="flex items-center gap-1 text-xs font-bold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg">
                    <X className="w-3 h-3" /> {t('reception.concern.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{concern}</p>
            )}

            {/* Symptom tags */}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="text-xs font-bold text-slate-500 mb-2">{t('reception.symptoms')}</div>
              <div className="flex flex-wrap gap-1.5">
                {symptoms.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-full">
                    {s}
                    <button onClick={() => removeSymptom(i)} className="text-orange-400 hover:text-red-500 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                {addingSymptom ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={newSymptom}
                      onChange={e => setNewSymptom(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSymptom(); } if (e.key === 'Escape') { setAddingSymptom(false); setNewSymptom(''); } }}
                      placeholder={t('reception.symptom.ph')}
                      className="text-xs border border-blue-300 rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                    />
                    <button onClick={addSymptom} className="p-1 text-green-600 hover:text-green-700">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setAddingSymptom(false); setNewSymptom(''); }} className="p-1 text-slate-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingSymptom(true)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-blue border border-dashed border-slate-300 hover:border-brand-blue px-2.5 py-1 rounded-full transition-colors"
                  >
                    <Plus className="w-3 h-3" /> {t('reception.symptom.add')}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Assigned Technician */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5" /> {t('reception.assigned-tech')}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                KY
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {lang === 'ja' ? '山本 健司' : 'Kenji Yamamoto'}
                </div>
                <div className="text-xs text-slate-500">
                  {lang === 'ja' ? 'シニアテクニシャン' : 'Senior Technician'}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── RIGHT: Service History + Action ─────────────────────────────── */}
        <div className="col-span-3 space-y-5">

          {/* Service History */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <History className="w-3.5 h-3.5" /> {t('reception.service-history')}
            </h2>
            <div className="space-y-3">
              {job.serviceHistory.map(sh => (
                <div key={sh.date} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 text-xs text-slate-400 w-20 pt-0.5">{sh.date}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{sh.description}</div>
                    {sh.dtcs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sh.dtcs.map(d => (
                          <span key={d} className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded">{d}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5">{sh.mileage.toLocaleString()} km</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA: SA hands off / Tech starts diagnosis ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            {isSA ? (
              handedOff ? (
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-sm">{t('reception.handoff.done')}</div>
                    <div className="text-xs text-green-600 mt-0.5">
                      {lang === 'ja'
                        ? '山本 健司 に割り当て済み。整備士が診断を引き継ぎます。'
                        : 'Assigned to Kenji Yamamoto. Technician will take over diagnosis.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    {lang === 'ja'
                      ? '顧客情報と訴えの確認が完了したら、担当整備士に引き継いでください。'
                      : 'Once customer info and concern are confirmed, hand off to the assigned technician.'}
                  </p>
                  <button
                    onClick={handleHandoff}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <UserCheck className="w-5 h-5" />
                    {t('reception.handoff.btn')}
                  </button>
                </div>
              )
            ) : isTech ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  {lang === 'ja'
                    ? 'サービスアドバイザーから引き継いだ案件です。診断を開始してください。'
                    : 'This job was handed off by the Service Advisor. Start diagnosis when ready.'}
                </p>
                <button
                  onClick={handleStartDiagnosis}
                  className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <ArrowRight className="w-5 h-5" />
                  {t('reception.start-diagnosis-tech')}
                </button>
              </div>
            ) : (
              /* fallback for cmc or other roles */
              <button
                onClick={handleStartDiagnosis}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                <ArrowRight className="w-5 h-5" />
                {t('reception.start-diagnosis-tech')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
