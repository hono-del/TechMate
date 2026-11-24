'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car, CheckCircle2, ScanLine, User, Phone, Mail, Hash, Gauge, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { UserMenu } from '@/components/common/UserMenu';
import { AppTopBar } from '@/components/common/AppTopBar';
import { MANUAL_MODELS } from '@/data/manuals';

const ENGINE_OPTIONS = ['1200', '1500', '1800', '2000', '2500', '3500', '4000', '4500'];

export default function NewJobPage() {
  const { t, lang, toggleLang } = useLanguage();
  const router = useRouter();

  // Owner
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  // Vehicle
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [decoded, setDecoded] = useState(false);
  const [model, setModel] = useState('Corolla Cross');
  const [year, setYear] = useState('2022');
  const [mileage, setMileage] = useState('25430');
  const [engineCC, setEngineCC] = useState('2000');
  const [mfgDate, setMfgDate] = useState('2022-03');
  const [regDate, setRegDate] = useState('2022-05');

  // Complaint
  const [concern, setConcern] = useState('');

  const [created, setCreated] = useState(false);

  const decode = () => {
    if (!vin) return;
    setDecoded(true);
    setModel('Corolla Cross');
    setYear('2022');
  };

  const isValid = ownerName.trim() && ownerPhone.trim() && concern.trim();

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar kicker={t('app.name')} title={t('jobnew.title')}>
          <button type="button" onClick={toggleLang} className="btn-ghost">
            <span>{lang === 'en' ? '🇯🇵' : '🇺🇸'}</span>
            <span>{lang === 'en' ? '日本語' : 'English'}</span>
          </button>
          <UserMenu variant="light" />
      </AppTopBar>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('jobnew.back')}
        </Link>

        {created ? (
          <div className="bg-white border border-green-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-teal flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-slate-900">{t('jobnew.created')}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  RO-2026-10-0088 · {year} {model}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{t('jobnew.sent-assign')}</p>
                <p className="text-xs text-slate-400 mt-2">{t('jobnew.demo-note')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/job/job-001/reception')}
              className="btn-primary"
            >
              {t('jobnew.open-reception')}
            </button>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValid) return;
              setCreated(true);
            }}
          >
            {/* ── Owner section ── */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wide flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> {t('jobnew.section.owner')}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('jobnew.owner.name')} <span className="text-red-500">*</span>
                  <input
                    required
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder={t('jobnew.owner.name.ph')}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                  />
                </label>
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('jobnew.owner.phone')} <span className="text-red-500">*</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      required
                      type="tel"
                      value={ownerPhone}
                      onChange={e => setOwnerPhone(e.target.value)}
                      placeholder={t('jobnew.owner.phone.ph')}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                    />
                  </div>
                </label>
              </div>

              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('jobnew.owner.email')}
                <div className="mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    placeholder="tanaka@example.com"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                  />
                </div>
              </label>
            </section>

            {/* ── Vehicle section ── */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wide flex items-center gap-2">
                <Car className="w-3.5 h-3.5" /> {t('jobnew.section.vehicle')}
              </h2>

              {/* License plate */}
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('jobnew.plate')}
                <div className="mt-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    value={plate}
                    onChange={e => setPlate(e.target.value)}
                    placeholder={t('jobnew.plate.ph')}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                  />
                </div>
              </label>

              {/* VIN + decode */}
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('jobnew.vin')}
                <div className="mt-1 flex gap-2">
                  <input
                    value={vin}
                    onChange={e => { setVin(e.target.value); setDecoded(false); }}
                    placeholder="JTNXXXXXXXXXXXXXX"
                    className="flex-1 text-sm font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={decode}
                    disabled={!vin}
                    className="inline-flex items-center gap-1.5 text-xs font-bold border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ScanLine className="w-3.5 h-3.5" /> {t('jobnew.decode')}
                  </button>
                </div>
                {decoded && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold uppercase bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    {t('jobnew.decoded')}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('vehicle.model')}
                  <select
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {MANUAL_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('home.manuals.choose-year')}
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {['2020', '2021', '2022', '2023', '2024'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('jobnew.mileage')}
                  <div className="mt-1 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      value={mileage}
                      onChange={e => setMileage(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                    />
                  </div>
                </label>
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('jobnew.engine-cc')}
                  <select
                    value={engineCC}
                    onChange={e => setEngineCC(e.target.value)}
                    className="mt-1 w-full text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {ENGINE_OPTIONS.map(cc => <option key={cc} value={cc}>{Number(cc).toLocaleString()} cc</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('jobnew.mfg-date')}
                  <div className="mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      type="month"
                      value={mfgDate}
                      onChange={e => setMfgDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                    />
                  </div>
                </label>
                <label className="block text-xs font-bold uppercase text-slate-400">
                  {t('jobnew.reg-date')}
                  <div className="mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      type="month"
                      value={regDate}
                      onChange={e => setRegDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                    />
                  </div>
                </label>
              </div>
            </section>

            {/* ── Complaint section ── */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wide">{t('jobnew.section.complaint')}</h2>
              <label className="block text-xs font-bold uppercase text-slate-400">
                {t('jobnew.concern')} <span className="text-red-500">*</span>
                <textarea
                  required
                  value={concern}
                  onChange={e => setConcern(e.target.value)}
                  placeholder={t('jobnew.concern.ph')}
                  rows={3}
                  className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-normal"
                />
              </label>
            </section>

            <button
              type="submit"
              disabled={!isValid}
              className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Car className="w-4 h-4" /> {t('jobnew.create.sa')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
