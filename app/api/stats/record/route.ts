import { NextRequest, NextResponse } from 'next/server';
import { recordGamePlay } from '@/lib/db';
import type { RecordGamePlayParams, GameMode } from '@/lib/types';

const VALID_GAME_MODES: GameMode[] = ['guess_player_scheduled', 'guess_player_random', 'versus', 'wordle'];

/**
 * POST /api/stats/record
 * Record a game play for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { gameMode, won, score } = body;

    if (!gameMode || !VALID_GAME_MODES.includes(gameMode)) {
      return NextResponse.json(
        { error: `Invalid game mode. Must be one of: ${VALID_GAME_MODES.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof won !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid "won" field (must be boolean)' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Missing or invalid "score" field (must be non-negative number)' },
        { status: 400 }
      );
    }

    const params: RecordGamePlayParams = {
      gameMode,
      won,
      score,
      surrendered: body.surrendered || false,
      sessionId: body.sessionId,
      targetId: body.targetId,
      targetDate: body.targetDate,
    };

    await recordGamePlay(params);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API Error - POST /api/stats/record:', error);
    return NextResponse.json(
      { error: 'Failed to record game play' },
      { status: 500 }
    );
  }
}
