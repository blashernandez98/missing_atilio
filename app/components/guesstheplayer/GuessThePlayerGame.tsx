'use client'

import { useState, useEffect } from 'react';
import type { Player, GuessThePlayerGameState, PlayerGuess, ComparisonResult } from '@/lib/types';
import PlayerAutocomplete from './PlayerAutocomplete';
import GuessResult from './GuessResult';
import GuessGameOver from './GuessGameOver';
import playersData from '@/app/data/players.json';

interface GuessThePlayerGameProps {
  playerId?: number; // Optional: for scheduled daily player
}

function GuessThePlayerGame({ playerId }: GuessThePlayerGameProps) {
  const players: Player[] = playersData as Player[];

  const [gameState, setGameState] = useState<GuessThePlayerGameState>({
    targetPlayer: null,
    guesses: [],
    gameOver: false,
    won: false,
    maxGuesses: 5,
  });

  // Initialize game with target player
  useEffect(() => {
    const initializeGame = async () => {
      let targetPlayer: Player | null = null;

      if (playerId !== undefined) {
        // Use provided player ID
        targetPlayer = players.find(p => p.id === playerId) || null;
      } else {
        // Try to fetch scheduled player for today
        try {
          const response = await fetch('/api/player-schedule/today');
          if (response.ok) {
            const schedule = await response.json();
            targetPlayer = players.find(p => p.id === schedule.playerId) || null;
          }
        } catch (error) {
          console.log('No scheduled player for today, using random player');
        }

        // Fallback to random player if no scheduled player
        if (!targetPlayer) {
          const randomIndex = Math.floor(Math.random() * players.length);
          targetPlayer = players[randomIndex];
        }
      }

      setGameState(prev => ({
        ...prev,
        targetPlayer,
        guesses: [],
        gameOver: false,
        won: false,
      }));
    };

    initializeGame();
  }, [playerId]);

  const parseDate = (dateString: string | undefined): Date | null => {
    if (!dateString || dateString.trim() === '') return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  const compareValues = (
    guessedValue: string | number | undefined,
    targetValue: string | number | undefined,
    isNumeric: boolean
  ): ComparisonResult => {
    if (isNumeric) {
      // For numeric values, convert to numbers
      const guessedNum = typeof guessedValue === 'number' ? guessedValue : (guessedValue ? parseFloat(guessedValue.toString()) : NaN);
      const targetNum = typeof targetValue === 'number' ? targetValue : (targetValue ? parseFloat(targetValue.toString()) : NaN);

      // If either value is missing or invalid, return 'different'
      if (isNaN(guessedNum) || isNaN(targetNum)) {
        return 'different';
      }

      // Compare numbers
      if (guessedNum === targetNum) return 'exact';
      return guessedNum < targetNum ? 'higher' : 'lower';
    }

    // String comparison for non-numeric values
    // Handle missing values
    if (
      guessedValue === undefined ||
      guessedValue === null ||
      guessedValue === '' ||
      targetValue === undefined ||
      targetValue === null ||
      targetValue === ''
    ) {
      return 'different';
    }

    return guessedValue.toString().toLowerCase() === targetValue.toString().toLowerCase() ? 'exact' : 'different';
  };

  const compareDates = (guessedDate: string | undefined, targetDate: string | undefined): ComparisonResult => {
    const guessedParsed = parseDate(guessedDate);
    const targetParsed = parseDate(targetDate);

    if (!guessedParsed || !targetParsed) {
      return 'different';
    }

    if (guessedParsed.getTime() === targetParsed.getTime()) return 'exact';
    return guessedParsed < targetParsed ? 'higher' : 'lower';
  };

  const handleGuess = (guessedPlayer: Player) => {
    if (!gameState.targetPlayer || gameState.gameOver) return;

    const comparisons = {
      country: compareValues(guessedPlayer.country, gameState.targetPlayer.country, false),
      birthCity: compareValues(guessedPlayer.birthCity, gameState.targetPlayer.birthCity, false),
      birthDate: compareDates(guessedPlayer.birthDate, gameState.targetPlayer.birthDate),
      debutYear: compareValues(guessedPlayer.debutYear, gameState.targetPlayer.debutYear, true),
      totalMatches: compareValues(guessedPlayer.stats.totalMatches, gameState.targetPlayer.stats.totalMatches, true),
      totalGoals: compareValues(guessedPlayer.stats.totalGoals, gameState.targetPlayer.stats.totalGoals, true),
      originClub: compareValues(guessedPlayer.originClub, gameState.targetPlayer.originClub, false),
      officialTitles: compareValues(guessedPlayer.stats.officialTitles, gameState.targetPlayer.stats.officialTitles, true),
    };

    const newGuess: PlayerGuess = {
      player: guessedPlayer,
      comparisons,
    };

    const newGuesses = [...gameState.guesses, newGuess];
    const isWin = guessedPlayer.id === gameState.targetPlayer.id;
    const isGameOver = isWin || newGuesses.length >= gameState.maxGuesses;

    setGameState({
      ...gameState,
      guesses: newGuesses,
      gameOver: isGameOver,
      won: isWin,
    });
  };

  const resetGame = () => {
    // Reset to a new random player
    const randomIndex = Math.floor(Math.random() * players.length);
    const newTargetPlayer = players[randomIndex];

    setGameState({
      targetPlayer: newTargetPlayer,
      guesses: [],
      gameOver: false,
      won: false,
      maxGuesses: 5,
    });
  };

  if (!gameState.targetPlayer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-xl">Cargando juego...</p>
      </div>
    );
  }

  const guessedPlayerIds = gameState.guesses.map(g => g.player.id);
  const remainingGuesses = gameState.maxGuesses - gameState.guesses.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Adivina el Jugador
        </h1>
        <p className="text-slate-300 text-lg">
          Tienes {remainingGuesses} {remainingGuesses === 1 ? 'intento' : 'intentos'} restante{remainingGuesses !== 1 ? 's' : ''}
        </p>
      </div>

      {!gameState.gameOver && (
        <div className="mb-8">
          <PlayerAutocomplete
            players={players}
            onSelectPlayer={handleGuess}
            excludePlayerIds={guessedPlayerIds}
            disabled={gameState.gameOver}
          />
        </div>
      )}

      {gameState.guesses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Tus intentos:</h2>
          <div className="space-y-3">
            {[...gameState.guesses].reverse().map((guess, reverseIndex) => {
              const originalIndex = gameState.guesses.length - 1 - reverseIndex;
              return <GuessResult key={originalIndex} guess={guess} index={originalIndex} />;
            })}
          </div>
        </div>
      )}

      {gameState.gameOver && (
        <GuessGameOver
          player={gameState.targetPlayer}
          won={gameState.won}
          guessCount={gameState.guesses.length}
          maxGuesses={gameState.maxGuesses}
          onPlayAgain={resetGame}
        />
      )}

      {/* Legend */}
      {gameState.guesses.length > 0 && !gameState.gameOver && (
        <div className="mt-8 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-300 mb-2">Leyenda:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>Exacto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⬆️</span>
              <span>Mayor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⬇️</span>
              <span>Menor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <span>Diferente</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuessThePlayerGame;
