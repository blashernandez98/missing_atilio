import React from "react";
import PropTypes from "prop-types";
import { useContext } from "react";
import { WordleContext } from "./Wordle";

interface LetterProps {
  letter: string;
  letterPos: number;
  correctName: string[];
  tryRow: number;
}

function Letter({ letter, correctName, letterPos, tryRow }: LetterProps) {
  const { currentTry } = useContext(WordleContext);

  const correct = letter.toLowerCase() === correctName[letterPos];
  const almost =
    !correct && letter !== "" && correctName.includes(letter.toLowerCase());
  const letterState =
    currentTry > tryRow && (correct ? "bg-green-300" : almost ? "bg-yellow-300" : "bg-zinc-400");

  return (
    <div className="flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-r from-slate-50 to-slate-100">
      <div className={ `${letterState ? letterState : 'bg-transparent'}  text-3xl font-bold text-[#1e3c72] flex items-center justify-center w-[90%] h-[90%]` }>
        { letter }
      </div>
    </div>
  );
}

Letter.propTypes = {
  letter: PropTypes.string,
  letterPos: PropTypes.number.isRequired,
  correctName: PropTypes.array.isRequired,
  tryRow: PropTypes.number.isRequired,
};

export default Letter;
