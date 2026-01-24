import type { PositionCategory } from './position-mappings';

export interface Partido {
  equipo: { [key: string]: string }
  resultado: string
  estadio: string
  rival: string
  fecha: string
  torneo: string
}

// Player positions mapping: position number (1-11) to player name
export type PlayerPositions = { [key: number]: string };

export interface Cronograma {
  liveDate: string
  formation: string
  gameIndex: number
  playerPositions?: PlayerPositions // Custom player positions (swapped from original)
}

export interface CronogramaDB {
  id: number
  live_date: string
  formation: string
  game_index: number
  player_positions: PlayerPositions | null
  created_at: Date
  updated_at: Date
}

export interface CronogramaCreate {
  live_date: string
  formation: string
  game_index: number
  player_positions?: PlayerPositions
}

export interface PlayerSchedule {
  liveDate: string
  playerId: number
}

export interface PlayerScheduleDB {
  id: number
  live_date: string
  player_id: number
  created_at: Date
  updated_at: Date
}

export interface PlayerScheduleCreate {
  live_date: string
  player_id: number
}

export interface Guesses {
  [key: number]: string[][]
}

export interface Letters {
  [key: string]: string
}

export interface Solved {
  [key: number]: number
}

export interface Player {
  id: number
  name: string
  fullName: string
  nickname?: string
  birthDate?: string
  birthCity?: string
  country?: string
  position?: string
  positionCategory?: PositionCategory
  photoUrl?: string
  debutYear?: number
  originClub?: string
  debutGameId?: number
  officialDebutGameId?: number
  lastGameId?: number
  lastOfficialGameId?: number
  rivalGoals?: Array<{ rival: string; goals: number }>
  goalsByTournament?: Array<{ tournament: string; goals: number }>
  stats: {
    totalMatches: number
    wins: number
    draws: number
    losses: number
    totalGoals: number
    goalsPerMatch: number
    penaltyGoals: number
    minutesPlayed: number
    officialTitles: number
    officialInternationalTitles?: number
    officialNationalTitles?: number
    friendlyInternationalTitles?: number
    friendlyNationalTitles?: number
  }
}

export interface Coach {
  id: number
  name: string
  fullName: string
  birthDate?: string
  photoUrl?: string
  stats: {
    totalMatches: number
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    winPercentage: number
    championships: number
  }
}

export type ComparisonStat = 'totalMatches' | 'totalGoals' | 'wins' | 'officialTitles' | 'minutesPlayed';

export interface ComparisonGameState {
  currentStreak: number
  bestStreak: number
  playerA: Player | null
  playerB: Player | null
  currentStat: ComparisonStat
  isRevealed: boolean
  isCorrect: boolean | null
  gameOver: boolean
}

// Guess The Player Game Types
export type ComparisonResult = 'exact' | 'higher' | 'lower' | 'different';

export interface PlayerGuess {
  player: Player
  comparisons: {
    country: ComparisonResult
    birthCity: ComparisonResult
    birthDate: ComparisonResult
    debutYear: ComparisonResult
    totalMatches: ComparisonResult
    totalGoals: ComparisonResult
    originClub: ComparisonResult
    officialTitles: ComparisonResult
    positionCategory: ComparisonResult
  }
}

export interface GuessThePlayerGameState {
  targetPlayer: Player | null
  guesses: PlayerGuess[]
  gameOver: boolean
  won: boolean
  maxGuesses: number
  hasGivenUp?: boolean
  isScheduledPlayer?: boolean
  todayDate?: string
  previousGuessCount?: number // Used when viewing a previously completed game
}

// Analytics types
export type GameMode = 'guess_player_scheduled' | 'guess_player_random' | 'versus' | 'wordle';

export interface LeaderboardEntry {
  id: number;
  gameMode: GameMode;
  score: number;
  playerName: string | null;
  sessionId: string | null;
  targetId: number | null;
  targetDate: string | null;
  createdAt: Date;
}

export interface RecordGamePlayParams {
  gameMode: GameMode;
  won: boolean;
  surrendered?: boolean;
  score: number; // guesses for guess games, streak for versus
  sessionId?: string;
  targetId?: number;
  targetDate?: string;
}

export interface RecordGamePlayResult {
  isHighscore: boolean;
  entryId: number | null;
  rank: number | null; // Position in leaderboard (1 = best)
}

// User Authentication Types
export interface User {
  id: number;
  username: string;
  createdAt: Date;
}

export interface UserDB {
  id: number;
  username: string;
  username_lower: string;
  password_hash: string;
  created_at: Date;
}

export interface UserCreate {
  username: string;
  password: string;
}

// Game Completion Types
export interface GameCompletion {
  id: number;
  userId: number | null;  // NULL for guests
  gameMode: 'wordle' | 'guess_player_scheduled' | 'versus';
  gameDate: string;
  won: boolean;
  score: number;
  completedAt: Date;
}

export interface GameCompletionCreate {
  userId: number | null;  // NULL for guest games
  sessionId?: string | null;  // For guest tracking
  gameMode: 'wordle' | 'guess_player_scheduled' | 'versus';
  gameDate: string;
  won: boolean;
  score: number;
}

// Migration Types (for importing localStorage data)
export interface MigrationWordleData {
  date: string;
  solved: Record<number, number>;
  score: number;
}

export interface MigrationGuessPlayerData {
  date: string;
  guessCount: number;
  won: boolean;
}

export interface MigrationPayload {
  wordle: MigrationWordleData[];
  guessPlayer: MigrationGuessPlayerData[];
}
