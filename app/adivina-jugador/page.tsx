'use client';

import Header from '@/app/components/common/Header';
import Footer from '@/app/components/common/Footer';
import GuessThePlayerGame from '@/app/components/guesstheplayer/GuessThePlayerGame';

export default function AdivinaJugadorPage() {
  return (
    <div className="relative bg-gradient-to-r from-[#1e3c72] to-[#2a5298] min-h-screen flex flex-col">
      <Header showBackButton />

      {/* Main Game Area */}
      <div className='flex-grow flex items-start justify-center px-4 py-8'>
        <GuessThePlayerGame />
      </div>

      <Footer />
    </div>
  );
}
