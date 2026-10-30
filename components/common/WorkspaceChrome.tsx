'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Headphones, CircleHelp, X, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { GlobalAISearchModal } from '@/components/knowledge/GlobalAISearchModal';
import type { TranslationKey } from '@/lib/translations';
import type { Role } from '@/data/users';

type Panel = 'ai' | 'contact' | 'help' | null;
const EVT = 'techmate-workspace';

export function openWorkspace(panel: Exclude<Panel, null>) {
  window.dispatchEvent(new CustomEvent(EVT, { detail: panel }));
}

export function WorkspaceChrome() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<Exclude<Panel, null>>).detail;
      if (detail) setPanel(detail);
    };
    window.addEventListener(EVT, onOpen);
    return () => window.removeEventListener(EVT, onOpen);
  }, []);

  if (!user || pathname === '/login') return null;

  return (
    <>
      <div className="fixed bottom-24 right-4 z-[85] flex flex-col gap-2 items-end">
        <ChromeBtn labelKey="chrome.ai" onClick={() => setPanel('ai')} className="bg-violet-600 hover:bg-violet-500 text-white">
          <Sparkles className="w-4 h-4" />
        </ChromeBtn>
        <ChromeBtn labelKey="chrome.contact" onClick={() => setPanel('contact')} className="bg-navy hover:bg-navy-light text-white">
          <Headphones className="w-4 h-4" />
        </ChromeBtn>
        <ChromeBtn labelKey="chrome.help" onClick={() => setPanel('help')} className="bg-white text-navy border border-slate-200 hover:bg-slate-50 shadow-sm">
          <CircleHelp className="w-4 h-4" />
        </ChromeBtn>
      </div>
      {panel === 'ai' && <GlobalAISearchModal onClose={() => setPanel(null)} />}
      {panel === 'contact' && <ContactUsModal onClose={() => setPanel(null)} />}
      {panel === 'help' && <HelpGuideModal onClose={() => setPanel(null)} role={user.role} />}
    </>
  );
}

function ChromeBtn({
  children,
  labelKey,
  onClick,
  className,
}: {
  children: React.ReactNode;
  labelKey: TranslationKey;
  onClick: () => void;
  className: string;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full pl-3 pr-3.5 py-2.5 text-xs font-bold shadow-lg ${className}`}
    >
      {children}
      {t(labelKey)}
    </button>
  );
}

function ContactUsModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [topic, setTopic] = useState('helpdesk');
  const [message, setMessage] = useState('');
  const [ro, setRo] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-16 mx-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[95] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('contact.title')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('contact.subtitle')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        {sent ? (
          <div className="bg-teal/10 border border-teal/20 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900">{t('contact.sent.title')}</div>
              <p className="text-sm text-slate-600 mt-1">{t('contact.sent.body')}</p>
            </div>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label className="block text-xs font-bold text-slate-500 uppercase">
              {t('contact.topic')}
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
              >
                <option value="helpdesk">{t('contact.topic.helpdesk')}</option>
                <option value="access">{t('contact.topic.access')}</option>
                <option value="document">{t('contact.topic.document')}</option>
                <option value="other">{t('contact.topic.other')}</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-500 uppercase">
              {t('contact.ro')}
              <input
                value={ro}
                onChange={(e) => setRo(e.target.value)}
                placeholder="RO-2026-10-0042"
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>
            <label className="block text-xs font-bold text-slate-500 uppercase">
              {t('contact.message')}
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.message.ph')}
                rows={4}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-bold px-4 py-2 rounded-lg"
            >
              <Send className="w-4 h-4" />
              {t('contact.send')}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

const HELP_KEYS: Record<Role, TranslationKey[]> = {
  technician: ['help.tech.1', 'help.tech.2', 'help.tech.3', 'help.tech.4', 'help.tech.5'],
  'dealer-admin': ['help.dealer.1', 'help.dealer.2', 'help.dealer.3', 'help.dealer.4', 'help.dealer.5'],
  cmc: ['help.cmc.1', 'help.cmc.2', 'help.cmc.3', 'help.cmc.4', 'help.cmc.5'],
};

function HelpGuideModal({ onClose, role }: { onClose: () => void; role: Role }) {
  const { t } = useLanguage();
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-16 mx-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[95] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('help.title')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('help.subtitle')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <ol className="space-y-2.5">
          {HELP_KEYS[role].map((key, i) => (
            <li key={key} className="flex gap-3 text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-brand-blue text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              {t(key)}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
