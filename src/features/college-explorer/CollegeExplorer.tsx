import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { CapRound, College } from '../../shared/types/college';
import { CollegeCard } from './CollegeCard';
import { Search, SlidersHorizontal, RotateCcw, Filter, Check } from 'lucide-react';
import { MobileSheet } from '../../shared/components/MobileSheet';
import { Chip } from '../../shared/components/Chip';
import {
  ALL_CATEGORIES,
  ALL_BRANCHES,
  collegeSearchText,
  discoverCategories,
  findBestBranchForFilter,
  normalizeSearchText,
  ROUND_LABELS,
} from '../../shared/lib/college';

interface CollegeExplorerProps {
  colleges: College[];
  selectedRound: CapRound;
  comparedColleges: College[];
  onToggleCompare: (college: College) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  GOPENH: 'GOPENH (General Open Home Univ)',
  GOPENO: 'GOPENO (General Open Other Univ)',
  GOPENS: 'GOPENS (General Open State Level)',
  LOPENH: 'LOPENH (Ladies Open Home Univ)',
  LOPENO: 'LOPENO (Ladies Open Other Univ)',
  LOPENS: 'LOPENS (Ladies Open State Level)',
  OBC: 'OBC (Other Backward Class)',
  GOBCH: 'GOBCH (General OBC Home Univ)',
  GOBCO: 'GOBCO (General OBC Other Univ)',
  GOBCS: 'GOBCS (General OBC State Level)',
  LOBCH: 'LOBCH (Ladies OBC Home Univ)',
  LOBCO: 'LOBCO (Ladies OBC Other Univ)',
  LOBCS: 'LOBCS (Ladies OBC State Level)',
  SC: 'SC (Scheduled Caste)',
  GSCH: 'GSCH (General SC Home Univ)',
  GSCO: 'GSCO (General SC Other Univ)',
  GSCS: 'GSCS (General SC State Level)',
  LSCH: 'LSCH (Ladies SC Home Univ)',
  LSCO: 'LSCO (Ladies SC Other Univ)',
  LSCS: 'LSCS (Ladies SC State Level)',
  ST: 'ST (Scheduled Tribe)',
  GSTH: 'GSTH (General ST Home Univ)',
  GSTO: 'GSTO (General ST Other Univ)',
  GSTS: 'GSTS (General ST State Level)',
  LSTH: 'LSTH (Ladies ST Home Univ)',
  LSTO: 'LSTO (Ladies ST Other Univ)',
  LSTS: 'LSTS (Ladies ST State Level)',
  EWS: 'EWS (Economically Weaker Section)',
  TFWS: 'TFWS (Tuition Fee Waiver Scheme)',
  GSEBCH: 'GSEBCH (General SEBC Home Univ)',
  GSEBCO: 'GSEBCO (General SEBC Other Univ)',
  GSEBCS: 'GSEBCS (General SEBC State Level)',
  LSEBCH: 'LSEBCH (Ladies SEBC Home Univ)',
  LSEBCO: 'LSEBCO (Ladies SEBC Other Univ)',
  LSEBCS: 'LSEBCS (Ladies SEBC State Level)',
  GNT1H: 'GNT1H (General NT-1 Home Univ)',
  GNT1O: 'GNT1O (General NT-1 Other Univ)',
  GNT1S: 'GNT1S (General NT-1 State Level)',
  GNT2H: 'GNT2H (General NT-2 Home Univ)',
  GNT2O: 'GNT2O (General NT-2 Other Univ)',
  GNT2S: 'GNT2S (General NT-2 State Level)',
  GNT3H: 'GNT3H (General NT-3 Home Univ)',
  GNT3O: 'GNT3O (General NT-3 Other Univ)',
  GNT3S: 'GNT3S (General NT-3 State Level)',
  GVJH: 'GVJH (General VJ/DT Home Univ)',
  GVJO: 'GVJO (General VJ/DT Other Univ)',
  GVJS: 'GVJS (General VJ/DT State Level)',
  LNT1H: 'LNT1H (Ladies NT-1 Home Univ)',
  LNT1O: 'LNT1O (Ladies NT-1 Other Univ)',
  LNT1S: 'LNT1S (Ladies NT-1 State Level)',
  LNT2H: 'LNT2H (Ladies NT-2 Home Univ)',
  LNT2O: 'LNT2O (Ladies NT-2 Other Univ)',
  LNT2S: 'LNT2S (Ladies NT-2 State Level)',
  LNT3H: 'LNT3H (Ladies NT-3 Home Univ)',
  LNT3O: 'LNT3O (Ladies NT-3 Other Univ)',
  LNT3S: 'LNT3S (Ladies NT-3 State Level)',
  LVJH: 'LVJH (Ladies VJ/DT Home Univ)',
  LVJO: 'LVJO (Ladies VJ/DT Other Univ)',
  LVJS: 'LVJS (Ladies VJ/DT State Level)',
  MI: 'MI (Minority)',
  ORPHAN: 'ORPHAN (Orphan)',
  DEFOPENS: 'DEFOPENS (Defense Open State)',
  DEFOBCS: 'DEFOBCS (Defense OBC State)',
  DEFSEBCS: 'DEFSEBCS (Defense SEBC State)',
  PWDOPENS: 'PWDOPENS (PWD Open State)',
  PWDOPENH: 'PWDOPENH (PWD Open Home Univ)',
  PWDOBCS: 'PWDOBCS (PWD OBC State)',
  PWDOBCH: 'PWDOBCH (PWD OBC Home Univ)',
  PWDSCS: 'PWDSCS (PWD SC State)'
};

const SORT_OPTIONS: Array<{ id: 'percentile_desc' | 'percentile_asc' | 'name' | 'rating'; label: string }> = [
  { id: 'percentile_desc', label: 'Cutoff: High to Low' },
  { id: 'percentile_asc', label: 'Cutoff: Low to High' },
  { id: 'rating', label: 'Rating: High to Low' },
  { id: 'name', label: 'College Name (A-Z)' }
];

const RESULTS_PER_PAGE = 24;

export const CollegeExplorer: React.FC<CollegeExplorerProps> = ({
  colleges,
  selectedRound,
  comparedColleges,
  onToggleCompare
}) => {
  const categories = useMemo(
    () => discoverCategories(colleges).map((id) => ({ id, label: CATEGORY_LABELS[id] || `${id} (${id})` })),
    [colleges],
  );

  const regionOptions = useMemo(() => [
    { id: 'ALL', label: 'All regions' },
    ...Array.from(new Set(colleges.map((college) => college.region).filter(Boolean))).sort().map((region) => ({
      id: region as string,
      label: region as string,
    })),
  ], [colleges]);

  const statusOptions = useMemo(() => [
    { id: 'ALL', label: 'All college types' },
    ...Array.from(new Set(colleges.map((college) => college.ownership).filter(Boolean))).sort().map((status) => ({
      id: status as string,
      label: status as string,
    })),
  ], [colleges]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>(ALL_BRANCHES);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [sortBy, setSortBy] = useState<'percentile_desc' | 'percentile_asc' | 'name' | 'rating'>('percentile_desc');
  const [minPercentile, setMinPercentile] = useState<number>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('ALL');
    setSelectedStatus('ALL');
    setSelectedBranch(ALL_BRANCHES);
    setSelectedCategory(ALL_CATEGORIES);
    setSortBy('percentile_desc');
    setMinPercentile(0);
  };

  const activeFilterCount =
    (selectedRegion !== 'ALL' ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedBranch !== 'ALL' ? 1 : 0) +
    (selectedCategory !== ALL_CATEGORIES ? 1 : 0) +
    (minPercentile > 0 ? 1 : 0);

  // Filter and sort against the selected round and exact selected category.
  const filteredColleges = useMemo(() => {
    return colleges.filter((col) => {
      const matchesSearch =
        normalizeSearchText(deferredSearchTerm) === '' ||
        collegeSearchText(col).includes(normalizeSearchText(deferredSearchTerm));

      const matchesRegion =
        selectedRegion === 'ALL' || col.region === selectedRegion;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        col.ownership === selectedStatus;

      const matchesBranch =
        selectedBranch === ALL_BRANCHES ||
        col.branches.some((branch) => branch.name.toLowerCase().includes(selectedBranch.toLowerCase()));

      const bestMatch = findBestBranchForFilter(
        col,
        selectedCategory,
        selectedBranch === ALL_BRANCHES ? '' : selectedBranch,
      );
      const matchesPercentile = (bestMatch?.cutoff.percentile ?? 0) >= minPercentile;

      return matchesSearch && matchesRegion && matchesStatus && matchesBranch && Boolean(bestMatch) && matchesPercentile;
    }).sort((colA, colB) => {
      const aCutoff = findBestBranchForFilter(
        colA,
        selectedCategory,
        selectedBranch === ALL_BRANCHES ? '' : selectedBranch,
      )?.cutoff.percentile ?? 0;
      const bCutoff = findBestBranchForFilter(
        colB,
        selectedCategory,
        selectedBranch === ALL_BRANCHES ? '' : selectedBranch,
      )?.cutoff.percentile ?? 0;

      if (sortBy === 'percentile_desc') return bCutoff - aCutoff;
      if (sortBy === 'percentile_asc') return aCutoff - bCutoff;
      if (sortBy === 'name') return colA.name.localeCompare(colB.name);
      if (sortBy === 'rating') return (colB.rating ?? 0) - (colA.rating ?? 0);
      return 0;
    });
  }, [colleges, deferredSearchTerm, selectedRegion, selectedStatus, selectedBranch, selectedCategory, sortBy, minPercentile]);

  useEffect(() => {
    setVisibleCount(RESULTS_PER_PAGE);
  }, [filteredColleges]);

  const visibleColleges = filteredColleges.slice(0, visibleCount);

  const statusLabel = statusOptions.find(s => s.id === selectedStatus)?.label || '';
  const branchLabel = selectedBranch === ALL_BRANCHES ? '' : selectedBranch;
  const categoryLabel = selectedCategory === ALL_CATEGORIES
    ? 'All Categories'
    : categories.find(c => c.id === selectedCategory)?.label?.split(' ')[0] || selectedCategory;

  const filterSheet = (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-bold text-slate-700 mb-2 block">Reservation Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="touch-target w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-4 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
        >
          <option value={ALL_CATEGORIES}>All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-2 block">Course search</label>
        <input
          type="search"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value || ALL_BRANCHES)}
          placeholder="All courses or type a course name"
          className="touch-target w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-4 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-2 block">Region</label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="touch-target w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-4 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
        >
          {regionOptions.map((region) => (
            <option key={region.id} value={region.id}>{region.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-2 block">College Type</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="touch-target w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-4 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
        >
          {statusOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-2 block">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'percentile_desc' | 'percentile_asc' | 'name' | 'rating')}
          className="touch-target w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-4 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-2">
          <span>Minimum MHT-CET Percentile</span>
          <span className="text-google-blue-600 font-extrabold">{minPercentile}%ile +</span>
        </div>
        <input
          type="range"
          min="0"
          max="99"
          step="1"
          value={minPercentile}
          onChange={(e) => setMinPercentile(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-google-blue-500"
        />
      </div>
    </div>
  );

  const defaultCatId = ALL_CATEGORIES;

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">

      {/* Search Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/80">
        <div className="max-w-3xl mx-auto text-center mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore <span className="text-google-blue-500">Maharashtra</span> Engineering Cutoffs
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Browse all 2026 Maharashtra engineering courses. Filter by CAP round, category, region, course, college type, or percentile.
          </p>
        </div>

        {/* Search input row + filter trigger */}
        <div className="max-w-2xl mx-auto flex items-stretch gap-2">
          <div className="relative flex-1 flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-full focus-within:shadow-[0_8px_30px_rgba(26,115,232,0.2)] focus-within:border-google-blue-500 transition-all duration-200">
            <Search className="w-5 h-5 text-google-blue-500 absolute left-4 sm:left-5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search college, city, university, course, or DTE code…"
              className="w-full pl-11 sm:pl-13 pr-10 py-3.5 rounded-full text-sm font-medium bg-white text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-full"
              >
                Clear
              </button>
            ) : null}
          </div>

          {/* Mobile filter trigger */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="md:hidden touch-target shrink-0 inline-flex items-center justify-center gap-1.5 bg-google-blue-500 hover:bg-google-blue-600 text-white text-sm font-bold rounded-full px-4 relative"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-google-red-500 text-white text-[11px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Desktop Region Pills (visible >= md) */}
      </div>

      {/* Mobile active filter chips (visible < md) */}
      {activeFilterCount > 0 ? (
        <div className="md:hidden -mt-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Active:</span>
            {selectedStatus !== 'ALL' ? (
              <Chip color="blue" label={statusLabel} onRemove={() => setSelectedStatus('ALL')} />
            ) : null}
            {selectedRegion !== 'ALL' ? (
              <Chip color="blue" label={selectedRegion} onRemove={() => setSelectedRegion('ALL')} />
            ) : null}
            {selectedBranch !== ALL_BRANCHES ? (
              <Chip color="blue" label={branchLabel} onRemove={() => setSelectedBranch(ALL_BRANCHES)} />
            ) : null}
            {selectedCategory !== defaultCatId ? (
              <Chip color="blue" label={categoryLabel} onRemove={() => setSelectedCategory(defaultCatId)} />
            ) : null}
            {minPercentile > 0 ? (
              <Chip color="blue" label={`${minPercentile}%+`} onRemove={() => setMinPercentile(0)} />
            ) : null}
            <button
              onClick={handleResetFilters}
              className="shrink-0 text-xs font-bold text-google-red-600 bg-google-red-50 border border-google-red-100 px-3 py-1.5 rounded-full"
            >
              Reset
            </button>
          </div>
        </div>
      ) : null}

      {/* Desktop Filter Controls Toolbar (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <SlidersHorizontal className="w-4 h-4 text-google-blue-500" />
            Refine Search & Category Cutoffs
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-google-red-500 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Reservation Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
            >
              <option value={ALL_CATEGORIES}>All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Course Search</label>
            <input
              type="search"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value || ALL_BRANCHES)}
              placeholder="All courses"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
            >
              {regionOptions.map((region) => (
                <option key={region.id} value={region.id}>{region.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">College Type</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
            >
              {statusOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Sort Colleges By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'percentile_desc' | 'percentile_asc' | 'name' | 'rating')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-google-blue-500 focus:outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1">
            <span>Filter Minimum MHT-CET Percentile Cutoff:</span>
            <span className="text-google-blue-600 font-extrabold text-sm">{minPercentile}%ile +</span>
          </div>
          <input
            type="range"
            min="0"
            max="99"
            step="1"
            value={minPercentile}
            onChange={(e) => setMinPercentile(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-google-blue-500"
          />
        </div>
      </div>

      {/* Search Results Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2">
        <div className="text-sm font-semibold text-slate-700">
          Showing <span className="font-bold text-slate-900">{visibleColleges.length}</span> of <span className="font-bold text-slate-900">{filteredColleges.length}</span> colleges matching criteria
        </div>
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          <span className="mr-2">{ROUND_LABELS[selectedRound]}</span>
          <span>Category: <span className="font-bold text-google-blue-600 bg-google-blue-50 px-2 py-0.5 rounded border border-google-blue-100">{categoryLabel}</span></span>
        </div>
      </div>

      {/* College List Grid */}
      {filteredColleges.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {visibleColleges.map((college) => {
            const isCompared = comparedColleges.some(c => c.code === college.code);
            return (
              <CollegeCard
                key={college.code}
                college={college}
                selectedRound={selectedRound}
                selectedCategory={selectedCategory}
                isCompared={isCompared}
                onToggleCompare={onToggleCompare}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-6 sm:my-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Colleges Found</h3>
          <p className="text-sm text-slate-500 mt-2">
            No engineering colleges matched your search parameters with cutoff data for <span className="font-bold text-slate-700">{categoryLabel}</span>. Try adjusting your category, minimum percentile, or region filters above.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 google-btn-secondary text-sm mx-auto"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {visibleColleges.length < filteredColleges.length ? (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((count) => count + RESULTS_PER_PAGE)}
            className="google-btn-secondary text-sm"
          >
            Load 24 more colleges
          </button>
        </div>
      ) : null}

      {/* Mobile filter bottom sheet */}
      <MobileSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="flex-1 touch-target inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setFiltersOpen(false)}
              className="flex-1 touch-target inline-flex items-center justify-center gap-1.5 bg-google-blue-500 text-white text-sm font-bold rounded-full"
            >
              <Check className="w-4 h-4" />
              Apply
            </button>
          </div>
        }
      >
        {filterSheet}
      </MobileSheet>
    </div>
  );
};
