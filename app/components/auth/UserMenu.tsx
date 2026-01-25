'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CompletionHistory from './CompletionHistory';

function UserMenu() {
  const { user, streaks, logout, migrateLocalStorageData, refreshStreaks } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await migrateLocalStorageData();
      await refreshStreaks();
    } finally {
      setIsSyncing(false);
    }
  };

  const wordleStreak = streaks['wordle'];
  const guessStreak = streaks['guess_player_scheduled'];

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* User Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white text-sm"
        >
          <span className="font-semibold">{user.username}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-lg bg-slate-900 border border-slate-600 shadow-xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-600">
              <p className="text-white font-semibold">{user.username}</p>
              <p className="text-slate-400 text-xs">Cuenta activa</p>
            </div>

            {/* Streaks Section */}
            <div className="px-4 py-3 border-b border-slate-600">
              <p className="text-slate-400 text-xs uppercase mb-2">Rachas</p>
              <div className="space-y-2">
                {/* Missing 11 Streak */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Missing 11</span>
                  <div className="flex items-center gap-2">
                    {wordleStreak ? (
                      <>
                        <span className="text-green-400 text-sm font-bold">
                          {wordleStreak.current} actual
                        </span>
                        <span className="text-slate-500 text-xs">
                          (mejor: {wordleStreak.best})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-sm">-</span>
                    )}
                  </div>
                </div>

                {/* Guess Player Streak */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Adivina el Jugador</span>
                  <div className="flex items-center gap-2">
                    {guessStreak ? (
                      <>
                        <span className="text-green-400 text-sm font-bold">
                          {guessStreak.current} actual
                        </span>
                        <span className="text-slate-500 text-xs">
                          (mejor: {guessStreak.best})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-sm">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setShowHistory(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 text-sm transition-colors"
              >
                Historial de partidas
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 text-sm transition-colors disabled:opacity-50"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar datos locales'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 text-sm transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Completion History Modal */}
      <CompletionHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}

export default UserMenu;
