import { NextRequest, NextResponse } from 'next/server';
import {
  getCronogramaById,
  updateCronograma,
  deleteCronograma,
  isValidDateFormat,
  isValidFormation
} from '@/lib/db';
import { CronogramaCreate } from '@/lib/types';

/**
 * PUT /api/cronograma/[id]
 * Updates an existing scheduled match
 * Body: { live_date?: string, formation?: string, game_index?: number }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Check if cronograma exists
    const existing = await getCronogramaById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Cronograma not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { live_date, formation, game_index } = body;

    // Validate fields if provided
    if (live_date !== undefined && !isValidDateFormat(live_date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected dd-mm-yyyy' },
        { status: 400 }
      );
    }

    if (formation !== undefined && !isValidFormation(formation)) {
      return NextResponse.json(
        {
          error:
            'Invalid formation. Must be one of: 4-4-2, 4-2-3-1, 4-2-4, 4-1-2-2-1'
        },
        { status: 400 }
      );
    }

    if (
      game_index !== undefined &&
      (typeof game_index !== 'number' || game_index < 0)
    ) {
      return NextResponse.json(
        { error: 'Invalid game_index. Must be a non-negative number' },
        { status: 400 }
      );
    }

    const updateData: Partial<CronogramaCreate> = {};
    if (live_date !== undefined) updateData.live_date = live_date;
    if (formation !== undefined) updateData.formation = formation;
    if (game_index !== undefined) updateData.game_index = game_index;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updated = await updateCronograma(id, updateData);

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('API Error - PUT /api/cronograma/[id]:', error);

    // Handle unique constraint violation
    if (error.message && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'A match is already scheduled for this date' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update cronograma entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cronograma/[id]
 * Deletes a scheduled match
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const deleted = await deleteCronograma(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Cronograma not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Cronograma deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error - DELETE /api/cronograma/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete cronograma entry' },
      { status: 500 }
    );
  }
}
