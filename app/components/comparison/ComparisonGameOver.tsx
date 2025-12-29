'use client'

import Link from 'next/link';
import Image from 'next/image';

interface ComparisonGameOverProps {
  streak: number;
  bestStreak: number;
  onClose: () => void;
}

interface GameOverMessage {
  title: string;
  message: string;
  image: string;
}

function getGameOverMessage(streak: number): GameOverMessage {
  if (streak === 0) {
    return {
      title: 'Ah pero que desastre...',
      message: '',
      image: '/GameOver/1.jpg',
    };
  } else if (streak >= 1 && streak <= 3) {
    return {
      title: 'Normal',
      message: '',
      image: '/GameOver/2.jpg',
    };
  } else if (streak >= 4 && streak <= 7) {
    return {
      title: 'Bastante decente',
      message: 'Algo sabés pibe',
      image: '/GameOver/4.jpg',
    };
  } else if (streak >= 8 && streak <= 12) {
    return {
      title: 'Bolso de ley',
      message: 'Bien metida manito. ¿Te estuviste juntando mucho con Hernán?',
      image: '/GameOver/5.jpg',
    };
  } else if (streak >= 13 && streak <= 20) {
    return {
      title: '¡Heredero de Prudencio!',
      message: '',
      image: '/GameOver/6.png',
    };
  } else {
    return {
      title: '¡LEYENDA TRICOLOR!',
      message: '¡Sos la verdadera enciclopedia bolso! Manda mail a la comisión de historia que te contratan.',
      image: '/GameOver/6.png',
    };
  }
}

function ComparisonGameOver({ streak, bestStreak, onClose }: ComparisonGameOverProps) {
  const message = getGameOverMessage(streak);
  const isNewRecord = streak === bestStreak && bestStreak > 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="
          bg-gradient-to-br from-slate-800 to-slate-900
          rounded-2xl p-6 sm:p-8 max-w-md w-full
          border-2 border-slate-600
          shadow-2xl
          transform transition-all duration-300
          animate-scale-in
        "
      >
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-6">
          {message.title}
        </h2>

        {/* Image */}
        {message.image && (
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image src={message.image} alt="GameOver" width={250} height={250} className="rounded-lg max-w-full h-auto" />
          </div>
        )}

        {/* Streak */}
        <div className="flex flex-row justify-center gap-6 sm:gap-8 mb-4 sm:mb-6">
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-cyan-700 w-16 md:w-20 aspect-square text-center text-2xl md:text-4xl font-bold text-white flex justify-center items-center shadow-lg">
              {streak}
            </span>
            <p className="text-center text-xs text-white/70">Racha</p>
          </div>
          {bestStreak > 0 && (
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-cyan-700 w-16 md:w-20 aspect-square text-center text-2xl md:text-4xl font-bold text-white flex justify-center items-center shadow-lg">
                {bestStreak}
              </span>
              <p className="text-center text-xs text-white/70">Mejor Racha</p>
            </div>
          )}
        </div>

        {isNewRecord && (
          <p className="text-green-400 font-semibold text-center mb-4 animate-pulse">
            ¡NUEVO RÉCORD! 🎉
          </p>
        )}

        {/* Message */}
        <p className="text-white/80 text-center mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          {message.message}
        </p>

        {/* Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Link href="/" className="flex-1">
            <button
              className="
                w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base
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
            onClick={onClose}
            className="
              flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base
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

export default ComparisonGameOver;
