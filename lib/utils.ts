import type { Player } from './types';

/**
 * Normalize a string by removing accents/diacritics
 * Useful for accent-insensitive search
 * Example: "José" -> "jose"
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
};

/**
 * Format player name with nickname if available
 * Pattern: [First names] "[Nickname]" [Last name]
 *
 * Examples:
 * - "Ruben Sosa" + "Principito" -> "Ruben \"Principito\" Sosa"
 * - "Jose Luis Alvarez" + "Pollo" -> "Jose Luis \"Pollo\" Alvarez"
 * - "Abalde" + "Mono" -> "Abalde \"Mono\""
 */
export const formatPlayerNameWithNickname = (player: Player): string => {
  if (!player.nickname || !player.nickname.trim()) {
    return player.name;
  }

  const nameParts = player.name.trim().split(/\s+/);

  // Edge case: single-word name
  if (nameParts.length === 1) {
    return `${player.name} "${player.nickname}"`;
  }

  // Extract last word (surname) and all other words (given names)
  const lastName = nameParts[nameParts.length - 1];
  const givenNames = nameParts.slice(0, -1).join(' ');

  return `${givenNames} "${player.nickname}" ${lastName}`;
};
