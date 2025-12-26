import { NextRequest, NextResponse } from 'next/server';
import { getNextAvailableDateForPlayerSchedule } from '@/lib/db';

/**
 * GET /api/player-schedule/next-available-date
 * Returns the next available date for scheduling a player
 * Format: dd-mm-yyyy
 */
export async function GET(request: NextRequest) {
  try {
    const nextDate = await getNextAvailableDateForPlayerSchedule();
    return NextResponse.json({ nextAvailableDate: nextDate }, { status: 200 });
  } catch (error) {
    console.error('API Error - GET /api/player-schedule/next-available-date:', error);
    return NextResponse.json(
      { error: 'Failed to get next available date' },
      { status: 500 }
    );
  }
}
