import { NextRequest, NextResponse } from 'next/server';
import { getPlayerScheduleByDate } from '@/lib/db';
import { getTodayStringUruguay } from '@/lib/date';

/**
 * GET /api/player-schedule/today
 * Returns the scheduled player for today in Uruguay timezone (dd-mm-yyyy format)
 */
export async function GET(_request: NextRequest) {
  try {
    // Get today's date in Uruguay timezone (dd-mm-yyyy format)
    const dateString = getTodayStringUruguay();

    const schedule = await getPlayerScheduleByDate(dateString);

    if (!schedule) {
      return NextResponse.json(
        { error: 'No player scheduled for today', searchedDate: dateString },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error('Error - GET /api/player-schedule/today:', error);
    return NextResponse.json(
      { error: 'Failed to get today\'s scheduled player' },
      { status: 500 }
    );
  }
}
