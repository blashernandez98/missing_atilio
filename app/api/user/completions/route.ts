import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { recordGameCompletion, getCompletionsForUser, updateLeaderboardWithUser } from '@/lib/db';

/**
 * GET /api/user/completions
 * Get user's game completions
 * Query params: gameMode (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameMode = searchParams.get('gameMode') as 'wordle' | 'guess_player_scheduled' | 'versus' | null;

    const completions = await getCompletionsForUser(
      user.userId,
      gameMode || undefined
    );

    return NextResponse.json({ completions });
  } catch (error) {
    console.error('API Error - GET /api/user/completions:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/completions
 * Record a new game completion (works for both logged-in users and guests)
 * Body: { gameMode, gameDate, won, score, sessionId?, leaderboardEntryId? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();
    const { gameMode, gameDate, won, score, sessionId, leaderboardEntryId } = body;

    // Validate required fields
    if (!gameMode || !gameDate || won === undefined || score === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // For guests, sessionId is required
    if (!user && !sessionId) {
      return NextResponse.json(
        { error: 'sessionId requerido para invitados' },
        { status: 400 }
      );
    }

    // Validate game mode
    if (!['wordle', 'guess_player_scheduled', 'versus'].includes(gameMode)) {
      return NextResponse.json(
        { error: 'Modo de juego inválido' },
        { status: 400 }
      );
    }

    // Record completion (userId can be null for guests)
    const completion = await recordGameCompletion({
      userId: user?.userId || null,
      sessionId: user ? null : sessionId,
      gameMode,
      gameDate,
      won,
      score,
    });

    if (!completion) {
      console.error('Failed to record completion:', { gameMode, gameDate, userId: user?.userId, sessionId });
      return NextResponse.json(
        { error: 'Error al guardar la partida' },
        { status: 500 }
      );
    }

    // Link leaderboard entry to user if provided (only for logged-in users)
    if (user && leaderboardEntryId) {
      await updateLeaderboardWithUser(leaderboardEntryId, user.userId, user.username);
    }

    return NextResponse.json({ completion });
  } catch (error) {
    console.error('API Error - POST /api/user/completions:', error);
    return NextResponse.json(
      { error: 'Error al guardar la partida' },
      { status: 500 }
    );
  }
}
