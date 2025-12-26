import React, { useContext } from "react";
import Letter from "./Letter";
import { AppContext } from "@/app/components/App";
import { WordleContext } from './Wordle';

export function Board() {
  const { currentPlayer, guesses } = useContext(AppContext);
  const { currentPlayerName } = useContext(WordleContext);

  const nameLength = currentPlayerName.filter(l => l !== ' ').length;
  const isLongName = nameLength > 8;

  return (
    <div className="flex flex-col w-full items-center justify-center p-6 sm:p-10 gap-2">
      { [...Array(5)].map((_, indexRow) => (
        <div
          className="flex flex-row justify-center items-center gap-1 sm:gap-2 max-w-[100vw] overflow-x-auto px-2"
          key={ indexRow }
        >
          { currentPlayerName.map((letter, indexLetter) => (
            currentPlayerName[indexLetter] === ' ' ? (
              <div key={ `${indexRow}:${indexLetter}` } className={ `${isLongName ? 'w-2 sm:w-3' : 'w-3 sm:w-4 md:w-5'}` } />
            ) : (
              <Letter
                letterPos={ indexLetter }
                letter={
                  guesses[currentPlayer][indexRow] &&
                    guesses[currentPlayer][indexRow][indexLetter]
                    ? guesses[currentPlayer][indexRow][indexLetter]
                    : ""
                }
                correctName={ currentPlayerName }
                tryRow={ indexRow }
                key={ `${indexRow}:${indexLetter}` }
                isLongName={ isLongName }
              />
            )
          )) }
        </div>
      )) }
    </div>

  );
}

