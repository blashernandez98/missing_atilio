-- Game Analytics Tables
-- Run this migration to create the analytics tables

-- Daily aggregated stats per game mode
CREATE TABLE IF NOT EXISTS daily_game_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  game_mode VARCHAR(50) NOT NULL, -- 'guess_player_scheduled', 'guess_player_random', 'versus', 'wordle'
  plays INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  surrenders INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0, -- sum of scores (guesses/streak) for calculating averages
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, game_mode)
);

-- Leaderboard for high scores (limited entries, auto-pruned)
CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  game_mode VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL, -- guesses (lower=better) or streak (higher=better)
  player_name VARCHAR(50) DEFAULT NULL, -- optional player name, submitted later
  session_id VARCHAR(100), -- anonymous session identifier
  target_id INTEGER, -- player_id or cronograma_id for context
  target_date VARCHAR(20), -- the scheduled date if applicable
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_mode_score ON leaderboard(game_mode, score);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date_mode ON daily_game_stats(date, game_mode);

-- Comments for clarity
COMMENT ON TABLE daily_game_stats IS 'Daily aggregated statistics per game mode';
COMMENT ON TABLE leaderboard IS 'Top scores per game mode with optional player names';
COMMENT ON COLUMN leaderboard.score IS 'For guess games: number of guesses (lower=better). For versus: streak length (higher=better)';
