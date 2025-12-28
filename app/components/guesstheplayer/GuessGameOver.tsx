'use client'

import Image from 'next/image';
import Link from 'next/link';
import type { Player } from '@/lib/types';
import { POSITION_MAPPINGS } from '@/lib/position-mappings';

interface GuessGameOverProps {
  player: Player;
  won: boolean;
  guessCount: number;
  maxGuesses: number;
  onPlayAgain: () => void;
}

function GuessGameOver({ player, won, guessCount, maxGuesses, onPlayAgain }: GuessGameOverProps) {
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
    <div className="w-full mb-6">
      <div className={`
        bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8
        border-4 shadow-2xl
        ${won ? 'border-yellow-500 shadow-yellow-500/20' : 'border-slate-600'}
      `}>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${won ? 'text-yellow-400' : 'text-red-400'}`}>
            {won ? '¡Felicitaciones! 🎉' : 'Juego Terminado'}
          </h2>
          {won && (
            <p className="text-slate-300">
              ¡Adivinaste en {guessCount} {guessCount === 1 ? 'intento' : 'intentos'}!
            </p>
          )}
          {!won && (
            <p className="text-slate-300">
              El jugador era:
            </p>
          )}
        </div>

        {/* Player Info */}
        <div className="bg-slate-800/50 rounded-xl p-4 md:p-6 border border-slate-700 mb-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Player Photo */}
            {player.photoUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={player.photoUrl}
                  alt={player.name}
                  width={120}
                  height={120}
                  className="rounded-lg border-2 border-cyan-500"
                  unoptimized
                />
              </div>
            )}

            {/* Player Details */}
            <div className="flex-grow">
              <h3 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1 text-center md:text-left">
                {player.name}
              </h3>
              {player.nickname && (
                <p className="text-sm text-slate-400 mb-2 text-center md:text-left">
                  &quot;{player.nickname}&quot;
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">País</p>
                  <p className="text-white font-bold">{player.country || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">Ciudad</p>
                  <p className="text-white font-bold">{player.birthCity || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">Posición</p>
                  <p className="text-white font-bold">{getPositionLabel(player.positionCategory)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">F. Nac.</p>
                  <p className="text-white font-bold">{player.birthDate || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">Debut</p>
                  <p className="text-white font-bold">{player.debutYear || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">Partidos</p>
                  <p className="text-white font-bold">{player.stats.totalMatches}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">Goles</p>
                  <p className="text-white font-bold">{player.stats.totalGoals}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">Proviene</p>
                  <p className="text-white font-bold">{player.originClub || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-slate-400 text-xs mb-1">Títulos</p>
                  <p className="text-white font-bold">{player.stats.officialTitles}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <button className="w-full px-4 py-2 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors">
              Inicio
            </button>
          </Link>
          <button
            onClick={onPlayAgain}
            className="flex-1 px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Jugar de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuessGameOver;
