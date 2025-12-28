'use client'

import Image from 'next/image';
import type { Player, ComparisonStat } from '@/lib/types';
import { useState, useEffect } from 'react';
import { formatPlayerNameWithNickname } from '@/lib/utils';

interface PlayerCompareCardProps {
  player: Player;
  stat: ComparisonStat;
  statLabel: string;
  isRevealed: boolean;
  isLeft: boolean;
  isCorrect?: boolean | null;
  onGuess?: (guessMore: boolean) => void;
  showButtons?: boolean;
}

function PlayerCompareCard({
  player,
  stat,
  statLabel,
  isRevealed,
  isLeft,
  isCorrect,
  onGuess,
  showButtons = false,
}: PlayerCompareCardProps) {
  const [animateReveal, setAnimateReveal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const statValue = player.stats[stat];

  // Reset image loaded state when player changes
  useEffect(() => {
    setImageLoaded(false);
  }, [player.id]);

  useEffect(() => {
    if (isRevealed && !isLeft) {
      setAnimateReveal(true);
      const timer = setTimeout(() => setAnimateReveal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, isLeft]);

  return (
    <div
      className={`
        relative flex flex-col items-center w-full sm:w-72 md:w-80 min-h-[500px]
        bg-gradient-to-br from-slate-800/90 to-slate-900/90
        backdrop-blur-sm rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl border border-slate-600/50
        transition-all duration-300
        ${animateReveal ? 'scale-105' : 'scale-100'}
      `}
    >
      {/* Player Photo */}
      <div className="relative w-32 h-40 sm:w-36 sm:h-44 md:w-40 md:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden border-4 border-slate-600 shadow-lg bg-slate-700">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700 animate-pulse p-4">
            <Image
              src="/logo.svg"
              alt="Loading"
              width={80}
              height={80}
              className="opacity-40"
            />
          </div>
        )}
        {player.photoUrl ? (
          <Image
            src={player.photoUrl}
            alt={player.name}
            fill
            className={`object-cover object-top transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <span className="text-6xl text-slate-400">👤</span>
          </div>
        )}
      </div>

      {/* Player Name */}
      <div className="mb-3 sm:mb-4 text-center min-h-[60px] flex flex-col justify-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          {player.name}
        </h2>
        {player.nickname && (
          <p className="text-sm text-slate-400 mt-1">
            &quot;{player.nickname}&quot;
          </p>
        )}
      </div>

      {/* Stat Display */}
      <div className="w-full">
        {isRevealed || isLeft ? (
          <div className="text-center space-y-2">
            <p className="text-white/80 text-sm">
              {isLeft ? 'tiene' : 'tiene'}
            </p>
            <div
              className={`
                text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-300 p-3 sm:p-4 rounded-xl
                bg-slate-700/50 border border-slate-600
                ${animateReveal ? 'animate-pulse' : ''}
              `}
            >
              {statValue.toLocaleString()}
            </div>
            <p className="text-white/80 text-sm">
              {statLabel} en Nacional
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-white/80 text-sm mb-4">
              ¿Tiene más o menos {statLabel}?
            </p>

            {/* Guess Buttons */}
            {showButtons && onGuess && (
              <div className="flex flex-col gap-2 sm:gap-3">
                <button
                  onClick={() => onGuess(true)}
                  className="
                    px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg
                    bg-green-600 hover:bg-green-500
                    text-white shadow-lg
                    transform transition-all duration-200
                    hover:scale-105 hover:shadow-xl
                    active:scale-95
                  "
                >
                  ⬆️ Más
                </button>
                <button
                  onClick={() => onGuess(false)}
                  className="
                    px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg
                    bg-red-600 hover:bg-red-500
                    text-white shadow-lg
                    transform transition-all duration-200
                    hover:scale-105 hover:shadow-xl
                    active:scale-95
                  "
                >
                  ⬇️ Menos
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Correct/Incorrect Indicator */}
      {isRevealed && !isLeft && isCorrect !== null && (
        <div
          className={`
            absolute -top-4 -right-4 w-16 h-16 rounded-full
            flex items-center justify-center shadow-2xl
            transform transition-all duration-500 scale-0
            ${animateReveal ? 'scale-100' : ''}
            ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
          `}
        >
          <span className="text-4xl">
            {isCorrect ? '✓' : '✗'}
          </span>
        </div>
      )}
    </div>
  );
}

export default PlayerCompareCard;
