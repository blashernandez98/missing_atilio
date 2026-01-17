'use client';

import { useState, useEffect, useCallback } from 'react';
import Footer from '@/app/components/common/Footer';
import GuessThePlayerGame, { CompletionData } from '@/app/components/guesstheplayer/GuessThePlayerGame';
import GuessThePlayerInstructions from '@/app/components/guesstheplayer/GuessThePlayerInstructions';
import PlayerScheduleNav from '@/app/components/guesstheplayer/PlayerScheduleNav';
import Link from 'next/link';
import Image from 'next/image';
import { parseDDMMYYYYToDate, getUruguayDate } from '@/lib/date';
import type { PlayerSchedule } from '@/lib/types';
import playersData from '@/app/data/players.json';

interface NavigationState {
  schedules: PlayerSchedule[]; // All scheduled players (sorted by date ascending)
  currentIndex: number; // Index in schedules array, or -1 for random mode
  completions: Map<string, CompletionData>; // Completion data by date
  randomPlayerId: number | null; // Current random player ID when in random mode
}

function getRandomPlayerId(): number {
  const randomIndex = Math.floor(Math.random() * playersData.length);
  return playersData[randomIndex].id;
}

// Helper to parse localStorage value (handles both old 'true' format and new JSON format)
function parseCompletionData(value: string): CompletionData | null {
  if (value === 'true') {
    // Old format - assume won with 1 guess (we don't know the actual count)
    return { guessCount: 1, won: true };
  }
  try {
    return JSON.parse(value) as CompletionData;
  } catch {
    return null;
  }
}

export default function AdivinaJugadorPage() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navState, setNavState] = useState<NavigationState>({
    schedules: [],
    currentIndex: -1,
    completions: new Map(),
    randomPlayerId: null,
  });

  // Load schedules and determine initial position
  useEffect(() => {
    const initializeNavigation = async () => {
      try {
        // Fetch all scheduled players
        const response = await fetch('/api/player-schedule');
        const schedules: PlayerSchedule[] = response.ok ? await response.json() : [];

        // Get today's date in Uruguay timezone
        const todayDate = getUruguayDate();

        // Filter schedules to only include dates up to today and sort by date ascending
        const validSchedules = schedules
          .filter(s => {
            const scheduleDate = parseDDMMYYYYToDate(s.liveDate);
            return scheduleDate <= todayDate;
          })
          .sort((a, b) => {
            const dateA = parseDDMMYYYYToDate(a.liveDate);
            const dateB = parseDDMMYYYYToDate(b.liveDate);
            return dateA.getTime() - dateB.getTime();
          });

        // Load completion data from localStorage
        const completions = new Map<string, CompletionData>();
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('guessPlayer_solved_')) {
            const dateStr = key.replace('guessPlayer_solved_', '');
            const value = localStorage.getItem(key);
            if (value) {
              const data = parseCompletionData(value);
              if (data) {
                completions.set(dateStr, data);
              }
            }
          }
        }

        // Default to the newest/latest scheduled player (last in array since sorted ascending)
        // Even if it's already solved, user will manually navigate if needed
        let initialIndex = validSchedules.length > 0 ? validSchedules.length - 1 : -1;

        setNavState({
          schedules: validSchedules,
          currentIndex: initialIndex,
          completions,
          randomPlayerId: initialIndex === -1 ? getRandomPlayerId() : null,
        });
      } catch (error) {
        console.error('Error initializing navigation:', error);
        // Fallback to random mode
        setNavState({
          schedules: [],
          currentIndex: -1,
          completions: new Map(),
          randomPlayerId: getRandomPlayerId(),
        });
      } finally {
        setLoading(false);
      }
    };

    initializeNavigation();
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setNavState(prev => {
      if (prev.currentIndex === -1) {
        // In random mode, go to last scheduled player
        return {
          ...prev,
          currentIndex: prev.schedules.length - 1,
          randomPlayerId: null,
        };
      } else if (prev.currentIndex > 0) {
        return {
          ...prev,
          currentIndex: prev.currentIndex - 1,
        };
      }
      return prev;
    });
  }, []);

  const handleNext = useCallback(() => {
    setNavState(prev => {
      if (prev.currentIndex === -1) {
        // Already in random mode, can't go next
        return prev;
      } else if (prev.currentIndex < prev.schedules.length - 1) {
        // Go to next scheduled player
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
        };
      } else {
        // At the last scheduled player, go to random mode
        return {
          ...prev,
          currentIndex: -1,
          randomPlayerId: getRandomPlayerId(),
        };
      }
    });
  }, []);

  // Called when a game is completed
  const handleGameComplete = useCallback((data: CompletionData) => {
    setNavState(prev => {
      if (prev.currentIndex === -1) {
        // Random mode - nothing to mark as complete
        return prev;
      }

      const currentDate = prev.schedules[prev.currentIndex].liveDate;
      const newCompletions = new Map(prev.completions);
      newCompletions.set(currentDate, data);

      return {
        ...prev,
        completions: newCompletions,
      };
    });
  }, []);

  // Called when user wants to play again
  const handlePlayAgain = useCallback(() => {
    setNavState(prev => {
      if (prev.currentIndex === -1) {
        // Random mode - generate new random player
        return {
          ...prev,
          randomPlayerId: getRandomPlayerId(),
        };
      }

      // Scheduled mode - find newest/latest unsolved player (search from end backwards)
      let nextIndex = -1;

      for (let i = prev.schedules.length - 1; i >= 0; i--) {
        if (!prev.completions.has(prev.schedules[i].liveDate)) {
          nextIndex = i;
          break;
        }
      }

      if (nextIndex === -1) {
        // All scheduled players complete, go to random mode
        return {
          ...prev,
          currentIndex: -1,
          randomPlayerId: getRandomPlayerId(),
        };
      }

      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });
  }, []);

  // Compute current state
  const isRandomMode = navState.currentIndex === -1;
  const currentSchedule = isRandomMode ? null : navState.schedules[navState.currentIndex];
  const currentDate = currentSchedule?.liveDate ?? null;
  const currentPlayerId = isRandomMode
    ? navState.randomPlayerId
    : currentSchedule?.playerId;
  const isCompleted = currentDate ? navState.completions.has(currentDate) : false;
  const previousCompletion = currentDate ? navState.completions.get(currentDate) ?? null : null;

  // Navigation availability
  const canGoPrev = navState.currentIndex === -1
    ? navState.schedules.length > 0 // In random mode, can go back if there are schedules
    : navState.currentIndex > 0; // In scheduled mode, can go back if not at first
  const canGoNext = navState.currentIndex !== -1; // Can go next if not in random mode

  if (loading) {
    return (
      <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] min-h-screen flex flex-col items-center justify-center">
        <p className="text-slate-400 text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] min-h-screen flex flex-col">
      {/* Instructions Modal */}
      <GuessThePlayerInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Header */}
      <nav className='flex items-center justify-between py-4 sm:py-6 px-4 sm:px-5 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
        <Link
          href="/"
          className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="text-2xl">←</span>
          <span className="hidden sm:inline">Volver</span>
        </Link>

        <div className='flex items-center gap-3'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight'>
            Adivina el Jugador
          </h1>
          <Image
            src='/atilio_grande.png'
            alt='Atilio Garcia'
            width='50'
            height='50'
            className='rounded-lg shadow-lg'
          />
        </div>

        {/* Empty div for flex spacing - help button moved to nav bar */}
        <div className="w-10 sm:w-12" />
      </nav>

      {/* Navigation Bar */}
      <div className="py-4">
        <PlayerScheduleNav
          currentDate={currentDate}
          isCompleted={isCompleted}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={handlePrev}
          onNext={handleNext}
          onShowInstructions={() => setShowInstructions(true)}
        />
      </div>

      {/* Main Game Area */}
      <div className='flex-grow flex items-start justify-center px-4 py-4'>
        {currentPlayerId != null && (
          <GuessThePlayerGame
            key={`${currentDate ?? 'random'}-${currentPlayerId}`}
            playerId={currentPlayerId}
            scheduleDate={currentDate}
            previousCompletion={previousCompletion}
            onComplete={handleGameComplete}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
