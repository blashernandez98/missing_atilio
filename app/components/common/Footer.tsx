export default function Footer() {
  return (
    <footer className='w-full flex flex-col items-center justify-center gap-2 py-6 px-4 bg-slate-950/20 border-t border-slate-700/30 mt-auto'>
      <p className='text-xs md:text-sm text-slate-300 text-center'>
        Gracias a los datos de{' '}
        <a
          href="https://atilio.uy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline decoration-cyan-400/30 hover:decoration-cyan-300"
        >
          atilio.uy
        </a>
      </p>
      <p className='text-sm md:text-base font-bold text-slate-200 text-center'>
        Hecho por Blas Hernández
      </p>
    </footer>
  );
}
