import { NextRequest, NextResponse } from 'next/server';
import { getPlayerScheduleByDate } from '@/lib/db';

/**
 * GET /api/player-schedule/today
 * Returns the scheduled player for today (dd-mm-yyyy format)
 */
export async function GET(request: NextRequest) {
  try {
    // Get today's date in dd-mm-yyyy format
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateString = `${day}-${month}-${year}`;

    const schedule = await getPlayerScheduleByDate(dateString);

    if (!schedule) {
      return NextResponse.json(
        { error: 'No player scheduled for today' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error('API Error - GET /api/player-schedule/today:', error);
    return NextResponse.json(
      { error: 'Failed to get today\'s scheduled player' },
      { status: 500 }
    );
  }
}
