'use client';

import React from 'react';
import { Partido } from '@/lib/types';

interface MatchInfoDisplayProps {
  match: Partido | null;
  gameIndex: number | null;
}

function MatchInfoDisplay({ match, gameIndex }: MatchInfoDisplayProps) {
  if (!match) {
    return (
      <div className="flex flex-col bg-slate-800 rounded-lg p-4 text-slate-400 text-center">
        <p>No hay partido seleccionado</p>
        <p className="text-sm mt-2">
          Haz clic en &quot;Partido al Azar&quot; para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#1e3c72] rounded-lg p-4 text-white gap-2">
      <h3 className="text-xl font-bold text-center border-b border-slate-400 pb-2">
        Datos del Partido
      </h3>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-300 font-semibold">Índice:</span>
          <span className="text-slate-50">{gameIndex !== null ? gameIndex : '-'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-300 font-semibold">Rival:</span>
          <span className="text-slate-50">{match.rival}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-300 font-semibold">Fecha:</span>
          <span className="text-slate-50">{match.fecha}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-300 font-semibold">Resultado:</span>
          <span className="text-slate-50 text-lg font-bold">{match.resultado}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-300 font-semibold">Estadio:</span>
          <span className="text-slate-50 text-right">{match.estadio}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-300 font-semibold">Torneo:</span>
          <span className="text-slate-50 text-sm">{match.torneo}</span>
        </div>
      </div>
    </div>
  );
}

export default MatchInfoDisplay;
