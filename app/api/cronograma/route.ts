import { NextRequest, NextResponse } from 'next/server';
import {
  getCronogramaAll,
  getCronogramaAllWithMetadata,
  createCronograma,
  isValidDateFormat,
  isValidFormation
} from '@/lib/db';
import { CronogramaCreate } from '@/lib/types';

/**
 * GET /api/cronograma
 * Returns all scheduled matches
 * Query params:
 *   - includeMetadata=true: Returns full data with IDs (for admin)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    if (includeMetadata) {
      const cronogramas = await getCronogramaAllWithMetadata();
      return NextResponse.json(cronogramas, { status: 200 });
    } else {
      const cronogramas = await getCronogramaAll();
      return NextResponse.json(cronogramas, { status: 200 });
    }
  } catch (error) {
    console.error('API Error - GET /api/cronograma:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cronograma data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cronograma
 * Creates a new scheduled match
 * Body: { live_date: string, formation: string, game_index: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { live_date, formation, game_index } = body;

    // Validation
    if (!live_date || !formation || game_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: live_date, formation, game_index' },
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

    // Validate formation
    if (!isValidFormation(formation)) {
      return NextResponse.json(
        {
          error:
            'Invalid formation. Must be one of: 4-4-2, 4-2-3-1, 4-2-4, 4-1-2-2-1'
        },
        { status: 400 }
      );
    }

    // Validate game_index is a number
    if (typeof game_index !== 'number' || game_index < 0) {
      return NextResponse.json(
        { error: 'Invalid game_index. Must be a non-negative number' },
        { status: 400 }
      );
    }

    const cronogramaData: CronogramaCreate = {
      live_date,
      formation,
      game_index
    };

    const created = await createCronograma(cronogramaData);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('API Error - POST /api/cronograma:', error);

    // Handle unique constraint violation (duplicate date)
    if (error.message && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'A match is already scheduled for this date' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create cronograma entry' },
      { status: 500 }
    );
  }
}
