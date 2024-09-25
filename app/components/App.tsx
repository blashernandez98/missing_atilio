'use client'

import Field from "@/app/components/Field/Field";
import Wordle from "@/app/components/Board/Wordle";
import GameOver from "@/app/components/GameOver";
import InfoCard from "@/app/components/InfoCard";
import Instructions from '@/app/components/Instructions';
import { createContext, useState, useEffect } from "react";
import { defaultAppContext } from "@/lib/Context"
import { Partido, Guesses, Solved, Cronograma } from "@/lib/types";
import data from "@/app/data/partidos.json";
import cronograma from "@/app/data/cronograma.json";
import Image from 'next/image';

export const AppContext = createContext(defaultAppContext);

const partidos_data = data as Partido[];
const cronograma_data = cronograma as Cronograma[];

// Get current day in dd/mm/yyyy format
const today = new Date();
const todayString = today.toISOString().split("T")[0].split('-').reverse().join('-');

// Get the index of the current game
let currentGame = cronograma_data.find(game => game.liveDate === todayString);
if (!currentGame) {
  console.error("No hay partido programado para hoy");
  currentGame = cronograma_data[0];
}

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

  useEffect(() => {
    if (partido["equipo"]) return;
    const partidoElegido = partidos_data[currentGame ? currentGame.gameIndex : 0];
    console.log(partidoElegido) // Remove before production
    setPartido(partidoElegido);
    const playerName = partidoElegido["equipo"][currentPlayer].toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .split(", ")[0]
      .split("")
    setPlayerName(playerName);
  }, [currentPlayer, partido]);


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
    <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] min-h-screen flex flex-col justify-around">
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
        <nav className='flex items-center justify-center p-5 gap-2'>
          <h1 className='text-4xl font-bold text-slate-50'>Missing Atilio</h1>
          <Image src='/atilio_grande.png' alt='Atilio Garcia' width='60' height='60' className='rounded-lg' />
        </nav>

        { fieldMode ? <Field formation={ currentGame ? currentGame.formation : '4-4-2' } /> : <Wordle /> }
        <GameOver />
        <footer className='w-full flex items-center justify-center mt-10'>
          <h1 className='text-sm md:text-lg font-bold text-slate-200 text-center my-2'>Hecho por Blas Hernández</h1>
        </footer>
      </AppContext.Provider>
    </div>
  );
}

export default App;