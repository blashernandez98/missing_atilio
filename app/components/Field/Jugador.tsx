import React, { useContext } from "react";
import PropTypes from "prop-types";
import { AppContext } from "@/app/components/App";
import Image from 'next/image';

interface JugadorProps {
  position: number;
}

function Jugador({ position }: JugadorProps) {
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
    console.log("setting currentplayer to", position)
    setCurrentPlayer(position);
    toggleFieldMode();
  };

  // flex justify-center items-center h-20 w-20 rounded-full bg-red-500 shadow-lg text-xl font-bold text-slate-50
  return (
    <div className='flex flex-col items-center hover:cursor-pointer hover:scale-105'>
      <div className="relative flex justify-center items-center" onClick={ openBoard }>
        <Image src='/camiseta.png' alt='Camiseta Nacional' width='50' height='50' className='w-16 h-16 aspect-auto' />
        <span className='absolute text-red-600 text-2xl font-bold'>{ solved[position] ? solved[position] : "?" }</span>
      </div>

      <span className="text-lg font-extrabold text-slate-50">
        { solved[position]
          ? currentPlayerName.join("").toUpperCase()
          : currentPlayerName.join("").replace(/./g, "*") }
      </span>
    </div>
  );
}

Jugador.propTypes = { position: PropTypes.number.isRequired };

export default Jugador;
