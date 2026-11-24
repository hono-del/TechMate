'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLocalizedExplanationNote, getLocalizedJob } from '@/data/localizedData';
import { getReview, writeReview } from '@/data/jobReview';
import { canCompleteCustomerHandover } from '@/data/users';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle2, Edit3, FileText, Loader2, MessageSquare, Sparkles, ArrowRight,
} from 'lucide-react';

type Phase = 'idle' | 'generating' | 'generated';

const FIELDS = [
  { key: 'customerConcern',    labelKey: 'handover.field.concern'     as const, color: 'blue' },
  { key: 'cause',              labelKey: 'handover.field.cause'       as const, color: 'orange' },
  { key: 'whatWeDid',          labelKey: 'handover.field.what-we-did' as const, color: 'teal' },
  { key: 'result',             labelKey: 'handover.field.result'      as const, color: 'green' },
  { key: 'whatYouShouldKnow',  labelKey: 'handover.field.should-know' as const, color: 'slate' },
  { key: 'nextRecommendation', labelKey: 'handover.field.next-rec'    as const, color: 'violet' },
] as const;

const fieldColorMap: Record<string, string> = {
  blue:   'border-blue-200 bg-blue-50',
  orange: 'border-orange-200 bg-orange-50',
  teal:   'border-teal-200 bg-teal-50',
  green:  'border-green-200 bg-green-50',
  slate:  'border-slate-200 bg-slate-50',
  violet: 'border-violet-200 bg-violet-50',
};

export default function ExplanationNotePage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const job = getLocalizedJob(lang);
  const isReviewer = user ? canCompleteCustomerHandover(user.role) : false;

  const [note, setNote] = useState(() => getLocalizedExplanationNote(lang));
  const [techComment, setTechComment] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const r = getReview(jobId);
    if (r.note) {
      setNote(r.note);
      setPhase('generated');
    } else {
      setNote(getLocalizedExplanationNote(lang));
      setPhase('idle');
    }
    setTechComment(r.techComment);
    setSubmitted(r.status === 'submitted' || r.status === 'reviewed');
    setEditing(null);
  }, [jobId, lang]);

  const persist = (nextNote = note, nextComment = techComment, status: 'draft' | 'submitted' = submitted ? 'submitted' : 'draft') => {
    const prev = getReview(jobId);
    writeReview(jobId, {
      status: status === 'submitted' ? 'submitted' : prev.status === 'reviewed' ? 'reviewed' : status,
      techComment: nextComment,
      saComment: prev.saComment,
      note: nextNote,
    });
  };

  const handleGenerate = () => {
    setPhase('generating');
    setTimeout(() => {
      const draft = getLocalizedExplanationNote(lang);
      setNote(draft);
      setPhase('generated');
      persist(draft, techComment, 'draft');
    }, 1200);
  };

  const saveEdit = (field: string) => {
    const next = { ...note, [field]: editValue };
    setNote(next);
    setEditing(null);
    persist(next, techComment);
  };

  const handleSubmit = () => {
    persist(note, techComment, 'submitted');
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="mb-6 bg-violet-50 border-2 border-violet-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-violet-950">{t('note.banner.title')}</h1>
          <p className="text-sm text-violet-800 mt-1">{t('note.banner.body')}</p>
        </div>
      </div>

      {isReviewer && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-blue-800">{t('note.sa-hint')}</p>
          <button
            onClick={() => router.push(`/job/${jobId}/handover`)}
            className="flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            {t('note.go-handover')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {submitted && (
        <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-green-900">{t('note.submitted.title')}</div>
              <p className="text-sm text-green-800 mt-1">{t('note.submitted.body')}</p>
              {!isReviewer && <p className="text-xs text-green-700 mt-2">{t('note.edit-after')}</p>}
            </div>
          </div>
        </div>
      )}

      {phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <Sparkles className="w-8 h-8 text-violet-500 mx-auto mb-3" />
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-violet-600 to-brand-blue text-white font-bold rounded-2xl hover:opacity-90 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            {t('note.generate.btn')}
          </button>
        </div>
      )}

      {phase === 'generating' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <div className="text-sm font-semibold text-slate-600">{t('note.generate.loading')}</div>
        </div>
      )}

      {phase === 'generated' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-200 uppercase tracking-wide font-semibold">{t('note.banner.title')}</div>
                <div className="text-base font-bold">{job.vehicle.year} {job.vehicle.model} — {job.roNumber}</div>
              </div>
              <span className="text-xs bg-violet-500 px-2.5 py-1 rounded-full text-white font-medium">✦ {t('handover.ai-draft')}</span>
            </div>
            <div className="p-6 space-y-4">
              {FIELDS.map((field, idx) => (
                <div key={field.key} className={`rounded-xl border p-4 ${fieldColorMap[field.color]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{t(field.labelKey)}</span>
                    <button
                      onClick={() => { setEditing(field.key); setEditValue(note[field.key]); }}
                      className="ml-auto p-1 rounded hover:bg-white/50 text-slate-400 hover:text-slate-700"
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
                        <button onClick={() => saveEdit(field.key)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium">
                          {t('btn.save')}
                        </button>
                        <button onClick={() => setEditing(null)} className="text-xs text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                          {t('btn.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed">{note[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-brand-blue" />
              <h2 className="text-sm font-bold text-slate-800">{t('note.comment.title')}</h2>
            </div>
            <textarea
              value={techComment}
              onChange={e => setTechComment(e.target.value)}
              onBlur={() => persist(note, techComment)}
              placeholder={t('note.comment.ph')}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 min-h-[88px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg">
        <p className="text-sm text-slate-500 max-w-xl">{t('note.submit.hint')}</p>
        <div className="flex items-center gap-3">
          {submitted && (
            <button
              onClick={() => router.push('/')}
              className="text-sm font-semibold px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {t('note.go-home')}
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={phase !== 'generated' || submitted || isReviewer}
            className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl shadow-md ${
              phase === 'generated' && !submitted && !isReviewer
                ? 'bg-verified text-white hover:bg-green-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('note.submit')}
          </button>
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
}
