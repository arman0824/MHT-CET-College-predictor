import React, { useState } from 'react';
import { School, Search, Target, GitCompare, BookOpen, ShieldCheck, Menu, Download } from 'lucide-react';
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
  activePillClass: string;
  activeTextClass: string;
  activeBorderClass: string;
  activeBgClass: string;
  drawerIconBgClass: string;
  drawerIconBorderClass: string;
  description: string;
}

const TAB_META: Record<TabKey, TabMeta> = {
  explore: {
    label: 'Explore Colleges',
    icon: Search,
    iconClass: 'text-google-blue-500',
    activePillClass: 'bg-white text-google-blue-600',
    activeTextClass: 'text-google-blue-600',
    activeBorderClass: 'border-google-blue-200',
    activeBgClass: 'bg-google-blue-50',
    drawerIconBgClass: 'bg-white',
    drawerIconBorderClass: 'border-google-blue-100',
    description: 'Browse 370+ Maharashtra engineering colleges'
  },
  predictor: {
    label: 'College Predictor',
    icon: Target,
    iconClass: 'text-google-green-500',
    activePillClass: 'bg-white text-google-green-600',
    activeTextClass: 'text-google-green-600',
    activeBorderClass: 'border-google-green-200',
    activeBgClass: 'bg-google-green-50',
    drawerIconBgClass: 'bg-white',
    drawerIconBorderClass: 'border-google-green-100',
    description: 'Predict your admission chances by percentile'
  },
  compare: {
    label: 'Compare',
    icon: GitCompare,
    iconClass: 'text-google-yellow-500',
    activePillClass: 'bg-white text-google-yellow-600',
    activeTextClass: 'text-google-yellow-600',
    activeBorderClass: 'border-google-yellow-200',
    activeBgClass: 'bg-google-yellow-50',
    drawerIconBgClass: 'bg-white',
    drawerIconBorderClass: 'border-google-yellow-100',
    description: 'Side-by-side college comparison (up to 3)'
  },
  trends: {
    label: 'About CAP',
    icon: BookOpen,
    iconClass: 'text-google-blue-500',
    activePillClass: 'bg-white text-google-blue-600',
    activeTextClass: 'text-google-blue-600',
    activeBorderClass: 'border-google-blue-200',
    activeBgClass: 'bg-google-blue-50',
    drawerIconBgClass: 'bg-white',
    drawerIconBorderClass: 'border-google-blue-100',
    description: 'CAP guidance and frequently asked questions'
  }
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, compareCount, selectedRound, onRoundChange }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelect = (tab: AppTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile header (h-14) */}
          <div className="md:hidden flex items-center justify-between h-14">
            <div
              onClick={() => handleSelect('explore')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <School className="w-5 h-5 text-google-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-0.5 font-semibold text-base tracking-tight text-slate-900 leading-tight">
                  <span className="text-google-blue-500 font-bold">CET</span>
                  <span>Vault</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-google-green-600" />
                  Official CAP Cutoffs
                </p>
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className="touch-target inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop header (h-20) — unchanged */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-20 gap-4">
            <div className="flex items-center justify-start">
              <div
                onClick={() => setActiveTab('explore')}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
              >
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                  <School className="w-6 h-6 text-google-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1 font-semibold text-lg tracking-tight text-slate-900">
                    <span className="text-google-blue-500 font-bold">CET</span>
                    <span>Vault</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-tight">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-google-green-600 inline" />
                      Official CAP Cutoffs
                    </span>
                   387 Maharashtra Colleges · 2026 Data
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <nav className="flex items-center p-1.5 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-[inner_0_1px_3px_rgba(0,0,0,0.06)]">
                {(Object.keys(TAB_META) as Array<TabKey>).map((key) => {
                  const meta = TAB_META[key];
                  const Icon = meta.icon;
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        active
                          ? `${meta.activePillClass} shadow-[0_3px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] border border-slate-200/50 scale-[1.02]`
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${meta.iconClass}`} />
                      {meta.label}
                      {key === 'compare' && compareCount > 0 ? (
                        <span className="w-5 h-5 bg-google-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                          {compareCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center justify-end">
              <div className="flex items-center gap-3 shrink-0">
                <RoundSelector value={selectedRound} onChange={onRoundChange} compact />
                <a
                  href={`/round${selectedRound}_26.pdf`}
                  download={`MHT-CET-CAP-ROUND-${selectedRound}-2026.pdf`}
                  className="hidden lg:flex items-center gap-2 bg-google-blue-50 text-google-blue-700 border border-google-blue-100 text-xs font-bold px-4 py-2 rounded-full hover:bg-google-blue-100 hover:border-google-blue-200 transition-colors duration-150"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile hamburger drawer */}
      <MobileSheet
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Menu"
        variant="drawer"
      >
        <nav className="flex flex-col gap-2 pt-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
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
                className={`touch-target text-left w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-colors ${
                  active
                    ? `${meta.activeBgClass} ${meta.activeBorderClass}`
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    active ? `${meta.drawerIconBgClass} ${meta.drawerIconBorderClass}` : 'bg-slate-100 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block font-bold text-sm ${active ? meta.activeTextClass : 'text-slate-900'}`}>
                    {meta.label}
                    {key === 'compare' && compareCount > 0 ? (
                      <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-google-red-500 text-white text-[11px] font-extrabold">
                        {compareCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5 truncate">{meta.description}</span>
                </span>
              </button>
            );
          })}

          <a
              href={`/round${selectedRound}_26.pdf`}
              download={`MHT-CET-CAP-ROUND-${selectedRound}-2026.pdf`}
              className="md:hidden mt-3 touch-target w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full"
            >
              <Download className="w-4 h-4" />
              Download {selectedRound === 4 ? 'Latest' : `Round ${selectedRound}`} PDF
            </a>

          <p className="text-[12px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-google-green-600" />
             387 Maharashtra colleges · 2026 data
          </p>
        </nav>
      </MobileSheet>
    </>
  );
};
