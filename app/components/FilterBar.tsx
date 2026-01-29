'use client';

import { CATEGORIES, type Category } from '@/lib/utils/category-matcher';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: Category;
  onCategoryChange: (category: Category) => void;
  lastUpdated?: string; // ISO date string
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  lastUpdated,
}: FilterBarProps) {
  return (
    <div className="w-full bg-gray-100 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Search + Category filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search input */}
          <div className="w-64">
            <label htmlFor="search" className="sr-only">Search trends</label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search trends..."
              className="w-full px-3 py-1.5 text-sm bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${category === cat
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-300'
                  }
                `}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Right side: Last updated */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 whitespace-nowrap">
            Updated: {new Date(lastUpdated).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
