'use client'

import Link from 'next/link';
import Header from './common/Header';
import Footer from './common/Footer';

function GameModeSelector() {
  return (
    <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] min-h-screen flex flex-col">
      <Header />

      {/* Game Mode Selection */}
      <div className='flex-grow flex items-start justify-center px-4 pt-12 pb-8'>
        <div className='max-w-4xl w-full'>
          <h2 className='text-white text-3xl sm:text-4xl font-bold text-center mb-4'>
            Elegí tu juego
          </h2>
          <p className='text-white/70 text-center mb-12 text-lg'>
            ¿Qué querés jugar hoy?
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
            {/* Missing Atilio (Wordle) */}
            <Link href="/missing11" className='h-full'>
              <div className='
                h-full
                group cursor-pointer
                bg-gradient-to-br from-slate-800/90 to-slate-900/90
                backdrop-blur-sm rounded-2xl p-8
                border-2 border-slate-600/50
                hover:border-blue-400/50
                shadow-2xl
                transform transition-all duration-300
                hover:scale-105 hover:shadow-blue-500/20
              '>
                <div className='flex flex-col items-center text-center h-full'>
                  <div className='text-6xl mb-4'>⚽</div>
                  <h3 className='text-2xl font-bold text-white mb-3'>
                    Missing Atilio
                  </h3>
                  <p className='text-white/70 text-sm mb-4 flex-grow'>
                    Adiviná los 11 jugadores del partido histórico del día
                  </p>
                  <div className='flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all'>
                    <span>Jugar</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Comparison Game */}
            <Link href="/versus" className='h-full'>
              <div className='
                h-full
                group cursor-pointer
                bg-gradient-to-br from-slate-800/90 to-slate-900/90
                backdrop-blur-sm rounded-2xl p-8
                border-2 border-slate-600/50
                hover:border-cyan-400/50
                shadow-2xl
                transform transition-all duration-300
                hover:scale-105 hover:shadow-cyan-500/20
              '>
                <div className='flex flex-col items-center text-center h-full'>
                  <div className='text-6xl mb-4'>⚔️</div>
                  <h3 className='text-2xl font-bold text-white mb-3'>
                    ¿Quién tiene más?
                  </h3>
                  <p className='text-white/70 text-sm mb-4 flex-grow'>
                    Compará las estadísticas de los jugadores tricolores
                  </p>
                  <div className='flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all'>
                    <span>Jugar</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Guess The Player */}
            <Link href="/adivina-jugador" className='h-full'>
              <div className='
                h-full
                group cursor-pointer
                bg-gradient-to-br from-slate-800/90 to-slate-900/90
                backdrop-blur-sm rounded-2xl p-8
                border-2 border-slate-600/50
                hover:border-green-400/50
                shadow-2xl
                transform transition-all duration-300
                hover:scale-105 hover:shadow-green-500/20
              '>
                <div className='flex flex-col items-center text-center h-full'>
                  <div className='text-6xl mb-4'>🔍</div>
                  <h3 className='text-2xl font-bold text-white mb-3'>
                    Adivina el Jugador
                  </h3>
                  <p className='text-white/70 text-sm mb-4 flex-grow'>
                    Descubrí quién es usando las pistas de comparación
                  </p>
                  <div className='flex items-center gap-2 text-green-400 font-semibold group-hover:gap-3 transition-all'>
                    <span>Jugar</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default GameModeSelector;
