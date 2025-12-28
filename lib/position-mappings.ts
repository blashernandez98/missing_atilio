/**
 * Position category types
 */
export type PositionCategory = 'GOL' | 'DEF' | 'MED' | 'ATA';

/**
 * Mapping of position strings to position categories
 * GOL - Goalkeeper (Arquero/Golero/Portero)
 * DEF - Defense (Defensa/Lateral/Zaguero)
 * MED - Midfield (Volante/Medio/Mediocampista)
 * ATA - Forward (Delantero/Puntero/Atacante)
 */
export const POSITION_MAPPINGS: Record<string, PositionCategory> = {
  'Arquero': 'GOL',
  'Arquero/Centro Forward': 'GOL',
  'Arquero/centro forward': 'GOL',
  'Back': 'DEF',
  'Back Derecho': 'DEF',
  'Back derecho': 'DEF',
  'Back derecho/half': 'DEF',
  'Back izquierdo': 'DEF',
  'Back/centre half': 'DEF',
  'Centre forward': 'ATA',
  'Centre forward/entreala': 'ATA',
  'Centre half': 'MED',
  'Centre half/half derecho': 'MED',
  'Centro Delantero': 'ATA',
  'Centro Forward': 'ATA',
  'Centro delalntero': 'ATA',
  'Centro delantero': 'ATA',
  'Centro forward': 'ATA',
  'Centro half': 'MED',
  'Centro half/half izq': 'MED',
  'Defensa': 'DEF',
  'Delantero': 'ATA',
  'Delantero/Volante': 'ATA',
  'Delantero/volante': 'ATA',
  'Entrala izquierdo': 'MED',
  'Entreala der/centre forward': 'ATA',
  'Entreala dercho': 'MED',
  'Entreala dercho/centro forward': 'ATA',
  'Entreala derecho': 'MED',
  'Entreala derecho/centro forward': 'ATA',
  'Entreala derecho/izquierdo': 'MED',
  'Entreala izquierdo': 'MED',
  'Entreala/centre forward': 'ATA',
  'Extremo derecho': 'ATA',
  'Half': 'MED',
  'Half Izquierdo': 'MED',
  'Half der': 'MED',
  'Half derecho': 'MED',
  'Half derecho/izquierdo': 'MED',
  'Half derrecho/izquierdo': 'MED',
  'Half izquierdo': 'MED',
  'Half/back izquierdo': 'MED',
  'Lateral Derecho': 'DEF',
  'Lateral Izquierdo': 'DEF',
  'Lateral derecho': 'DEF',
  'Lateral derecho e izquierdo': 'DEF',
  'Lateral derecho/izquierdo': 'DEF',
  'Lateral derecho/Volante': 'DEF',
  'Lateral derecho/Zaguero': 'DEF',
  'Lateral derecho/volante': 'DEF',
  'Lateral izq.': 'DEF',
  'Lateral izquierdo': 'DEF',
  'Lateral izquierdo/volante': 'DEF',
  'Lateral volante izquierdo': 'DEF',
  'Polifuncional': 'MED',
  'Puntero Izquierdo': 'ATA',
  'Puntero derecho': 'ATA',
  'Puntero derecho/izquierdo': 'ATA',
  'Puntero izquierdo': 'ATA',
  'Volante': 'MED',
  'Volante Ofensivo': 'MED',
  'Volante central': 'MED',
  'Volante central/zaguero': 'MED',
  'Volante defensivo': 'MED',
  'Volante ofensivo': 'MED',
  'Volante/Delantero': 'MED',
  'Volante/Zaguero': 'MED',
  'Volante/delantero': 'MED',
  'Volante/lateral derecho': 'MED',
  'Wing der.': 'ATA',
  'Wing derecho': 'ATA',
  'Wing derecho/izquierdo': 'ATA',
  'Wing izquierdo': 'ATA',
  'Wing izquierdo/arquero': 'ATA',
  'Wing izquierdo/entreala izquierdo': 'ATA',
  'Wing/entreala derecho': 'ATA',
  'Zaguero': 'DEF',
  'Zaguero / Lateral derecho': 'DEF',
  'Zaguero/Lateral': 'DEF',
  'Zaguero/Lateral izquierdo': 'DEF',
  'Zaguero/Lateral volante': 'DEF',
  'Zaguero/centro delantero': 'DEF',
  'Zaguero/lateral': 'DEF',
  'Zaguero/lateral izquierdo': 'DEF',
  'Zaguero/volante': 'DEF',
  'delantero': 'ATA',
};

/**
 * Get position category for a given position string
 * Returns undefined if position is not recognized
 */
export function getPositionCategory(position: string | undefined): PositionCategory | undefined {
  if (!position) return undefined;
  return POSITION_MAPPINGS[position];
}
