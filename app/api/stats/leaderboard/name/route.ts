import { NextRequest, NextResponse } from 'next/server';
import { updateLeaderboardPlayerName } from '@/lib/db';

/**
 * POST /api/stats/leaderboard/name
 * Update player name on a leaderboard entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, playerName } = body;

    if (typeof entryId !== 'number' || entryId <= 0) {
      return NextResponse.json(
        { error: 'Invalid or missing entryId' },
        { status: 400 }
      );
    }

    if (typeof playerName !== 'string' || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Sanitize and limit player name to 15 characters
    const sanitizedName = playerName.trim().slice(0, 15);

    const success = await updateLeaderboardPlayerName(entryId, sanitizedName);

    if (!success) {
      return NextResponse.json(
        { error: 'Entry not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, playerName: sanitizedName }, { status: 200 });
  } catch (error) {
    console.error('API Error - POST /api/stats/leaderboard/name:', error);
    return NextResponse.json(
      { error: 'Failed to update player name' },
      { status: 500 }
    );
  }
}
