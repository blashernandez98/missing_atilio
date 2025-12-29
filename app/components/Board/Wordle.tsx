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

  // Parse full player name to get first name and last name separately
  const fullPlayerName = partido["equipo"] ? partido["equipo"][currentPlayer] : "Atilio, García";
  const nameParts = fullPlayerName.split(", ");
  const lastName = nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts[1] : "";

  const currentPlayerName = lastName
    .toLowerCase()
    .trim()
    .split("");

  // Check if player is solved or failed
  const isSolved = solved[currentPlayer] > 0 && solved[currentPlayer] < 6;
  const isFailed = solved[currentPlayer] === 6;
  const isCompleted = isSolved || isFailed;

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
      <div className='w-full flex justify-center mb-4'>
        <button
          onClick={ toggleFieldMode }
          className='rounded-lg px-5 py-2.5 mt-2 bg-slate-700/80 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm text-white font-semibold'
        >
          ← Volver a la Cancha
        </button>
      </div>
      <Board />
      {isCompleted && firstName && (
        <div className='w-full flex justify-center mt-2 mb-4'>
          <div className='bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-lg px-4 py-2 shadow-md'>
            <p className='text-slate-300 text-sm'>
              <span className='font-semibold text-slate-200'>Nombre: </span>
              <span className='text-cyan-300'>{firstName}</span>
            </p>
          </div>
        </div>
      )}
      <Keyboard />
    </WordleContext.Provider>
  );
}

export default Wordle;
