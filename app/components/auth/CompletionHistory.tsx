'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/modal';
import { useAuth } from '@/contexts/AuthContext';
import { GameCompletion } from '@/lib/types';

interface CompletionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAME_MODE_LABELS: Record<string, string> = {
  wordle: 'Missing 11',
  guess_player_scheduled: 'Adivina el Jugador',
  versus: 'Versus',
};

// Format date for display - handles both DD/MM/YYYY and ISO timestamps
function formatDate(dateStr: string): string {
  // Check if it's an ISO timestamp (versus games)
  if (dateStr.includes('T')) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  // Otherwise return as-is (DD/MM/YYYY format)
  return dateStr;
}

function CompletionHistory({ isOpen, onClose }: CompletionHistoryProps) {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<GameCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      fetch('/api/user/completions')
        .then((res) => res.json())
        .then((data) => {
          setCompletions(data.completions || []);
        })
        .catch(() => {
          setCompletions([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, user]);

  const filteredCompletions = filter === 'all'
    ? completions
    : completions.filter((c) => c.gameMode === filter);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col rounded-xl relative p-6 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white border-2 border-red-500 shadow-2xl min-w-[320px] sm:min-w-[400px] max-h-[80vh]">
        {/* Header */}
        <h2 className="text-xl font-bold text-center mb-4">
          Historial de Partidas
        </h2>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('wordle')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'wordle'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Missing 11
          </button>
          <button
            onClick={() => setFilter('guess_player_scheduled')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'guess_player_scheduled'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Adivina
          </button>
          <button
            onClick={() => setFilter('versus')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'versus'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Versus
          </button>
        </div>

        {/* Completions List */}
        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : filteredCompletions.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>No hay partidas completadas</p>
              {filter !== 'all' && (
                <p className="text-sm mt-1">en esta categoría</p>
              )}
            </div>
          ) : (
            filteredCompletions.map((completion) => (
              <div
                key={completion.id}
                className="flex justify-between items-center p-3 bg-white/10 rounded-lg"
              >
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">
                    {formatDate(completion.gameDate)}
                  </span>
                  <span className="text-white/60 text-xs">
                    {GAME_MODE_LABELS[completion.gameMode] || completion.gameMode}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  {completion.gameMode === 'versus' ? (
                    <>
                      <span className="text-cyan-400 font-bold text-sm">
                        Racha: {completion.score}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`font-bold text-sm ${
                          completion.won ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {completion.won ? 'Ganado' : 'Perdido'}
                      </span>
                      <span className="text-white/60 text-xs">
                        {completion.score} {completion.gameMode === 'wordle' ? 'total' : 'intentos'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {!isLoading && filteredCompletions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Total partidas:</span>
              <span className="text-white font-semibold">{filteredCompletions.length}</span>
            </div>
            {filter === 'versus' ? (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Mejor racha:</span>
                <span className="text-cyan-400 font-semibold">
                  {Math.max(...filteredCompletions.map((c) => c.score), 0)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Victorias:</span>
                <span className="text-green-400 font-semibold">
                  {filteredCompletions.filter((c) => c.won).length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold transition-all"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}

export default CompletionHistory;
