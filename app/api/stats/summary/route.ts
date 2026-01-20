import { NextResponse } from 'next/server';
import { getStatsSummary, getRawDailyStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === 'true';

  try {
    const summary = await getStatsSummary();

    if (debug) {
      const rawStats = await getRawDailyStats();
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        summary,
        rawStats,
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });
    }

    return NextResponse.json(summary, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
