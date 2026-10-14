import type { Branch, CapRound, CategoryCutoffs, College, CutoffData } from '../types/college';

export const ALL_CATEGORIES = 'ALL';
export const ALL_BRANCHES = 'ALL';

export const ROUND_LABELS: Record<CapRound, string> = {
  1: 'CAP Round 1',
  2: 'CAP Round 2',
  3: 'CAP Round 3',
  4: 'CAP Round 4',
};

export function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getRoundCutoffs(branch: Branch | undefined): CategoryCutoffs {
  return branch?.cutoffs ?? {};
}

export function getCategoryCutoffs(branch: Branch | undefined, category: string): CutoffData[] {
  if (!branch) return [];
  if (category === ALL_CATEGORIES) {
    return Object.values(getRoundCutoffs(branch)).flat();
  }
  return getRoundCutoffs(branch)[category] ?? [];
}

export function getPreferredCutoff(
  branch: Branch | undefined,
  category: string,
): CutoffData | null {
  const values = getCategoryCutoffs(branch, category);
  if (values.length === 0) return null;

  // For a specific category, use the strongest published cutoff in that
  // selected round. All underlying stage/allocation facts remain available.
  return values.reduce((best, current) =>
    current.percentile > best.percentile ? current : best,
  );
}

export function hasCategoryCutoff(branch: Branch, category: string): boolean {
  return getCategoryCutoffs(branch, category).length > 0;
}

export function hasAnyCutoff(branch: Branch): boolean {
  return Object.values(getRoundCutoffs(branch)).some((values) => values.length > 0);
}

export function findPreferredBranch(college: College, category: string): Branch | undefined {
  const branchesWithData = college.branches.filter((branch) => hasCategoryCutoff(branch, category));
  return branchesWithData.find(isComputerBranch) ?? branchesWithData[0];
}

export function findBestBranchForFilter(
  college: College,
  category: string,
  branchQuery: string,
): { branch: Branch; cutoff: CutoffData } | null {
  const query = normalizeSearchText(branchQuery);
  const candidates = college.branches
    .filter((branch) => query === '' || normalizeSearchText(branch.name).includes(query))
    .map((branch) => ({ branch, cutoff: getPreferredCutoff(branch, category) }))
    .filter((item): item is { branch: Branch; cutoff: CutoffData } => item.cutoff !== null);

  if (candidates.length === 0) return null;
  return candidates.reduce((best, current) =>
    current.cutoff.percentile > best.cutoff.percentile ? current : best,
  );
}

export function isComputerBranch(branch: Branch): boolean {
  const name = normalizeSearchText(branch.name);
  return name.includes('computer') || name.includes('cse');
}

export function findBranchByKeywords(college: College, keywords: string[]): Branch | undefined {
  const normalizedKeywords = keywords.map(normalizeSearchText);
  return college.branches.find((branch) => {
    const name = normalizeSearchText(branch.name);
    return normalizedKeywords.some((keyword) => name.includes(keyword));
  });
}

export function getBestCutoff(branch: Branch | undefined): CutoffData | null {
  return getPreferredCutoff(branch, ALL_CATEGORIES);
}

export function discoverCategories(colleges: College[]): string[] {
  return Array.from(
    new Set(
      colleges.flatMap((college) =>
        college.branches.flatMap((branch) => Object.keys(branch.cutoffs)),
      ),
    ),
  ).sort((first, second) => first.localeCompare(second));
}

export function collegeSearchText(college: College): string {
  return normalizeSearchText([
    college.code,
    college.name,
    college.shortName,
    college.city,
    college.region,
    college.status,
    college.homeUniversity,
    college.ownership,
    ...college.branches.flatMap((branch) => [branch.code, branch.name]),
  ].filter(Boolean).join(' '));
}
