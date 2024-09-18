'use client'

import Field from "@/app/components/Field/Field";
import Wordle from "@/app/components/Board/Wordle";
import GameOver from "@/app/components/GameOver";
import InfoCard from "@/app/components/InfoCard";
import { createContext, useState, useEffect } from "react";
import { defaultAppContext } from "@/lib/Context"
import { Partido, Guesses, Solved } from "@/lib/types";
import data from "@/app/partidos.json";
import Image from 'next/image';

export const AppContext = createContext(defaultAppContext);

const partidos_data = data as Partido[];

function App() {
  const [fieldMode, setFieldMode] = useState(true);
  const [partido, setPartido] = useState<Partido>(defaultAppContext.partido);
  const [player_name, setPlayerName] = useState<string[]>([]); // ["a", "t", "i", "l", "i", "o"
  const [guesses, setGuesses] = useState<Guesses>(defaultAppContext.guesses);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [solved, setSolved] = useState<Solved>(defaultAppContext.solved);
  const [infoCard, setInfoCard] = useState(true);
  const [helpCard, setHelpCard] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (partido["equipo"]) return;
    console.log("cambio el currentplayer")
    const partidoElegido = partidos_data[Math.floor(Math.random() * data.length)]
    setPartido(partidoElegido);
    setPlayerName(partidoElegido["equipo"][currentPlayer].toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .split(", ")[0]
      .split(""))
  }, [currentPlayer, partido]);


  const toggleFieldMode = () => {
    setFieldMode(!fieldMode);
  };

  const toggleInfo = () => {
    setInfoCard(!infoCard);
  };

  const toggleHelp = () => {
    setHelpCard(!helpCard);
  }

  const toggleGameOver = () => {
    setGameOver(!gameOver);
  };

  return (
    <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] w-full min-h-screen">
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
          toggleHelp,
          gameOver,
          toggleGameOver,
          infoCard,
        } }
      >
        <InfoCard />
        <nav className='w-full flex items-center justify-center p-5 gap-2'>
          <h1 className='text-4xl font-bold text-slate-50'>Missing Atilio</h1>
          <Image src='/atilio2.jpg' alt='Atilio Garcia' width='60' height='60' className='rounded-lg' />
        </nav>

        { fieldMode ? <Field /> : <Wordle /> }
        <GameOver />
        <footer className='bottom-0 flex items-center justify-center h-10 w-full mt-10'>
          <h1 className='text-lg font-light text-slate-50 text-center'>Hecho por Blas Hernández</h1>
        </footer>
      </AppContext.Provider>
    </div>
  );
}

export default App;