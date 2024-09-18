import React, { useContext, useEffect } from "react";
import Letter from "./Letter";
import { AppContext } from "@/app/components/App";
import { WordleContext } from './Wordle';

export function Board() {
  const { currentPlayer, guesses } = useContext(AppContext);
  const { currentPlayerName } = useContext(WordleContext);

  useEffect(() => {
    console.log("opnening board", currentPlayer, currentPlayerName);
  }, [currentPlayer]);

  return (
    <div className="flex flex-col w-full items-center justify-center p-10 gap-2">
      { [...Array(5)].map((_, indexRow) => (
        <div className="flex flex-row w-80 sm:w-[500px] md:w-[600px] justify-center items-center gap-1" key={ indexRow }>
          { currentPlayerName.map((letter, indexLetter) => (
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
            />
          )) }
        </div>
      )) }
    </div>
  );
}

