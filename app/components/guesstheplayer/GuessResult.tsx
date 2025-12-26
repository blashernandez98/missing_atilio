'use client'

import type { PlayerGuess, ComparisonResult } from '@/lib/types';

interface GuessResultProps {
  guess: PlayerGuess;
  index: number;
}

interface StatCellProps {
  label: string;
  value: string | number | undefined;
  comparison: ComparisonResult;
}

function StatCell({ label, value, comparison }: StatCellProps) {
  const getComparisonIcon = () => {
    switch (comparison) {
      case 'exact':
        return '✓';
      case 'higher':
        return '⬆️';
      case 'lower':
        return '⬇️';
      case 'different':
        return '❌';
    }
  };

  const getComparisonColor = () => {
    switch (comparison) {
      case 'exact':
        return 'bg-green-600/30 border-green-500';
      case 'higher':
        return 'bg-yellow-600/30 border-yellow-500';
      case 'lower':
        return 'bg-yellow-600/30 border-yellow-500';
      case 'different':
        return 'bg-red-600/30 border-red-500';
    }
  };

  const displayValue = value !== undefined && value !== null && value !== '' ? value : 'N/A';

  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 ${getComparisonColor()} transition-all`}>
      <div className="text-2xl mb-1">{getComparisonIcon()}</div>
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm text-slate-100 font-bold text-center">{displayValue}</div>
    </div>
  );
}

function GuessResult({ guess, index }: GuessResultProps) {
  const { player, comparisons } = guess;

  return (
    <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white">
            {index + 1}
          </div>
          <div>
            <div className="font-bold text-white text-lg">{player.fullName}</div>
            <div className="text-sm text-slate-400">{player.name}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCell
          label="País"
          value={player.country}
          comparison={comparisons.country}
        />
        <StatCell
          label="Ciudad"
          value={player.birthCity}
          comparison={comparisons.birthCity}
        />
        <StatCell
          label="F. Nac."
          value={player.birthDate}
          comparison={comparisons.birthDate}
        />
        <StatCell
          label="Debut"
          value={player.debutYear}
          comparison={comparisons.debutYear}
        />
        <StatCell
          label="Partidos"
          value={player.stats.totalMatches}
          comparison={comparisons.totalMatches}
        />
        <StatCell
          label="Goles"
          value={player.stats.totalGoals}
          comparison={comparisons.totalGoals}
        />
        <StatCell
          label="Proviene"
          value={player.originClub}
          comparison={comparisons.originClub}
        />
        <StatCell
          label="Títulos"
          value={player.stats.officialTitles}
          comparison={comparisons.officialTitles}
        />
      </div>
    </div>
  );
}

export default GuessResult;
