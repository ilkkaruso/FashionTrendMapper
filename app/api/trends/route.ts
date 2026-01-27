import { NextResponse } from 'next/server';
import { getTrendsWithChange } from '@/lib/database/trend-repository';

/**
 * GET /api/trends
 *
 * Returns all trends with popularity scores and daily change percentages.
 * Used by home page visualization.
 *
 * @returns JSON array of TrendWithHistory objects
 */
export async function GET() {
  try {
    const trends = await getTrendsWithChange();

    return NextResponse.json({
      success: true,
      data: trends,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching trends:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trends',
        data: [],
      },
      { status: 500 }
    );
  }
}
