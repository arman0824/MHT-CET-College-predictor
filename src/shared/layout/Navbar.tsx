import React, { useState } from 'react';
import { BookOpen, Download, GitCompare, Menu, School, Search, Target } from 'lucide-react';
import { MobileSheet } from '../components/MobileSheet';
import { RoundSelector } from '../components/RoundSelector';
import type { AppTab } from '../../app/navigation';
import type { CapRound } from '../types/college';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  compareCount: number;
  selectedRound: CapRound;
  onRoundChange: (round: CapRound) => void;
}

type TabKey = AppTab;

interface TabMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}

const TAB_META: Record<TabKey, TabMeta> = {
  explore: { label: 'Explore', icon: Search, iconClass: 'text-google-blue-500' },
  predictor: { label: 'Predictor', icon: Target, iconClass: 'text-google-green-600' },
  compare: { label: 'Compare', icon: GitCompare, iconClass: 'text-google-yellow-600' },
  trends: { label: 'About', icon: BookOpen, iconClass: 'text-slate-500' },
};

const MOBILE_DRAWER_ID = 'mobile-navigation-drawer';

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  compareCount,
  selectedRound,
  onRoundChange,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelect = (tab: AppTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  const logo = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-google-blue-500 text-white shadow-sm">
        <School className="h-5 w-5" />
      </span>
      <span className="leading-tight text-left">
        <span className="block text-base font-extrabold tracking-tight text-slate-900">
          <span className="text-google-blue-600">CET</span> Vault
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">MHT-CET 2026</span>
      </span>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Mobile header */}
          <div className="flex h-14 items-center justify-between md:hidden">
            <a
              href="#home"
              onClick={() => handleSelect('explore')}
              className="inline-flex items-center gap-2.5 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-google-blue-500"
              aria-label="Go to Explore Colleges"
            >
              {logo}
            </a>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                R{selectedRound}
              </span>
              <button
                onClick={() => setDrawerOpen(true)}
                className="touch-target inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                aria-controls={MOBILE_DRAWER_ID}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden h-16 items-center justify-between gap-6 md:flex">
            <a
              href="#home"
              onClick={() => setActiveTab('explore')}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-google-blue-500"
              aria-label="Go to Explore Colleges"
            >
              {logo}
            </a>

            <nav className="flex items-center gap-1" aria-label="Primary navigation">
              {(Object.keys(TAB_META) as Array<TabKey>).map((key) => {
                const meta = TAB_META[key];
                const Icon = meta.icon;
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex h-11 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-google-blue-500 ${
                      active
                        ? 'text-slate-900 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-google-blue-500'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${meta.iconClass}`} />
                    {meta.label}
                    {key === 'compare' && compareCount > 0 ? (
                      <span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${active ? 'bg-white/15 text-white' : 'bg-google-red-500 text-white'}`}>
                        {compareCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <RoundSelector value={selectedRound} onChange={onRoundChange} compact />
              <a
                href={`/round${selectedRound}_26.pdf`}
                download={`MHT-CET-CAP-ROUND-${selectedRound}-2026.pdf`}
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
                aria-label={`Download ${selectedRound === 4 ? 'latest' : `Round ${selectedRound}`} CAP PDF`}
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </a>
            </div>
          </div>
        </div>
      </header>

      <MobileSheet
        id={MOBILE_DRAWER_ID}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Navigation"
        variant="drawer"
      >
        <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
          <div className="mb-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <RoundSelector value={selectedRound} onChange={onRoundChange} />
          </div>

          {(Object.keys(TAB_META) as Array<TabKey>).map((key) => {
            const meta = TAB_META[key];
            const Icon = meta.icon;
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                aria-current={active ? 'page' : undefined}
                className={`touch-target min-h-12 inline-flex w-full items-center gap-3 rounded-xl border px-3 text-left text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-google-blue-500 ${
                  active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-white' : meta.iconClass}`} />
                <span className="flex-1">{meta.label}</span>
                {key === 'compare' && compareCount > 0 ? <span className="rounded-full bg-google-red-500 px-2 py-0.5 text-[11px] text-white">{compareCount}</span> : null}
              </button>
            );
          })}

          <a
            href={`/round${selectedRound}_26.pdf`}
            download={`MHT-CET-CAP-ROUND-${selectedRound}-2026.pdf`}
            className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            <Download className="h-4 w-4" />
            Download {selectedRound === 4 ? 'latest' : `Round ${selectedRound}`} PDF
          </a>
        </nav>
      </MobileSheet>
    </>
  );
};
