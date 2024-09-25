import React, { useContext } from "react";
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

  const currentPlayerName = partido["equipo"] ? partido["equipo"][position].toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(", ")[0]
    .split("") : ['a', 't', 'i', 'l', 'i', 'o'];

  const openBoard = () => {
    if (solved[position]) return;
    setCurrentPlayer(position);
    toggleFieldMode();
  };

  let player_name_length: [number] = [0];

  if (currentPlayerName.includes(" ")) {
    let spaces = 0;
    for (let i = 0; i < currentPlayerName.length; i++) {
      if (currentPlayerName[i] === " ") {
        player_name_length.push(0);
        spaces++;
      } else {
        player_name_length[spaces]++;
      }
    }
  } else {
    player_name_length[0] = currentPlayerName.length;
  }

  let length_string = player_name_length.join(", ");
  let location_classes = `col-start-${locationX} row-start-${locationY}`;
  const solved_font_classes = (solved[position] && solved[position] < 6) ? "text-slate-50" : "text-red-700";
  const guesses_text = (!solved[position]) ? "?" : (solved[position] < 6) ? solved[position] : "X";

  // flex justify-center items-center h-20 w-20 rounded-full bg-red-500 shadow-lg text-xl font-bold text-slate-50
  return (
    <div className={ `${location_classes} flex flex-col items-center hover:cursor-pointer hover:scale-105` }>
      <div className="relative flex justify-center items-center" onClick={ openBoard }>
        <Image src='/camiseta.png' alt='Camiseta Nacional' width='50' height='50' className='w-12 sm:w-16 md:w-20 aspect-auto' />
        <span className='absolute top-1 sm:top-2 text-red-600 text-2xl md:text-3xl font-bold'>{ guesses_text }</span>
        <span className='absolute bottom-[-10px] rounded-full bg-[#1e3c72] text-slate-50 text-xs h-6 md:text-sm md:h-8 aspect-square font-bold flex items-center justify-center'>
          { length_string }
        </span>
      </div>

      <span className={ `text-xs md:text-lg mt-2 font-semibold text-center ${solved_font_classes}` }>
        { solved[position]
          && currentPlayerName.join("").toUpperCase() }
      </span>
    </div>
  );
}

Jugador.propTypes = { position: PropTypes.number.isRequired, locationX: PropTypes.number.isRequired, locationY: PropTypes.number.isRequired };

export default Jugador;
