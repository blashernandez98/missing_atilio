-- Migration: User Authentication and Game Data Persistence
-- Adds user accounts, game completions tracking, and streak tracking

-- Users table: Simple username/password authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(15) NOT NULL,
  username_lower VARCHAR(15) NOT NULL UNIQUE,  -- For case-insensitive lookups
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast username lookups during login
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(username_lower);

-- User game completions: Stores completed game data (not in-progress state)
CREATE TABLE IF NOT EXISTS user_game_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_mode VARCHAR(30) NOT NULL,  -- 'wordle', 'guess_player_scheduled'
  game_date VARCHAR(15) NOT NULL,  -- dd-mm-yyyy format
  won BOOLEAN NOT NULL,
  score INTEGER NOT NULL,          -- total guesses for wordle, guess count for guess_player
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one completion per user per scheduled game
  CONSTRAINT unique_user_game_completion UNIQUE (user_id, game_mode, game_date)
);

CREATE INDEX IF NOT EXISTS idx_user_completions_user ON user_game_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_completions_date ON user_game_completions(game_date);
CREATE INDEX IF NOT EXISTS idx_user_completions_mode ON user_game_completions(game_mode);

-- User streaks: Tracks consecutive-day win streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_mode VARCHAR(30) NOT NULL,  -- 'wordle', 'guess_player_scheduled'
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_win_date VARCHAR(15),       -- dd-mm-yyyy format, NULL if no wins yet
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_streak UNIQUE (user_id, game_mode)
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);

-- Add user_id to existing leaderboard table for linking highscores to accounts
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(user_id);
