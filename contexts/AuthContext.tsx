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

// Helper to get the sync flag key for a user
function getSyncKey(userId: number): string {
  return `atilio_synced_${userId}`;
}

// Check if user's data has been synced
function isDataSynced(userId: number): boolean {
  return localStorage.getItem(getSyncKey(userId)) === 'true';
}

// Mark user's data as synced
function markDataSynced(userId: number): void {
  localStorage.setItem(getSyncKey(userId), 'true');
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

// Clear synced game data from localStorage to prevent duplicate accounts
function clearSyncedGameData(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('missing11_') || key?.startsWith('guessPlayer_solved_')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

// Helper function to collect and migrate localStorage data to server
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
        // Clear synced data from localStorage to prevent duplicate accounts
        clearSyncedGameData();
        return true;
      }
    } catch {
      console.error('Error migrating data');
    }
  }

  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streaks, setStreaks] = useState<Record<string, StreakData>>({});

  // Fetch completions and calculate streaks
  const fetchAndCalculateStreaks = async () => {
    try {
      const res = await fetch('/api/user/completions');
      if (res.ok) {
        const data = await res.json();
        const calculatedStreaks = calculateStreaksFromCompletions(data.completions || []);
        setStreaks(calculatedStreaks);
      }
    } catch {
      console.error('Error fetching completions for streak calculation');
    }
  };

  // Check session on mount and auto-sync if needed
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        if (data?.user) {
          setUser(data.user);

          // Auto-sync localStorage data if not already synced
          if (!isDataSynced(data.user.id)) {
            await performMigration();
            markDataSynced(data.user.id);
          }

          // Calculate streaks from completions
          await fetchAndCalculateStreaks();
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

        // Auto-sync localStorage data if not already synced
        if (!isDataSynced(data.user.id)) {
          await performMigration();
          markDataSynced(data.user.id);
        }

        // Calculate streaks from completions
        await fetchAndCalculateStreaks();

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
          markDataSynced(data.user.id);
        }

        // Calculate streaks from completions
        await fetchAndCalculateStreaks();

        return { success: true, isNewUser: data.isNewUser };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStreaks({});
  };

  const migrateLocalStorageData = useCallback(async () => {
    if (!user) return;

    await performMigration();
    markDataSynced(user.id);

    // Recalculate streaks from completions
    await fetchAndCalculateStreaks();
  }, [user]);

  const refreshStreaks = async () => {
    if (!user) return;

    try {
      // Fetch completions and calculate streaks locally
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
