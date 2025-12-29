import { neon } from '@neondatabase/serverless';
import { Cronograma, CronogramaDB, CronogramaCreate, PlayerSchedule, PlayerScheduleDB, PlayerScheduleCreate } from './types';

const getSql = () => {
  const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || '';
  if (!url) {
    throw new Error(
      'DATABASE_URL or NETLIFY_DATABASE_URL environment variable is required. ' +
      'Make sure you have a .env.local file with DATABASE_URL set.'
    );
  }
  return neon(url);
};

/**
 * Get all cronograma entries, ordered by date ascending
 * Returns Cronograma format (camelCase) for compatibility with frontend
 */
export async function getCronogramaAll(): Promise<Cronograma[]> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        id,
        live_date as "liveDate",
        formation,
        game_index as "gameIndex",
        created_at,
        updated_at
      FROM cronograma
      ORDER BY TO_DATE(live_date, 'DD-MM-YYYY') ASC
    ` as any[];

    return results.map((row: any) => ({
      liveDate: row.liveDate,
      formation: row.formation,
      gameIndex: row.gameIndex
    }));
  } catch (error) {
    console.error('Error fetching all cronograma:', error);
    throw error;
  }
}

/**
 * Get all cronograma entries with full DB fields
 * Returns CronogramaDB format for admin panel
 */
export async function getCronogramaAllWithMetadata(): Promise<CronogramaDB[]> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        id,
        live_date,
        formation,
        game_index,
        created_at,
        updated_at
      FROM cronograma
      ORDER BY TO_DATE(live_date, 'DD-MM-YYYY') ASC
    ` as any[];

    return results as CronogramaDB[];
  } catch (error) {
    console.error('Error fetching cronograma with metadata:', error);
    throw error;
  }
}

/**
 * Get cronograma entry for specific date
 */
export async function getCronogramaByDate(date: string): Promise<Cronograma | null> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        live_date as "liveDate",
        formation,
        game_index as "gameIndex"
      FROM cronograma
      WHERE live_date = ${date}
      LIMIT 1
    ` as any[];

    if (results.length === 0) {
      return null;
    }

    return results[0] as Cronograma;
  } catch (error) {
    console.error('Error fetching cronograma by date:', error);
    throw error;
  }
}

/**
 * Get cronograma entry by ID
 */
export async function getCronogramaById(id: number): Promise<CronogramaDB | null> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        id,
        live_date,
        formation,
        game_index,
        created_at,
        updated_at
      FROM cronograma
      WHERE id = ${id}
      LIMIT 1
    ` as any[];

    if (results.length === 0) {
      return null;
    }

    return results[0] as CronogramaDB;
  } catch (error) {
    console.error('Error fetching cronograma by ID:', error);
    throw error;
  }
}

/**
 * Create new cronograma entry
 * Returns the created entry with ID
 */
export async function createCronograma(data: CronogramaCreate): Promise<CronogramaDB> {
  try {
    const sql = getSql();
    const results = await sql`
      INSERT INTO cronograma (live_date, formation, game_index)
      VALUES (${data.live_date}, ${data.formation}, ${data.game_index})
      RETURNING
        id,
        live_date,
        formation,
        game_index,
        created_at,
        updated_at
    ` as any[];

    return results[0] as CronogramaDB;
  } catch (error) {
    console.error('Error creating cronograma:', error);
    throw error;
  }
}

/**
 * Update existing cronograma entry
 */
export async function updateCronograma(id: number, data: Partial<CronogramaCreate>): Promise<CronogramaDB> {
  try {
    const sql = getSql();
    const updates = [];
    const values = [];

    if (data.live_date !== undefined) {
      updates.push('live_date');
      values.push(data.live_date);
    }
    if (data.formation !== undefined) {
      updates.push('formation');
      values.push(data.formation);
    }
    if (data.game_index !== undefined) {
      updates.push('game_index');
      values.push(data.game_index);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Build dynamic UPDATE query
    const setClause = updates.map((field, i) => `${field} = $${i + 1}`).join(', ');

    const results = await sql`
      UPDATE cronograma
      SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING
        id,
        live_date,
        formation,
        game_index,
        created_at,
        updated_at
    ` as any[];

    if (results.length === 0) {
      throw new Error('Cronograma not found');
    }

    return results[0] as CronogramaDB;
  } catch (error) {
    console.error('Error updating cronograma:', error);
    throw error;
  }
}

/**
 * Delete cronograma entry
 */
export async function deleteCronograma(id: number): Promise<boolean> {
  try {
    const sql = getSql();
    const results = await sql`
      DELETE FROM cronograma
      WHERE id = ${id}
      RETURNING id
    ` as any[];

    return results.length > 0;
  } catch (error) {
    console.error('Error deleting cronograma:', error);
    throw error;
  }
}

/**
 * Get next available date (tomorrow if no schedules, or day after last scheduled date)
 * Returns date in dd-mm-yyyy format
 */
export async function getNextAvailableDate(): Promise<string> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT live_date
      FROM cronograma
      ORDER BY TO_DATE(live_date, 'DD-MM-YYYY') DESC
      LIMIT 1
    ` as any[];

    if (results.length === 0) {
      // No schedules, return tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatDateToDDMMYYYY(tomorrow);
    }

    // Parse the last scheduled date and add 1 day
    const lastScheduledDate = parseDDMMYYYYToDate(results[0].live_date);
    lastScheduledDate.setDate(lastScheduledDate.getDate() + 1);
    return formatDateToDDMMYYYY(lastScheduledDate);
  } catch (error) {
    console.error('Error getting next available date:', error);
    throw error;
  }
}

/**
 * Helper function to parse dd-mm-yyyy string to Date object
 */
function parseDDMMYYYYToDate(dateString: string): Date {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Helper function to format Date object to dd-mm-yyyy string
 */
function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Validate date format (dd-mm-yyyy)
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const [day, month, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validate formation string
 */
export function isValidFormation(formation: string): boolean {
  const validFormations = ['4-4-2', '4-2-3-1', '4-2-4', '4-1-2-2-1', '4-3-3'];
  return validFormations.includes(formation);
}

// ============================================================================
// PLAYER SCHEDULE FUNCTIONS
// ============================================================================

/**
 * Get all player schedule entries, ordered by date ascending
 * Returns PlayerSchedule format (camelCase) for compatibility with frontend
 */
export async function getPlayerScheduleAll(): Promise<PlayerSchedule[]> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        id,
        live_date as "liveDate",
        player_id as "playerId",
        created_at,
        updated_at
      FROM player_schedule
      ORDER BY TO_DATE(live_date, 'DD-MM-YYYY') ASC
    ` as any[];

    return results.map((row: any) => ({
      liveDate: row.liveDate,
      playerId: row.playerId
    }));
  } catch (error) {
    console.error('Error fetching all player schedules:', error);
    throw error;
  }
}

/**
 * Get all player schedule entries with full DB fields
 * Returns PlayerScheduleDB format for admin panel
 */
export async function getPlayerScheduleAllWithMetadata(): Promise<PlayerScheduleDB[]> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        id,
        live_date,
        player_id,
        created_at,
        updated_at
      FROM player_schedule
      ORDER BY TO_DATE(live_date, 'DD-MM-YYYY') ASC
    ` as any[];

    return results as PlayerScheduleDB[];
  } catch (error) {
    console.error('Error fetching player schedules with metadata:', error);
    throw error;
  }
}

/**
 * Get player schedule entry for specific date
 */
export async function getPlayerScheduleByDate(date: string): Promise<PlayerSchedule | null> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        live_date as "liveDate",
        player_id as "playerId"
      FROM player_schedule
      WHERE live_date = ${date}
      LIMIT 1
    ` as any[];

    if (results.length === 0) {
      return null;
    }

    return results[0] as PlayerSchedule;
  } catch (error) {
    console.error('Error fetching player schedule by date:', error);
    throw error;
  }
}

/**
 * Get player schedule entry by ID
 */
export async function getPlayerScheduleById(id: number): Promise<PlayerScheduleDB | null> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        id,
        live_date,
        player_id,
        created_at,
        updated_at
      FROM player_schedule
      WHERE id = ${id}
      LIMIT 1
    ` as any[];

    if (results.length === 0) {
      return null;
    }

    return results[0] as PlayerScheduleDB;
  } catch (error) {
    console.error('Error fetching player schedule by ID:', error);
    throw error;
  }
}

/**
 * Create new player schedule entry
 * Returns the created entry with ID
 */
export async function createPlayerSchedule(data: PlayerScheduleCreate): Promise<PlayerScheduleDB> {
  try {
    const sql = getSql();
    const results = await sql`
      INSERT INTO player_schedule (live_date, player_id)
      VALUES (${data.live_date}, ${data.player_id})
      RETURNING
        id,
        live_date,
        player_id,
        created_at,
        updated_at
    ` as any[];

    return results[0] as PlayerScheduleDB;
  } catch (error) {
    console.error('Error creating player schedule:', error);
    throw error;
  }
}

/**
 * Update existing player schedule entry
 */
export async function updatePlayerSchedule(id: number, data: Partial<PlayerScheduleCreate>): Promise<PlayerScheduleDB> {
  try {
    const sql = getSql();
    const updates = [];
    const values = [];

    if (data.live_date !== undefined) {
      updates.push('live_date');
      values.push(data.live_date);
    }
    if (data.player_id !== undefined) {
      updates.push('player_id');
      values.push(data.player_id);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Build dynamic UPDATE query
    const setClause = updates.map((field, i) => `${field} = $${i + 1}`).join(', ');

    const results = await sql`
      UPDATE player_schedule
      SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING
        id,
        live_date,
        player_id,
        created_at,
        updated_at
    ` as any[];

    if (results.length === 0) {
      throw new Error('Player schedule not found');
    }

    return results[0] as PlayerScheduleDB;
  } catch (error) {
    console.error('Error updating player schedule:', error);
    throw error;
  }
}

/**
 * Delete player schedule entry
 */
export async function deletePlayerSchedule(id: number): Promise<boolean> {
  try {
    const sql = getSql();
    const results = await sql`
      DELETE FROM player_schedule
      WHERE id = ${id}
      RETURNING id
    ` as any[];

    return results.length > 0;
  } catch (error) {
    console.error('Error deleting player schedule:', error);
    throw error;
  }
}

/**
 * Get next available date for player schedule (tomorrow if no schedules, or day after last scheduled date)
 * Returns date in dd-mm-yyyy format
 */
export async function getNextAvailableDateForPlayerSchedule(): Promise<string> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT live_date
      FROM player_schedule
      ORDER BY TO_DATE(live_date, 'DD-MM-YYYY') DESC
      LIMIT 1
    ` as any[];

    if (results.length === 0) {
      // No schedules, return tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatDateToDDMMYYYY(tomorrow);
    }

    // Parse the last scheduled date and add 1 day
    const lastScheduledDate = parseDDMMYYYYToDate(results[0].live_date);
    lastScheduledDate.setDate(lastScheduledDate.getDate() + 1);
    return formatDateToDDMMYYYY(lastScheduledDate);
  } catch (error) {
    console.error('Error getting next available date for player schedule:', error);
    throw error;
  }
}
