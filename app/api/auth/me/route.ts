import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Get current authenticated user info
 * Note: Streaks are now calculated client-side from completions
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: authUser.userId,
        username: authUser.username,
      },
    });
  } catch (error) {
    console.error('API Error - GET /api/auth/me:', error);
    return NextResponse.json({ user: null });
  }
}
