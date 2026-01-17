'use client';

import React from 'react';
import Modal from '../ui/modal';
import type { ComparisonResult } from '@/lib/types';

interface GuessThePlayerInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Reusable StatCell for the example
interface ExampleStatCellProps {
  label: string;
  value: string | number;
  comparison: ComparisonResult;
}

function ExampleStatCell({ label, value, comparison }: ExampleStatCellProps) {
  const getComparisonIcon = () => {
    switch (comparison) {
      case 'exact': return '✓';
      case 'higher': return '↑';
      case 'lower': return '↓';
      case 'different': return '✗';
    }
  };

  const getComparisonColor = () => {
    switch (comparison) {
      case 'exact': return 'bg-green-600/30 border-green-500';
      case 'higher': return 'bg-slate-600/30 border-slate-400';
      case 'lower': return 'bg-slate-600/30 border-slate-400';
      case 'different': return 'bg-red-600/30 border-red-500';
    }
  };

  const getIconBadgeColor = () => {
    switch (comparison) {
      case 'exact': return 'bg-green-600 border-green-500 text-white';
      case 'higher': return 'bg-slate-300 border-slate-200 text-slate-900';
      case 'lower': return 'bg-slate-300 border-slate-200 text-slate-900';
      case 'different': return 'bg-red-600 border-red-500 text-white';
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-1 rounded border ${getComparisonColor()} transition-all`}>
      <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold border ${getIconBadgeColor()}`}>
        {getComparisonIcon()}
      </div>
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-tight">{label}</div>
      <div className="text-xs text-slate-100 font-bold text-center truncate max-w-full">{value}</div>
    </div>
  );
}

function GuessThePlayerInstructions({ isOpen, onClose }: GuessThePlayerInstructionsProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='flex flex-col rounded-xl items-center relative p-5 sm:p-6 max-h-[600px] md:max-h-[700px] overflow-y-auto bg-[#1e3c72] text-white border border-slate-600 shadow-2xl'>
        <button
          className='absolute top-3 right-3 rounded-full bg-slate-700 hover:bg-slate-600 w-8 h-8 text-white font-bold flex justify-center items-center transition-all border border-slate-600 hover:border-slate-500 z-10'
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className='text-2xl sm:text-3xl font-bold text-center my-2 mb-4'>Cómo Jugar</h2>

        <p className='text-md text-left my-2'>
          Intentá adivinar el <strong>jugador del día</strong>.
        </p>

        <p className='text-sm text-left my-2'>
          Escribí el nombre de algún jugador de la historia de Nacional y con cada intento vas a recibir <strong>pistas</strong> sobre qué tan cerca estás:
        </p>

        {/* Example guess result - hardcoded */}
        <div className='w-full rounded-lg p-2 border mb-3 mt-2 bg-slate-800/50 border-slate-700'>
          <div className="flex items-center gap-2 mb-2">
            <div className='w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-cyan-600'>
              1
            </div>
            <div className='font-bold text-white text-sm'>
              Luis Suárez
            </div>
          </div>

          {/* Top row: Text fields */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 mb-1">
            <ExampleStatCell label="País" value="Uruguay" comparison="exact" />
            <ExampleStatCell label="Ciudad" value="Salto" comparison="different" />
            <ExampleStatCell label="Posición" value="Del. Centro" comparison="different" />
            <ExampleStatCell label="F. Nac." value="24/01/1987" comparison="lower" />
            <ExampleStatCell label="Proviene" value="Div. juveniles" comparison="different" />
          </div>

          {/* Bottom row: Numerical fields */}
          <div className="grid grid-cols-4 gap-1">
            <ExampleStatCell label="Debut" value="2004" comparison="higher" />
            <ExampleStatCell label="Partidos" value="65" comparison="higher" />
            <ExampleStatCell label="Goles" value="25" comparison="lower" />
            <ExampleStatCell label="Títulos" value="5" comparison="higher" />
          </div>
        </div>

        <p className='text-sm text-left my-2 mb-1'>
          <strong>Los indicadores:</strong>
        </p>

        <ul className='text-left list-none my-2 p-0 w-full space-y-2'>
          <li className='text-sm flex items-center gap-2'>
            <span className='inline-flex items-center justify-center w-5 h-5 bg-green-600 rounded text-white font-bold text-xs'>✓</span>
            <span><strong>Verde</strong> = Coincide exactamente.</span>
          </li>
          <li className='text-sm flex items-center gap-2'>
            <span className='inline-flex items-center justify-center w-5 h-5 bg-red-600 rounded text-white font-bold text-xs'>✕</span>
            <span><strong>Rojo</strong> = No coincide.</span>
          </li>
          <li className='text-sm flex items-center gap-2'>
            <span className='inline-flex items-center justify-center w-5 h-5 bg-slate-300 rounded text-slate-900 font-bold text-xs'>↑</span>
            <span><strong>Flecha arriba</strong> = El valor del jugador misterioso es <strong>mayor</strong>.</span>
          </li>
          <li className='text-sm flex items-center gap-2'>
            <span className='inline-flex items-center justify-center w-5 h-5 bg-slate-300 rounded text-slate-900 font-bold text-xs'>↓</span>
            <span><strong>Flecha abajo</strong> = El valor del jugador misterioso es <strong>menor</strong>.</span>
          </li>
        </ul>

        <div className='bg-slate-800/50 rounded-lg p-3 my-3 border border-slate-700 w-full'>
          <p className='text-sm text-left mb-2'>
            <strong>Modos de juego:</strong>
          </p>
          <p className='text-xs text-left text-slate-300'>
            Cada día hay un <strong>jugador programado</strong>. Podés navegar entre los jugadores de días anteriores usando las flechas.
            Una vez que completes todos los jugadores programados, pasás al modo <strong>jugador al azar</strong> para seguir practicando.
          </p>
        </div>

        <div className='bg-amber-900/30 rounded-lg p-3 my-2 border border-amber-700/50 w-full'>
          <p className='text-xs text-left text-amber-200'>
            <strong>Importante:</strong> Todos los datos de los jugadores refieren a sus estadísticas personales en Nacional, no cuentan otros clubes/selección. Ej: el año de debut refiere a su debut oficial defendiendo a Nacional.
          </p>
        </div>

        <p className='text-md text-center my-3'>
          <strong>¡Suerte Bolso!</strong>
        </p>

        <button
          className='bg-blue-600 hover:bg-blue-700 border border-blue-500 hover:border-blue-400 rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl'
          onClick={onClose}
        >
          JUGAR
        </button>
      </div>
    </Modal>
  );
}

export default GuessThePlayerInstructions;
