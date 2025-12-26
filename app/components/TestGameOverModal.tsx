'use client'

import { useState } from 'react';

interface TestGameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTest: (solvedPlayers: number, totalGuesses: number) => void;
}

function TestGameOverModal({ isOpen, onClose, onTest }: TestGameOverModalProps) {
  const [solvedPlayers, setSolvedPlayers] = useState(8);
  const [totalGuesses, setTotalGuesses] = useState(15);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTest(solvedPlayers, totalGuesses);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border-2 border-slate-600 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          🧪 Test Game Over
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Solved Players */}
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Jugadores Resueltos (0-11)
            </label>
            <input
              type="number"
              min="0"
              max="11"
              value={solvedPlayers}
              onChange={(e) => setSolvedPlayers(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Total Guesses */}
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Número de Intentos (11-60)
            </label>
            <input
              type="number"
              min="11"
              max="60"
              value={totalGuesses}
              onChange={(e) => setTotalGuesses(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Probar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestGameOverModal;
