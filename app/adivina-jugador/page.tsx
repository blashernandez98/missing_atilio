'use client';

import Footer from '@/app/components/common/Footer';
import GuessThePlayerGame from '@/app/components/guesstheplayer/GuessThePlayerGame';
import Link from 'next/link';
import Image from 'next/image';

export default function AdivinaJugadorPage() {
  return (
    <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] min-h-screen flex flex-col">
      {/* Header */}
      <nav className='flex items-center justify-between py-4 sm:py-6 px-4 sm:px-5 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
        <Link
          href="/"
          className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="text-2xl">←</span>
          <span className="hidden sm:inline">Volver</span>
        </Link>

        <div className='flex items-center gap-3'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight'>
            Adivina el Jugador
          </h1>
          <Image
            src='/atilio_grande.png'
            alt='Atilio Garcia'
            width='50'
            height='50'
            className='rounded-lg shadow-lg'
          />
        </div>

        <div className="w-16 sm:w-24" /> {/* Spacer for centering */}
      </nav>

      {/* Main Game Area */}
      <div className='flex-grow flex items-start justify-center px-4 py-8'>
        <GuessThePlayerGame />
      </div>

      <Footer />
    </div>
  );
}
