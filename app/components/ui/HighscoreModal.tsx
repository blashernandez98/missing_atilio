'use client';

import React, { useState } from 'react';
import Modal from './modal';

interface HighscoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: number;
  score: number;
  rank: number;
  gameMode: 'wordle' | 'versus' | 'guess_player_scheduled' | 'guess_player_random';
}

const GAME_MODE_LABELS: Record<string, string> = {
  'wordle': 'Missing 11',
  'versus': '¿Quién tiene más?',
  'guess_player_scheduled': 'Adivina el Jugador',
  'guess_player_random': 'Adivina el Jugador (Aleatorio)',
};

const SCORE_LABELS: Record<string, string> = {
  'wordle': 'intentos',
  'versus': 'de racha',
  'guess_player_scheduled': 'intentos',
  'guess_player_random': 'intentos',
};

function HighscoreModal({ isOpen, onClose, entryId, score, rank, gameMode }: HighscoreModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      setError('Ingresa tu nombre');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/stats/leaderboard/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, playerName: playerName.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to save name');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPlayerName('');
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col rounded-xl items-center relative p-6 sm:p-8 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white border-2 border-red-500 shadow-2xl">
        {/* Trophy Icon */}
        <div className="text-6xl mb-4 animate-bounce">
          🏆
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          ¡Nuevo Récord!
        </h2>

        {/* Game Mode */}
        <p className="text-sm text-white/80 mb-4">
          {GAME_MODE_LABELS[gameMode]}
        </p>

        {/* Score Display */}
        <div className="bg-red-600/30 border border-red-500/50 rounded-xl px-6 py-4 mb-6 text-center">
          <div className="text-4xl font-bold text-white">
            {gameMode === 'versus' ? score : score}
          </div>
          <div className="text-sm text-white/80">
            {SCORE_LABELS[gameMode]}
          </div>
          {rank && (
            <div className="text-xs text-red-300 mt-1">
              Posición #{rank}
            </div>
          )}
        </div>

        {!submitted ? (
          <>
            {/* Name Input */}
            <div className="w-full mb-4">
              <label className="block text-sm text-white/80 mb-2 text-center">
                Escribí tu nombre para el ranking:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 15))}
                placeholder="Tu nombre..."
                maxLength={15}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 text-center text-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/50"
                disabled={isSubmitting}
                autoFocus
              />
              <p className="text-xs text-white/60 text-center mt-1">
                {playerName.length}/15 caracteres
              </p>
            </div>

            {error && (
              <p className="text-red-300 text-sm mb-4">{error}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold transition-all"
                disabled={isSubmitting}
              >
                Omitir
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !playerName.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-lg font-semibold">¡Nombre guardado!</p>
              <p className="text-sm text-white/80">
                Tu récord quedó registrado como <strong>{playerName}</strong>
              </p>
            </div>

            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
            >
              Continuar
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

export default HighscoreModal;
