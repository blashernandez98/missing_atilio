import { neon } from '@neondatabase/serverless';
import { Cronograma, CronogramaDB, CronogramaCreate, PlayerSchedule, PlayerScheduleDB, PlayerScheduleCreate, GameMode, DailyGameStats, LeaderboardEntry, RecordGamePlayParams, RecordGamePlayResult } from './types';
import { getTomorrowStringUruguay, getTodayStringUruguay } from './date';

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
      WHERE TRIM(live_date) = TRIM(${date})
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
 * Returns date in dd-mm-yyyy format (Uruguay timezone)
 */
export async function getNextAvailableDate(): Promise<string> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT live_date
      FROM cronograma
    ` as any[];

    if (results.length === 0) {
      // No schedules, return tomorrow in Uruguay timezone
      return getTomorrowStringUruguay();
    }

    // Parse all dates and find the maximum
    const dates = results.map(row => parseDDMMYYYYToDate(row.live_date));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add 1 day to the maximum date
    maxDate.setDate(maxDate.getDate() + 1);
    return formatDateToDDMMYYYY(maxDate);
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
      WHERE TRIM(live_date) = TRIM(${date})
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
 * Returns date in dd-mm-yyyy format (Uruguay timezone)
 */
export async function getNextAvailableDateForPlayerSchedule(): Promise<string> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT live_date
      FROM player_schedule
    ` as any[];

    if (results.length === 0) {
      // No schedules, return tomorrow in Uruguay timezone
      return getTomorrowStringUruguay();
    }

    // Parse all dates and find the maximum
    const dates = results.map(row => parseDDMMYYYYToDate(row.live_date));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add 1 day to the maximum date
    maxDate.setDate(maxDate.getDate() + 1);
    return formatDateToDDMMYYYY(maxDate);
  } catch (error) {
    console.error('Error getting next available date for player schedule:', error);
    throw error;
  }
}

// ==================== GAME ANALYTICS ====================

/**
 * Record a game play - updates daily stats and potentially adds to leaderboard
 * Returns whether this is a highscore and the entry ID for name submission
 *
 * Highscore logic:
 * - wordle: best (lowest) score for that specific targetDate
 * - guess_player_scheduled: best (lowest) score for that specific targetDate
 * - guess_player_random: best (lowest) score overall for random mode
 * - versus: top 10 overall (highest streaks)
 */
export async function recordGamePlay(params: RecordGamePlayParams): Promise<RecordGamePlayResult> {
  const defaultResult: RecordGamePlayResult = { isHighscore: false, entryId: null, rank: null };

  try {
    const sql = getSql();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for DB

    // Update daily stats (upsert)
    await sql`
      INSERT INTO daily_game_stats (date, game_mode, plays, wins, surrenders, total_score)
      VALUES (
        ${today},
        ${params.gameMode},
        1,
        ${params.won ? 1 : 0},
        ${params.surrendered ? 1 : 0},
        ${params.score}
      )
      ON CONFLICT (date, game_mode)
      DO UPDATE SET
        plays = daily_game_stats.plays + 1,
        wins = daily_game_stats.wins + ${params.won ? 1 : 0},
        surrenders = daily_game_stats.surrenders + ${params.surrendered ? 1 : 0},
        total_score = daily_game_stats.total_score + ${params.score},
        updated_at = CURRENT_TIMESTAMP
    `;

    // Only add to leaderboard if it's a win (for guess games) or any play (for versus)
    if (!params.won && params.gameMode !== 'versus') {
      return defaultResult;
    }

    // Insert the entry and get its ID
    const insertResult = await sql`
      INSERT INTO leaderboard (game_mode, score, session_id, target_id, target_date)
      VALUES (
        ${params.gameMode},
        ${params.score},
        ${params.sessionId || null},
        ${params.targetId || null},
        ${params.targetDate || null}
      )
      RETURNING id
    ` as any[];

    const entryId = insertResult[0]?.id;

    // Determine if this is a highscore based on game mode
    let isHighscore = false;
    let rank: number | null = null;

    if (params.gameMode === 'versus') {
      // Versus: top 10 overall (higher is better)
      const rankResult = await sql`
        SELECT COUNT(*) + 1 as rank
        FROM leaderboard
        WHERE game_mode = 'versus'
        AND score > ${params.score}
      ` as any[];
      rank = parseInt(rankResult[0]?.rank) || null;
      isHighscore = rank !== null && rank <= 10;
    } else if (params.gameMode === 'guess_player_random') {
      // Random mode: best overall (lower is better)
      const rankResult = await sql`
        SELECT COUNT(*) + 1 as rank
        FROM leaderboard
        WHERE game_mode = 'guess_player_random'
        AND score < ${params.score}
      ` as any[];
      rank = parseInt(rankResult[0]?.rank) || null;
      isHighscore = rank === 1; // Only #1 is a highscore for random
    } else {
      // Wordle and guess_player_scheduled: best for that specific date (lower is better)
      const rankResult = await sql`
        SELECT COUNT(*) + 1 as rank
        FROM leaderboard
        WHERE game_mode = ${params.gameMode}
        AND target_date = ${params.targetDate}
        AND score < ${params.score}
      ` as any[];
      rank = parseInt(rankResult[0]?.rank) || null;
      isHighscore = rank === 1; // Only #1 for that date is a highscore
    }

    // Prune leaderboard to keep only top 100 per game mode
    const isLowerBetter = params.gameMode !== 'versus';

    if (isLowerBetter) {
      await sql`
        DELETE FROM leaderboard
        WHERE game_mode = ${params.gameMode}
        AND id NOT IN (
          SELECT id FROM leaderboard
          WHERE game_mode = ${params.gameMode}
          ORDER BY score ASC, created_at DESC
          LIMIT 100
        )
      `;
    } else {
      await sql`
        DELETE FROM leaderboard
        WHERE game_mode = ${params.gameMode}
        AND id NOT IN (
          SELECT id FROM leaderboard
          WHERE game_mode = ${params.gameMode}
          ORDER BY score DESC, created_at DESC
          LIMIT 100
        )
      `;
    }

    // Check if our entry was pruned
    const stillExists = await sql`
      SELECT id FROM leaderboard WHERE id = ${entryId}
    ` as any[];

    if (stillExists.length === 0) {
      return defaultResult; // Entry was pruned, not a highscore
    }

    return { isHighscore, entryId, rank };
  } catch (error) {
    console.error('Error recording game play:', error);
    return defaultResult;
  }
}

/**
 * Get leaderboard for a game mode
 */
export async function getLeaderboard(gameMode: GameMode, limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const sql = getSql();
    const isLowerBetter = gameMode !== 'versus';

    let results;
    if (isLowerBetter) {
      results = await sql`
        SELECT
          id,
          game_mode as "gameMode",
          score,
          player_name as "playerName",
          session_id as "sessionId",
          target_id as "targetId",
          target_date as "targetDate",
          created_at as "createdAt"
        FROM leaderboard
        WHERE game_mode = ${gameMode}
        ORDER BY score ASC, created_at ASC
        LIMIT ${limit}
      ` as any[];
    } else {
      results = await sql`
        SELECT
          id,
          game_mode as "gameMode",
          score,
          player_name as "playerName",
          session_id as "sessionId",
          target_id as "targetId",
          target_date as "targetDate",
          created_at as "createdAt"
        FROM leaderboard
        WHERE game_mode = ${gameMode}
        ORDER BY score DESC, created_at ASC
        LIMIT ${limit}
      ` as any[];
    }

    return results as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Update player name on a leaderboard entry
 */
export async function updateLeaderboardPlayerName(id: number, playerName: string): Promise<boolean> {
  try {
    const sql = getSql();
    const results = await sql`
      UPDATE leaderboard
      SET player_name = ${playerName}
      WHERE id = ${id}
      RETURNING id
    ` as any[];

    return results.length > 0;
  } catch (error) {
    console.error('Error updating leaderboard player name:', error);
    return false;
  }
}

/**
 * Get daily stats for a game mode (optional date range)
 */
export async function getDailyStats(
  gameMode?: GameMode,
  startDate?: string,
  endDate?: string
): Promise<DailyGameStats[]> {
  try {
    const sql = getSql();

    let results;
    if (gameMode && startDate && endDate) {
      results = await sql`
        SELECT
          id,
          date,
          game_mode as "gameMode",
          plays,
          wins,
          surrenders,
          total_score as "totalScore"
        FROM daily_game_stats
        WHERE game_mode = ${gameMode}
        AND date >= ${startDate}
        AND date <= ${endDate}
        ORDER BY date DESC
      ` as any[];
    } else if (gameMode) {
      results = await sql`
        SELECT
          id,
          date,
          game_mode as "gameMode",
          plays,
          wins,
          surrenders,
          total_score as "totalScore"
        FROM daily_game_stats
        WHERE game_mode = ${gameMode}
        ORDER BY date DESC
        LIMIT 30
      ` as any[];
    } else {
      results = await sql`
        SELECT
          id,
          date,
          game_mode as "gameMode",
          plays,
          wins,
          surrenders,
          total_score as "totalScore"
        FROM daily_game_stats
        ORDER BY date DESC
        LIMIT 100
      ` as any[];
    }

    return results as DailyGameStats[];
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return [];
  }
}

/**
 * Get aggregate stats summary for all game modes
 */
export async function getStatsSummary(): Promise<{
  gameMode: GameMode;
  totalPlays: number;
  totalWins: number;
  avgScore: number;
}[]> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        game_mode as "gameMode",
        SUM(plays) as "totalPlays",
        SUM(wins) as "totalWins",
        CASE WHEN SUM(plays) > 0 THEN ROUND(SUM(total_score)::numeric / SUM(plays), 2) ELSE 0 END as "avgScore"
      FROM daily_game_stats
      GROUP BY game_mode
      ORDER BY game_mode
    ` as any[];

    return results.map((r: any) => ({
      gameMode: r.gameMode as GameMode,
      totalPlays: parseInt(r.totalPlays) || 0,
      totalWins: parseInt(r.totalWins) || 0,
      avgScore: parseFloat(r.avgScore) || 0,
    }));
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    return [];
  }
}
