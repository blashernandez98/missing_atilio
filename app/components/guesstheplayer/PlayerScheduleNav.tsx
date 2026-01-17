'use client';

import React from 'react';

interface PlayerScheduleNavProps {
  currentDate: string | null; // null means random mode
  isCompleted: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onShowInstructions: () => void;
}

function PlayerScheduleNav({
  currentDate,
  isCompleted,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onShowInstructions,
}: PlayerScheduleNavProps) {
  const isRandomMode = currentDate === null;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 relative">
      {/* Label above navigation */}
      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">
        Jugador del día
      </span>

      {/* Centered Navigation */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="text-white/60 hover:text-white transition-colors text-xl sm:text-2xl disabled:opacity-30 disabled:cursor-not-allowed p-1"
          aria-label="Jugador anterior"
        >
          ◀
        </button>

        <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[160px] justify-center">
          {isRandomMode ? (
            <span className="text-white/90 text-sm sm:text-base font-semibold px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded">
              Jugador al azar
            </span>
          ) : (
            <>
              <span className="text-white/90 text-sm sm:text-base font-semibold">
                {currentDate}
              </span>
              {isCompleted && (
                <span className="text-green-400 text-sm" title="Completado">
                  ✓
                </span>
              )}
            </>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="text-white/60 hover:text-white transition-colors text-xl sm:text-2xl disabled:opacity-30 disabled:cursor-not-allowed p-1"
          aria-label="Jugador siguiente"
        >
          ▶
        </button>
      </div>

      {/* Help button - positioned absolutely on the right */}
      <button
        onClick={onShowInstructions}
        className="absolute right-4 top-1/2 -translate-y-1/2 group flex items-center gap-2 px-3 py-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-white font-bold transition-all border border-slate-600 hover:border-slate-500"
        aria-label="Cómo jugar"
      >
        <span className="text-lg">?</span>
        <span className="hidden sm:group-hover:inline text-sm font-normal whitespace-nowrap">
          Cómo jugar
        </span>
      </button>
    </div>
  );
}

export default PlayerScheduleNav;
