import React, { useContext } from "react";
import { AppContext } from "@/app/components/App";
import Modal from './ui/modal';

function GameOver() {
  const { solved, toggleGameOver, gameOver } = useContext(AppContext);
  let players = 0,
    guesses = 0;

  for (const player in solved) {
    players++;
    guesses += solved[player];
  }
  return (
    <Modal isOpen={ gameOver } onClose={ toggleGameOver }>
      <div className='flex flex-col justify-center items-center relative p-2'>
        <button className='absolute top-2 right-2 rounded-full bg-red-500 w-5 h-5 text-white font-bold flex justify-center items-center' onClick={ toggleGameOver }>x</button>
        <h2 className='text-3xl font-bold text-center'>Heredero de Prudencio</h2>
        <h3 className='text-left'>{ `Te acordaste de los 11 jugadores en: ${guesses} intentos` }</h3>
        <button>Twitter</button>
        <button>Copy</button>
      </div>
    </Modal>
  );
}

export default GameOver;
