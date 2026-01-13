'use client'

import { useState, useEffect } from 'react';
import type { Player, ComparisonStat, ComparisonGameState } from '@/lib/types';
import PlayerCompareCard from './PlayerCompareCard';
import ComparisonGameOver from './ComparisonGameOver';
import playersData from '@/app/data/players.json';

const players = playersData as Player[];

const STAT_LABELS: Record<ComparisonStat, string> = {
  totalMatches: 'partidos jugados',
  totalGoals: 'goles',
  wins: 'partidos ganados',
  officialTitles: 'títulos oficiales',
  minutesPlayed: 'minutos jugados',
};

function ComparisonGame() {
  const [gameState, setGameState] = useState<ComparisonGameState>({
    currentStreak: 0,
    bestStreak: 0,
    playerA: null,
    playerB: null,
    currentStat: 'totalMatches',
    isRevealed: false,
    isCorrect: null,
    gameOver: false,
  });

  const [manualPlayerId, setManualPlayerId] = useState<string>('');
  const [showDevTools, setShowDevTools] = useState(false);
  const [lastStreakBeforeLoss, setLastStreakBeforeLoss] = useState<number>(0);

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedGameState = localStorage.getItem('versus_gameState');

    // Migrate from old storage format if it exists
    const oldBestStreak = localStorage.getItem('versus_bestStreak');
    const oldCurrentStreak = localStorage.getItem('versus_currentStreak');
    if (oldBestStreak || oldCurrentStreak) {
      // Only migrate best streak, reset current streak (can't restore without players)
      setGameState(prev => ({
        ...prev,
        bestStreak: oldBestStreak ? parseInt(oldBestStreak) : 0,
      }));
      // Clean up old keys
      localStorage.removeItem('versus_bestStreak');
      localStorage.removeItem('versus_currentStreak');
      return; // Don't load from new format if migrating
    }

    if (savedGameState) {
      try {
        const parsed = JSON.parse(savedGameState);

        // Validate that saved players still exist in data
        const playerA = parsed.playerA ? players.find(p => p.id === parsed.playerA.id) : null;
        const playerB = parsed.playerB ? players.find(p => p.id === parsed.playerB.id) : null;

        setGameState(prev => ({
          ...prev,
          bestStreak: parsed.bestStreak || 0,
          currentStreak: parsed.currentStreak || 0,
          // Only restore players if they still exist (prevents cheating via refresh)
          playerA: playerA || prev.playerA,
          playerB: playerB || prev.playerB,
          currentStat: parsed.currentStat || prev.currentStat,
        }));
      } catch (error) {
        console.error('Error loading game state:', error);
      }
    }
  }, []);

  // Save complete game state to localStorage whenever it changes
  useEffect(() => {
    // Only save if we have both players (game is initialized)
    if (gameState.playerA && gameState.playerB) {
      const stateToSave = {
        bestStreak: gameState.bestStreak,
        currentStreak: gameState.currentStreak,
        playerA: gameState.playerA,
        playerB: gameState.playerB,
        currentStat: gameState.currentStat,
      };
      localStorage.setItem('versus_gameState', JSON.stringify(stateToSave));
    }
  }, [gameState.bestStreak, gameState.currentStreak, gameState.playerA, gameState.playerB, gameState.currentStat]);

  // Initialize game (only if no players loaded yet)
  useEffect(() => {
    if (!gameState.playerA || !gameState.playerB) {
      const { playerA, playerB, stat } = getValidPlayerPair();
      setGameState(prev => ({
        ...prev,
        playerA,
        playerB,
        currentStat: stat,
      }));
    }
  }, []);

  const getRandomPlayer = (excludeId?: number): Player => {
    let player: Player;
    do {
      player = players[Math.floor(Math.random() * players.length)];
    } while (excludeId && player.id === excludeId);
    return player;
  };

  const getRandomStat = (): ComparisonStat => {
    const stats: ComparisonStat[] = ['totalMatches', 'totalGoals', 'wins', 'officialTitles', 'minutesPlayed'];
    return stats[Math.floor(Math.random() * stats.length)];
  };

  // Get two players with different stat values
  const getValidPlayerPair = (): { playerA: Player; playerB: Player; stat: ComparisonStat } => {
    const MAX_ATTEMPTS = 50; // Prevent infinite loop
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
      const playerA = getRandomPlayer();
      const playerB = getRandomPlayer(playerA.id);
      const stat = getRandomStat();

      // Check if the values are different
      if (playerA.stats[stat] !== playerB.stats[stat]) {
        return { playerA, playerB, stat };
      }

      attempts++;
    }

    // Fallback: If we can't find different values after many attempts,
    // just return the last pair (we'll handle ties in handleGuess)
    const playerA = getRandomPlayer();
    const playerB = getRandomPlayer(playerA.id);
    const stat = getRandomStat();
    return { playerA, playerB, stat };
  };

  const startNewGame = () => {
    const { playerA, playerB, stat } = getValidPlayerPair();

    setGameState({
      currentStreak: 0,
      bestStreak: gameState.bestStreak,
      playerA,
      playerB,
      currentStat: stat,
      isRevealed: false,
      isCorrect: null,
      gameOver: false,
    });
  };

  const handleGuess = (guessMore: boolean) => {
    if (gameState.isRevealed || !gameState.playerA || !gameState.playerB) return;

    const valueA = gameState.playerA.stats[gameState.currentStat];
    const valueB = gameState.playerB.stats[gameState.currentStat];

    // Handle tie case - both answers are correct
    let correct: boolean;
    if (valueA === valueB) {
      correct = true; // Always correct on a tie
    } else {
      const actualMore = valueB > valueA;
      correct = guessMore === actualMore;
    }

    setGameState({
      ...gameState,
      isRevealed: true,
      isCorrect: correct,
    });

    // After animation, either continue or end game
    setTimeout(() => {
      if (correct) {
        continueGame();
      } else {
        endGame();
      }
    }, 2500);
  };

  const continueGame = () => {
    if (!gameState.playerB) return;

    const newPlayerA = gameState.playerB;
    const newStreak = gameState.currentStreak + 1;

    // Check if manual player ID is set (dev mode only)
    let newPlayerB: Player;
    let newStat: ComparisonStat;

    if (process.env.NODE_ENV === 'development' && manualPlayerId) {
      const playerId = parseInt(manualPlayerId);
      const manualPlayer = players.find(p => p.id === playerId);

      if (manualPlayer && manualPlayer.id !== newPlayerA.id) {
        newPlayerB = manualPlayer;
        newStat = getRandomStat();
        setManualPlayerId(''); // Clear after use
      } else {
        // Fallback if player not found or same as playerA
        newPlayerB = getRandomPlayer(newPlayerA.id);
        newStat = getRandomStat();
      }
    } else {
      // Normal flow: Try to find a new player B with different stat values
      let attempts = 0;
      const MAX_ATTEMPTS = 50;

      do {
        newPlayerB = getRandomPlayer(newPlayerA.id);
        newStat = getRandomStat();
        attempts++;
      } while (
        attempts < MAX_ATTEMPTS &&
        newPlayerA.stats[newStat] === newPlayerB.stats[newStat]
      );
    }

    setGameState({
      ...gameState,
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, gameState.bestStreak),
      playerA: newPlayerA,
      playerB: newPlayerB,
      currentStat: newStat,
      isRevealed: false,
      isCorrect: null,
    });
  };

  const endGame = () => {
    // Save the current streak before resetting it
    setLastStreakBeforeLoss(gameState.currentStreak);

    setGameState({
      ...gameState,
      currentStreak: 0, // Reset streak immediately on wrong answer to prevent cheat
      gameOver: true,
    });
  };

  const closeGameOver = () => {
    setLastStreakBeforeLoss(0); // Reset for next game
    startNewGame();
  };

  if (!gameState.playerA || !gameState.playerB) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-2xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 sm:p-4 pt-4 sm:pt-8 min-h-screen">
      {/* Dev Tools */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 text-center">
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="text-purple-400 hover:text-purple-300 text-sm underline mb-2"
          >
            {showDevTools ? '🔧 Hide Dev Tools' : '🔧 Show Dev Tools'}
          </button>
          {showDevTools && (
            <div className="bg-purple-900/30 border border-purple-600/50 rounded-lg p-4 max-w-md mx-auto">
              <label className="block text-white/80 text-sm mb-2">
                Manual Player ID for next round:
              </label>
              <input
                type="number"
                value={manualPlayerId}
                onChange={(e) => setManualPlayerId(e.target.value)}
                placeholder="Enter player ID..."
                className="w-full px-3 py-2 rounded bg-slate-700/50 border border-slate-600 text-white text-sm focus:outline-none focus:border-purple-400"
              />
              <p className="text-white/50 text-xs mt-2">
                The next player B will be the one with this ID
              </p>
            </div>
          )}
        </div>
      )}

      {/* Streak Display */}
      <div className="mb-3 sm:mb-6 md:mb-8 text-center">
        <p className="text-white text-lg sm:text-xl font-bold">
          Racha: <span className="text-cyan-300">{gameState.currentStreak}</span>
        </p>
        <p className="text-white/70 text-xs sm:text-sm mt-0.5 sm:mt-1">
          Mejor racha: {gameState.bestStreak}
        </p>
      </div>

      {/* Players Comparison */}
      <div className="flex flex-col md:flex-row gap-2 sm:gap-4 md:gap-8 items-center justify-center w-full max-w-6xl mx-auto">
        {/* Player A - Revealed */}
        <PlayerCompareCard
          player={gameState.playerA}
          stat={gameState.currentStat}
          statLabel={STAT_LABELS[gameState.currentStat]}
          isRevealed={true}
          isLeft={true}
        />

        {/* VS Divider */}
        <div className="flex items-center justify-center self-center my-1 sm:my-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-slate-700/80 flex items-center justify-center border-2 border-slate-500">
            <span className="text-white font-bold text-base sm:text-lg md:text-xl">VS</span>
          </div>
        </div>

        {/* Player B - Hidden until guess */}
        <PlayerCompareCard
          player={gameState.playerB}
          stat={gameState.currentStat}
          statLabel={STAT_LABELS[gameState.currentStat]}
          isRevealed={gameState.isRevealed}
          isLeft={false}
          isCorrect={gameState.isCorrect}
          onGuess={handleGuess}
          showButtons={!gameState.isRevealed}
        />
      </div>

      {/* Game Over Modal */}
      {gameState.gameOver && (
        <ComparisonGameOver
          streak={lastStreakBeforeLoss}
          bestStreak={gameState.bestStreak}
          onClose={closeGameOver}
        />
      )}
    </div>
  );
}

export default ComparisonGame;
