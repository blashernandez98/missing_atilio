import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { recordGameCompletion } from '@/lib/db';
import { MigrationPayload } from '@/lib/types';

/**
 * POST /api/auth/migrate
 * Import localStorage game data to user account
 * Body: MigrationPayload
 * Note: Streaks are now calculated client-side from completions
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload: MigrationPayload = await request.json();
    const migratedCount = { wordle: 0, guessPlayer: 0 };

    // Migrate wordle completions
    for (const game of payload.wordle || []) {
      // Check if it's a win (all 11 players solved with < 6 guesses each)
      const solvedValues = Object.values(game.solved || {});
      const solvedCount = solvedValues.filter(v => v && v < 6).length;
      const won = solvedCount === 11;

      const result = await recordGameCompletion({
        userId: user.userId,
        gameMode: 'wordle',
        gameDate: game.date,
        won,
        score: game.score,
      });

      if (result) {
        migratedCount.wordle++;
      }
    }

    // Migrate guess_player completions
    for (const game of payload.guessPlayer || []) {
      const result = await recordGameCompletion({
        userId: user.userId,
        gameMode: 'guess_player_scheduled',
        gameDate: game.date,
        won: game.won,
        score: game.guessCount,
      });

      if (result) {
        migratedCount.guessPlayer++;
      }
    }

    return NextResponse.json({
      success: true,
      migrated: migratedCount,
    });
  } catch (error) {
    console.error('API Error - POST /api/auth/migrate:', error);
    return NextResponse.json(
      { error: 'Error al migrar datos' },
      { status: 500 }
    );
  }
}
