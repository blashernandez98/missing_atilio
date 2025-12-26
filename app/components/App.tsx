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
  const [cronogramaData, setCronogramaData] = useState<Cronograma[]>(cronograma_fallback);
  const [currentGame, setCurrentGame] = useState<Cronograma | null>(null);

  // Fetch cronograma from API on mount
  useEffect(() => {
    const fetchCronograma = async () => {
      try {
        const res = await fetch('/api/cronograma');
        if (res.ok) {
          const data = await res.json();
          setCronogramaData(data);
          console.log('✅ Cronograma loaded from API');
        } else {
          console.warn('⚠️ API failed, using fallback cronograma.json');
          setCronogramaData(cronograma_fallback);
        }
      } catch (error) {
        console.error('❌ Error fetching cronograma, using fallback:', error);
        setCronogramaData(cronograma_fallback);
      }
    };

    fetchCronograma();
  }, []);

  // Select current game based on today's date
  useEffect(() => {
    if (cronogramaData.length === 0) return;

    // Get current day in dd-mm-yyyy format
    const today = new Date();
    const todayString = today.toISOString().split("T")[0].split('-').reverse().join('-');

    // Find game for today
    let game = cronogramaData.find(g => g.liveDate === todayString);
    if (!game) {
      console.error("No hay partido programado para hoy");
      game = cronogramaData[0];
      console.log("Selecciono partido: ", game);
    }

    setCurrentGame(game);
  }, [cronogramaData]);

  // Load partido when currentGame changes
  useEffect(() => {
    if (!currentGame || partido["equipo"]) return;

    const partidoElegido = partidos_data[currentGame.gameIndex];
    setPartido(partidoElegido);
    const playerName = partidoElegido["equipo"][currentPlayer].toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .split(", ")[0]
      .split("")
    setPlayerName(playerName);
  }, [currentPlayer, partido, currentGame]);


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
        } }
      >
        <InfoCard />
        <Instructions />
        <nav className='flex items-center justify-between py-6 px-5 gap-3 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="text-2xl">←</span>
            <span className="hidden sm:inline">Volver</span>
          </Link>

          <div className='flex items-center gap-3'>
            <h1 className='text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight'>Missing Atilio</h1>
            <Image src='/atilio_grande.png' alt='Atilio Garcia' width='50' height='50' className='rounded-lg shadow-lg' />
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