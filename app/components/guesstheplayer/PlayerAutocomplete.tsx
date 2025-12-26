'use client'

import { useState, useRef, useEffect } from 'react';
import type { Player } from '@/lib/types';

interface PlayerAutocompleteProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  disabled?: boolean;
  excludePlayerIds?: number[];
}

function PlayerAutocomplete({ players, onSelectPlayer, disabled, excludePlayerIds = [] }: PlayerAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter players based on search term (minimum 3 characters)
  const filteredPlayers = searchTerm.length >= 3
    ? players
        .filter(player => !excludePlayerIds.includes(player.id))
        .filter(player => {
          const searchLower = searchTerm.toLowerCase();
          return (
            player.fullName.toLowerCase().includes(searchLower) ||
            player.name.toLowerCase().includes(searchLower)
          );
        })
        .slice(0, 10) // Limit to 10 results
    : [];

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered players change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleSelect = (player: Player) => {
    onSelectPlayer(player);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredPlayers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredPlayers[highlightedIndex]) {
          handleSelect(filteredPlayers[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (e.target.value.length >= 3) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Escribe el nombre del jugador..."
        className="
          w-full px-4 py-3 rounded-lg
          bg-slate-700/50 border-2 border-slate-600
          text-white placeholder-slate-400
          focus:outline-none focus:border-cyan-400
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      />

      {isOpen && filteredPlayers.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="
            absolute top-full left-0 right-0 mt-2
            bg-slate-800 border-2 border-slate-600
            rounded-lg shadow-2xl
            max-h-80 overflow-y-auto
            z-50
          "
        >
          {filteredPlayers.map((player, index) => (
            <button
              key={player.id}
              onClick={() => handleSelect(player)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                w-full px-4 py-3 text-left
                transition-colors
                ${
                  index === highlightedIndex
                    ? 'bg-cyan-600/30 text-white'
                    : 'text-slate-200 hover:bg-slate-700/50'
                }
                ${index !== filteredPlayers.length - 1 ? 'border-b border-slate-700' : ''}
              `}
            >
              <div className="font-semibold">{player.fullName}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredPlayers.length === 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="
            absolute top-full left-0 right-0 mt-2
            bg-slate-800 border-2 border-slate-600
            rounded-lg shadow-2xl
            px-4 py-3
            text-slate-400 text-center
            z-50
          "
        >
          No se encontraron jugadores
        </div>
      )}
    </div>
  );
}

export default PlayerAutocomplete;
