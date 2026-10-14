import type { College, CutoffData } from '../../shared/types/college';
import { ALL_CATEGORIES, getBestCutoff, getPreferredCutoff, normalizeSearchText } from '../../shared/lib/college';

export type PredictionBucket = 'safe' | 'moderate' | 'dream';

export interface Prediction {
  college: College;
  branchName: string;
  cutoff: CutoffData;
  cutoffP: number;
  meritNumber: number | null;
  margin: number;
}

export interface Predictions {
  safeList: Prediction[];
  moderateList: Prediction[];
  dreamList: Prediction[];
}

const EMPTY_PREDICTIONS: Predictions = { safeList: [], moderateList: [], dreamList: [] };

export function calculatePredictions(
  colleges: College[],
  userPercentile: number | string,
  category: string,
  region: string,
  branchFilter: string,
): Predictions {
  const percentile = typeof userPercentile === 'number' ? userPercentile : Number.parseFloat(userPercentile);
  if (!Number.isFinite(percentile) || percentile < 0 || percentile > 100 || !category) return EMPTY_PREDICTIONS;

  const predictions: Predictions = { safeList: [], moderateList: [], dreamList: [] };
  const normalizedBranchFilter = normalizeSearchText(branchFilter);

  colleges.forEach((college) => {
    if (region !== 'ALL' && college.region !== region) return;

    college.branches.forEach((branch) => {
      if (normalizedBranchFilter && !normalizeSearchText(branch.name).includes(normalizedBranchFilter)) return;

      const cutoff = category === ALL_CATEGORIES
        ? getBestCutoff(branch)
        : getPreferredCutoff(branch, category);
      if (!cutoff) return;

      const prediction: Prediction = {
        college,
        branchName: branch.name,
        cutoff,
        cutoffP: cutoff.percentile,
        meritNumber: cutoff.meritNumber,
        margin: percentile - cutoff.percentile,
      };

      if (prediction.margin >= 0) predictions.safeList.push(prediction);
      else if (prediction.margin >= -1.5) predictions.moderateList.push(prediction);
      else if (prediction.margin >= -3.5) predictions.dreamList.push(prediction);
    });
  });

  const comparePredictions = (first: Prediction, second: Prediction) => {
    const marginDifference = Math.abs(first.margin) - Math.abs(second.margin);
    if (Math.abs(marginDifference) > 0.0001) return marginDifference;
    if (second.cutoffP !== first.cutoffP) return second.cutoffP - first.cutoffP;
    return first.college.name.localeCompare(second.college.name);
  };

  Object.values(predictions).forEach((list) => list.sort(comparePredictions));
  return predictions;
}
