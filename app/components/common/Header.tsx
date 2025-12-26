import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  if (showBackButton) {
    return (
      <nav className='flex items-center justify-center py-6 px-5 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
        <Link href="/" className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
          <span className='text-2xl'>←</span>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight'>Missing Atilio</h1>
          <Image src='/atilio_grande.png' alt='Atilio Garcia' width='50' height='50' className='rounded-lg shadow-lg' />
        </Link>
      </nav>
    );
  }

  return (
    <nav className='flex items-center justify-center py-6 px-5 gap-3 bg-slate-950/30 backdrop-blur-sm border-b border-slate-700/50'>
      <h1 className='text-3xl sm:text-4xl font-bold text-slate-50 tracking-tight'>Missing Atilio</h1>
      <Image src='/atilio_grande.png' alt='Atilio Garcia' width='60' height='60' className='rounded-lg shadow-lg' />
    </nav>
  );
}
