import { guessesDefault } from '@/lib/Words'
import { Partido, Guesses, Solved, Letters } from './types'

export const defaultAppContext = {
  toggleFieldMode: () => {},
  partido: {} as Partido,
  guesses: guessesDefault as Guesses,
  setGuesses: (guess: Guesses) => {},
  currentPlayer: 1,
  setCurrentPlayer: (player: number) => {},
  player_name: [] as string[],
  solved: {} as Solved,
  setSolved: (solved: Solved) => {},
  toggleInfo: () => {},
  gameOver: false,
  toggleGameOver: () => {},
  instructions: false,
  toggleInstructions: () => {},
  infoCard: true,
  clearCurrentGameProgress: () => {},
}

export const solvedAppContext = {
  toggleFieldMode: () => {},
  partido: {} as Partido,
  guesses: guessesDefault as Guesses,
  setGuesses: (guess: Guesses) => {},
  currentPlayer: 1,
  setCurrentPlayer: (player: number) => {},
  player_name: [] as string[],
  solved: {1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1} as Solved,
  setSolved: (solved: Solved) => {},
  toggleInfo: () => {},
  gameOver: false,
  toggleGameOver: () => {},
  instructions: false,
  toggleInstructions: () => {},
  infoCard: true,
  setFormacion: (formacion: string) => {},
  clearCurrentGameProgress: () => {},
}

export const defaultWordleContext = {
  currentTry: 0,
  setCurrentTry: (tryNumber: number) => {},
  currentLetter: 0,
  setCurrentLetter: (letterIndex: number) => {},
  selectLetter: (letter: string) => {},
  onDelete: () => {},
  onEnter: () => {},
  letterStates: {} as Letters,
  currentPlayerName: [] as string[],
}
