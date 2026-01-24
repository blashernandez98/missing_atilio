-- Migration: Simplify Game Tracking
--
-- Changes:
-- 1. Extend game_date to VARCHAR(30) for ISO timestamps (versus mode)
-- 2. Allow guest games in user_game_completions (nullable user_id)
-- 3. Add session_id for guest tracking
-- 4. Mark user_streaks as deprecated (calculate from completions on client)
-- 5. Mark daily_game_stats as deprecated
-- 6. Add unique index for guest game deduplication

-- 1. Extend game_date column to support ISO timestamps (versus uses full timestamps)
-- Original: VARCHAR(15) for dd-mm-yyyy format (10 chars)
-- New: VARCHAR(30) to accommodate ISO timestamps like 2026-01-23T15:30:00.000Z (24 chars)
ALTER TABLE user_game_completions
  ALTER COLUMN game_date TYPE VARCHAR(30);

-- 2. Allow guest games (nullable user_id)
ALTER TABLE user_game_completions
  ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add session_id for guest tracking
ALTER TABLE user_game_completions
  ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_user_completions_session ON user_game_completions(session_id);

-- 4. Drop the user_streaks table (streaks will be calculated on client)
-- Note: Keep this commented out for now in case rollback is needed
-- DROP TABLE IF EXISTS user_streaks;

-- Instead, let's mark it as deprecated by adding a comment
COMMENT ON TABLE user_streaks IS 'DEPRECATED: Streaks are now calculated on client from user_game_completions. This table may be removed in future migrations.';

-- 5. Mark daily_game_stats as deprecated
COMMENT ON TABLE daily_game_stats IS 'DEPRECATED: Stats can now be aggregated from user_game_completions (includes both users and guests). Keep for backwards compatibility with admin panel.';

-- 6. Add constraint for guest game uniqueness per session (optional)
-- This prevents the same guest from submitting duplicate completions
-- Note: Only for daily games, not versus (which uses timestamp dates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_game_completion
  ON user_game_completions(session_id, game_mode, game_date)
  WHERE user_id IS NULL AND session_id IS NOT NULL;
