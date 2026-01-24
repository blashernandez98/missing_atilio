import { NextResponse } from 'next/server';
import { getStatsSummary, getRecentCompletions } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  noStore(); // Disable all caching for this route

  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === 'true';

  try {
    const summary = await getStatsSummary();

    if (debug) {
      const recentCompletions = await getRecentCompletions();
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        summary,
        recentCompletions,
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
