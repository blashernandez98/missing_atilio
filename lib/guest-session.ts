/**
 * Guest session management utilities
 * Generates and persists a unique session ID for guest players
 */

const GUEST_SESSION_KEY = 'atilio_guest_session';

/**
 * Get or create a guest session ID
 * Returns a persistent ID stored in localStorage
 */
export function getGuestSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder (won't be used)
    return '';
  }

  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Record a game completion for the current user (logged-in) or guest
 * This is a helper that handles the auth check and session ID automatically
 */
export async function recordGameCompletion(
  user: { id: number; username: string } | null,
  data: {
    gameMode: 'wordle' | 'guess_player_scheduled' | 'versus';
    gameDate: string;
    won: boolean;
    score: number;
  }
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      gameMode: data.gameMode,
      gameDate: data.gameDate,
      won: data.won,
      score: data.score,
    };

    // Add sessionId for guests
    if (!user) {
      body.sessionId = getGuestSessionId();
    }

    console.log('[recordGameCompletion] Sending:', {
      ...body,
      userId: user?.id ?? 'guest',
    });

    const res = await fetch('/api/user/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('[recordGameCompletion] Failed:', res.status, errorData);
      return false;
    }

    const result = await res.json();
    console.log('[recordGameCompletion] Success:', result.completion?.id);
    return true;
  } catch (error) {
    console.error('[recordGameCompletion] Error:', error);
    return false;
  }
}
