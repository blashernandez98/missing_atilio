'use client'

import { useState, useEffect, useRef } from 'react';
import type { Player, GuessThePlayerGameState, PlayerGuess, ComparisonResult } from '@/lib/types';
import PlayerAutocomplete, { PlayerAutocompleteRef } from './PlayerAutocomplete';
import GuessResult from './GuessResult';
import GuessGameOver from './GuessGameOver';
import playersData from '@/app/data/players.json';

interface GuessThePlayerGameProps {
  playerId?: number; // Optional: for scheduled daily player
}

function GuessThePlayerGame({ playerId }: GuessThePlayerGameProps) {
  const players: Player[] = playersData as Player[];
  const autocompleteRef = useRef<PlayerAutocompleteRef>(null);

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
      positionCategory: compareValues(guessedPlayer.positionCategory, gameState.targetPlayer.positionCategory, false),
    };

    const newGuess: PlayerGuess = {
      player: guessedPlayer,
      comparisons,
    };

    const newGuesses = [...gameState.guesses, newGuess];
    const isWin = guessedPlayer.id === gameState.targetPlayer.id;
    const isGameOver = isWin;

    setGameState({
      ...gameState,
      guesses: newGuesses,
      gameOver: isGameOver,
      won: isWin,
    });

    // Auto-focus the input after submitting a guess (if not game over)
    if (!isGameOver) {
      setTimeout(() => {
        autocompleteRef.current?.focus();
      }, 100);
    }
  };

  const handleGiveUp = () => {
    setGameState({
      ...gameState,
      gameOver: true,
      won: false,
      hasGivenUp: true,
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
      hasGivenUp: false,
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Game Over Card at Top with Animation */}
      {gameState.gameOver && (
        <div className="animate-slide-down">
          <GuessGameOver
            player={gameState.targetPlayer}
            won={gameState.won}
            guessCount={gameState.guesses.length}
            maxGuesses={gameState.maxGuesses}
            onPlayAgain={resetGame}
          />
        </div>
      )}

      {!gameState.gameOver && (
        <div className="mb-8 space-y-3">
          <PlayerAutocomplete
            ref={autocompleteRef}
            players={players}
            onSelectPlayer={handleGuess}
            excludePlayerIds={guessedPlayerIds}
            disabled={gameState.gameOver}
          />
          <div className="text-center">
            <button
              onClick={handleGiveUp}
              disabled={gameState.guesses.length < 3}
              className={`px-6 py-2 rounded-lg font-semibold border-2 transition-colors ${
                gameState.guesses.length < 3
                  ? 'bg-slate-700/20 text-slate-500 border-slate-600/50 cursor-not-allowed'
                  : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-600/50'
              }`}
            >
              Rendirse
            </button>
          </div>
        </div>
      )}

      {gameState.guesses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Tus intentos:
          </h2>
          <div className="space-y-2">
            {/* Show all guesses in reverse order */}
            {[...gameState.guesses].reverse().map((guess, reverseIndex) => {
              const originalIndex = gameState.guesses.length - 1 - reverseIndex;
              return <GuessResult key={originalIndex} guess={guess} index={originalIndex} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default GuessThePlayerGame;
