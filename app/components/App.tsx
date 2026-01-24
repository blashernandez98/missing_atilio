'use client'

import Field from "@/app/components/Field/Field";
import Wordle from "@/app/components/Board/Wordle";
import GameOver from "@/app/components/GameOver";
import InfoCard from "@/app/components/InfoCard";
import Instructions from '@/app/components/Instructions';
import Footer from "@/app/components/common/Footer";
import HighscoreModal from "@/app/components/ui/HighscoreModal";
import { createContext, useState, useEffect, useRef } from "react";
import { defaultAppContext } from "@/lib/Context"
import { Partido, Guesses, Solved, Cronograma } from "@/lib/types";
import data from "@/app/data/partidos.json";
import cronograma from "@/app/data/cronograma.json";
import Image from 'next/image';
import Link from 'next/link';
import { normalizeString } from '@/lib/utils';
import { getTodayStringUruguay, getUruguayDate, parseDDMMYYYYToDate } from '@/lib/date';
import { useAuth } from '@/contexts/AuthContext';
import { recordGameCompletion } from '@/lib/guest-session';
export const AppContext = createContext(defaultAppContext);

interface RecordStatsResult {
  isHighscore: boolean;
  entryId: number | null;
  rank: number | null;
}

// Record game play stats to the server
async function recordWordleStats(params: {
  won: boolean;
  score: number;
  targetDate?: string;
}): Promise<RecordStatsResult> {
  try {
    const res = await fetch('/api/stats/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameMode: 'wordle',
        won: params.won,
        score: params.score,
        surrendered: false,
        targetDate: params.targetDate,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        isHighscore: data.isHighscore || false,
        entryId: data.entryId || null,
        rank: data.rank || null,
      };
    }
  } catch (error) {
    console.error('Failed to record stats:', error);
  }
  return { isHighscore: false, entryId: null, rank: null };
}

const partidos_data = data as Partido[];
const cronograma_fallback = cronograma as Cronograma[];

function App() {
  const { user, refreshStreaks } = useAuth();
  const [fieldMode, setFieldMode] = useState(true);
  const [partido, setPartido] = useState<Partido>(defaultAppContext.partido);
  const [player_name, setPlayerName] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guesses>(defaultAppContext.guesses);
  const [currentPlayer, setCurrentPlayer] = useState(2);
  const [solved, setSolved] = useState<Solved>(defaultAppContext.solved);
  const [infoCard, setInfoCard] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [cronogramaData, setCronogramaData] = useState<Cronograma[]>([]);
  const [currentGame, setCurrentGame] = useState<Cronograma | null>(null);

  // Track if we've recorded stats for the current game to prevent duplicates
  const statsRecordedRef = useRef<string | null>(null);
  // Track if we've recorded user completion for the current game
  const userCompletionRecordedRef = useRef<string | null>(null);

  // Highscore modal state
  const [highscoreData, setHighscoreData] = useState<{
    show: boolean;
    entryId: number | null;
    score: number;
    rank: number | null;
  }>({ show: false, entryId: null, score: 0, rank: null });

  // Fetch cronograma from API on mount
  useEffect(() => {
    const fetchCronograma = async () => {
      try {
        const res = await fetch('/api/cronograma');
        if (res.ok) {
          const data = await res.json();
          setCronogramaData(data);
        } else {
          setCronogramaData(cronograma_fallback);
        }
      } catch (error) {
        console.error('Error fetching cronograma, using fallback:', error);
        setCronogramaData(cronograma_fallback);
      }
    };

    fetchCronograma();
  }, []);

  // Select current game based on today's date in Uruguay timezone (only on first load)
  useEffect(() => {
    if (cronogramaData.length === 0 || currentGame) return;

    // Get current day in dd-mm-yyyy format (Uruguay timezone)
    const todayString = getTodayStringUruguay();
    const todayDate = getUruguayDate();

    // Find game for today
    let game = cronogramaData.find(g => g.liveDate === todayString);
    if (!game) {
      // Find the most recent game that is <= today
      const pastGames = cronogramaData.filter(g => {
        const gameDate = parseDDMMYYYYToDate(g.liveDate);
        return gameDate <= todayDate;
      });

      // Take the last one (most recent) since they're sorted ASC
      game = pastGames.length > 0 ? pastGames[pastGames.length - 1] : cronogramaData[0];
    }

    setCurrentGame(game);
  }, [cronogramaData, currentGame]);

  // Load partido when currentGame changes
  useEffect(() => {
    if (!currentGame) return;

    const originalPartido = partidos_data[currentGame.gameIndex];

    // Apply custom player positions if available
    let partidoElegido = originalPartido;
    if (currentGame.playerPositions && Object.keys(currentGame.playerPositions).length > 0) {
      // Create a modified partido with custom player positions
      partidoElegido = {
        ...originalPartido,
        equipo: currentGame.playerPositions as { [key: string]: string }
      };
    }

    setPartido(partidoElegido);
    const playerLastName = partidoElegido["equipo"][currentPlayer]
      .trim()
      .split(", ")[0]; // Get last name
    const playerName = normalizeString(playerLastName).split("");
    setPlayerName(playerName);

    // Try to load saved game state from localStorage
    const savedState = localStorage.getItem(`missing11_${currentGame.liveDate}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const loadedSolved = parsed.solved || defaultAppContext.solved;
        const isCompleted = Object.keys(loadedSolved).length === 11;

        setGuesses(parsed.guesses || defaultAppContext.guesses);
        setSolved(loadedSolved);
        setCurrentPlayer(parsed.currentPlayer || 2);
        setFieldMode(parsed.fieldMode !== undefined ? parsed.fieldMode : true);

        // For completed games, don't show modals - just show the field with guesses
        if (isCompleted) {
          setGameOver(false); // Don't show GameOver modal
          setInfoCard(false); // Don't show InfoCard modal
        } else {
          setGameOver(parsed.gameOver || false);
          setInfoCard(true); // Show info for incomplete games
        }
      } catch (error) {
        console.error('Error loading saved game state:', error);
        // Reset to default on error
        setGuesses(defaultAppContext.guesses);
        setSolved(defaultAppContext.solved);
        setCurrentPlayer(2);
        setFieldMode(true);
        setGameOver(false);
      }
    } else {
      // No saved state, reset to default
      setGuesses(defaultAppContext.guesses);
      setSolved(defaultAppContext.solved);
      setCurrentPlayer(2);
      setFieldMode(true);
      setGameOver(false);
    }
  }, [currentGame]);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (!currentGame) return;

    const gameState = {
      guesses,
      solved,
      currentPlayer,
      fieldMode,
      gameOver,
    };

    localStorage.setItem(`missing11_${currentGame.liveDate}`, JSON.stringify(gameState));
  }, [currentGame, guesses, solved, currentPlayer, fieldMode, gameOver]);

  // Record stats when game is completed (all 11 players solved or failed)
  useEffect(() => {
    if (!gameOver || !currentGame) return;

    // Check if we've already recorded stats for this game
    if (statsRecordedRef.current === currentGame.liveDate) return;

    // Calculate stats from solved state
    let solvedPlayers = 0;
    let totalGuesses = 0;
    for (let i = 1; i <= 11; i++) {
      if (solved[i] && solved[i] < 6) solvedPlayers++;
      if (solved[i]) totalGuesses += solved[i];
    }

    // Only record if all 11 players have been attempted
    const allPlayersAttempted = Object.keys(solved).length === 11;
    if (!allPlayersAttempted) return;

    // Record stats and check for highscore
    statsRecordedRef.current = currentGame.liveDate;
    const won = solvedPlayers === 11;
    recordWordleStats({
      won,
      score: totalGuesses,
      targetDate: currentGame.liveDate,
    }).then((result) => {
      if (result.isHighscore && result.entryId) {
        setHighscoreData({
          show: true,
          entryId: result.entryId,
          score: totalGuesses,
          rank: result.rank,
        });
      }
    });

    // Record completion for stats (both users and guests)
    if (userCompletionRecordedRef.current !== currentGame.liveDate) {
      userCompletionRecordedRef.current = currentGame.liveDate;
      recordGameCompletion(user, {
        gameMode: 'wordle',
        gameDate: currentGame.liveDate,
        won,
        score: totalGuesses,
      }).then(() => {
        // Refresh streaks for logged-in users
        if (user && won) {
          refreshStreaks();
        }
      });
    }
  }, [gameOver, currentGame, solved, user, refreshStreaks]);

  const toggleFieldMode = () => {
    setFieldMode(!fieldMode);
  };

  const toggleInfo = () => {
    setInfoCard(!infoCard);
  };

  const toggleGameOver = () => {
    setGameOver(!gameOver);
  };

  const toggleInstructions = () => {
    setInstructions(!instructions);
  }

  // Clear progress for current game
  const clearCurrentGameProgress = () => {
    if (!currentGame) return;

    // Clear localStorage for this game
    localStorage.removeItem(`missing11_${currentGame.liveDate}`);

    // Reset state to default
    setGuesses(defaultAppContext.guesses);
    setSolved(defaultAppContext.solved);
    setCurrentPlayer(2);
    setFieldMode(true);
    setGameOver(false);
  };

  // Navigate to previous/next game
  const navigateGame = (direction: 'prev' | 'next') => {
    if (!currentGame || cronogramaData.length === 0) return;

    const currentIndex = cronogramaData.findIndex(g => g.liveDate === currentGame.liveDate);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= cronogramaData.length) return;

    const newGame = cronogramaData[newIndex];

    // Check if new game is in the future (Uruguay timezone)
    const todayDate = getUruguayDate();
    const newGameDate = parseDDMMYYYYToDate(newGame.liveDate);

    // Don't allow navigation to future games
    if (newGameDate > todayDate) return;

    setCurrentGame(newGame);
    // InfoCard visibility is handled in the load effect based on completion status
  }

  return (
    <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] min-h-screen flex flex-col">
      <AppContext.Provider
        value={ {
          toggleFieldMode,
          partido,
          guesses,
          setGuesses,
          currentPlayer,
          setCurrentPlayer,
          player_name,
          solved,
          setSolved,
          toggleInfo,
          gameOver,
          toggleGameOver,
          instructions,
          toggleInstructions,
          infoCard,
          clearCurrentGameProgress,
        } }
      >
        <InfoCard />
        <Instructions />
        <nav className='flex items-center justify-between py-4 sm:py-6 px-4 sm:px-5 gap-3 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="text-2xl">←</span>
            <span className="hidden sm:inline">Volver</span>
          </Link>

          <div className='flex flex-col items-center gap-2'>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight'>Missing Atilio</h1>
              <Image src='/atilio_grande.png' alt='Atilio Garcia' width='50' height='50' className='rounded-lg shadow-lg' />
            </div>

            {/* Date Navigation */}
            {currentGame && (
              <div className='flex items-center gap-2 sm:gap-3'>
                <button
                  onClick={() => navigateGame('prev')}
                  className='text-white/60 hover:text-white transition-colors text-lg sm:text-xl disabled:opacity-30 disabled:cursor-not-allowed'
                  disabled={cronogramaData.findIndex(g => g.liveDate === currentGame.liveDate) === 0}
                >
                  ◀
                </button>
                <div className='flex items-center gap-2'>
                  <span className='text-white/80 text-sm sm:text-base font-semibold'>
                    {currentGame.liveDate}
                  </span>
                  {/* Green check for completed games */}
                  {Object.keys(solved).length === 11 && (
                    <span className='text-green-400 text-lg' title='Completado'>✓</span>
                  )}
                </div>
                <button
                  onClick={() => navigateGame('next')}
                  className='text-white/60 hover:text-white transition-colors text-lg sm:text-xl disabled:opacity-30 disabled:cursor-not-allowed'
                  disabled={(() => {
                    const currentIndex = cronogramaData.findIndex(g => g.liveDate === currentGame.liveDate);
                    if (currentIndex === -1 || currentIndex === cronogramaData.length - 1) return true;

                    const nextGame = cronogramaData[currentIndex + 1];
                    const todayDate = getUruguayDate();
                    const nextGameDate = parseDDMMYYYYToDate(nextGame.liveDate);

                    return nextGameDate > todayDate;
                  })()}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          <div className="w-16 sm:w-24" /> {/* Spacer for centering */}
        </nav>

        <div className='flex-grow flex flex-col'>
          { fieldMode ? <Field formation={ currentGame ? currentGame.formation : '4-4-2' } /> : <Wordle /> }
          <GameOver />
        </div>
        <Footer />

        {/* Highscore Modal */}
        {highscoreData.show && highscoreData.entryId && (
          <HighscoreModal
            isOpen={highscoreData.show}
            onClose={() => setHighscoreData(prev => ({ ...prev, show: false }))}
            entryId={highscoreData.entryId}
            score={highscoreData.score}
            rank={highscoreData.rank || 1}
            gameMode="wordle"
          />
        )}
      </AppContext.Provider>
    </div>
  );
}

export default App;