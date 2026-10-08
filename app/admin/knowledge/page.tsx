'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import {
  AlertTriangle,
  FileText,
  MessageCircle,
  BookOpen,
  Search,
  ChevronRight,
  CheckCircle2,
  Zap,
  ArrowRight,
  Sparkles,
  Info,
  Send,
  Users,
} from 'lucide-react';
import { KNOWLEDGE_GAPS, type KnowledgeGap, type GapStatus, type RelatedQA, type QAReply } from '@/data/admin/knowledgeGaps';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import type { TranslationKey } from '@/lib/translations';

type EvidenceTab = 'fieldNotes' | 'searchPatterns' | 'qa' | 'existing';

const STATUS_KEYS: Record<GapStatus, TranslationKey> = {
  new:            'admin.ki.status.new',
  'under-review': 'admin.ki.status.review',
  candidate:      'admin.ki.status.candidate',
  approved:       'admin.ki.status.approved',
  published:      'admin.ki.status.published',
};

const STATUS_COLORS: Record<GapStatus, string> = {
  new:            'bg-red-100 text-red-700',
  'under-review': 'bg-orange-100 text-orange-700',
  candidate:      'bg-violet-100 text-violet-700',
  approved:       'bg-teal-light text-teal',
  published:      'bg-green-100 text-green-700',
};

const PRIORITY_KEYS: Record<string, TranslationKey> = {
  high:   'admin.ki.priority.high',
  medium: 'admin.ki.priority.medium',
  low:    'admin.ki.priority.low',
};

const PRIORITY_COLORS: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low:    'bg-slate-100 text-slate-600',
};

function KnowledgeTypeIcon({ type }: { type: 'manual' | 'tie' | 'faq' }) {
  if (type === 'manual') return <FileText className="w-4 h-4 text-brand-blue" />;
  if (type === 'tie') return <Zap className="w-4 h-4 text-orange-500" />;
  return <MessageCircle className="w-4 h-4 text-violet-500" />;
}

function forumInitials(name: string) {
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function KnowledgePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { canAccess, hasRole, user, dealer } = useAuth();
  const canCreateKnowledge = hasRole('dealer-admin', 'cmc');
  const initialIssue = searchParams.get('issue') ?? KNOWLEDGE_GAPS[0].id.replace('gap-', '');

  const findGap = (issueId: string) =>
    KNOWLEDGE_GAPS.find((g) => g.issueId === issueId) ?? KNOWLEDGE_GAPS[0];

  const [selectedGap, setSelectedGap] = useState<KnowledgeGap>(() => findGap(initialIssue));
  const [tab, setTab] = useState<EvidenceTab>('fieldNotes');
  const [gapStatuses, setGapStatuses] = useState<Record<string, GapStatus>>({});
  const [createdTIE, setCreatedTIE] = useState<Record<string, boolean>>({});
  const [extraThreads, setExtraThreads] = useState<Record<string, RelatedQA[]>>({});
  const [extraReplies, setExtraReplies] = useState<Record<string, QAReply[]>>({});
  const [questionDraft, setQuestionDraft] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [justPosted, setJustPosted] = useState(false);
  const [myPostIds, setMyPostIds] = useState<string[]>([]);

  const effectiveStatus = (gap: KnowledgeGap): GapStatus =>
    gapStatuses[gap.id] ?? gap.status;

  const posterName = user ? (lang === 'ja' ? user.nameJa : user.name) : '';
  const posterDealer = dealer
    ? (lang === 'ja' ? dealer.nameJa : dealer.name)
    : t('auth.dealer.all');

  const mergeThread = (qa: RelatedQA): RelatedQA => {
    const more = extraReplies[qa.id] ?? [];
    const replies = [...qa.replies, ...more];
    return { ...qa, replies, answered: qa.answered || replies.length > 0 };
  };

  const forumThreads: RelatedQA[] = [
    ...(extraThreads[selectedGap.id] ?? []).map(mergeThread),
    ...selectedGap.relatedQA.map(mergeThread),
  ];

  const handlePostQuestion = () => {
    const text = questionDraft.trim();
    if (!text || !user) return;
    const firstLine = text.split('\n')[0].trim();
    const thread: RelatedQA = {
      id: `qa-local-${Date.now()}`,
      question: firstLine.length > 110 ? `${firstLine.slice(0, 107)}…` : firstLine,
      body: text,
      author: posterName,
      dealer: posterDealer,
      date: new Date().toISOString().slice(0, 10),
      answered: false,
      views: 1,
      replies: [],
    };
    setExtraThreads((prev) => ({
      ...prev,
      [selectedGap.id]: [thread, ...(prev[selectedGap.id] ?? [])],
    }));
    setMyPostIds((prev) => [...prev, thread.id]);
    setQuestionDraft('');
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 2500);
  };

  const handlePostAnswer = (qaId: string) => {
    const text = (answerDrafts[qaId] ?? '').trim();
    if (!text || !user) return;
    const reply: QAReply = {
      id: `qa-reply-${Date.now()}`,
      author: posterName,
      dealer: posterDealer,
      date: new Date().toISOString().slice(0, 10),
      text,
      helpfulCount: 0,
    };
    setExtraReplies((prev) => ({
      ...prev,
      [qaId]: [...(prev[qaId] ?? []), reply],
    }));
    setMyPostIds((prev) => [...prev, reply.id]);
    setAnswerDrafts((prev) => ({ ...prev, [qaId]: '' }));
  };

  const handleCreateTIE = (gapId: string) => {
    setCreatedTIE((prev) => ({ ...prev, [gapId]: true }));
    setGapStatuses((prev) => ({ ...prev, [gapId]: 'candidate' }));
    setTimeout(() => {
      setCreatedTIE((prev) => ({ ...prev, [gapId]: false }));
    }, 3000);
  };

  const TABS: { id: EvidenceTab; key: TranslationKey; icon: React.ElementType }[] = [
    { id: 'fieldNotes',    key: 'admin.ki.tab.notes',  icon: FileText },
    { id: 'searchPatterns',key: 'admin.ki.tab.search', icon: Search },
    { id: 'qa',            key: 'admin.ki.tab.qa',     icon: MessageCircle },
    { id: 'existing',      key: 'admin.ki.tab.existing',icon: BookOpen },
  ];

  return (
    <div className="flex h-full">
      {/* Left: Knowledge Gap Queue */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('admin.ki.queue')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t('admin.ki.queue-sub')}</p>
        </div>
        <div className="divide-y divide-slate-50">
          {KNOWLEDGE_GAPS.map((gap) => {
            const active = selectedGap.id === gap.id;
            const status = effectiveStatus(gap);
            return (
              <button
                key={gap.id}
                className={`w-full text-left px-4 py-3.5 transition-colors ${
                  active ? 'bg-brand-blue/5 border-r-2 border-brand-blue' : 'hover:bg-slate-50'
                }`}
                onClick={() => {
                  setSelectedGap(gap);
                  setTab('fieldNotes');
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-sm font-semibold ${active ? 'text-brand-blue' : 'text-slate-800'}`}>
                    {gap.issue}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${PRIORITY_COLORS[gap.priority]}`}>
                    {t(PRIORITY_KEYS[gap.priority])}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span><b className="text-slate-700">{gap.caseCount}</b> {t('admin.ki.sym.cases')}</span>
                    <span><b className="text-orange-600">{gap.additionalSearches}</b> {t('admin.ki.sym.searches')}</span>
                    <span><b className="text-red-500">{gap.unresolvedCount}</b> {t('admin.ki.sym.unresolved')}</span>
                  </div>
                  <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                    {t(STATUS_KEYS[status])}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main: Gap Detail */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{selectedGap.issue}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${PRIORITY_COLORS[selectedGap.priority]}`}>
                  {t(PRIORITY_KEYS[selectedGap.priority])} {t('admin.ki.priority-label')}
                </span>
                <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[effectiveStatus(selectedGap)]}`}>
                  {t(STATUS_KEYS[effectiveStatus(selectedGap)])}
                </span>
              </div>
              <p className="text-sm text-slate-500">{selectedGap.symptom}</p>
            </div>
          </div>

          {/* Issue Summary Cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { key: 'admin.ki.metrics.cases',      value: selectedGap.caseCount,          color: 'text-slate-900' },
              { key: 'admin.ki.metrics.unresolved',  value: selectedGap.unresolvedCount,    color: 'text-red-600' },
              { key: 'admin.ki.metrics.searches',    value: selectedGap.additionalSearches, color: 'text-orange-600' },
              { key: 'admin.ki.metrics.resolution',  value: `${selectedGap.resolutionRate}%`, color: 'text-slate-900' },
              { key: 'admin.ki.metrics.diag',        value: `${selectedGap.avgDiagnosisTime} ${t('admin.kpi.min')}`, color: 'text-slate-900' },
            ].map((m) => (
              <div key={m.key} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
                <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{t(m.key as TranslationKey)}</div>
              </div>
            ))}
          </div>

          {/* Vehicle models */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">{t('admin.ki.affected')}</span>
            {selectedGap.vehicleModels.map((m) => (
              <span key={m} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{m}</span>
            ))}
            {selectedGap.dtc && (
              <span className="text-xs bg-blue-50 text-brand-blue px-2 py-0.5 rounded-full font-bold">{selectedGap.dtc}</span>
            )}
          </div>

          {/* Evidence Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 flex">
              {TABS.map((tabItem) => (
                <button
                  key={tabItem.id}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                    tab === tabItem.id
                      ? 'text-brand-blue border-b-2 border-brand-blue bg-blue-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setTab(tabItem.id)}
                >
                  <tabItem.icon className="w-3.5 h-3.5" />
                  {t(tabItem.key)}
                  {tabItem.id === 'fieldNotes' && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                      {selectedGap.fieldNotes.length}
                    </span>
                  )}
                  {tabItem.id === 'qa' && (
                    <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">
                      {forumThreads.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Field Notes */}
              {tab === 'fieldNotes' && (
                <div className="space-y-3">
                  {selectedGap.fieldNotes.map((note) => (
                    <div key={note.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-white text-[10px] font-bold">
                          {note.author[0]}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{note.author}</span>
                        <span className="text-xs text-slate-400">{note.date}</span>
                        <span className="text-xs text-slate-400 ml-auto">{note.jobId}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{note.text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Patterns */}
              {tab === 'searchPatterns' && (
                <div>
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    {t('admin.ki.search-insight-prefix')}
                  </p>
                  <div className="space-y-2.5">
                    {selectedGap.searchPatterns.map((sp, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700 font-medium">&ldquo;{sp.term}&rdquo;</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${(sp.count / 12) * 80}px` }} />
                          <span className="text-xs font-bold text-slate-700 w-16 text-right">{sp.count} {t('admin.ki.searches')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-xs text-orange-700">
                    <b>{t('admin.ki.search.insight')}</b> {t('admin.ki.search.insight-body')}
                  </div>
                </div>
              )}

              {/* Q&A Forum */}
              {tab === 'qa' && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-lg px-4 py-3">
                    <Users className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-violet-800">{t('admin.ki.qa.banner-title')}</p>
                      <p className="text-xs text-violet-700 mt-0.5 leading-relaxed">{t('admin.ki.qa.banner-body')}</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.ki.qa.ask-label')}</label>
                    <textarea
                      value={questionDraft}
                      onChange={(e) => setQuestionDraft(e.target.value)}
                      rows={3}
                      placeholder={t('admin.ki.qa.ask-placeholder')}
                      className="mt-2 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {posterName} · {posterDealer}
                      </span>
                      <button
                        type="button"
                        disabled={!questionDraft.trim()}
                        onClick={handlePostQuestion}
                        className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        {t('admin.ki.qa.post')}
                      </button>
                    </div>
                    {justPosted && (
                      <p className="mt-2 text-xs text-teal font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('admin.ki.qa.posted')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {forumThreads.map((qa) => (
                      <article key={qa.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {forumInitials(qa.author)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-slate-900">{qa.question}</p>
                                {myPostIds.includes(qa.id) && (
                                  <span className="text-[10px] font-bold uppercase bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded">
                                    {t('admin.ki.qa.you')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {t('admin.ki.qa.asked-by')} {qa.author} · {qa.dealer} · {qa.date}
                              </p>
                              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{qa.body}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-slate-400">{qa.views} {t('admin.ki.views')}</span>
                                <span className="text-xs text-slate-400">{qa.replies.length} {t('admin.ki.qa.replies')}</span>
                                {qa.answered ? (
                                  <span className="text-xs text-teal font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> {t('admin.ki.answered')}
                                  </span>
                                ) : (
                                  <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> {t('admin.ki.qa.awaiting')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 space-y-3">
                          {qa.replies.length === 0 && (
                            <p className="text-xs text-slate-400 italic">{t('admin.ki.qa.no-answers')}</p>
                          )}
                          {qa.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`rounded-lg p-3 ${
                                reply.isBestAnswer
                                  ? 'bg-teal/10 border border-teal/30'
                                  : 'bg-white border border-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-[9px] font-bold">
                                  {forumInitials(reply.author)}
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{reply.author}</span>
                                {myPostIds.includes(reply.id) && (
                                  <span className="text-[10px] font-bold uppercase bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded">
                                    {t('admin.ki.qa.you')}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400">{reply.dealer} · {reply.date}</span>
                                {reply.isBestAnswer && (
                                  <span className="text-[10px] font-bold uppercase bg-teal text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> {t('admin.ki.qa.best')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{reply.text}</p>
                              {reply.helpfulCount > 0 && (
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                  {reply.helpfulCount} {t('admin.ki.qa.helpful')}
                                </p>
                              )}
                            </div>
                          ))}

                          <div>
                            <label className="text-[11px] font-semibold text-slate-500">{t('admin.ki.qa.reply-to')}</label>
                            <div className="mt-1 flex items-end gap-2">
                              <textarea
                                value={answerDrafts[qa.id] ?? ''}
                                onChange={(e) =>
                                  setAnswerDrafts((prev) => ({ ...prev, [qa.id]: e.target.value }))
                                }
                                rows={2}
                                placeholder={t('admin.ki.qa.answer-placeholder')}
                                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                              />
                              <button
                                type="button"
                                disabled={!(answerDrafts[qa.id] ?? '').trim()}
                                onClick={() => handlePostAnswer(qa.id)}
                                className="flex items-center gap-1 bg-navy hover:bg-navy-light disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                              >
                                <Send className="w-3 h-3" />
                                {t('admin.ki.qa.post-answer')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Knowledge */}
              {tab === 'existing' && (
                <div className="space-y-3">
                  {selectedGap.existingKnowledge.map((ek) => (
                    <div key={ek.id} className="border border-slate-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <KnowledgeTypeIcon type={ek.type} />
                        <span className="text-sm font-semibold text-slate-800">{ek.title}</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-amber-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>{ek.coverageNote}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-slate-500 italic mt-2">
                    {t('admin.ki.existing.note')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggested Improvement */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-1">{t('admin.ki.suggest.label')}</div>
                <h3 className="text-base font-bold text-slate-900">{selectedGap.suggestedImprovement.title}</h3>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-4 pl-12">
              {selectedGap.suggestedImprovement.body}
            </p>

            <div className="pl-12 mb-5">
              <div className="text-xs font-bold text-violet-700 mb-2">{t('admin.ki.suggest.why')}</div>
              <ul className="space-y-1.5">
                {selectedGap.suggestedImprovement.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <ChevronRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons — dealer admin / CMC only */}
            {canCreateKnowledge && (
            <div className="pl-12 flex items-center gap-3 flex-wrap">
              {createdTIE[selectedGap.id] ? (
                <div className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('admin.ki.created.title')}
                </div>
              ) : (
                <button
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  onClick={() => handleCreateTIE(selectedGap.id)}
                >
                  <Zap className="w-4 h-4" />
                  {t('admin.ki.action.tie')}
                </button>
              )}
              <button className="flex items-center gap-2 border border-violet-200 text-violet-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
                {t('admin.ki.action.faq')}
              </button>
              <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                <BookOpen className="w-4 h-4" />
                {t('admin.ki.action.rule')}
              </button>
              <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors px-2 py-2">
                {t('admin.ki.action.ignore')}
              </button>
            </div>
            )}

            {createdTIE[selectedGap.id] && (
              <div className="mt-4 pl-12">
                <div className="bg-teal/10 border border-teal/20 rounded-lg px-4 py-3 text-sm text-teal font-medium">
                  {t('admin.ki.created.body')}
                </div>
              </div>
            )}
          </div>

          {/* CTA to Recommendation Performance */}
          {effectiveStatus(selectedGap) === 'candidate' && canAccess('/admin/recommendations') && (
            <div className="bg-white border border-teal/30 rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-teal" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t('admin.ki.flow.title')}</div>
                  <div className="text-xs text-slate-500">{t('admin.ki.flow.body')}</div>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 text-sm font-bold text-teal hover:underline"
                onClick={() => router.push('/admin/recommendations')}
              >
                {t('admin.ki.flow.link')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading...</div>}>
      <KnowledgePageContent />
    </Suspense>
  );
}
