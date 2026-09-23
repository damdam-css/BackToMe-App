import React from 'react';

/**
 * Skeleton Loader Component for Item Card (matching ItemCard layout)
 */
export const ItemCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-xs overflow-hidden flex flex-col animate-pulse">
      {/* 1:1 Thumbnail Skeleton */}
      <div className="relative w-full aspect-square bg-slate-200 shrink-0">
        <div className="absolute top-2 right-2 w-20 h-5 bg-slate-300 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-16 h-4 bg-slate-300 rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between min-w-0 space-y-3">
        <div className="space-y-2">
          {/* Title Line 1 & 2 */}
          <div className="h-4 bg-slate-200 rounded-md w-11/12"></div>
          <div className="h-3.5 bg-slate-100 rounded-md w-3/4"></div>

          {/* Location & Time */}
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-slate-200 rounded-full shrink-0"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-slate-200 rounded-full shrink-0"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid Skeleton Loader for Catalog and Home Views
 */
export const ItemGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ItemCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Skeleton Loader for My Claims / WhatsApp View
 */
export const MyClaimsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#CBD5E1] space-y-3">
        <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded-md w-2/3"></div>
      </div>

      {/* List Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white rounded-2xl p-4 border border-[#CBD5E1] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0"></div>
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-40"></div>
                  <div className="h-3 bg-slate-100 rounded w-28"></div>
                </div>
              </div>
              <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
            </div>

            <div className="h-16 bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-4/5"></div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <div className="h-9 w-28 bg-slate-200 rounded-xl"></div>
              <div className="h-9 w-32 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Satpam Dashboard
 */
export const SatpamDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white p-4 rounded-2xl border border-[#CBD5E1] space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="h-7 bg-slate-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>

      {/* Table / List Skeleton */}
      <div className="bg-white rounded-2xl border border-[#CBD5E1] p-4 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-14 bg-slate-100 rounded-xl border border-slate-200 flex items-center px-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
                <div className="space-y-1">
                  <div className="h-3.5 bg-slate-200 rounded w-32"></div>
                  <div className="h-3 bg-slate-100 rounded w-20"></div>
                </div>
              </div>
              <div className="h-7 w-20 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Item Detail Modal
 */
export const DetailModalSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-5 animate-pulse">
      <div className="w-full aspect-video sm:aspect-21/9 bg-slate-200 rounded-2xl"></div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
          <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
        </div>
        <div className="h-6 bg-slate-300 rounded-md w-3/4"></div>
        <div className="h-4 bg-slate-100 rounded-md w-full"></div>
        <div className="h-4 bg-slate-100 rounded-md w-2/3"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3">
        <div className="h-12 bg-slate-200 rounded-xl"></div>
        <div className="h-12 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
};
