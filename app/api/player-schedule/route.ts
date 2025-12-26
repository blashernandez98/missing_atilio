import { NextRequest, NextResponse } from 'next/server';
import {
  getPlayerScheduleAll,
  getPlayerScheduleAllWithMetadata,
  createPlayerSchedule,
  isValidDateFormat
} from '@/lib/db';
import { PlayerScheduleCreate } from '@/lib/types';

/**
 * GET /api/player-schedule
 * Returns all scheduled players
 * Query params:
 *   - includeMetadata=true: Returns full data with IDs (for admin)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    if (includeMetadata) {
      const schedules = await getPlayerScheduleAllWithMetadata();
      return NextResponse.json(schedules, { status: 200 });
    } else {
      const schedules = await getPlayerScheduleAll();
      return NextResponse.json(schedules, { status: 200 });
    }
  } catch (error) {
    console.error('API Error - GET /api/player-schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player schedule data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/player-schedule
 * Creates a new scheduled player
 * Body: { live_date: string, player_id: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { live_date, player_id } = body;

    // Validation
    if (!live_date || player_id === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: live_date, player_id' },
        { status: 400 }
      );
    }

    // Validate date format (dd-mm-yyyy)
    if (!isValidDateFormat(live_date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected dd-mm-yyyy' },
        { status: 400 }
      );
    }

    // Validate player_id is a number
    if (typeof player_id !== 'number' || player_id < 0) {
      return NextResponse.json(
        { error: 'Invalid player_id. Must be a non-negative number' },
        { status: 400 }
      );
    }

    const scheduleData: PlayerScheduleCreate = {
      live_date,
      player_id
    };

    const created = await createPlayerSchedule(scheduleData);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('API Error - POST /api/player-schedule:', error);

    // Handle unique constraint violation (duplicate date)
    if (error.message && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'A player is already scheduled for this date' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create player schedule entry' },
      { status: 500 }
    );
  }
}
