import type { CapRound, College } from '../types/college';

const DATA_URL = (round: CapRound) => `/data/colleges-2026-round${round}.json`;
const collegesRequests = new Map<CapRound, Promise<College[]>>();

function isValidCutoff(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const cutoff = value as Record<string, unknown>;
  return typeof cutoff.percentile === 'number'
    && Number.isFinite(cutoff.percentile)
    && cutoff.percentile >= 0
    && cutoff.percentile <= 100
    && (cutoff.meritNumber === null || typeof cutoff.meritNumber === 'number');
}

function validateColleges(value: unknown): College[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { colleges?: unknown }).colleges)) {
    throw new Error('The college dataset has an invalid structure.');
  }

  const colleges = (value as { colleges: unknown[] }).colleges;
  for (const college of colleges) {
    if (!college || typeof college !== 'object') throw new Error('The college dataset contains an invalid college.');
    const record = college as Record<string, unknown>;
    if (typeof record.code !== 'string' || typeof record.name !== 'string' || !Array.isArray(record.branches)) {
      throw new Error('The college dataset contains an invalid college record.');
    }
    for (const branch of record.branches) {
      if (!branch || typeof branch !== 'object') throw new Error('The college dataset contains an invalid course.');
      const branchRecord = branch as Record<string, unknown>;
      if (typeof branchRecord.code !== 'string' || typeof branchRecord.name !== 'string' || typeof branchRecord.cutoffs !== 'object') {
        throw new Error('The college dataset contains an invalid course record.');
      }
      for (const values of Object.values(branchRecord.cutoffs as Record<string, unknown>)) {
        if (!Array.isArray(values) || !values.every(isValidCutoff)) {
          throw new Error('The college dataset contains an invalid cutoff.');
        }
      }
    }
  }

  return colleges as College[];
}

export function fetchColleges(round: CapRound): Promise<College[]> {
  const existingRequest = collegesRequests.get(round);
  if (existingRequest) return existingRequest;

  const request = fetch(DATA_URL(round)).then(async (response) => {
    if (!response.ok) throw new Error('College data could not be loaded.');
    return validateColleges(await response.json());
  });

  collegesRequests.set(round, request);
  return request;
}
