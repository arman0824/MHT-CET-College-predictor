export const CAP_ROUNDS = [1, 2, 3, 4] as const;

export type CapRound = (typeof CAP_ROUNDS)[number];

export interface CutoffData {
  percentile: number;
  meritNumber: number | null;
  stage: string | null;
  allocation: string | null;
}

export type CategoryCutoffs = Record<string, CutoffData[]>;

export interface Branch {
  code: string;
  name: string;
  intake: number | null;
  cutoffs: CategoryCutoffs;
}

export interface College {
  code: string;
  name: string;
  shortName: string;
  city: string | null;
  region: string | null;
  status: string | null;
  homeUniversity: string | null;
  ownership: string | null;
  autonomous: boolean | null;
  minority: boolean | null;
  established: number | null;
  fees: number | null;
  website: string | null;
  rating: number | null;
  ratingSource: string;
  metadataSource: string;
  branches: Branch[];
}
