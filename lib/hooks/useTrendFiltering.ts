'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { TrendWithHistory } from '@/lib/fetchers/types';
import { detectCategory, type Category } from '@/lib/utils/category-matcher';

export function useTrendFiltering(allTrends: TrendWithHistory[]) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get('search') || '';
  const category = (searchParams.get('category') || 'all') as Category;

  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  const setCategory = (cat: Category) => {
    const params = new URLSearchParams(searchParams);
    if (cat && cat !== 'all') {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.push(`?${params.toString()}`);
  };

  // Filter trends
  const filteredTrends = useMemo(() => {
    return allTrends.filter(trend => {
      // Search filter
      if (searchQuery && !trend.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (category !== 'all') {
        const trendCategory = detectCategory(trend.title);
        if (trendCategory !== category) {
          return false;
        }
      }

      return true;
    });
  }, [allTrends, searchQuery, category]);

  return {
    filteredTrends,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
  };
}
