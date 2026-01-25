'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MigrationPayload, GameCompletion } from '@/lib/types';

interface AuthUser {
  id: number;
  username: string;
}

interface StreakData {
  current: number;
  best: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  streaks: Record<string, StreakData>;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  logout: () => Promise<void>;
  migrateLocalStorageData: () => Promise<void>;
  refreshStreaks: () => Promise<void>;
  updateStreak: (gameMode: string, current: number, best: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to get the migration flag key for a user (tracks if initial localStorage was synced to DB)
function getMigrationKey(userId: number): string {
  return `atilio_migrated_${userId}`;
}

// Check if user's localStorage data has been migrated to DB
function isDataMigrated(userId: number): boolean {
  return localStorage.getItem(getMigrationKey(userId)) === 'true';
}

// Mark user's data as migrated
function markDataMigrated(userId: number): void {
  localStorage.setItem(getMigrationKey(userId), 'true');
}

// Calculate streaks from completions locally
function calculateStreaksFromCompletions(
  completions: GameCompletion[]
): Record<string, StreakData> {
  const streaks: Record<string, StreakData> = {};

  // Group win dates by game mode (only for streak-applicable modes)
  const winDatesByMode: Record<string, string[]> = {
    wordle: [],
    guess_player_scheduled: [],
  };

  for (const completion of completions) {
    if (completion.won && winDatesByMode[completion.gameMode]) {
      winDatesByMode[completion.gameMode].push(completion.gameDate);
    }
  }

  // Calculate streaks for each mode
  for (const [mode, dates] of Object.entries(winDatesByMode)) {
    if (dates.length === 0) continue;

    // Sort dates descending (most recent first)
    const sortedDates = [...dates].sort((a, b) => {
      return parseDateToTimestamp(b) - parseDateToTimestamp(a);
    });

    // Calculate best streak
    let bestStreak = 1;
    let tempStreak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const daysDiff = daysBetweenDates(sortedDates[i], sortedDates[i + 1]);
      if (daysDiff === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else if (daysDiff > 1) {
        tempStreak = 1;
      }
      // daysDiff === 0 means same day, keep counting
    }

    // Calculate current streak from today backwards
    const today = getTodayUruguay();
    let currentStreak = 0;
    let checkDate = today;

    for (const dateStr of sortedDates) {
      const daysDiff = daysBetweenDates(checkDate, dateStr);
      if (daysDiff === 0 || daysDiff === 1) {
        if (daysDiff === 1 || currentStreak === 0) {
          currentStreak++;
        }
        checkDate = dateStr;
      } else {
        break;
      }
    }

    streaks[mode] = { current: currentStreak, best: bestStreak };
  }

  return streaks;
}

// Calculate best versus streak from completions
function calculateVersusBestStreak(completions: GameCompletion[]): number {
  const versusWins = completions
    .filter(c => c.gameMode === 'versus' && c.won)
    .map(c => c.score); // For versus, score is the streak length when game ended

  if (versusWins.length === 0) return 0;
  return Math.max(...versusWins);
}

// Parse date string (DD-MM-YYYY) to timestamp
function parseDateToTimestamp(dateStr: string): number {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

// Calculate days between two date strings (DD-MM-YYYY format)
function daysBetweenDates(date1: string, date2: string): number {
  const d1 = parseDateToTimestamp(date1);
  const d2 = parseDateToTimestamp(date2);
  return Math.abs(Math.floor((d1 - d2) / (1000 * 60 * 60 * 24)));
}

// Get today's date in Uruguay timezone as DD-MM-YYYY
function getTodayUruguay(): string {
  const now = new Date();
  const uruguayTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Montevideo' }));
  const day = uruguayTime.getDate().toString().padStart(2, '0');
  const month = (uruguayTime.getMonth() + 1).toString().padStart(2, '0');
  const year = uruguayTime.getFullYear();
  return `${day}-${month}-${year}`;
}

// Clear all game-related localStorage keys (called on logout)
function clearGameLocalStorage(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key?.startsWith('missing11_') ||
      key?.startsWith('guessPlayer_solved_') ||
      key === 'versus_gameState'
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

// Populate localStorage from database completions (called on login)
function populateLocalStorageFromCompletions(completions: GameCompletion[]): void {
  // Group completions by game mode
  const wordleCompletions = completions.filter(c => c.gameMode === 'wordle');
  const guessPlayerCompletions = completions.filter(c => c.gameMode === 'guess_player_scheduled');
  const versusCompletions = completions.filter(c => c.gameMode === 'versus');

  // Populate Missing11 completions
  for (const completion of wordleCompletions) {
    const key = `missing11_${completion.gameDate}`;
    // Only set if not already in localStorage (don't overwrite active game state)
    if (!localStorage.getItem(key)) {
      // Create a synthetic completed state
      const syntheticSolved: Record<number, number> = {};
      const avgGuesses = Math.ceil(completion.score / 11);
      for (let i = 1; i <= 11; i++) {
        syntheticSolved[i] = avgGuesses;
      }
      const state = {
        guesses: {},
        solved: syntheticSolved,
        currentPlayer: 2,
        fieldMode: true,
        gameOver: true,
      };
      localStorage.setItem(key, JSON.stringify(state));
    }
  }

  // Populate Guess the Player completions
  for (const completion of guessPlayerCompletions) {
    const key = `guessPlayer_solved_${completion.gameDate}`;
    // Only set if not already in localStorage
    if (!localStorage.getItem(key)) {
      const data = {
        guessCount: completion.score,
        won: completion.won,
      };
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Populate Versus best streak
  if (versusCompletions.length > 0) {
    const bestStreak = calculateVersusBestStreak(versusCompletions);
    const existingState = localStorage.getItem('versus_gameState');

    if (existingState) {
      try {
        const parsed = JSON.parse(existingState);
        // Only update if DB has a better streak
        if (bestStreak > (parsed.bestStreak || 0)) {
          parsed.bestStreak = bestStreak;
          localStorage.setItem('versus_gameState', JSON.stringify(parsed));
        }
      } catch {
        // Invalid state, create new
        localStorage.setItem('versus_gameState', JSON.stringify({
          currentStreak: 0,
          bestStreak: bestStreak,
        }));
      }
    } else {
      // No existing state, create with best streak from DB
      localStorage.setItem('versus_gameState', JSON.stringify({
        currentStreak: 0,
        bestStreak: bestStreak,
      }));
    }
  }
}

// Helper function to collect and migrate localStorage data to server (does NOT clear localStorage)
async function performMigration(): Promise<boolean> {
  const migrationData: MigrationPayload = {
    wordle: [],
    guessPlayer: [],
  };

  // Collect missing11 completions
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('missing11_')) {
      try {
        const dateStr = key.replace('missing11_', '');
        const value = localStorage.getItem(key);
        if (value) {
          const state = JSON.parse(value);
          // Check if game was completed (all 11 positions attempted)
          const solvedCount = Object.keys(state.solved || {}).length;
          if (solvedCount === 11) {
            // Calculate total score (sum of guesses)
            const score = Object.values(state.solved || {}).reduce(
              (sum: number, guesses: unknown) => sum + (typeof guesses === 'number' ? guesses : 0),
              0
            );
            migrationData.wordle.push({
              date: dateStr,
              solved: state.solved,
              score: score as number,
            });
          }
        }
      } catch {
        // Skip invalid data
      }
    }

    // Collect guess player completions
    if (key?.startsWith('guessPlayer_solved_')) {
      try {
        const dateStr = key.replace('guessPlayer_solved_', '');
        const value = localStorage.getItem(key);
        if (value) {
          // Handle both old format (string 'true') and new format (JSON object)
          let data;
          if (value === 'true') {
            data = { won: true, guessCount: 0 };
          } else {
            data = JSON.parse(value);
          }
          migrationData.guessPlayer.push({
            date: dateStr,
            guessCount: data.guessCount || 0,
            won: data.won ?? true,
          });
        }
      } catch {
        // Skip invalid data
      }
    }
  }

  // Only migrate if there's data
  if (migrationData.wordle.length > 0 || migrationData.guessPlayer.length > 0) {
    try {
      const res = await fetch('/api/auth/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(migrationData),
      });

      if (res.ok) {
        // NOTE: We no longer clear localStorage after migration
        // localStorage stays intact so games continue to work
        return true;
      }
    } catch {
      console.error('Error migrating data');
    }
  }

  return false;
}

// Fetch completions from DB and populate localStorage + calculate streaks
async function syncFromDatabase(): Promise<Record<string, StreakData>> {
  try {
    const res = await fetch('/api/user/completions');
    if (res.ok) {
      const data = await res.json();
      const completions: GameCompletion[] = data.completions || [];

      // Populate localStorage from DB completions
      populateLocalStorageFromCompletions(completions);

      // Calculate and return streaks
      return calculateStreaksFromCompletions(completions);
    }
  } catch {
    console.error('Error syncing from database');
  }
  return {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streaks, setStreaks] = useState<Record<string, StreakData>>({});

  // Check session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        if (data?.user) {
          setUser(data.user);

          // Migrate localStorage to DB if not already done (first time this user logs in on this device)
          if (!isDataMigrated(data.user.id)) {
            await performMigration();
            markDataMigrated(data.user.id);
          }

          // Sync from DB: populate localStorage and calculate streaks
          const calculatedStreaks = await syncFromDatabase();
          setStreaks(calculatedStreaks);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);

        // Migrate localStorage to DB if not already done
        if (!isDataMigrated(data.user.id)) {
          await performMigration();
          markDataMigrated(data.user.id);
        }

        // Sync from DB: populate localStorage and calculate streaks
        const calculatedStreaks = await syncFromDatabase();
        setStreaks(calculatedStreaks);

        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);

        // For new users, migrate localStorage data immediately
        if (data.isNewUser) {
          await performMigration();
          markDataMigrated(data.user.id);
        }

        // Sync from DB (will have the newly migrated data)
        const calculatedStreaks = await syncFromDatabase();
        setStreaks(calculatedStreaks);

        return { success: true, isNewUser: data.isNewUser };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });

    // Clear game-related localStorage on logout
    clearGameLocalStorage();

    setUser(null);
    setStreaks({});
  };

  const migrateLocalStorageData = useCallback(async () => {
    if (!user) return;

    await performMigration();
    markDataMigrated(user.id);

    // Recalculate streaks from completions
    const calculatedStreaks = await syncFromDatabase();
    setStreaks(calculatedStreaks);
  }, [user]);

  const refreshStreaks = async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/user/completions');
      if (res.ok) {
        const data = await res.json();
        const calculatedStreaks = calculateStreaksFromCompletions(data.completions || []);
        setStreaks(calculatedStreaks);
      }
    } catch {
      console.error('Error refreshing streaks');
    }
  };

  const updateStreak = (gameMode: string, current: number, best: number) => {
    setStreaks((prev) => ({
      ...prev,
      [gameMode]: { current, best },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        streaks,
        login,
        register,
        logout,
        migrateLocalStorageData,
        refreshStreaks,
        updateStreak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
