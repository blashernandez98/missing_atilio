'use client'

import Link from 'next/link';

interface ComparisonGameOverProps {
  streak: number;
  bestStreak: number;
  onClose: () => void;
}

interface GameOverMessage {
  title: string;
  message: string;
  emoji: string;
}

function getGameOverMessage(streak: number): GameOverMessage {
  if (streak === 0) {
    return {
      title: '¡Ups!',
      message: '¡Fallaste en el primer intento! Pero no te desanimes, probá de nuevo.',
      emoji: '😅',
    };
  } else if (streak >= 1 && streak <= 3) {
    return {
      title: '¡Buen intento!',
      message: 'Estás empezando a conocer a los jugadores tricolores. ¡Seguí practicando!',
      emoji: '👍',
    };
  } else if (streak >= 4 && streak <= 7) {
    return {
      title: '¡Muy bien!',
      message: '¡Ya vas conociendo bastante sobre los jugadores de Nacional!',
      emoji: '⚽',
    };
  } else if (streak >= 8 && streak <= 12) {
    return {
      title: '¡Excelente!',
      message: '¡Sos un verdadero conocedor de la historia tricolor!',
      emoji: '🏆',
    };
  } else if (streak >= 13 && streak <= 20) {
    return {
      title: '¡Increíble!',
      message: '¡Tenés un conocimiento impresionante sobre Nacional!',
      emoji: '🔥',
    };
  } else {
    return {
      title: '¡LEYENDA!',
      message: '¡Sos una verdadera enciclopedia tricolor! Tu conocimiento es extraordinario.',
      emoji: '👑',
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
        {/* Emoji */}
        <div className="text-center mb-3 sm:mb-4">
          <span className="text-5xl sm:text-6xl md:text-7xl">{message.emoji}</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-3 sm:mb-4">
          {message.title}
        </h2>

        {/* Streak */}
        <div className="text-center mb-3 sm:mb-4">
          <p className="text-white/70 text-sm mb-2">Racha</p>
          <p className="text-4xl sm:text-5xl font-bold text-cyan-300 mb-2">
            {streak}
          </p>
          {isNewRecord && (
            <p className="text-green-400 font-semibold text-sm animate-pulse">
              ¡NUEVO RÉCORD! 🎉
            </p>
          )}
          {!isNewRecord && bestStreak > streak && (
            <p className="text-white/50 text-sm">
              Mejor racha: {bestStreak}
            </p>
          )}
        </div>

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
