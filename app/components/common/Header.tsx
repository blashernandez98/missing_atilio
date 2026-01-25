'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AuthControls } from '@/app/components/auth/AppHeader';

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  if (showBackButton) {
    return (
      <nav className='flex items-center justify-between py-4 sm:py-6 px-4 sm:px-5 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
        <Link
          href="/"
          className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="text-2xl">←</span>
          <span className="hidden sm:inline">Volver</span>
        </Link>

        <div className='flex items-center gap-3'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight'>Missing Atilio</h1>
          <Image src='/atilio_grande.png' alt='Atilio Garcia' width='50' height='50' className='rounded-lg shadow-lg' />
        </div>

        <AuthControls />
      </nav>
    );
  }

  return (
    <nav className='flex items-center justify-between py-4 sm:py-6 px-4 sm:px-5 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
      {/* Spacer for centering on desktop only */}
      <div className="hidden sm:block w-24" />

      <div className='flex items-center gap-2 sm:gap-3'>
        <h1 className='text-xl sm:text-3xl md:text-4xl font-bold text-slate-50 tracking-tight'>Missing Atilio</h1>
        <Image src='/atilio_grande.png' alt='Atilio Garcia' width='50' height='50' className='rounded-lg shadow-lg w-10 h-10 sm:w-[50px] sm:h-[50px]' />
      </div>

      <AuthControls />
    </nav>
  );
}
