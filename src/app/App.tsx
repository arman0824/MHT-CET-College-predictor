import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { CapRound, College } from '../shared/types/college';
import { fetchColleges } from '../shared/api/colleges';
import { Navbar } from '../shared/layout/Navbar';
import { CollegeExplorer } from '../features/college-explorer/CollegeExplorer';
import { Footer } from '../shared/layout/Footer';
import { GitCompare } from 'lucide-react';
import type { AppTab } from './navigation';

const CutoffPredictor = lazy(() => import('../features/cutoff-predictor/CutoffPredictor').then(({ CutoffPredictor: component }) => ({ default: component })));
const CollegeCompare = lazy(() => import('../features/college-comparison/CollegeCompare').then(({ CollegeCompare: component }) => ({ default: component })));
const AboutCap = lazy(() => import('../features/cutoff-trends/AboutCap').then(({ AboutCap: component }) => ({ default: component })));

function TabLoadingState() {
  return (
    <section className="flex min-h-72 items-center justify-center" aria-label="Loading page">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-google-blue-100 border-t-google-blue-500" />
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTabState] = useState<AppTab>('explore');
  const [selectedRound, setSelectedRound] = useState<CapRound>(4);
  const [comparedCodes, setComparedCodes] = useState<string[]>([]);
  const [colleges, setColleges] = useState<College[] | null>(null);
  const [dataError, setDataError] = useState(false);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

  useEffect(() => {
    setColleges(null);
    setDataError(false);
    fetchColleges(selectedRound).then(setColleges).catch(() => setDataError(true));
  }, [selectedRound]);

  const comparedColleges = useMemo(
    () => colleges?.filter((college) => comparedCodes.includes(college.code)) ?? [],
    [colleges, comparedCodes],
  );

  const setActiveTab = (tab: AppTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleCompare = (college: College) => {
    if (comparedCodes.includes(college.code)) {
      setComparedCodes((current) => current.filter((code) => code !== college.code));
      return;
    }
    if (comparedCodes.length >= 3) {
      setCompareMessage('Comparison is limited to 3 colleges. Remove one before adding another.');
      window.setTimeout(() => setCompareMessage(null), 3500);
      return;
    }
    setComparedCodes((current) => [...current, college.code]);
  };

  const handleRemoveCompare = (collegeCode: string) => {
    setComparedCodes((current) => current.filter((code) => code !== collegeCode));
  };

  const handleClearAllCompare = () => {
    setComparedCodes([]);
  };

  const showFloatingCompare = comparedCodes.length > 0 && activeTab !== 'compare';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compareCount={comparedCodes.length}
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
      />

      <main id="home" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'explore' && colleges && (
          <CollegeExplorer
            colleges={colleges}
            selectedRound={selectedRound}
            comparedColleges={comparedColleges}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {activeTab === 'predictor' && colleges && (
          <Suspense fallback={<TabLoadingState />}>
            <CutoffPredictor
              colleges={colleges}
              selectedRound={selectedRound}
              onToggleCompare={handleToggleCompare}
              comparedColleges={comparedColleges}
            />
          </Suspense>
        )}

        {activeTab === 'compare' && colleges && (
          <Suspense fallback={<TabLoadingState />}>
            <CollegeCompare
              comparedColleges={comparedColleges}
              selectedRound={selectedRound}
              onRemoveCompare={handleRemoveCompare}
              onClearAll={handleClearAllCompare}
              onNavigateExplore={() => setActiveTab('explore')}
            />
          </Suspense>
        )}

        {activeTab === 'trends' && (
          <Suspense fallback={<TabLoadingState />}>
            <AboutCap />
          </Suspense>
        )}

        {(['explore', 'predictor', 'compare'].includes(activeTab) && !colleges) ? (
          <section className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
            {!dataError ? <div className="h-9 w-9 animate-spin rounded-full border-4 border-google-blue-100 border-t-google-blue-500" aria-hidden="true" /> : null}
            <p className="text-sm font-medium text-slate-600">
              {dataError ? '2026 college data could not be loaded. Please refresh and try again.' : `Loading CAP Round ${selectedRound} college data…`}
            </p>
          </section>
        ) : null}
      </main>

      {compareMessage ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl" role="status">
          {compareMessage}
        </div>
      ) : null}

      <Footer setActiveTab={setActiveTab} />

      {showFloatingCompare ? (
        <div className="md:hidden fixed bottom-4 inset-x-0 z-30 px-4 safe-bottom pointer-events-none">
          <button
            onClick={() => setActiveTab('compare')}
            className="pointer-events-auto w-full flex items-center justify-center gap-2 bg-google-yellow-500 hover:bg-google-yellow-600 text-slate-900 font-bold text-sm py-3 px-4 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.2)] active:scale-95 transition-transform"
            aria-label={`View comparison (${comparedCodes.length} selected)`}
          >
            <GitCompare className="w-4 h-4" />
            View Comparison ({comparedCodes.length})
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default App;
