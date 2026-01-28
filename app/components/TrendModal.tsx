'use client';

import { useRef, useEffect } from 'react';
import type { TrendWithHistory } from '@/lib/fetchers/types';
import { findRelatedTrends } from '@/lib/utils/related-trends';
import { getAmazonFashionLink } from '@/lib/affiliate/amazon-links';

interface TrendModalProps {
  trend: TrendWithHistory | null;
  allTrends: TrendWithHistory[];
  isOpen: boolean;
  onClose: () => void;
}

export function TrendModal({ trend, allTrends, isOpen, onClose }: TrendModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal(); // Use showModal() for proper accessibility
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Close on ESC key (native dialog handles this, but also call onClose)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  if (!trend) return null;

  const relatedTrends = findRelatedTrends(trend, allTrends, 3);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg p-0 shadow-xl backdrop:bg-black/50 max-w-lg w-full"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900">
            {trend.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description (MODAL-02) */}
        {trend.description && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {trend.description}
          </p>
        )}

        {/* Popularity Score */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
            Popularity Score
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900">
              {trend.score.toFixed(1)}
            </span>
            <span className="text-lg text-gray-500">/ 100</span>
          </div>
          <p className={`text-sm mt-1 ${trend.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}% from yesterday
          </p>
        </div>

        {/* Source Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
            Source Breakdown
          </h3>
          <div className="space-y-2">
            {trend.sourceBreakdown.map(sb => (
              <div key={sb.source} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{sb.source}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${sb.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {sb.score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Trends */}
        {relatedTrends.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Related Trends
            </h3>
            <ul className="space-y-2">
              {relatedTrends.map(related => (
                <li
                  key={related.title}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700">{related.title}</span>
                  <span className="font-medium text-gray-900">
                    {related.score.toFixed(0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Shop on Amazon (Affiliate) */}
        <div className="pt-4 border-t border-gray-200">
          <a
            href={getAmazonFashionLink(trend.title)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center justify-center gap-2 w-full bg-[#FF9900] hover:bg-[#E88B00] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93V4.07z"/>
            </svg>
            Shop &ldquo;{trend.title}&rdquo; on Amazon
          </a>
          <p className="text-xs text-gray-500 mt-2 text-center">
            As an Amazon Associate we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </dialog>
  );
}
