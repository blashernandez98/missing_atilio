'use client'

import Image from 'next/image';
import Link from 'next/link';
import type { Player } from '@/lib/types';

interface GuessGameOverProps {
  player: Player;
  won: boolean;
  guessCount: number;
  maxGuesses: number;
  onPlayAgain: () => void;
}

function GuessGameOver({ player, won, guessCount, maxGuesses, onPlayAgain }: GuessGameOverProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-slate-600 shadow-2xl transform transition-all duration-300 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
            {won ? '¡Felicitaciones! 🎉' : '¡Juego Terminado!'}
          </h2>
          {won && (
            <p className="text-slate-300 text-lg">
              ¡Adivinaste en {guessCount} {guessCount === 1 ? 'intento' : 'intentos'}!
            </p>
          )}
          {!won && (
            <p className="text-slate-300 text-lg">
              El jugador era:
            </p>
          )}
        </div>

        {/* Player Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Player Photo */}
            {player.photoUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={player.photoUrl}
                  alt={player.fullName}
                  width={150}
                  height={150}
                  className="rounded-lg border-2 border-cyan-500"
                />
              </div>
            )}

            {/* Player Details */}
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-4">
                {player.fullName}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">País</p>
                  <p className="text-white font-bold">{player.country || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Ciudad</p>
                  <p className="text-white font-bold">{player.birthCity || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">F. Nacimiento</p>
                  <p className="text-white font-bold">{player.birthDate || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Debut</p>
                  <p className="text-white font-bold">{player.debutYear || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Partidos</p>
                  <p className="text-white font-bold">{player.stats.totalMatches}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Goles</p>
                  <p className="text-white font-bold">{player.stats.totalGoals}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Proviene</p>
                  <p className="text-white font-bold">{player.originClub || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
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
            <button className="w-full px-6 py-3 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors shadow-lg">
              Inicio
            </button>
          </Link>
          <button
            onClick={onPlayAgain}
            className="flex-1 px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg"
          >
            Jugar de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuessGameOver;
