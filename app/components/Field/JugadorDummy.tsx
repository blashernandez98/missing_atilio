import React, { useContext } from "react";
import PropTypes from "prop-types";
import Image from 'next/image';

interface JugadorDummyProps {
  player_name: string;
  handleClick?: () => void;
}

function JugadorDummy({ player_name, handleClick }: JugadorDummyProps) {

  const player_name_length = player_name.length;


  // flex justify-center items-center h-20 w-20 rounded-full bg-red-500 shadow-lg text-xl font-bold text-slate-50
  return (
    <div className='flex flex-col items-center hover:cursor-pointer hover:scale-105' onClick={ handleClick }>
      <div className="relative flex justify-center items-center">
        <Image src='/camiseta.png' alt='Camiseta Nacional' width='50' height='50' className='w-16 h-16 aspect-auto' />
        <span className='absolute text-red-600 text-2xl font-bold'>?</span>
        <span className='absolute bottom-0 rounded-full bg-[#1e3c72] text-slate-50 text-xs font-bold px-1'>{ player_name_length }</span>
      </div>

      <span className="text-lg font-extrabold text-slate-50 mt-2">{ player_name.replace(/./g, "*") }</span>
    </div>
  );
}

JugadorDummy.propTypes = { player_name: PropTypes.string.isRequired };

export default JugadorDummy;
