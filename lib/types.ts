export interface Partido {
  equipo: { [key: string]: string }
  resultado: string
  estadio: string
  rival: string
  fecha: string
  torneo: string
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
