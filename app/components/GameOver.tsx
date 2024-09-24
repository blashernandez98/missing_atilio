import React, { useContext } from "react";
import { AppContext } from "@/app/components/App";
import Modal from './ui/modal';
import Image from 'next/image';

function GameOver() {
  const { solved, toggleGameOver, gameOver } = useContext(AppContext);
  let solvedPlayers = 0,
    numberOfGuesses = 0;

  let titulo = ""
  let descripcion = ""
  let imagen = ""

  for (const player in solved) {
    solvedPlayers++;
    numberOfGuesses += solved[player];
  }

  if (solvedPlayers <= 7) {
    titulo = "Ah pero que desastre..."
    descripcion = 'No estas muy bolso.'
    imagen = "/GameOver/1.jpg"
  } else if (solvedPlayers <= 10) {
    titulo = "¡Casi llegás Migliore!"
    descripcion = 'Te faltó muy poquito. Como a aquel ese día...'
    imagen = "/GameOver/2.jpg"
  } else if (numberOfGuesses >= 30) {
    titulo = "Dudoso..."
    descripcion = 'Me parece que alguien estuvo usando más las pistas de letras que recordando los 11 tricolores.'
    imagen = "/GameOver/3.jpg"
  }
  else if (numberOfGuesses >= 15) {
    titulo = 'Bastante decente'
    descripcion = 'Te acordaste de casi todos en un par de intentos.'
    imagen = "/GameOver/4.jpg"
  } else if (numberOfGuesses > 11) {
    titulo = 'Bolso de ley'
    descripcion = 'Bien metida manito. ¿Te estuviste juntando mucho con Hernán?'
    imagen = "/GameOver/5.jpg"
  } else if (numberOfGuesses === 11) {
    titulo = '¡Heredero de Prudencio!'
    descripcion = 'Todos en un intento no es para cualquiera. Manda mail a la comisión de historia que te contratan.'
    imagen = "/GameOver/6.png"
  } else {
    titulo = 'Paso algo raro'
    descripcion = 'Si estas viendo esto falló la matrix'
  }


  return (
    <Modal isOpen={ gameOver } onClose={ toggleGameOver }>
      <div className='flex flex-col justify-center items-center relative p-6 bg-[#1e3c72] text-white max-h-[500px] overflow-y-scroll'>
        <button className='absolute top-2 right-2 rounded-full bg-red-500 w-5 h-5 text-white font-bold flex justify-center items-center' onClick={ toggleGameOver }>x</button>
        <h2 className='text-2xl font-bold text-center my-4'>{ titulo }</h2>
        <Image src={ imagen } alt='GameOver' width={ 250 } height={ 250 } />
        <div className='flex flex-row my-5 gap-8'>
          <div className='flex flex-col items-center gap-2'>
            <span className='rounded-full bg-green-800 w-14 md:w-20 aspect-square text-center text-2xl md:text-4xl font-bold text-white p-3 flex justify-center items-center'>{ solvedPlayers }</span>
            <p className='text-center text-xs'>Jugadores Resueltos</p>
          </div>
          <div className='flex flex-col items-center gap-2'>
            <span className='rounded-full bg-green-800 w-14 md:w-20 aspect-square text-center text-2xl md:text-4xl font-bold text-white p-3 flex justify-center items-center'>{ numberOfGuesses }</span>
            <p className='text-center text-xs'>Número de intentos</p>
          </div>
        </div>
        <p className='text-left text-sm p-2'>{ descripcion }</p>
      </div>
    </Modal>
  );
}

export default GameOver;
