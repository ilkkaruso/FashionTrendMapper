/**
 * Manual test endpoint for Google Trends fetcher
 *
 * Development: Accessible without authentication
 * Production: Requires CRON_SECRET in Authorization header
 */

import { NextRequest } from 'next/server';
import { fetchGoogleTrends } from '@/lib/fetchers/google-trends';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Only allow in development or with secret
  const authHeader = request.headers.get('authorization');
  const isDev = process.env.NODE_ENV === 'development';
  const hasSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isDev && !hasSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchGoogleTrends();

  return Response.json({
    success: result.success,
    cached: result.cached || false,
    count: result.data?.length || 0,
    data: result.data || [],
    error: result.error || null,
    timestamp: new Date().toISOString(),
  });
}
