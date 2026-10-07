'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ChevronDown,
  Globe,
  Calendar,
  Building2,
  User,
  ArrowLeft,
  Wrench,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/knowledge', label: 'Knowledge Improvement', icon: BookOpen },
  { href: '/admin/recommendations', label: 'Recommendation Performance', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [region] = useState('Asia Pacific');
  const [dealer] = useState('All Dealers');
  const [period] = useState('Last 30 Days');

  useEffect(() => { setMounted(true); }, []);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (!mounted) return false;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-navy flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-none">TechMate</div>
              <div className="text-white/50 text-[10px] mt-0.5 uppercase tracking-wider">Admin Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Technician View Link */}
        <div className="px-3 pb-5 border-t border-white/10 pt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Technician View</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          {/* Page title placeholder — filled by each page via h1 */}
          <div className="flex-1" />

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Region */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{region}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Dealer */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{dealer}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Period */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{period}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* User */}
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center ml-1">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
