import React, { useContext } from "react";
import { AppContext } from "@/app/components/App";
import Image from 'next/image';
import Link from 'next/link';

function GameOver() {
  const { solved, toggleGameOver, gameOver } = useContext(AppContext);
  let solvedPlayers = 0,
    numberOfGuesses = 0;

  let titulo = ""
  let descripcion = ""
  let imagen = ""

  for (let i = 1; i <= 11; i++) {
    if (solved[i] < 6) solvedPlayers++;
    numberOfGuesses += solved[i];
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

  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="
          bg-gradient-to-br from-slate-800 to-slate-900
          rounded-2xl p-8 max-w-md w-full
          border-2 border-slate-600
          shadow-2xl
          transform transition-all duration-300
          animate-scale-in
        "
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {titulo}
        </h2>

        {/* Image */}
        {imagen && (
          <div className="flex justify-center mb-6">
            <Image src={imagen} alt="GameOver" width={250} height={250} className="rounded-lg" />
          </div>
        )}

        {/* Stats */}
        <div className='flex flex-row justify-center gap-8 mb-6'>
          <div className='flex flex-col items-center gap-2'>
            <span className='rounded-full bg-cyan-700 w-16 md:w-20 aspect-square text-center text-2xl md:text-4xl font-bold text-white flex justify-center items-center shadow-lg'>
              {solvedPlayers}
            </span>
            <p className='text-center text-xs text-white/70'>Jugadores Resueltos</p>
          </div>
          <div className='flex flex-col items-center gap-2'>
            <span className='rounded-full bg-cyan-700 w-16 md:w-20 aspect-square text-center text-2xl md:text-4xl font-bold text-white flex justify-center items-center shadow-lg'>
              {numberOfGuesses}
            </span>
            <p className='text-center text-xs text-white/70'>Número de intentos</p>
          </div>
        </div>

        {/* Message */}
        <p className='text-white/80 text-center mb-8 leading-relaxed'>
          {descripcion}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <button
              className="
                w-full px-6 py-3 rounded-xl font-bold
                bg-slate-700 hover:bg-slate-600
                text-white shadow-lg
                transform transition-all duration-200
                hover:scale-105 hover:shadow-xl
                active:scale-95
              "
            >
              Inicio
            </button>
          </Link>
          <button
            onClick={toggleGameOver}
            className="
              flex-1 px-6 py-3 rounded-xl font-bold
              bg-blue-600 hover:bg-blue-500
              text-white shadow-lg
              transform transition-all duration-200
              hover:scale-105 hover:shadow-xl
              active:scale-95
            "
          >
            Jugar de Nuevo
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default GameOver;
