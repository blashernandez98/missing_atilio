import React from "react";
import PropTypes from "prop-types";
import { useContext } from "react";
import { WordleContext } from "./Wordle";

interface LetterProps {
  letter: string;
  letterPos: number;
  correctName: string[];
  tryRow: number;
  isLongName: boolean;
}

function Letter({ letter, correctName, letterPos, tryRow, isLongName }: LetterProps) {
  const { currentTry } = useContext(WordleContext);

  const correct = letter.toLowerCase() === correctName[letterPos];
  const almost =
    !correct && letter !== "" && correctName.includes(letter.toLowerCase());
  const letterState =
    currentTry > tryRow && (correct ? "bg-green-300" : almost ? "bg-yellow-300" : "bg-zinc-400");

  const sizeClasses = isLongName ? 'w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14' : 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20';
  const textSize = isLongName ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl';

  return (
    <div className={`flex items-center justify-center ${sizeClasses} bg-gradient-to-r from-slate-50 to-slate-100 rounded-md overflow-hidden`}>
      <div className={ `${letterState ? letterState : 'bg-transparent'} ${textSize} font-bold text-[#1e3c72] flex items-center justify-center w-full h-full` }>
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
