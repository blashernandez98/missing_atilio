'use client'

import { useState, useEffect, useRef } from 'react';
import type { Player, GuessThePlayerGameState, PlayerGuess, ComparisonResult } from '@/lib/types';
import PlayerAutocomplete, { PlayerAutocompleteRef } from './PlayerAutocomplete';
import GuessResult from './GuessResult';
import GuessGameOver from './GuessGameOver';
import playersData from '@/app/data/players.json';

// Data stored in localStorage for completed games
export interface CompletionData {
  guessCount: number;
  won: boolean;
}

interface GuessThePlayerGameProps {
  playerId: number; // The target player ID to guess
  scheduleDate: string | null; // The schedule date (null = random mode)
  previousCompletion: CompletionData | null; // If the game was already completed, this contains the result
  onComplete: (data: CompletionData) => void; // Called when game is completed (won or gave up)
  onPlayAgain: () => void; // Called when user wants to play again
}

function GuessThePlayerGame({ playerId, scheduleDate, previousCompletion, onComplete, onPlayAgain }: GuessThePlayerGameProps) {
  const players: Player[] = playersData as Player[];
  const autocompleteRef = useRef<PlayerAutocompleteRef>(null);

  // Track the previous player to detect navigation vs completion
  const prevPlayerRef = useRef<{ playerId: number; scheduleDate: string | null } | null>(null);

  const [gameState, setGameState] = useState<GuessThePlayerGameState>({
    targetPlayer: null,
    guesses: [],
    gameOver: false,
    won: false,
    maxGuesses: 5,
  });

  // Initialize/reset game only when navigating to a different player
  useEffect(() => {
    const currentPlayerKey = { playerId, scheduleDate };
    const prevPlayerKey = prevPlayerRef.current;

    // Check if we're navigating to a different player
    const isNavigating = !prevPlayerKey ||
      prevPlayerKey.playerId !== playerId ||
      prevPlayerKey.scheduleDate !== scheduleDate;

    // Update the ref for next comparison
    prevPlayerRef.current = currentPlayerKey;

    // Only reset state when navigating to a different player
    if (isNavigating) {
      const targetPlayer = players.find(p => p.id === playerId) || null;

      // If there's previous completion data (navigating to already-completed game),
      // show the game over state immediately
      if (previousCompletion) {
        setGameState({
          targetPlayer,
          guesses: [],
          gameOver: true,
          won: previousCompletion.won,
          maxGuesses: 5,
          isScheduledPlayer: scheduleDate !== null,
          todayDate: scheduleDate ?? undefined,
          previousGuessCount: previousCompletion.guessCount,
        });
      } else {
        setGameState({
          targetPlayer,
          guesses: [],
          gameOver: false,
          won: false,
          maxGuesses: 5,
          isScheduledPlayer: scheduleDate !== null,
          todayDate: scheduleDate ?? undefined,
        });
      }
    }
    // If not navigating (i.e., previousCompletion changed because user just completed),
    // don't reset - keep showing the guesses
  }, [playerId, scheduleDate, previousCompletion]);

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

    // If it's a scheduled player and game is over, save completion data to localStorage
    if (isGameOver && scheduleDate) {
      const completionData: CompletionData = { guessCount: newGuesses.length, won: isWin };
      localStorage.setItem(`guessPlayer_solved_${scheduleDate}`, JSON.stringify(completionData));
    }

    setGameState({
      ...gameState,
      guesses: newGuesses,
      gameOver: isGameOver,
      won: isWin,
    });

    // Notify parent that game is complete
    if (isGameOver) {
      onComplete({ guessCount: newGuesses.length, won: isWin });
    }

    // Auto-focus the input after submitting a guess (if not game over and on larger screens)
    // Don't auto-focus on mobile to avoid keyboard covering the clues
    if (!isGameOver && window.innerWidth >= 640) {
      setTimeout(() => {
        autocompleteRef.current?.focus();
      }, 100);
    }
  };

  const handleGiveUp = () => {
    const completionData: CompletionData = { guessCount: gameState.guesses.length, won: false };

    // If it's a scheduled player, save completion data to localStorage
    if (scheduleDate) {
      localStorage.setItem(`guessPlayer_solved_${scheduleDate}`, JSON.stringify(completionData));
    }

    setGameState({
      ...gameState,
      gameOver: true,
      won: false,
      hasGivenUp: true,
    });

    // Notify parent that game is complete
    onComplete(completionData);
  };

  if (!gameState.targetPlayer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-xl">Cargando juego...</p>
      </div>
    );
  }

  const guessedPlayerIds = gameState.guesses.map(g => g.player.id);

  // Use previousGuessCount if viewing a previously completed game, otherwise use current guesses length
  const displayGuessCount = gameState.previousGuessCount ?? gameState.guesses.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Game Over Card at Top with Animation */}
      {gameState.gameOver && (
        <div className={previousCompletion ? '' : 'animate-slide-down'}>
          <GuessGameOver
            player={gameState.targetPlayer}
            won={gameState.won}
            guessCount={displayGuessCount}
            maxGuesses={gameState.maxGuesses}
            onPlayAgain={onPlayAgain}
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
