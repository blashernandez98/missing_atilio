import { neon } from '@neondatabase/serverless';
import { Cronograma, CronogramaDB, CronogramaCreate, PlayerSchedule, PlayerScheduleDB, PlayerScheduleCreate, GameMode, LeaderboardEntry, RecordGamePlayParams, RecordGamePlayResult, PlayerPositions, UserDB, User, GameCompletion, GameCompletionCreate } from './types';
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
        player_positions as "playerPositions",
        created_at,
        updated_at
      FROM cronograma
      ORDER BY TO_DATE(live_date, 'DD-MM-YYYY') ASC
    ` as any[];

    return results.map((row: any) => ({
      liveDate: row.liveDate,
      formation: row.formation,
      gameIndex: row.gameIndex,
      playerPositions: row.playerPositions || undefined
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
        player_positions,
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
        game_index as "gameIndex",
        player_positions as "playerPositions"
      FROM cronograma
      WHERE TRIM(live_date) = TRIM(${date})
      LIMIT 1
    ` as any[];

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      liveDate: row.liveDate,
      formation: row.formation,
      gameIndex: row.gameIndex,
      playerPositions: row.playerPositions || undefined
    };
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
        player_positions,
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
    const playerPositionsJson = data.player_positions ? JSON.stringify(data.player_positions) : null;
    const results = await sql`
      INSERT INTO cronograma (live_date, formation, game_index, player_positions)
      VALUES (${data.live_date}, ${data.formation}, ${data.game_index}, ${playerPositionsJson}::jsonb)
      RETURNING
        id,
        live_date,
        formation,
        game_index,
        player_positions,
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
    const setClauses: string[] = [];

    if (data.live_date !== undefined) {
      setClauses.push(`live_date = '${data.live_date}'`);
    }
    if (data.formation !== undefined) {
      setClauses.push(`formation = '${data.formation}'`);
    }
    if (data.game_index !== undefined) {
      setClauses.push(`game_index = ${data.game_index}`);
    }
    if (data.player_positions !== undefined) {
      const positionsJson = JSON.stringify(data.player_positions);
      setClauses.push(`player_positions = '${positionsJson}'::jsonb`);
    }

    if (setClauses.length === 0) {
      throw new Error('No fields to update');
    }

    const setClause = setClauses.join(', ');

    const results = await sql`
      UPDATE cronograma
      SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING
        id,
        live_date,
        formation,
        game_index,
        player_positions,
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
  const validFormations = ['4-4-2', '4-2-3-1', '4-2-4', '4-1-2-2-1', '4-3-3', '4-3-3-ofensivo'];
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
 * Record a game play - adds to leaderboard if applicable
 * Returns whether this is a highscore and the entry ID for name submission
 *
 * Highscore rules:
 * - wordle: ONE per scheduled game (target_date), lowest score wins. Must beat existing.
 * - guess_player_scheduled: ONE per scheduled player (target_date), lowest score wins. Must beat existing.
 * - guess_player_random: best (lowest) score overall for random mode
 * - versus: Top 10 highest streaks. Must EXCEED (not tie) existing top 10 to qualify.
 *
 * Note: Game completions are tracked separately via recordGameCompletion()
 */
export async function recordGamePlay(params: RecordGamePlayParams): Promise<RecordGamePlayResult> {
  const defaultResult: RecordGamePlayResult = { isHighscore: false, entryId: null, rank: null };

  try {
    const sql = getSql();

    // Only add to leaderboard if it's a win (for guess games) or any play (for versus)
    if (!params.won && params.gameMode !== 'versus') {
      return defaultResult;
    }

    // Check if this qualifies as a highscore based on game mode
    if (params.gameMode === 'versus') {
      // Versus: Must strictly exceed one of the top 10 scores
      const top10Result = await sql`
        SELECT score FROM leaderboard
        WHERE game_mode = 'versus'
        ORDER BY score DESC
        LIMIT 10
      ` as any[];

      const top10Scores = top10Result.map((r: any) => parseInt(r.score));
      const lowestTop10 = top10Scores.length >= 10 ? Math.min(...top10Scores) : 0;

      // Must strictly exceed the lowest top 10 score (or be in top 10 if less than 10 entries)
      if (top10Scores.length >= 10 && params.score <= lowestTop10) {
        return defaultResult; // Doesn't beat top 10, not a highscore
      }

      // Insert the new entry
      const insertResult = await sql`
        INSERT INTO leaderboard (game_mode, score, session_id, target_id, target_date)
        VALUES (${params.gameMode}, ${params.score}, ${params.sessionId || null}, ${params.targetId || null}, ${params.targetDate || null})
        RETURNING id
      ` as any[];

      const entryId = insertResult[0]?.id;

      // Calculate rank
      const rankResult = await sql`
        SELECT COUNT(*) + 1 as rank
        FROM leaderboard
        WHERE game_mode = 'versus' AND score > ${params.score}
      ` as any[];
      const rank = parseInt(rankResult[0]?.rank) || 1;

      // Prune to keep only top 10 for versus
      await sql`
        DELETE FROM leaderboard
        WHERE game_mode = 'versus'
        AND id NOT IN (
          SELECT id FROM leaderboard
          WHERE game_mode = 'versus'
          ORDER BY score DESC, created_at ASC
          LIMIT 10
        )
      `;

      return { isHighscore: true, entryId, rank };

    } else if (params.gameMode === 'wordle' || params.gameMode === 'guess_player_scheduled') {
      // Daily games: Only ONE entry per target_date, must beat existing score
      const existingResult = await sql`
        SELECT id, score FROM leaderboard
        WHERE game_mode = ${params.gameMode} AND target_date = ${params.targetDate}
        ORDER BY score ASC
        LIMIT 1
      ` as any[];

      if (existingResult.length > 0) {
        const existingScore = parseInt(existingResult[0].score);
        // Must strictly beat the existing score
        if (params.score >= existingScore) {
          return defaultResult; // Doesn't beat existing, not a highscore
        }
        // Beat the existing score - delete the old entry
        await sql`
          DELETE FROM leaderboard WHERE id = ${existingResult[0].id}
        `;
      }

      // Insert the new entry
      const insertResult = await sql`
        INSERT INTO leaderboard (game_mode, score, session_id, target_id, target_date)
        VALUES (${params.gameMode}, ${params.score}, ${params.sessionId || null}, ${params.targetId || null}, ${params.targetDate || null})
        RETURNING id
      ` as any[];

      const entryId = insertResult[0]?.id;
      return { isHighscore: true, entryId, rank: 1 };

    } else if (params.gameMode === 'guess_player_random') {
      // Random mode: best overall (lower is better)
      const existingResult = await sql`
        SELECT score FROM leaderboard
        WHERE game_mode = 'guess_player_random'
        ORDER BY score ASC
        LIMIT 1
      ` as any[];

      if (existingResult.length > 0 && params.score >= parseInt(existingResult[0].score)) {
        return defaultResult; // Doesn't beat existing best
      }

      // Insert the new entry
      const insertResult = await sql`
        INSERT INTO leaderboard (game_mode, score, session_id, target_id, target_date)
        VALUES (${params.gameMode}, ${params.score}, ${params.sessionId || null}, ${params.targetId || null}, ${params.targetDate || null})
        RETURNING id
      ` as any[];

      const entryId = insertResult[0]?.id;

      // Prune to keep only top 10 for random mode
      await sql`
        DELETE FROM leaderboard
        WHERE game_mode = 'guess_player_random'
        AND id NOT IN (
          SELECT id FROM leaderboard
          WHERE game_mode = 'guess_player_random'
          ORDER BY score ASC, created_at ASC
          LIMIT 10
        )
      `;

      return { isHighscore: true, entryId, rank: 1 };
    }

    return defaultResult;
  } catch (error) {
    console.error('Error recording game play:', error);
    return defaultResult;
  }
}

/**
 * Get leaderboard for a game mode
 *
 * For 'versus' and 'guess_player_random': returns top N entries overall
 * For 'wordle' and 'guess_player_scheduled': returns the best entry per date (one champion per scheduled game)
 */
export async function getLeaderboard(gameMode: GameMode, limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const sql = getSql();

    let results;

    if (gameMode === 'versus') {
      // Versus: top N overall, higher score is better
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
    } else if (gameMode === 'guess_player_random') {
      // Random mode: top N overall, lower score is better
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
      // Wordle and guess_player_scheduled: one champion per date (best score per target_date)
      // Uses DISTINCT ON to get the best entry for each date
      results = await sql`
        SELECT DISTINCT ON (target_date)
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
        AND target_date IS NOT NULL
        ORDER BY target_date DESC, score ASC, created_at ASC
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
 * Get aggregate stats summary for all game modes
 * Uses game_completions table (includes both users and guests)
 */
export async function getStatsSummary(): Promise<{
  gameMode: GameMode;
  totalPlays: number;
  totalWins: number;
  avgScore: number;
}[]> {
  try {
    const sql = getSql();
    // Aggregate stats from game_completions (includes both users and guests)
    const results = await sql`
      SELECT
        game_mode,
        COUNT(*) as total_plays,
        COUNT(*) FILTER (WHERE won = true) as total_wins,
        COALESCE(SUM(score), 0) as total_score
      FROM game_completions
      GROUP BY game_mode
      ORDER BY game_mode
    ` as any[];

    return results.map((row: any) => ({
      gameMode: row.game_mode as GameMode,
      totalPlays: parseInt(row.total_plays) || 0,
      totalWins: parseInt(row.total_wins) || 0,
      avgScore: row.total_plays > 0
        ? Math.round((row.total_score / row.total_plays) * 100) / 100
        : 0,
    }));
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    return [];
  }
}

/**
 * Debug function: Get recent game completions
 */
export async function getRecentCompletions(): Promise<any[]> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT
        id,
        user_id,
        session_id,
        game_mode,
        game_date,
        won,
        score,
        completed_at
      FROM game_completions
      ORDER BY completed_at DESC
      LIMIT 100
    ` as any[];
    return results;
  } catch (error) {
    console.error('Error fetching recent completions:', error);
    return [];
  }
}

// ============================================
// USER AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Get user by username (case-insensitive)
 */
export async function getUserByUsername(username: string): Promise<UserDB | null> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT id, username, username_lower, password_hash, created_at
      FROM users
      WHERE username_lower = ${username.toLowerCase()}
      LIMIT 1
    ` as any[];

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT id, username, created_at as "createdAt"
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    ` as any[];

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(username: string, passwordHash: string): Promise<User | null> {
  try {
    const sql = getSql();
    const results = await sql`
      INSERT INTO users (username, username_lower, password_hash)
      VALUES (${username}, ${username.toLowerCase()}, ${passwordHash})
      RETURNING id, username, created_at as "createdAt"
    ` as any[];

    return results.length > 0 ? results[0] : null;
  } catch (error: any) {
    // Check for unique constraint violation
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      console.error('Username already exists');
      return null;
    }
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return user === null;
}

// ============================================
// GAME COMPLETIONS FUNCTIONS
// ============================================

/**
 * Record a game completion for a user or guest
 *
 * For daily games (wordle, guess_player_scheduled):
 *   - Uses ON CONFLICT to ensure one completion per user/session per day
 *
 * For versus:
 *   - Simple INSERT, allows unlimited games (each has unique timestamp)
 */
export async function recordGameCompletion(data: GameCompletionCreate): Promise<GameCompletion | null> {
  try {
    const sql = getSql();
    const isDailyGame = data.gameMode === 'wordle' || data.gameMode === 'guess_player_scheduled';

    if (isDailyGame) {
      // Daily games: upsert with conflict handling
      if (data.userId) {
        const results = await sql`
          INSERT INTO game_completions (user_id, game_mode, game_date, won, score)
          VALUES (${data.userId}, ${data.gameMode}, ${data.gameDate}, ${data.won}, ${data.score})
          ON CONFLICT (user_id, game_mode, game_date)
            WHERE game_mode IN ('wordle', 'guess_player_scheduled') AND user_id IS NOT NULL
          DO UPDATE SET won = EXCLUDED.won, score = EXCLUDED.score
          RETURNING
            id,
            user_id as "userId",
            game_mode as "gameMode",
            game_date as "gameDate",
            won,
            score,
            completed_at as "completedAt"
        ` as any[];
        return results.length > 0 ? results[0] : null;
      } else {
        const results = await sql`
          INSERT INTO game_completions (user_id, session_id, game_mode, game_date, won, score)
          VALUES (NULL, ${data.sessionId || null}, ${data.gameMode}, ${data.gameDate}, ${data.won}, ${data.score})
          ON CONFLICT (session_id, game_mode, game_date)
            WHERE game_mode IN ('wordle', 'guess_player_scheduled') AND user_id IS NULL AND session_id IS NOT NULL
          DO UPDATE SET won = EXCLUDED.won, score = EXCLUDED.score
          RETURNING
            id,
            user_id as "userId",
            game_mode as "gameMode",
            game_date as "gameDate",
            won,
            score,
            completed_at as "completedAt"
        ` as any[];
        return results.length > 0 ? results[0] : null;
      }
    } else {
      // Versus: simple insert, no conflict handling (unlimited games)
      const results = await sql`
        INSERT INTO game_completions (user_id, session_id, game_mode, game_date, won, score)
        VALUES (
          ${data.userId || null},
          ${data.sessionId || null},
          ${data.gameMode},
          ${data.gameDate},
          ${data.won},
          ${data.score}
        )
        RETURNING
          id,
          user_id as "userId",
          game_mode as "gameMode",
          game_date as "gameDate",
          won,
          score,
          completed_at as "completedAt"
      ` as any[];
      return results.length > 0 ? results[0] : null;
    }
  } catch (error) {
    console.error('Error recording game completion:', error);
    return null;
  }
}

/**
 * Get all completions for a user
 */
export async function getCompletionsForUser(userId: number, gameMode?: 'wordle' | 'guess_player_scheduled' | 'versus'): Promise<GameCompletion[]> {
  try {
    const sql = getSql();
    let results;

    if (gameMode) {
      results = await sql`
        SELECT
          id,
          user_id as "userId",
          game_mode as "gameMode",
          game_date as "gameDate",
          won,
          score,
          completed_at as "completedAt"
        FROM game_completions
        WHERE user_id = ${userId} AND game_mode = ${gameMode}
        ORDER BY completed_at DESC
      ` as any[];
    } else {
      results = await sql`
        SELECT
          id,
          user_id as "userId",
          game_mode as "gameMode",
          game_date as "gameDate",
          won,
          score,
          completed_at as "completedAt"
        FROM game_completions
        WHERE user_id = ${userId}
        ORDER BY completed_at DESC
      ` as any[];
    }

    return results;
  } catch (error) {
    console.error('Error fetching user completions:', error);
    return [];
  }
}

/**
 * Check if user has completed a specific daily game
 */
export async function hasUserCompletedGame(userId: number, gameMode: string, gameDate: string): Promise<boolean> {
  try {
    const sql = getSql();
    const results = await sql`
      SELECT id FROM game_completions
      WHERE user_id = ${userId} AND game_mode = ${gameMode} AND game_date = ${gameDate}
      LIMIT 1
    ` as any[];

    return results.length > 0;
  } catch (error) {
    console.error('Error checking user game completion:', error);
    return false;
  }
}

/**
 * Link a leaderboard entry to a user
 */
export async function linkLeaderboardEntryToUser(entryId: number, userId: number): Promise<boolean> {
  try {
    const sql = getSql();
    const results = await sql`
      UPDATE leaderboard
      SET user_id = ${userId}
      WHERE id = ${entryId}
      RETURNING id
    ` as any[];

    return results.length > 0;
  } catch (error) {
    console.error('Error linking leaderboard entry to user:', error);
    return false;
  }
}

/**
 * Update leaderboard entry with user info (sets both user_id and player_name)
 */
export async function updateLeaderboardWithUser(entryId: number, userId: number, username: string): Promise<boolean> {
  try {
    const sql = getSql();
    const results = await sql`
      UPDATE leaderboard
      SET user_id = ${userId}, player_name = ${username}
      WHERE id = ${entryId}
      RETURNING id
    ` as any[];

    return results.length > 0;
  } catch (error) {
    console.error('Error updating leaderboard with user:', error);
    return false;
  }
}
