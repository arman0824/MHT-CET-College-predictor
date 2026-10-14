import React, { useEffect, useMemo, useState } from 'react';
import type { CapRound, College, CutoffData } from '../../shared/types/college';
import { GitCompare, X, Star, MapPin, Trash2, LayoutGrid, Rows3 } from 'lucide-react';
import { ALL_CATEGORIES, discoverCategories, getPreferredCutoff, ROUND_LABELS } from '../../shared/lib/college';

interface CollegeCompareProps {
  comparedColleges: College[];
  selectedRound: CapRound;
  onRemoveCompare: (collegeCode: string) => void;
  onClearAll: () => void;
  onNavigateExplore: () => void;
}

type Layout = 'stacked' | 'side';

const formatCutoff = (cutoff: CutoffData | null) => {
  if (!cutoff) return <span className="text-slate-400">No published cutoff</span>;
  return (
    <div>
      <div className="font-extrabold text-google-blue-600">{cutoff.percentile.toFixed(2)}%ile</div>
      <div className="text-[11px] text-slate-500">
        {cutoff.meritNumber ? `Merit #${cutoff.meritNumber.toLocaleString()}` : 'Merit unavailable'}
      </div>
      <div className="text-[11px] text-slate-400">{cutoff.stage || 'Stage unavailable'} · {cutoff.allocation || 'Allocation unavailable'}</div>
    </div>
  );
};

const MetadataRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">{label}</span>
    <span className="text-sm text-slate-800 font-semibold text-right min-w-0 break-words">{children}</span>
  </div>
);

export const CollegeCompare: React.FC<CollegeCompareProps> = ({
  comparedColleges,
  selectedRound,
  onRemoveCompare,
  onClearAll,
  onNavigateExplore,
}) => {
  const [layout, setLayout] = useState<Layout>('stacked');
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const categories = useMemo(() => discoverCategories(comparedColleges), [comparedColleges]);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);

  useEffect(() => {
    if (selectedCategory !== ALL_CATEGORIES && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0] ?? ALL_CATEGORIES);
    }
  }, [categories, selectedCategory]);

  const courseRows = useMemo(() => {
    const courses = new Map<string, string>();
    comparedColleges.forEach((college) => college.branches.forEach((branch) => courses.set(branch.code, branch.name)));
    return Array.from(courses.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [comparedColleges]);

  const filteredCourseRows = useMemo(() => {
    if (!selectedCourse) return courseRows;
    return courseRows.filter((course) => course.code === selectedCourse);
  }, [courseRows, selectedCourse]);

  const visibleCourseRows = showAllCourses || selectedCourse
    ? filteredCourseRows
    : filteredCourseRows.slice(0, 50);

  const handleClear = () => {
    if (confirmingClear) {
      onClearAll();
      setConfirmingClear(false);
      return;
    }
    setConfirmingClear(true);
    window.setTimeout(() => setConfirmingClear(false), 3000);
  };

  if (comparedColleges.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-md max-w-xl mx-auto my-8 sm:my-12 space-y-4">
        <div className="w-16 h-16 bg-google-yellow-50 text-google-yellow-600 rounded-full flex items-center justify-center mx-auto border border-google-yellow-100 shadow-sm">
          <GitCompare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Colleges Selected for Comparison</h2>
        <p className="text-sm text-slate-500">Select up to 3 colleges from Explore or Predictor. The comparison will update for the selected CAP round.</p>
        <button onClick={onNavigateExplore} className="google-btn-primary text-sm mx-auto mt-4">Explore & Add Colleges</button>
      </div>
    );
  }

  const getBranchCutoff = (college: College, code: string) => {
    const branch = college.branches.find((candidate) => candidate.code === code);
    return getPreferredCutoff(branch, selectedCategory);
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-google-yellow-600" />
            <span><span className="hidden sm:inline">College </span><span className="text-google-yellow-600">Comparison</span></span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Comparing {comparedColleges.length} of 3 colleges · {ROUND_LABELS[selectedRound]}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-slate-600">
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="ml-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-google-blue-500"
            >
              <option value={ALL_CATEGORIES}>Best available category</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          {comparedColleges.length < 3 ? <button onClick={onNavigateExplore} className="google-btn-secondary text-xs">+ Add More ({3 - comparedColleges.length} slots)</button> : null}
          <button
            onClick={handleClear}
            className={`text-xs font-semibold px-4 py-2.5 rounded-full transition-colors flex items-center gap-1.5 ${confirmingClear ? 'bg-google-red-500 text-white' : 'text-google-red-600 bg-google-red-50 hover:bg-google-red-100 border border-google-red-200'}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmingClear ? 'Tap again to confirm' : 'Clear'}
          </button>
        </div>

        <div className="md:hidden inline-flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
          <button onClick={() => setLayout('stacked')} className={`touch-target inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-bold ${layout === 'stacked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} aria-label="Stacked view" aria-pressed={layout === 'stacked'}><Rows3 className="w-4 h-4" />Stacked</button>
          <button onClick={() => setLayout('side')} className={`touch-target inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-bold ${layout === 'side' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} aria-label="Side-by-side view" aria-pressed={layout === 'side'}><LayoutGrid className="w-4 h-4" />Side-by-side</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex-1 min-w-[220px] text-xs font-bold text-slate-600">
          Course in this comparison
          <select
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-google-blue-500"
          >
            <option value="">All courses</option>
            {courseRows.map((course) => <option key={course.code} value={course.code}>{course.name} · {course.code}</option>)}
          </select>
        </label>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-800">{visibleCourseRows.length}</span> of {filteredCourseRows.length} matching courses
        </div>
        {selectedCourse ? null : (
          <button
            onClick={() => setShowAllCourses((current) => !current)}
            className="google-btn-secondary text-xs"
          >
            {showAllCourses ? 'Show fewer courses' : 'Show all courses'}
          </button>
        )}
      </div>

      <div className="md:hidden">
        {layout === 'stacked' ? (
          <div className="space-y-3">
            {comparedColleges.map((college) => (
              <div key={college.code} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative">
                <button onClick={() => onRemoveCompare(college.code)} className="touch-target absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-google-red-500 hover:text-white text-slate-600" aria-label={`Remove ${college.name}`}><X className="w-4 h-4" /></button>
                <div className="pr-10">
                  <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded mb-1.5">DTE: {college.code}</span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">{college.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-google-red-500" />{college.city || 'Location unavailable'}{college.region ? `, ${college.region}` : ''}</p>
                </div>
                <div className="mt-3">
                  <MetadataRow label="Type">{college.status || 'Unavailable'}</MetadataRow>
                  <MetadataRow label="University">{college.homeUniversity || 'Unavailable'}</MetadataRow>
                  <MetadataRow label="Rating">
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />{college.rating === null ? 'N/A' : `${college.rating.toFixed(1)} / 5`}</span>
                  </MetadataRow>
                  <MetadataRow label="Courses">{college.branches.length}</MetadataRow>
                  <div className="mt-3 space-y-2">
                    {visibleCourseRows.map((course) => <div key={course.code} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5"><div className="text-xs font-bold text-slate-800">{course.name}</div><div className="text-[10px] text-slate-400 font-mono">{course.code}</div><div className="mt-1">{formatCutoff(getBranchCutoff(college, course.code))}</div></div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CompareTable colleges={comparedColleges} courses={visibleCourseRows} getCutoff={getBranchCutoff} onRemove={onRemoveCompare} />
        )}
      </div>

      <div className="hidden md:block">
        <CompareTable colleges={comparedColleges} courses={visibleCourseRows} getCutoff={getBranchCutoff} onRemove={onRemoveCompare} />
      </div>
    </div>
  );
};

interface CompareTableProps {
  colleges: College[];
  courses: Array<{ code: string; name: string }>;
  getCutoff: (college: College, code: string) => CutoffData | null;
  onRemove: (code: string) => void;
}

const CompareTable: React.FC<CompareTableProps> = ({ colleges, courses, getCutoff, onRemove }) => (
  <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg">
    <table className="w-full text-left border-collapse min-w-[900px]">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          <th className="p-5 text-xs uppercase tracking-wider text-slate-400 font-extrabold w-1/4 sticky left-0 bg-slate-50 z-10">Course / Metric</th>
          {colleges.map((college) => (
            <th key={college.code} className="p-5 w-1/4 align-top relative border-l border-slate-200">
              <button onClick={() => onRemove(college.code)} className="touch-target absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-slate-200 hover:bg-google-red-500 hover:text-white text-slate-600" aria-label={`Remove ${college.name}`}><X className="w-4 h-4" /></button>
              <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded mb-2">DTE: {college.code}</span>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight pr-8">{college.name}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{college.city || 'Location unavailable'}</p>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
        <tr><td className="p-4 font-bold text-slate-900 bg-slate-50/50 sticky left-0">College type</td>{colleges.map((college) => <td key={college.code} className="p-4 border-l border-slate-200">{college.status || 'Unavailable'}</td>)}</tr>
        <tr><td className="p-4 font-bold text-slate-900 bg-slate-50/50 sticky left-0">University</td>{colleges.map((college) => <td key={college.code} className="p-4 border-l border-slate-200">{college.homeUniversity || 'Unavailable'}</td>)}</tr>
        <tr><td className="p-4 font-bold text-slate-900 bg-slate-50/50 sticky left-0">Cutoff-derived score</td>{colleges.map((college) => <td key={college.code} className="p-4 border-l border-slate-200"><span className="inline-flex items-center gap-1 text-amber-700 font-bold"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />{college.rating === null ? 'N/A' : `${college.rating.toFixed(1)} / 5`}</span></td>)}</tr>
        <tr><td className="p-4 font-bold text-slate-900 bg-slate-50/50 sticky left-0">Published courses</td>{colleges.map((college) => <td key={college.code} className="p-4 border-l border-slate-200">{college.branches.length}</td>)}</tr>
        {courses.map((course) => <tr key={course.code}><td className="p-4 font-semibold text-slate-900 bg-slate-50/50 sticky left-0"><div>{course.name}</div><span className="text-[10px] text-slate-400 font-mono">{course.code}</span></td>{colleges.map((college) => <td key={college.code} className="p-4 border-l border-slate-200 align-top">{formatCutoff(getCutoff(college, course.code))}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
);
