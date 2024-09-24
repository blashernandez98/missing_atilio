import React, { useState, createContext, useContext, useEffect } from "react";
import { Board } from "@/app/components/Board/Board";
import { Keyboard } from "@/app/components/Board/Keyboard";
import { AppContext } from "@/app/components/App";
import { letterStatesDefault } from "@/lib/Words";
import { defaultWordleContext } from '@/lib/Context';

export const WordleContext = createContext(defaultWordleContext);

function Wordle() {
  const {
    guesses,
    setGuesses,
    currentPlayer,
    toggleFieldMode,
    solved,
    setSolved,
    partido,
  } = useContext(AppContext);
  const [currentTry, setCurrentTry] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [letterStates, setLetterStates] = useState(letterStatesDefault);

  useEffect(() => {
    setCurrentTry(guesses[currentPlayer].length - 1);
  }, [guesses, currentPlayer]);

  useEffect(() => {
    letterHints(guesses[currentPlayer][currentTry]);
  }, [currentPlayer]);

  const currentPlayerName = partido["equipo"] ? partido["equipo"][currentPlayer].toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(", ")[0]
    .split("") : ['a', 't', 'i', 'l', 'i', 'o'];

  const onEnter = () => {
    if (currentLetter != currentPlayerName.length) return;
    if (
      guesses[currentPlayer][currentTry].join("").toLowerCase() ===
      currentPlayerName.join("")
    ) {
      const completed = { ...solved };
      completed[currentPlayer] = guesses[currentPlayer].length;
      setSolved(completed);
      toggleFieldMode();
      return;
    }
    if (guesses[currentPlayer].length === 5) {
      const completed = { ...solved };
      completed[currentPlayer] = 6;
      setSolved(completed);
      toggleFieldMode();
      return;
    }
    letterHints(guesses[currentPlayer][currentTry]);
    let newGuesses = { ...guesses };
    newGuesses[currentPlayer].push([]);
    setGuesses(newGuesses);
    setCurrentTry(currentTry + 1);
    setCurrentLetter(0);
  };

  const onDelete = () => {
    if (currentLetter === 0) return;
    const newGuess = [...guesses[currentPlayer]];
    newGuess[currentTry].pop();
    let newGuesses = { ...guesses };
    newGuesses[currentPlayer] = newGuess;
    setGuesses(newGuesses);
    setCurrentLetter(currentLetter - 1);
  };

  const selectLetter = (key: string) => {
    if (guesses[currentPlayer][currentTry].length === currentPlayerName.length) {
      return;
    }
    const newGuess = [...guesses[currentPlayer]];
    newGuess[currentTry][currentLetter] = key;
    if (currentPlayerName[currentLetter + 1] === ' ') {
      newGuess[currentTry][currentLetter + 1] = ' ';
      setCurrentLetter(currentLetter + 2);
    } else {
      setCurrentLetter(currentLetter + 1);
    }
    let newGuesses = { ...guesses };
    newGuesses[currentPlayer] = newGuess;
    setGuesses(newGuesses);
  };

  const letterHints = (guess: string[]) => {
    const currentLetterStates = { ...letterStates };
    for (let index = 0; index < guess.length; index++) {
      const guessLetter = guess[index];
      const correct = guessLetter.toLowerCase() === currentPlayerName[index];
      const almost =
        !correct &&
        guessLetter !== "" &&
        currentPlayerName.includes(guessLetter.toLowerCase());
      const letterStateRes = correct ? "correct" : almost ? "almost" : "error";

      currentLetterStates[guessLetter as keyof typeof currentLetterStates] = letterStateRes;
    }
    setLetterStates(currentLetterStates);
  };

  return (
    <WordleContext.Provider
      value={ {
        currentTry,
        setCurrentTry,
        currentLetter,
        setCurrentLetter,
        selectLetter,
        onDelete,
        onEnter,
        letterStates,
        currentPlayerName,
      } }
    >
      <div className='w-full flex justify-center'>
        <button onClick={ toggleFieldMode } className='bg-gradient-to-r from-rose-600 to-red-500 rounded-md text-center p-2 text-white'>Volver</button>
      </div>
      <Board />
      <Keyboard />
    </WordleContext.Provider>
  );
}

export default Wordle;
