import { NextRequest, NextResponse } from 'next/server';
import { deletePlayerSchedule, getPlayerScheduleById } from '@/lib/db';

/**
 * GET /api/player-schedule/[id]
 * Get a specific player schedule by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const schedule = await getPlayerScheduleById(id);

    if (!schedule) {
      return NextResponse.json(
        { error: 'Player schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error('API Error - GET /api/player-schedule/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player schedule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/player-schedule/[id]
 * Delete a specific player schedule by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const deleted = await deletePlayerSchedule(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Player schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Player schedule deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error - DELETE /api/player-schedule/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete player schedule' },
      { status: 500 }
    );
  }
}
