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
  toggleHelp: () => {},
  gameOver: false,
  toggleGameOver: () => {},
  infoCard: true,
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
