import Link from 'next/link';
import Image from 'next/image';

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

        <div className="w-16 sm:w-24" /> {/* Spacer for centering */}
      </nav>
    );
  }

  return (
    <nav className='flex items-center justify-center py-4 sm:py-6 px-4 sm:px-5 gap-3 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50 tracking-tight'>Missing Atilio</h1>
      <Image src='/atilio_grande.png' alt='Atilio Garcia' width='50' height='50' className='rounded-lg shadow-lg' />
    </nav>
  );
}
