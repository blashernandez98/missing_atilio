-- Migration 007: Simplify Game Completions Schema
--
-- Changes:
-- 1. Rename user_game_completions to game_completions
-- 2. Drop old unique constraint (was causing issues with versus mode)
-- 3. Add partial unique indexes for daily games only (wordle, guess_player_scheduled)
-- 4. Drop deprecated tables (user_streaks, daily_game_stats)
--
-- This allows:
-- - Daily games: one completion per user/guest per day per mode
-- - Versus games: unlimited completions (each game is unique)

-- 1. Rename the table
ALTER TABLE user_game_completions RENAME TO game_completions;

-- 2. Drop the old unique constraint that was blocking versus games
ALTER TABLE game_completions DROP CONSTRAINT IF EXISTS unique_user_game_completion;

-- 3. Drop old indexes that reference the old table name
DROP INDEX IF EXISTS idx_user_completions_user;
DROP INDEX IF EXISTS idx_user_completions_date;
DROP INDEX IF EXISTS idx_user_completions_mode;
DROP INDEX IF EXISTS idx_user_completions_session;
DROP INDEX IF EXISTS idx_guest_game_completion;

-- 4. Create new indexes with correct names
CREATE INDEX IF NOT EXISTS idx_completions_user ON game_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_date ON game_completions(game_date);
CREATE INDEX IF NOT EXISTS idx_completions_mode ON game_completions(game_mode);
CREATE INDEX IF NOT EXISTS idx_completions_session ON game_completions(session_id);

-- 5. Create partial unique index for daily games (logged-in users)
-- Only wordle and guess_player_scheduled need one-per-day constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_user_completion
  ON game_completions(user_id, game_mode, game_date)
  WHERE game_mode IN ('wordle', 'guess_player_scheduled') AND user_id IS NOT NULL;

-- 6. Create partial unique index for daily games (guests)
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_guest_completion
  ON game_completions(session_id, game_mode, game_date)
  WHERE game_mode IN ('wordle', 'guess_player_scheduled') AND user_id IS NULL AND session_id IS NOT NULL;

-- 7. Drop deprecated tables
DROP TABLE IF EXISTS user_streaks;
DROP TABLE IF EXISTS daily_game_stats;
