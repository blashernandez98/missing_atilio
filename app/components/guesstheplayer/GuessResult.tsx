'use client'

import type { PlayerGuess, ComparisonResult } from '@/lib/types';

interface GuessResultProps {
  guess: PlayerGuess;
  index: number;
  isAnswer?: boolean;
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
        return '↑';
      case 'lower':
        return '↓';
      case 'different':
        return '✗';
    }
  };

  const getComparisonColor = () => {
    switch (comparison) {
      case 'exact':
        return 'bg-green-600/30 border-green-500';
      case 'higher':
        return 'bg-slate-600/30 border-slate-400';
      case 'lower':
        return 'bg-slate-600/30 border-slate-400';
      case 'different':
        return 'bg-red-600/30 border-red-500';
    }
  };

  const getIconBadgeColor = () => {
    switch (comparison) {
      case 'exact':
        return 'bg-green-600 border-green-500 text-white';
      case 'higher':
        return 'bg-slate-300 border-slate-200 text-slate-900';
      case 'lower':
        return 'bg-slate-300 border-slate-200 text-slate-900';
      case 'different':
        return 'bg-red-600 border-red-500 text-white';
    }
  };

  const displayValue = value !== undefined && value !== null && value !== '' ? value : 'N/A';

  return (
    <div className={`relative flex flex-col items-center justify-center p-1 rounded border ${getComparisonColor()} transition-all`}>
      {/* Icon in top-right corner */}
      <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold border ${getIconBadgeColor()}`}>
        {getComparisonIcon()}
      </div>

      <div className="text-xs text-slate-400 font-semibold uppercase tracking-tight">{label}</div>
      <div className="text-xs text-slate-100 font-bold text-center truncate max-w-full">{displayValue}</div>
    </div>
  );
}

function GuessResult({ guess, index, isAnswer = false }: GuessResultProps) {
  const { player, comparisons } = guess;

  // Get position label from category
  const getPositionLabel = (category?: string): string => {
    if (!category) return 'N/A';
    const labels: Record<string, string> = {
      'GOL': 'Arquero',
      'DEF': 'Defensa',
      'MED': 'Mediocampista',
      'ATA': 'Delantero',
    };
    return labels[category] || category;
  };

  return (
    <div className={`w-full rounded-lg p-2 border mb-2 animate-slide-down ${
      isAnswer
        ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-500 border-2'
        : 'bg-slate-800/50 border-slate-700'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          isAnswer ? 'bg-yellow-600' : 'bg-cyan-600'
        }`}>
          {isAnswer ? '★' : index + 1}
        </div>
        <div className={`font-bold text-white ${isAnswer ? 'text-base' : 'text-sm'}`}>
          {player.name}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
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
          label="Posición"
          value={getPositionLabel(player.positionCategory)}
          comparison={comparisons.positionCategory}
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
