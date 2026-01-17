/**
 * Position category types
 */
export type PositionCategory = 'GOL' | 'DEF_CENTRAL' | 'LATERAL' | 'VOL_CENTRAL' | 'VOLANTE' | 'DEL_CENTRO' | 'EXTREMO';

/**
 * Display labels for position categories (in Spanish)
 */
export const POSITION_LABELS: Record<PositionCategory, string> = {
  'GOL': 'Arquero',
  'DEF_CENTRAL': 'Def. Central',
  'LATERAL': 'Lateral',
  'VOL_CENTRAL': 'Vol. Central',
  'VOLANTE': 'Volante',
  'DEL_CENTRO': 'Del. Centro',
  'EXTREMO': 'Extremo',
};

/**
 * Mapping of position strings to position categories
 * GOL - Goalkeeper (Arquero)
 * DEF_CENTRAL - Central Defense (Zaguero/Back/Defensa)
 * LATERAL - Full-back (Lateral)
 * VOL_CENTRAL - Defensive/Central Midfielder (Volante central/defensivo)
 * VOLANTE - Midfielder (Volante/Entreala/Half)
 * DEL_CENTRO - Center Forward (Centro delantero/Centre forward)
 * EXTREMO - Winger (Wing/Puntero/Extremo)
 */
export const POSITION_MAPPINGS: Record<string, PositionCategory> = {
  // Goalkeepers
  'Arquero': 'GOL',
  'Arquero/Centro Forward': 'GOL',
  'Arquero/centro forward': 'GOL',

  // Central Defenders
  'Back': 'DEF_CENTRAL',
  'Back Derecho': 'DEF_CENTRAL',
  'Back derecho': 'DEF_CENTRAL',
  'Back derecho/half': 'DEF_CENTRAL',
  'Back izquierdo': 'DEF_CENTRAL',
  'Back/centre half': 'DEF_CENTRAL',
  'Defensa': 'DEF_CENTRAL',
  'Zaguero': 'DEF_CENTRAL',
  'Zaguero / Lateral derecho': 'DEF_CENTRAL',
  'Zaguero/Lateral': 'DEF_CENTRAL',
  'Zaguero/Lateral izquierdo': 'DEF_CENTRAL',
  'Zaguero/Lateral volante': 'DEF_CENTRAL',
  'Zaguero/centro delantero': 'DEF_CENTRAL',
  'Zaguero/lateral': 'DEF_CENTRAL',
  'Zaguero/lateral izquierdo': 'DEF_CENTRAL',
  'Zaguero/volante': 'DEF_CENTRAL',

  // Laterals (Full-backs)
  'Lateral Derecho': 'LATERAL',
  'Lateral Izquierdo': 'LATERAL',
  'Lateral derecho': 'LATERAL',
  'Lateral derecho e izquierdo': 'LATERAL',
  'Lateral derecho/izquierdo': 'LATERAL',
  'Lateral derecho/Volante': 'LATERAL',
  'Lateral derecho/Zaguero': 'LATERAL',
  'Lateral derecho/volante': 'LATERAL',
  'Lateral izq.': 'LATERAL',
  'Lateral izquierdo': 'LATERAL',
  'Lateral izquierdo/volante': 'LATERAL',
  'Lateral volante izquierdo': 'LATERAL',

  // Central/Defensive Midfielders
  'Centre half': 'VOL_CENTRAL',
  'Centre half/half derecho': 'VOL_CENTRAL',
  'Centro half': 'VOL_CENTRAL',
  'Centro half/half izq': 'VOL_CENTRAL',
  'Volante central': 'VOL_CENTRAL',
  'Volante central/zaguero': 'VOL_CENTRAL',
  'Volante defensivo': 'VOL_CENTRAL',
  'Volante/Zaguero': 'VOL_CENTRAL',

  // Midfielders (general/offensive)
  'Entrala izquierdo': 'VOLANTE',
  'Entreala dercho': 'VOLANTE',
  'Entreala derecho': 'VOLANTE',
  'Entreala derecho/izquierdo': 'VOLANTE',
  'Entreala izquierdo': 'VOLANTE',
  'Half': 'VOLANTE',
  'Half Izquierdo': 'VOLANTE',
  'Half der': 'VOLANTE',
  'Half derecho': 'VOLANTE',
  'Half derecho/izquierdo': 'VOLANTE',
  'Half derrecho/izquierdo': 'VOLANTE',
  'Half izquierdo': 'VOLANTE',
  'Half/back izquierdo': 'VOLANTE',
  'Polifuncional': 'VOLANTE',
  'Volante': 'VOLANTE',
  'Volante Ofensivo': 'VOLANTE',
  'Volante ofensivo': 'VOLANTE',
  'Volante/Delantero': 'VOLANTE',
  'Volante/delantero': 'VOLANTE',
  'Volante/lateral derecho': 'VOLANTE',

  // Center Forwards
  'Centre forward': 'DEL_CENTRO',
  'Centre forward/entreala': 'DEL_CENTRO',
  'Centro Delantero': 'DEL_CENTRO',
  'Centro Forward': 'DEL_CENTRO',
  'Centro delalntero': 'DEL_CENTRO',
  'Centro delantero': 'DEL_CENTRO',
  'Centro forward': 'DEL_CENTRO',
  'Delantero': 'DEL_CENTRO',
  'Delantero/Volante': 'DEL_CENTRO',
  'Delantero/volante': 'DEL_CENTRO',
  'delantero': 'DEL_CENTRO',
  'Entreala der/centre forward': 'DEL_CENTRO',
  'Entreala dercho/centro forward': 'DEL_CENTRO',
  'Entreala derecho/centro forward': 'DEL_CENTRO',
  'Entreala/centre forward': 'DEL_CENTRO',

  // Wingers/Extremos
  'Extremo derecho': 'EXTREMO',
  'Puntero Izquierdo': 'EXTREMO',
  'Puntero derecho': 'EXTREMO',
  'Puntero derecho/izquierdo': 'EXTREMO',
  'Puntero izquierdo': 'EXTREMO',
  'Wing der.': 'EXTREMO',
  'Wing derecho': 'EXTREMO',
  'Wing derecho/izquierdo': 'EXTREMO',
  'Wing izquierdo': 'EXTREMO',
  'Wing izquierdo/arquero': 'EXTREMO',
  'Wing izquierdo/entreala izquierdo': 'EXTREMO',
  'Wing/entreala derecho': 'EXTREMO',
};

/**
 * Get position category for a given position string
 * Returns undefined if position is not recognized
 */
export function getPositionCategory(position: string | undefined): PositionCategory | undefined {
  if (!position) return undefined;
  return POSITION_MAPPINGS[position];
}

/**
 * Get display label for a position category
 * Returns the category code if not found
 */
export function getPositionLabel(category: PositionCategory | string | undefined): string {
  if (!category) return 'N/A';
  return POSITION_LABELS[category as PositionCategory] || category;
}
