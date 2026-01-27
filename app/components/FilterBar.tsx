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
    <div className="w-full bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Search input */}
      <div className="max-w-md">
        <label htmlFor="search" className="sr-only">Search trends</label>
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search trends..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="text-sm text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}
