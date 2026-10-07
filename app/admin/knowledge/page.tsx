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
  Clock,
  Zap,
  Users,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { KNOWLEDGE_GAPS, type KnowledgeGap, type GapStatus } from '@/data/admin/knowledgeGaps';

type EvidenceTab = 'fieldNotes' | 'searchPatterns' | 'qa' | 'existing';

const STATUS_LABELS: Record<GapStatus, string> = {
  new: 'New',
  'under-review': 'Under Review',
  candidate: 'Candidate',
  approved: 'Approved',
  published: 'Published',
};

const STATUS_COLORS: Record<GapStatus, string> = {
  new: 'bg-red-100 text-red-700',
  'under-review': 'bg-orange-100 text-orange-700',
  candidate: 'bg-violet-100 text-violet-700',
  approved: 'bg-teal-light text-teal',
  published: 'bg-green-100 text-green-700',
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-slate-100 text-slate-600',
};

function GapStatusChip({ status }: { status: GapStatus }) {
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function KnowledgeTypeIcon({ type }: { type: 'manual' | 'tie' | 'faq' }) {
  if (type === 'manual') return <FileText className="w-4 h-4 text-brand-blue" />;
  if (type === 'tie') return <Zap className="w-4 h-4 text-orange-500" />;
  return <MessageCircle className="w-4 h-4 text-violet-500" />;
}

function KnowledgePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialIssue = searchParams.get('issue') ?? KNOWLEDGE_GAPS[0].id.replace('gap-', '');

  const findGap = (issueId: string) =>
    KNOWLEDGE_GAPS.find((g) => g.issueId === issueId) ?? KNOWLEDGE_GAPS[0];

  const [selectedGap, setSelectedGap] = useState<KnowledgeGap>(() => findGap(initialIssue));
  const [tab, setTab] = useState<EvidenceTab>('fieldNotes');
  const [gapStatuses, setGapStatuses] = useState<Record<string, GapStatus>>({});
  const [createdTIE, setCreatedTIE] = useState<Record<string, boolean>>({});

  const effectiveStatus = (gap: KnowledgeGap): GapStatus =>
    gapStatuses[gap.id] ?? gap.status;

  const handleCreateTIE = (gapId: string) => {
    setCreatedTIE((prev) => ({ ...prev, [gapId]: true }));
    setGapStatuses((prev) => ({ ...prev, [gapId]: 'candidate' }));
    setTimeout(() => {
      setCreatedTIE((prev) => ({ ...prev, [gapId]: false }));
    }, 3000);
  };

  const TABS: { id: EvidenceTab; label: string; icon: React.ElementType }[] = [
    { id: 'fieldNotes', label: 'Field Notes', icon: FileText },
    { id: 'searchPatterns', label: 'Search Patterns', icon: Search },
    { id: 'qa', label: 'Q&A', icon: MessageCircle },
    { id: 'existing', label: 'Existing Knowledge', icon: BookOpen },
  ];

  return (
    <div className="flex h-full">
      {/* Left: Knowledge Gap Queue */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Knowledge Gap Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">Issues requiring attention</p>
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
                    {gap.priority}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span><b className="text-slate-700">{gap.caseCount}</b> cases</span>
                    <span><b className="text-orange-600">{gap.additionalSearches}</b> searches</span>
                    <span><b className="text-red-500">{gap.unresolvedCount}</b> unresolved</span>
                  </div>
                  <GapStatusChip status={status} />
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
                  {selectedGap.priority} priority
                </span>
                <GapStatusChip status={effectiveStatus(selectedGap)} />
              </div>
              <p className="text-sm text-slate-500">{selectedGap.symptom}</p>
            </div>
          </div>

          {/* Issue Summary Cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Cases', value: selectedGap.caseCount, color: 'text-slate-900' },
              { label: 'Unresolved', value: selectedGap.unresolvedCount, color: 'text-red-600' },
              { label: 'Extra Searches', value: selectedGap.additionalSearches, color: 'text-orange-600' },
              { label: 'Resolution Rate', value: `${selectedGap.resolutionRate}%`, color: 'text-slate-900' },
              { label: 'Avg. Diagnosis', value: `${selectedGap.avgDiagnosisTime} min`, color: 'text-slate-900' },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
                <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Vehicle models */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Affected models:</span>
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
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'text-brand-blue border-b-2 border-brand-blue bg-blue-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setTab(t.id)}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {t.id === 'fieldNotes' && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                      {selectedGap.fieldNotes.length}
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
                    Technicians frequently searched for these terms when working on this issue.
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
                          <span className="text-xs font-bold text-slate-700 w-12 text-right">{sp.count} searches</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-xs text-orange-700">
                    <b>Insight:</b> Technicians are searching beyond the current SM scope. This volume indicates a gap in existing documentation.
                  </div>
                </div>
              )}

              {/* Q&A */}
              {tab === 'qa' && (
                <div className="space-y-3">
                  {selectedGap.relatedQA.map((qa) => (
                    <div key={qa.id} className="border border-slate-100 rounded-lg p-4 flex items-start gap-3">
                      <MessageCircle className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{qa.question}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-slate-400">{qa.views} views</span>
                          {qa.answered ? (
                            <span className="text-xs text-teal font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Answered
                            </span>
                          ) : (
                            <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Unresolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    These documents cover the initial diagnosis but do not address recurring or post-repair scenarios identified in field notes.
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
                <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-1">Suggested Knowledge Improvement</div>
                <h3 className="text-base font-bold text-slate-900">{selectedGap.suggestedImprovement.title}</h3>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-4 pl-12">
              {selectedGap.suggestedImprovement.body}
            </p>

            <div className="pl-12 mb-5">
              <div className="text-xs font-bold text-violet-700 mb-2">Why detected?</div>
              <ul className="space-y-1.5">
                {selectedGap.suggestedImprovement.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <ChevronRight className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pl-12 flex items-center gap-3 flex-wrap">
              {createdTIE[selectedGap.id] ? (
                <div className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  TIE Candidate Created
                </div>
              ) : (
                <button
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  onClick={() => handleCreateTIE(selectedGap.id)}
                >
                  <Zap className="w-4 h-4" />
                  Create TIE Candidate
                </button>
              )}
              <button className="flex items-center gap-2 border border-violet-200 text-violet-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Create FAQ Candidate
              </button>
              <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                <BookOpen className="w-4 h-4" />
                Add to Recommendation Rule
              </button>
              <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors px-2 py-2">
                Mark as Not Relevant
              </button>
            </div>

            {createdTIE[selectedGap.id] && (
              <div className="mt-4 pl-12">
                <div className="bg-teal/10 border border-teal/20 rounded-lg px-4 py-3 text-sm text-teal font-medium">
                  ✓ This knowledge can now be reviewed and reused in future jobs.
                </div>
              </div>
            )}
          </div>

          {/* CTA to Recommendation Performance */}
          {effectiveStatus(selectedGap) === 'candidate' && (
            <div className="bg-white border border-teal/30 rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-teal" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Knowledge is being reviewed</div>
                  <div className="text-xs text-slate-500">Once published, track how it performs in Recommendation Performance.</div>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 text-sm font-bold text-teal hover:underline"
                onClick={() => router.push('/admin/recommendations')}
              >
                View Performance <ChevronRight className="w-4 h-4" />
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
