'use client';

import { useState } from 'react';
import { TIE_TEMPLATES } from '@/data/admin/tieFlow';
import { useLanguage } from '@/context/LanguageContext';

export default function TemplatesPage() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState(TIE_TEMPLATES);
  const [selectedId, setSelectedId] = useState(items[0].id);
  const selected = items.find((x) => x.id === selectedId) ?? items[0];

  const toggle = (id: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  };

  return (
    <div className="px-8 py-6 max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t('tpl.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('tpl.subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <aside className="col-span-1 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left rounded-xl border px-3 py-3 ${
                item.id === selected.id ? 'border-brand-blue bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-semibold text-slate-800">{lang === 'ja' ? item.nameJa : item.name}</div>
              <span className={`mt-1 inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {item.active ? t('tpl.active') : t('tpl.inactive')}
              </span>
            </button>
          ))}
        </aside>

        <section className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">{lang === 'ja' ? selected.nameJa : selected.name}</h2>
          <p className="text-xs text-slate-500">{t('tpl.fields-help')}</p>
          <ul className="space-y-1.5">
            {selected.fields.map((f) => (
              <li key={f} className="text-sm border border-slate-100 rounded-lg px-3 py-2 text-slate-700">{f}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => toggle(selected.id)}
            className="text-sm font-bold border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            {selected.active ? t('tpl.deactivate') : t('tpl.activate')}
          </button>
        </section>
      </div>
    </div>
  );
}
