'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Image, Mic, Paperclip, Plus, Save, Video, X, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { UserMenu } from '@/components/common/UserMenu';
import { MANUAL_MODELS } from '@/data/manuals';
import {
  readTieQueue,
  suggestFromTitle,
  upsertTie,
  type TieAttachment,
  type TieDriveType,
  type TieMediaKind,
  type TiePowertrain,
  type TieSubmission,
} from '@/data/admin/tieFlow';

const YEARS = ['2021', '2022', '2023', '2024'];

function Req({ children }: { children: string }) {
  return (
    <>
      {children} <span className="text-red-500">*</span>
    </>
  );
}

export default function TieSubmitPage() {
  const { t, lang, toggleLang } = useLanguage();
  const { user, dealer } = useAuth();
  const [id, setId] = useState(`tie-sub-${Date.now()}`);
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('Corolla Cross');
  const [year, setYear] = useState('2022');
  const [system, setSystem] = useState('Engine / Exhaust');
  const [faultType, setFaultType] = useState('Recurring DTC');
  const [dtc, setDtc] = useState('');
  const [chapter, setChapter] = useState('');
  const [problem, setProblem] = useState('');
  const [action, setAction] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [driveType, setDriveType] = useState<TieDriveType>('');
  const [powertrain, setPowertrain] = useState<TiePowertrain>('');
  const [attachments, setAttachments] = useState<TieAttachment[]>([]);
  const [done, setDone] = useState<'draft' | 'submitted' | null>(null);
  const [mine, setMine] = useState<TieSubmission[]>([]);

  const author = user ? (lang === 'ja' ? user.nameJa : user.name) : 'Technician';
  const dealerName = dealer ? (lang === 'ja' ? dealer.nameJa : dealer.name) : '—';

  useEffect(() => {
    const q = readTieQueue();
    setMine(q.filter(x =>
      (x.author === author || x.author === user?.name || x.author === user?.nameJa) &&
      (x.status === 'draft' || x.status === 'correction-requested')
    ));
  }, [author, user?.name, user?.nameJa]);

  const ai = useMemo(() => suggestFromTitle(title), [title]);

  const applyAi = () => {
    setTags(prev => [...new Set([...prev, ...ai.tags])]);
    setFaultType(ai.faultType);
  };

  const loadItem = (item: TieSubmission) => {
    setId(item.id);
    setTitle(item.title);
    setModel(item.model);
    setYear(item.year);
    setSystem(item.system);
    setFaultType(item.faultType);
    setDtc(item.dtc);
    setChapter(item.chapter);
    setProblem(item.problem);
    setAction(item.action);
    setTags(item.tags);
    setDriveType(item.driveType);
    setPowertrain(item.powertrain);
    setAttachments(item.attachments);
    setDone(null);
  };

  const build = (status: 'draft' | 'submitted'): TieSubmission => ({
    id,
    title: title || `${dtc || 'TIE'} ${model}`,
    model,
    year,
    system,
    faultType,
    dtc,
    chapter,
    problem,
    action,
    tags,
    driveType,
    powertrain,
    attachments,
    author,
    dealer: dealerName,
    submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status,
  });

  const saveDraft = () => {
    upsertTie(build('draft'));
    setDone('draft');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertTie(build('submitted'));
    setDone('submitted');
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    setTags(prev => [...new Set([...prev, v])]);
    setTagInput('');
  };

  const addMockMedia = (kind: TieMediaKind) => {
    const name =
      kind === 'image' ? `photo-${attachments.length + 1}.jpg` :
      kind === 'video' ? `clip-${attachments.length + 1}.mp4` :
      `audio-${attachments.length + 1}.wav`;
    setAttachments(prev => [...prev, { kind, name }]);
  };

  const inputCls = 'mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2';

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <div className="text-xs font-bold tracking-widest text-blue-200 uppercase">{t('app.name')}</div>
          <div className="text-lg font-bold">{t('tiesub.title')}</div>
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

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/tie" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('tie.nav.list')}
        </Link>
        <p className="text-sm text-slate-500 mb-6">{t('tiesub.subtitle')}</p>

        {mine.length > 0 && !done && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-xs font-bold uppercase text-amber-800 mb-2">{t('tiesub.continue')}</div>
            <div className="space-y-1">
              {mine.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadItem(item)}
                  className="w-full text-left text-sm text-amber-900 hover:underline"
                >
                  {item.title || t('tiesub.untitled')} · {item.status === 'draft' ? t('tieq.status.draft') : t('tieq.status.correction')}
                </button>
              ))}
            </div>
          </div>
        )}

        {done ? (
          <div className="bg-white border border-green-200 rounded-2xl p-6 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal flex-shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {done === 'draft' ? t('tiesub.draft.title') : t('tiesub.sent.title')}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {done === 'draft' ? t('tiesub.draft.body') : t('tiesub.sent.body')}
              </p>
              <button type="button" onClick={() => { setDone(null); setId(`tie-sub-${Date.now()}`); }} className="mt-3 text-sm font-semibold text-brand-blue">
                {t('tiesub.another')}
              </button>
            </div>
          </div>
        ) : (
          <form className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4" onSubmit={submit}>
            <label className="block text-xs font-bold uppercase text-slate-400">
              <Req>{t('tiesub.form.title')}</Req>
              <input required value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
            </label>

            {title.length >= 4 && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                <div className="text-xs font-bold text-violet-800 mb-1">{t('tiesub.ai.title')}</div>
                <p className="text-xs text-violet-700 mb-2">{t('tiesub.ai.hint')}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ai.tags.map(tag => (
                    <span key={tag} className="text-[11px] bg-white border border-violet-200 text-violet-800 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                  <span className="text-[11px] text-violet-600">{t('tiesub.fault')}: {ai.faultType}</span>
                </div>
                <button type="button" onClick={applyAi} className="text-xs font-bold text-violet-800 hover:underline">
                  {t('tiesub.ai.accept')}
                </button>
              </div>
            )}

            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">{t('tiesub.tags')}</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter(x => x !== tag))} aria-label="remove">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder={t('tiesub.tags.ph')}
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2"
                />
                <button type="button" onClick={addTag} className="px-3 rounded-lg border border-slate-200 text-slate-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold uppercase text-slate-400">
                <Req>{t('vehicle.model')}</Req>
                <select value={model} onChange={e => setModel(e.target.value)} className={inputCls}>
                  {MANUAL_MODELS.map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                <Req>{t('home.manuals.choose-year')}</Req>
                <select value={year} onChange={e => setYear(e.target.value)} className={inputCls}>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                <Req>{t('tiesub.system')}</Req>
                <input required value={system} onChange={e => setSystem(e.target.value)} className={inputCls} />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('tiesub.fault')}
                <input value={faultType} onChange={e => setFaultType(e.target.value)} className={inputCls} />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('tiesub.dtc')}
                <input value={dtc} onChange={e => setDtc(e.target.value)} className={inputCls} />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('tiesub.chapter')} <span className="normal-case font-medium text-slate-400">({t('tiesub.optional')})</span>
                <input value={chapter} onChange={e => setChapter(e.target.value)} className={inputCls} />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('tiesub.drive')}
                <select value={driveType} onChange={e => setDriveType(e.target.value as TieDriveType)} className={inputCls}>
                  <option value="">{t('tie.list.filter.all')}</option>
                  <option value="2WD">2WD</option>
                  <option value="4WD">4WD</option>
                </select>
              </label>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('tiesub.powertrain')}
                <select value={powertrain} onChange={e => setPowertrain(e.target.value as TiePowertrain)} className={inputCls}>
                  <option value="">{t('tie.list.filter.all')}</option>
                  <option value="Gasoline">{t('tiesub.pt.gas')}</option>
                  <option value="Diesel">{t('tiesub.pt.diesel')}</option>
                  <option value="Hybrid">{t('tiesub.pt.hybrid')}</option>
                </select>
              </label>
            </div>

            <label className="block text-xs font-bold uppercase text-slate-400">
              <Req>{t('tiesub.problem')}</Req>
              <textarea
                required
                value={problem}
                onChange={e => setProblem(e.target.value)}
                rows={4}
                placeholder={t('tiesub.problem.ph')}
                className={inputCls}
              />
            </label>

            <label className="block text-xs font-bold uppercase text-slate-400">
              <Req>{t('tiesub.action')}</Req>
              <textarea
                required
                value={action}
                onChange={e => setAction(e.target.value)}
                rows={4}
                placeholder={t('tiesub.action.ph')}
                className={inputCls}
              />
            </label>

            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" /> {t('tiesub.media')}
              </div>
              <p className="text-xs text-slate-400 mb-2">{t('tiesub.media.hint')}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <button type="button" onClick={() => addMockMedia('image')} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                  <Image className="w-3.5 h-3.5" /> {t('tiesub.media.image')}
                </button>
                <button type="button" onClick={() => addMockMedia('video')} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                  <Video className="w-3.5 h-3.5" /> {t('tiesub.media.video')}
                </button>
                <button type="button" onClick={() => addMockMedia('audio')} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                  <Mic className="w-3.5 h-3.5" /> {t('tiesub.media.audio')}
                </button>
              </div>
              {attachments.length > 0 && (
                <ul className="text-xs text-slate-600 space-y-1">
                  {attachments.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                      <span>{f.kind} · {f.name}</span>
                      <button type="button" onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}>
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-slate-50">
                <Save className="w-4 h-4" /> {t('tiesub.draft')}
              </button>
              <button type="submit" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg">
                <Zap className="w-4 h-4" /> {t('tiesub.send')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
