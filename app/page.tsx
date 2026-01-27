'use client';

import { useEffect, useState, Suspense } from 'react';
import { BubbleChart } from './components/BubbleChart';
import { FilterBar } from './components/FilterBar';
import { TrendModal } from './components/TrendModal';
import { useResizeObserver } from '@/lib/hooks/useResizeObserver';
import { useTrendFiltering } from '@/lib/hooks/useTrendFiltering';
import type { TrendWithHistory } from '@/lib/fetchers/types';

interface TrendsResponse {
  success: boolean;
  data: TrendWithHistory[];
  lastUpdated: string;
  error?: string;
}

function HomeContent() {
  const [trends, setTrends] = useState<TrendWithHistory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedTrend, setSelectedTrend] = useState<TrendWithHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Responsive sizing
  const { ref: containerRef, dimensions } = useResizeObserver<HTMLDivElement>();

  // Filtering
  const {
    filteredTrends,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
  } = useTrendFiltering(trends);

  // Fetch trends on mount
  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        const response = await fetch('/api/trends');
        const json: TrendsResponse = await response.json();

        if (json.success) {
          setTrends(json.data);
          setLastUpdated(json.lastUpdated);
        } else {
          setError(json.error || 'Failed to load trends');
        }
      } catch (err) {
        console.error('Error fetching trends:', err);
        setError('Failed to load trends');
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  // Handle bubble click
  const handleBubbleClick = (trend: TrendWithHistory) => {
    setSelectedTrend(trend);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTrend(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Fashion Trend Mapper
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Discover trending fashion items and styles
        </p>
      </header>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        category={category}
        onCategoryChange={setCategory}
        lastUpdated={lastUpdated}
      />

      {/* Visualization Container */}
      <div ref={containerRef} className="flex-1 bg-gray-50">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trends...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p className="font-semibold">Error loading trends</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && dimensions.width > 0 && dimensions.height > 0 && (
          <BubbleChart
            trends={filteredTrends}
            width={dimensions.width}
            height={dimensions.height}
            onBubbleClick={handleBubbleClick}
          />
        )}
      </div>

      {/* Trend Modal */}
      <TrendModal
        trend={selectedTrend}
        allTrends={trends}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
