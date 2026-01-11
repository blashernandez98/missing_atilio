import type { Player } from './types';

/**
 * Normalize a string by removing accents/diacritics BUT preserving Ñ/ñ
 * Useful for accent-insensitive search while keeping Spanish ñ
 * Example: "José" -> "jose", but "Peña" -> "peña"
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    // Replace accented vowels explicitly to preserve ñ
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ü/g, 'u');
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
