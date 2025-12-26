import React, { useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AppContext } from "@/app/components/App";
import Image from 'next/image';

interface JugadorProps {
  position: number;
  locationX: number;
  locationY: number;
}

/* col-start-1 col-start-2 col-start-3 col-start-4 col-start-5 col-start-6 col-start-7 col-start-8 col-start-9 col-start-10 col-start-11
col-end-1 col-end-2 col-end-3 col-end-4 col-end-5 col-end-6 col-end-7 col-end-8 col-end-9 col-end-10 col-end-11
row-start-1 row-start-2 row-start-3 row-start-4 row-start-5 row-start-6
row-end-1 row-end-2 row-end-3 row-end-4 row-end-5 row-end-6
 */
function Jugador({ position, locationX, locationY }: JugadorProps) {
  const { partido, toggleFieldMode, setCurrentPlayer, solved } =
    useContext(AppContext);

  // Memoize player name processing to avoid recalculations
  const { currentPlayerName, lengthString } = useMemo(() => {
    const playerName = partido["equipo"]
      ? partido["equipo"][position]
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .split(", ")[0]
          .split("")
      : ['a', 't', 'i', 'l', 'i', 'o'];

    // Calculate name length parts
    const nameLengthParts: number[] = [0];
    let partIndex = 0;

    for (let i = 0; i < playerName.length; i++) {
      if (playerName[i] === " ") {
        nameLengthParts.push(0);
        partIndex++;
      } else {
        nameLengthParts[partIndex]++;
      }
    }

    return {
      currentPlayerName: playerName,
      lengthString: nameLengthParts.join(", ")
    };
  }, [partido, position]);

  const openBoard = () => {
    if (solved[position]) return;
    setCurrentPlayer(position);
    toggleFieldMode();
  };

  // Memoize class names and display values
  const locationClasses = `col-start-${locationX} row-start-${locationY}`;
  const isSolved = Boolean(solved[position]);
  const isCorrect = isSolved && solved[position] < 6;
  const solvedFontClasses = isCorrect ? "text-slate-50" : "text-red-700";
  const guessesText = !isSolved ? "?" : isCorrect ? solved[position] : "X";
  const displayName = currentPlayerName.join("").toUpperCase();

  return (
    <div className={`${locationClasses} flex flex-col items-center transition-all duration-200 hover:cursor-pointer hover:scale-105`}>
      <div className="relative flex justify-center items-center" onClick={openBoard}>
        <Image
          src='/camiseta.png'
          alt='Camiseta Nacional'
          width='50'
          height='50'
          className='w-12 sm:w-16 md:w-20 aspect-auto'
          priority
        />
        <span className='absolute top-1 sm:top-2 text-red-600 text-2xl md:text-3xl font-bold'>
          {guessesText}
        </span>
        <span className='absolute bottom-[-10px] rounded-full bg-[#1e3c72] text-slate-50 text-xs h-6 md:text-sm md:h-8 aspect-square font-bold flex items-center justify-center'>
          {lengthString}
        </span>
      </div>

      {isSolved && (
        <span
          className={`
            text-xs md:text-lg mt-2 font-semibold text-center
            ${solvedFontClasses}
            animate-fade-in
          `}
        >
          {displayName}
        </span>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

Jugador.propTypes = {
  position: PropTypes.number.isRequired,
  locationX: PropTypes.number.isRequired,
  locationY: PropTypes.number.isRequired
};

export default Jugador;
