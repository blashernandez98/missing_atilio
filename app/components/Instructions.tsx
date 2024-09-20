import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "@/app/components/App";
import Modal from './ui/modal';
import JugadorDummy from './Field/JugadorDummy';
import Image from 'next/image';

function Instructions() {
  const { solved, toggleInstructions, instructions } = useContext(AppContext);
  const [tutorialState, setTutorialState] = useState(0);
  const modalContentRef = useRef<HTMLDivElement>(null);
  let players = 0,
    guesses = 0;

  for (const player in solved) {
    players++;
    guesses += solved[player];
  }

  const handleNextPhase = () => {
    setTutorialState(tutorialState + 1);
  }

  const handleClose = () => {
    toggleInstructions();
    setTutorialState(0);
  }

  useEffect(() => {
    // Scroll the modal content to the top whenever the tutorial state changes
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo(0, 0);
    }
  }, [tutorialState]);

  return (
    <Modal isOpen={ instructions } onClose={ toggleInstructions }>
      <div
        ref={ modalContentRef }  // Assign the ref to the scrollable content
        className='flex flex-col rounded-md items-center relative p-5 max-h-96 overflow-y-auto bg-[#1e3c72] text-white'>
        <button className='absolute top-2 right-2 rounded-full bg-red-500 w-5 h-5 text-white font-bold flex justify-center items-center' onClick={ handleClose }>x</button>
        <h2 className='text-3xl font-bold text-center my-2'>Como Jugar</h2>
        { tutorialState === 0 && (
          <>
            <p className='text-md text-left my-2'>
              El juego consiste en intentar recordar los 11 jugadores de un partido de la historia de <strong>Nacional</strong>.
              <br />
              Cuando estas viendo la cancha cada jugador esta representado por una camiseta que tiene:
            </p>
            <ul className='text-left list-disc my-3 p-3'>
              <li className='text-sm'><strong>Un signo de pregunta</strong>, que una vez aciertes el nombre se convertira en el número de intentos que te llevó.</li>
              <li className='text-sm'><strong>Un número</strong> que indica la cantidad de letras que tiene el nombre del jugador.</li>
              <li className='text-sm'><strong>El nombre de el jugador</strong> oculto con asteriscos, si no lo adivinaste. O el nombre del jugador una vez resuelto.</li>
            </ul>
            <JugadorDummy player_name={ 'atilio' } handleClick={ handleNextPhase } />

            <p className='text-md text-left my-2'>
              <strong>Hace click</strong> en el jugador de arriba.
            </p>
          </>
        ) }
        { tutorialState === 1 && (
          <>
            <p className='text-md text-left my-2'>
              Despues de elegir un jugador vas a ver esta pantalla con tus intentos.
              <br />
              Tenes <strong>5 intentos por jugador</strong>.
              <br />
              Podés escribir con el teclado (en computadora) o con un teclado debajo de la grilla (en celular).
            </p>
            <Image src='/board.png' alt='Grilla de intentos' width='200' height='400' />
            <p className='text-md text-left my-2'>
              Cuando termines de escribir tu intento, hace click en el botón <strong>Enviar</strong> o apreta <strong>enter</strong>.
            </p>
            <Image src='/board2.png' alt='Grilla de intentos' width='300' height='100' />
            <p className='text-md text-left my-2'>
              Una vez que envies tu intento, cada casilla se pintará de un color distinto:
            </p>
            <ul className='text-left list-disc my-3 p-3'>
              <li className='text-sm my-1'><strong>Gris</strong> si la letra no está en el nombre del jugador.</li>
              <li className='text-sm my-1'><strong>Amarillo</strong> si la letra está en el nombre del jugador pero en otra posición.</li>
              <li className='text-sm my-1'><strong>Verde</strong> si la letra está en la posición correcta.</li>
            </ul>
            <p className='text-md text-left my-2'>
              <strong>Ojo</strong>, en este caso tenemos una 'O' verde en la 6ta letra y otra amarilla en la 2da letra, esto no implica que <strong>necesariamente</strong> haya otra '0' en el nombre además de la 6ta.
            </p>
            <p className='text-md text-left my-2'>
              <strong>¡Suerte Bolso!</strong>
            </p>
            <button className='bg-red-500 rounded-md w-20 h-16 text-white font-bold hover:scale-110 transition-all ease-in duration-75' onClick={ handleClose }>JUGAR</button>
          </>
        ) }
      </div>
    </Modal>
  );
}

export default Instructions;
