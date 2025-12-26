export interface Partido {
  equipo: { [key: string]: string }
  resultado: string
  estadio: string
  rival: string
  fecha: string
  torneo: string
}

export interface Cronograma {
  liveDate: string
  formation: string
  gameIndex: number
}

export interface CronogramaDB {
  id: number
  live_date: string
  formation: string
  game_index: number
  created_at: Date
  updated_at: Date
}

export interface CronogramaCreate {
  live_date: string
  formation: string
  game_index: number
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
  birthDate?: string
  birthCity?: string
  country?: string
  position?: string
  photoUrl?: string
  debutYear?: number
  originClub?: string
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
  }
}

export interface GuessThePlayerGameState {
  targetPlayer: Player | null
  guesses: PlayerGuess[]
  gameOver: boolean
  won: boolean
  maxGuesses: number
}
