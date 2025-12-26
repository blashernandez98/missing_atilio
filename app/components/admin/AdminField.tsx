'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Formaciones, Formation } from '@/lib/Football';
import { Partido } from '@/lib/types';

interface AdminFieldProps {
  match: Partido | null;
  formation: string;
  onLineupChange?: (newLineup: { [key: number]: string }) => void;
}

interface AdminPlayerProps {
  position: number;
  locationX: number;
  locationY: number;
  playerName: string;
  isSelected: boolean;
  onClick: () => void;
}

function AdminPlayer({ position, locationX, locationY, playerName, isSelected, onClick }: AdminPlayerProps) {
  const location_classes = `col-start-${locationX} row-start-${locationY}`;

  // Get last name only (remove first name after comma)
  const lastName = playerName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .split(', ')[0];

  const letterCount = lastName.replace(/\s/g, '').length;

  return (
    <div
      className={`${location_classes} flex flex-col items-center cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-110' : 'hover:scale-105'
      }`}
      onClick={onClick}
    >
      <div className={`relative flex justify-center items-center ${isSelected ? 'ring-4 ring-cyan-400 rounded-full' : ''}`}>
        <Image
          src="/camiseta.png"
          alt="Camiseta Nacional"
          width={50}
          height={50}
          className={`w-12 sm:w-16 md:w-20 aspect-auto ${isSelected ? 'opacity-100' : 'opacity-90'}`}
        />
        <span className="absolute top-1 sm:top-2 text-red-600 text-xl md:text-2xl font-bold">
          {position}
        </span>
        <span className="absolute bottom-[-10px] rounded-full bg-[#1e3c72] text-slate-50 text-xs h-6 md:text-sm md:h-8 aspect-square font-bold flex items-center justify-center">
          {letterCount}
        </span>
      </div>

      <span className={`text-xs md:text-sm mt-2 font-semibold text-center ${isSelected ? 'text-cyan-300' : 'text-slate-50'}`}>
        {lastName.toUpperCase()}
      </span>
    </div>
  );
}

function AdminField({ match, formation, onLineupChange }: AdminFieldProps) {
  const coordenadas: Formation = Formaciones[formation] || Formaciones['4-4-2'];
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [currentLineup, setCurrentLineup] = useState<{ [key: number]: string }>(
    match?.equipo || {}
  );

  // Update lineup when match changes
  React.useEffect(() => {
    if (match) {
      setCurrentLineup(match.equipo);
      setSelectedPosition(null);
    }
  }, [match]);

  const handlePlayerClick = (position: number) => {
    if (selectedPosition === null) {
      // First selection
      setSelectedPosition(position);
    } else if (selectedPosition === position) {
      // Deselect if clicking the same player
      setSelectedPosition(null);
    } else {
      // Second selection - swap the players
      const newLineup = { ...currentLineup };
      const temp = newLineup[selectedPosition];
      newLineup[selectedPosition] = newLineup[position];
      newLineup[position] = temp;

      setCurrentLineup(newLineup);
      setSelectedPosition(null);

      // Notify parent of change
      if (onLineupChange) {
        onLineupChange(newLineup);
      }
    }
  };

  if (!match) {
    return (
      <div className="flex flex-col items-center p-5">
        <div className="relative flex flex-col w-[310px] sm:w-[550px] aspect-[2/3]">
          <div className="absolute inset-0 bg-football-field bg-no-repeat bg-contain opacity-30"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-slate-400 text-xl font-bold">
              Selecciona un partido al azar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="flex flex-row justify-center items-center text-slate-50 gap-3 font-bold">
          <span className="text-lg">Formación: {formation}</span>
        </div>
        {selectedPosition && (
          <p className="text-cyan-400 text-sm animate-pulse">
            Selecciona otro jugador para intercambiar posiciones
          </p>
        )}
      </div>
      <div
        id="cancha-admin"
        className="relative flex flex-col w-[310px] sm:w-[550px] aspect-[2/3]"
      >
        <div className="absolute inset-0 bg-football-field bg-no-repeat bg-contain opacity-50"></div>
        <div className="relative z-10 grid grid-rows-6 grid-cols-5 place-items-center py-5 h-[90%] sm:h-[80%]">
          {Array.from({ length: 11 }).map((_, i) => {
            const position = i + 1;
            const playerName = currentLineup[position] || 'Desconocido';
            const coords = coordenadas[position];

            return (
              <AdminPlayer
                key={position}
                position={position}
                locationX={coords[0]}
                locationY={coords[1]}
                playerName={playerName}
                isSelected={selectedPosition === position}
                onClick={() => handlePlayerClick(position)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminField;
