-- Migration: Add player_positions column to cronograma table
-- This allows storing custom player position swaps for each scheduled game

-- Add player_positions column as JSONB to store custom player positions
-- The format is: {"1": "PlayerName1", "2": "PlayerName2", ...}
ALTER TABLE cronograma
ADD COLUMN IF NOT EXISTS player_positions JSONB DEFAULT NULL;

-- Comment for clarity
COMMENT ON COLUMN cronograma.player_positions IS 'Custom player positions (swapped from original). Format: {position_number: player_name}';
