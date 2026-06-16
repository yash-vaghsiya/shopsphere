import React from "react";

export const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800/80 overflow-hidden shadow-sm flex flex-col justify-between animate-pulse">
      {/* Product Image Panel Skeleton */}
      <div className="relative w-full aspect-square bg-gray-105 dark:bg-gray-850 flex items-center justify-center">
        {/* Shimmer overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
      </div>

      {/* Product Info Section Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {/* Category tag skeleton */}
            <div className="w-16 h-3 bg-gray-150 dark:bg-gray-750 rounded"></div>
            {/* Compare tag skeleton */}
            <div className="w-12 h-4.5 bg-gray-105 dark:bg-gray-850/60 rounded-md"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="w-4/5 h-4 bg-gray-250 dark:bg-gray-750 rounded"></div>
          
          {/* Rating stars skeleton */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3.5 h-3.5 bg-gray-150 dark:bg-gray-800 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Price & Action Row Skeleton */}
        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-850 pt-3.5">
          <div className="flex items-baseline gap-2">
            {/* Main Price block */}
            <div className="w-16 h-5 bg-gray-250 dark:bg-gray-750 rounded"></div>
            {/* Original Price discounted block */}
            <div className="w-10 h-3.5 bg-gray-105 dark:bg-gray-850 rounded"></div>
          </div>
          
          {/* Add to cart action button skeleton */}
          <div className="w-8 h-8 bg-gray-150 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
