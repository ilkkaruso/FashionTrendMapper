/**
 * Database repository for trend operations
 *
 * Handles saving trends to Supabase with historical snapshots and
 * retrieving trends with change calculations.
 */

import { createClient } from '@/lib/supabase/server';
import type { NormalizedTrend, TrendWithHistory, SourceType } from '@/lib/fetchers/types';

/**
 * Save trends to database with historical snapshots
 *
 * Upserts trends to the trends table, saves source scores to trend_sources,
 * and creates daily snapshots in trend_history for change tracking.
 *
 * @param trends - Array of normalized trends to save
 * @throws Error if database operations fail
 *
 * @example
 * await saveTrendsWithHistory([
 *   {
 *     title: "Baggy Jeans",
 *     score: 85.5,
 *     sources: ["google"],
 *     sourceBreakdown: [{ source: "google", score: 85.5 }]
 *   }
 * ]);
 */
export async function saveTrendsWithHistory(trends: NormalizedTrend[]): Promise<void> {
  if (trends.length === 0) {
    console.log('No trends to save');
    return;
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  let successCount = 0;
  let errorCount = 0;

  for (const trend of trends) {
    try {
      // 1. Upsert to trends table
      const { data: trendData, error: trendError } = await supabase
        .from('trends')
        .upsert({
          title: trend.title,
          description: null, // Will be enriched later
          current_score: trend.score,
          updated_at: now,
        }, {
          onConflict: 'title',
        })
        .select('id')
        .single();

      if (trendError) {
        console.error(`Error upserting trend "${trend.title}":`, trendError);
        errorCount++;
        continue;
      }

      if (!trendData) {
        console.error(`No data returned for trend "${trend.title}"`);
        errorCount++;
        continue;
      }

      const trendId = trendData.id;

      // 2. Upsert to trend_sources for each source
      for (const sourceBreakdown of trend.sourceBreakdown) {
        const { error: sourceError } = await supabase
          .from('trend_sources')
          .upsert({
            trend_id: trendId,
            source_name: sourceBreakdown.source,
            source_score: sourceBreakdown.score,
            source_url: sourceBreakdown.url || null,
            fetched_at: now,
          }, {
            onConflict: 'trend_id,source_name',
          });

        if (sourceError) {
          console.error(`Error upserting source for trend "${trend.title}":`, sourceError);
        }
      }

      // 3. Upsert to trend_history for daily snapshot
      const { error: historyError } = await supabase
        .from('trend_history')
        .upsert({
          trend_id: trendId,
          snapshot_date: today,
          data_snapshot: {
            score: trend.score,
            sources: trend.sources,
            sourceBreakdown: trend.sourceBreakdown,
          },
        }, {
          onConflict: 'trend_id,snapshot_date',
        });

      if (historyError) {
        console.error(`Error upserting history for trend "${trend.title}":`, historyError);
      } else {
        successCount++;
      }

    } catch (error) {
      console.error(`Unexpected error saving trend "${trend.title}":`, error);
      errorCount++;
    }
  }

  console.log(`Saved ${successCount} trends, ${errorCount} errors`);

  if (errorCount > 0 && successCount === 0) {
    throw new Error(`Failed to save any trends (${errorCount} errors)`);
  }
}

/**
 * Get trends with daily change calculation
 *
 * Retrieves all trends sorted by score (descending) with percentage change
 * calculated from yesterday's snapshot.
 *
 * @returns Array of trends with change percentages
 * @throws Error if database query fails
 *
 * @example
 * const trends = await getTrendsWithChange();
 * // [
 * //   {
 * //     title: "Baggy Jeans",
 * //     score: 85.5,
 * //     changePercent: 12.5, // Up 12.5% from yesterday
 * //     sources: ["google"],
 * //     sourceBreakdown: [...]
 * //   },
 * //   ...
 * // ]
 */
export async function getTrendsWithChange(): Promise<TrendWithHistory[]> {
  const supabase = await createClient();

  // Calculate today and yesterday date strings
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Fetch trends with their history and sources
  const { data: trendsData, error: trendsError } = await supabase
    .from('trends')
    .select(`
      id,
      title,
      description,
      current_score,
      trend_history!inner (
        snapshot_date,
        data_snapshot
      ),
      trend_sources (
        source_name,
        source_score,
        source_url
      )
    `)
    .order('current_score', { ascending: false, nullsFirst: false });

  if (trendsError) {
    console.error('Error fetching trends:', trendsError);
    throw new Error(`Failed to fetch trends: ${trendsError.message}`);
  }

  if (!trendsData) {
    return [];
  }

  // Process each trend to calculate change
  const trendsWithChange: TrendWithHistory[] = trendsData.map((trendRow: any) => {
    const currentScore = trendRow.current_score || 0;

    // Find yesterday's snapshot
    const yesterdaySnapshot = trendRow.trend_history?.find(
      (h: any) => h.snapshot_date === yesterdayStr
    );

    // Calculate change percentage
    let changePercent = 0;
    if (yesterdaySnapshot?.data_snapshot?.score) {
      const yesterdayScore = yesterdaySnapshot.data_snapshot.score;
      if (yesterdayScore > 0) {
        changePercent = ((currentScore - yesterdayScore) / yesterdayScore) * 100;
      } else {
        // If yesterday was 0, any positive current is +infinity, show as 100%
        changePercent = currentScore > 0 ? 100 : 0;
      }
    }
    // If no yesterday snapshot, it's a new trend (changePercent = 0)

    // Build sourceBreakdown from trend_sources
    const sourceBreakdown = (trendRow.trend_sources || []).map((ts: any) => ({
      source: ts.source_name as SourceType,
      score: ts.source_score || 0,
      url: ts.source_url || undefined,
    }));

    // Extract unique sources
    const sources = [...new Set(sourceBreakdown.map((sb: any) => sb.source))] as SourceType[];

    return {
      title: trendRow.title,
      description: trendRow.description || undefined,
      score: currentScore,
      sources,
      sourceBreakdown,
      changePercent: Math.round(changePercent * 100) / 100, // Round to 2 decimals
    };
  });

  return trendsWithChange;
}
