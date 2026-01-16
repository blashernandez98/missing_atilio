'use client'

import Field from "@/app/components/Field/Field";
import Wordle from "@/app/components/Board/Wordle";
import GameOver from "@/app/components/GameOver";
import InfoCard from "@/app/components/InfoCard";
import Instructions from '@/app/components/Instructions';
import Footer from "@/app/components/common/Footer";
import { createContext, useState, useEffect } from "react";
import { defaultAppContext } from "@/lib/Context"
import { Partido, Guesses, Solved, Cronograma } from "@/lib/types";
import data from "@/app/data/partidos.json";
import cronograma from "@/app/data/cronograma.json";
import Image from 'next/image';
import Link from 'next/link';
import { normalizeString } from '@/lib/utils';
import { getTodayStringUruguay, getUruguayDate, parseDDMMYYYYToDate } from '@/lib/date';
export const AppContext = createContext(defaultAppContext);

const partidos_data = data as Partido[];
const cronograma_fallback = cronograma as Cronograma[];

function App() {
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

    const partidoElegido = partidos_data[currentGame.gameIndex];
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
        setGuesses(parsed.guesses || defaultAppContext.guesses);
        setSolved(parsed.solved || defaultAppContext.solved);
        setCurrentPlayer(parsed.currentPlayer || 2);
        setFieldMode(parsed.fieldMode !== undefined ? parsed.fieldMode : true);
        setGameOver(parsed.gameOver || false);
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
    setInfoCard(true); // Show info modal when navigating to a different game
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
                <span className='text-white/80 text-sm sm:text-base font-semibold'>
                  {currentGame.liveDate}
                </span>
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
      </AppContext.Provider>
    </div>
  );
}

export default App;