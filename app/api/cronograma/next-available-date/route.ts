import { NextRequest, NextResponse } from 'next/server';
import { getNextAvailableDate } from '@/lib/db';

/**
 * GET /api/cronograma/next-available-date
 * Returns the next available date for scheduling (dd-mm-yyyy format)
 * Logic: If no schedules exist, returns tomorrow. Otherwise returns day after last scheduled date.
 */
export async function GET(request: NextRequest) {
  try {
    const nextDate = await getNextAvailableDate();
    return NextResponse.json({ nextAvailableDate: nextDate }, { status: 200 });
  } catch (error) {
    console.error('API Error - GET /api/cronograma/next-available-date:', error);
    return NextResponse.json(
      { error: 'Failed to get next available date' },
      { status: 500 }
    );
  }
}
