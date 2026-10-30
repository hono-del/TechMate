'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type Ticket = {
  id: string;
  from: string;
  subject: string;
  subjectJa: string;
  body: string;
  bodyJa: string;
  at: string;
  status: 'open' | 'replied';
};

const SEED: Ticket[] = [
  {
    id: 'fb-01',
    from: 'owner@example.co.jp',
    subject: 'Check engine light returned after pickup',
    subjectJa: '引渡し後に警告灯が再点灯',
    body: 'Vehicle: Corolla Cross 2022. Light came back on the highway yesterday.',
    bodyJa: '車両: Corolla Cross 2022。昨日高速道路で警告灯が再点灯しました。',
    at: '2026-10-29 18:22',
    status: 'open',
  },
  {
    id: 'fb-02',
    from: 'service@sg-toyota.example',
    subject: 'Customer cannot open the explanation PDF',
    subjectJa: '顧客が説明PDFを開けない',
    body: 'Handover email link expired. Please resend.',
    bodyJa: '引渡しメールのリンクが期限切れです。再送をお願いします。',
    at: '2026-10-28 11:05',
    status: 'replied',
  },
];

export default function FeedbackPage() {
  const { t, lang } = useLanguage();
  const [tickets, setTickets] = useState(SEED);
  const [selectedId, setSelectedId] = useState(SEED[0].id);
  const [reply, setReply] = useState('');
  const selected = tickets.find((x) => x.id === selectedId) ?? tickets[0];

  const send = () => {
    if (!reply.trim()) return;
    setTickets((prev) => prev.map((x) => (x.id === selected.id ? { ...x, status: 'replied' } : x)));
    setReply('');
  };

  return (
    <div className="flex h-full">
      <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('fb.inbox')}</h2>
        </div>
        {tickets.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`w-full text-left px-4 py-3.5 border-b border-slate-50 ${item.id === selected.id ? 'bg-brand-blue/5 border-r-2 border-brand-blue' : 'hover:bg-slate-50'}`}
          >
            <div className="text-sm font-semibold text-slate-800">{lang === 'ja' ? item.subjectJa : item.subject}</div>
            <div className="text-xs text-slate-400 mt-1">{item.from}</div>
            <span className={`mt-1.5 inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>
              {item.status === 'open' ? t('fb.open') : t('fb.replied')}
            </span>
          </button>
        ))}
      </aside>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-3xl space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('fb.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('fb.subtitle')}</p>
        </div>
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="text-xs text-slate-400">{selected.from} · {selected.at}</div>
          <h2 className="text-base font-bold text-slate-900">{lang === 'ja' ? selected.subjectJa : selected.subject}</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{lang === 'ja' ? selected.bodyJa : selected.body}</p>
        </section>
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t('fb.reply.ph')}
            rows={4}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
          />
          <button
            type="button"
            onClick={send}
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-bold px-3.5 py-2 rounded-lg"
          >
            <Send className="w-4 h-4" /> {t('fb.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
