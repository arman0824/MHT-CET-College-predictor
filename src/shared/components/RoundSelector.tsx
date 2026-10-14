import React from 'react';
import { CAP_ROUNDS, type CapRound } from '../types/college';
import { ROUND_LABELS } from '../lib/college';

interface RoundSelectorProps {
  value: CapRound;
  onChange: (round: CapRound) => void;
  compact?: boolean;
}

export const RoundSelector: React.FC<RoundSelectorProps> = ({ value, onChange, compact = false }) => (
  <label className={`inline-flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} font-bold text-slate-700`}>
    <span className="shrink-0">{compact ? 'Round' : 'Cutoff round'}</span>
    <select
      value={value}
      onChange={(event) => onChange(Number(event.target.value) as CapRound)}
      className="touch-target rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-google-blue-500"
      aria-label="Select CAP cutoff round"
    >
      {CAP_ROUNDS.map((round) => (
        <option key={round} value={round}>{ROUND_LABELS[round]}</option>
      ))}
    </select>
  </label>
);
