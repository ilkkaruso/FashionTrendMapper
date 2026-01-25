import { NextRequest } from 'next/server';
import { fetchGoogleTrends } from '@/lib/fetchers/google-trends';
import { normalizeScores } from '@/lib/normalizers/score-normalizer';
import { saveTrendsWithHistory } from '@/lib/database/trend-repository';

// CRITICAL: Prevent response caching
export const dynamic = 'force-dynamic';

// Extend timeout for Vercel Pro (optional, defaults to 10s on Hobby)
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // 1. Authenticate - Vercel sends CRON_SECRET in Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Cron auth failed - invalid or missing CRON_SECRET');
    return Response.json(
      { error: 'Unauthorized', hint: 'CRON_SECRET mismatch' },
      { status: 401 }
    );
  }

  console.log('Cron job started:', new Date().toISOString());

  try {
    // 2. Fetch from Google Trends
    const googleResult = await fetchGoogleTrends();

    console.log(`Google: ${googleResult.success ? googleResult.data?.length : 'failed'} trends`);

    if (!googleResult.success || !googleResult.data?.length) {
      console.error('No trends fetched from Google Trends');
      return Response.json({
        success: false,
        error: 'No data from Google Trends',
        googleError: googleResult.error,
        duration: Date.now() - startTime,
      }, { status: 500 });
    }

    // 3. Normalize scores to 0-100 scale
    const normalized = normalizeScores(googleResult.data);
    console.log(`Normalized: ${normalized.length} trends`);

    // 4. Save to database with history
    await saveTrendsWithHistory(normalized);
    console.log('Saved to database');

    const duration = Date.now() - startTime;
    console.log(`Cron job completed in ${duration}ms`);

    return Response.json({
      success: true,
      stats: {
        google: {
          success: googleResult.success,
          count: googleResult.data?.length || 0,
          cached: googleResult.cached || false,
        },
        normalized: normalized.length,
        duration,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Cron job failed:', error);

    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
