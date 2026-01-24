import { getTodayStringUruguay } from './date';

/**
 * Parse a date string in dd-mm-yyyy format to a Date object
 */
export function parseDDMMYYYYToDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = parseDDMMYYYYToDate(date1);
  const d2 = parseDDMMYYYYToDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastWinDate: string | null;
}

export interface StreakUpdateResult {
  currentStreak: number;
  bestStreak: number;
  lastWinDate: string;
}

/**
 * Calculate updated streak based on a new win
 * @param existingStreak Current streak data from DB (null if first win)
 * @param winDate The date of the win (dd-mm-yyyy format)
 * @returns Updated streak values
 */
export function calculateStreakUpdate(
  existingStreak: StreakData | null,
  winDate: string
): StreakUpdateResult {
  if (!existingStreak || !existingStreak.lastWinDate) {
    // First win ever
    return {
      currentStreak: 1,
      bestStreak: 1,
      lastWinDate: winDate,
    };
  }

  const daysDiff = daysBetween(existingStreak.lastWinDate, winDate);

  if (daysDiff === 0) {
    // Same day - no change to streak (already counted)
    return {
      currentStreak: existingStreak.currentStreak,
      bestStreak: existingStreak.bestStreak,
      lastWinDate: existingStreak.lastWinDate,
    };
  } else if (daysDiff === 1) {
    // Consecutive day - increment streak
    const newStreak = existingStreak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, existingStreak.bestStreak),
      lastWinDate: winDate,
    };
  } else {
    // Gap in days - reset to 1
    return {
      currentStreak: 1,
      bestStreak: existingStreak.bestStreak, // Keep best
      lastWinDate: winDate,
    };
  }
}

/**
 * Check if streak is still active (not broken by missing yesterday)
 * Called on login to update displayed streak
 */
export function isStreakActive(lastWinDate: string | null): boolean {
  if (!lastWinDate) return false;

  const today = getTodayStringUruguay();
  const daysDiff = daysBetween(lastWinDate, today);

  // Streak is active if last win was today or yesterday
  return daysDiff <= 1;
}

/**
 * Get the current streak value, accounting for potential streak break
 * If the user hasn't played since 2+ days ago, their current streak is 0
 */
export function getEffectiveCurrentStreak(streak: StreakData | null): number {
  if (!streak) return 0;
  if (!streak.lastWinDate) return 0;

  if (isStreakActive(streak.lastWinDate)) {
    return streak.currentStreak;
  }

  // Streak has been broken
  return 0;
}

/**
 * Calculate streak from an array of completion dates
 * Used for migration from localStorage
 */
export function calculateStreakFromDates(
  winDates: string[]
): { currentStreak: number; bestStreak: number; lastWinDate: string | null } {
  if (winDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, lastWinDate: null };
  }

  // Sort dates descending (most recent first)
  const sortedDates = [...winDates].sort((a, b) => {
    return parseDDMMYYYYToDate(b).getTime() - parseDDMMYYYYToDate(a).getTime();
  });

  // Calculate best streak (find longest consecutive sequence)
  let bestStreak = 1;
  let tempStreak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const daysDiff = daysBetween(sortedDates[i], sortedDates[i + 1]);
    if (daysDiff === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Calculate current streak from today backwards
  const today = getTodayStringUruguay();
  let currentStreak = 0;
  let checkDate = today;

  for (const dateStr of sortedDates) {
    const daysDiff = daysBetween(dateStr, checkDate);
    if (daysDiff === 0 || daysDiff === 1) {
      currentStreak++;
      checkDate = dateStr;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    bestStreak,
    lastWinDate: sortedDates[0],
  };
}
