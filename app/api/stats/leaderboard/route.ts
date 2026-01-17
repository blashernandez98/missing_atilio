import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db';
import type { GameMode } from '@/lib/types';

const VALID_GAME_MODES: GameMode[] = ['guess_player_scheduled', 'guess_player_random', 'versus', 'wordle'];

/**
 * GET /api/stats/leaderboard
 * Get leaderboard for a game mode
 * Query params:
 *   - gameMode: required - the game mode
 *   - limit: optional - max entries to return (default 10, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gameMode = searchParams.get('gameMode') as GameMode;
    const limitParam = searchParams.get('limit');

    if (!gameMode || !VALID_GAME_MODES.includes(gameMode)) {
      return NextResponse.json(
        { error: `Missing or invalid gameMode. Must be one of: ${VALID_GAME_MODES.join(', ')}` },
        { status: 400 }
      );
    }

    let limit = 10;
    if (limitParam) {
      limit = Math.min(Math.max(parseInt(limitParam) || 10, 1), 100);
    }

    const leaderboard = await getLeaderboard(gameMode, limit);

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error('API Error - GET /api/stats/leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
