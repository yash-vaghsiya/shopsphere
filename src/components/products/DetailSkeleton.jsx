import React from "react";

export const DetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex gap-2 items-center">
        <div className="w-16 h-4 bg-gray-150 dark:bg-gray-800 rounded"></div>
        <div className="w-3 h-3 bg-gray-150 dark:bg-gray-800 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-150 dark:bg-gray-800 rounded"></div>
        <div className="w-3 h-3 bg-gray-150 dark:bg-gray-800 rounded-full"></div>
        <div className="w-36 h-4 bg-gray-250 dark:bg-gray-750 rounded"></div>
      </div>

      {/* Main product detail section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
        
        {/* Left Column: Image Gallery Skeleton (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main big image slot */}
          <div className="w-full aspect-square bg-gray-105 dark:bg-gray-850 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
          </div>
          
          {/* Thumbnails row */}
          <div className="flex gap-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="w-20 h-20 bg-gray-105 dark:bg-gray-850 rounded-xl"></div>
            ))}
          </div>

          {/* Specifications Box Panel Skeleton */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="w-28 h-4 bg-gray-250 dark:bg-gray-750 rounded"></div>
            <div className="space-y-3 pt-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                  <div className="w-24 h-3 bg-gray-150 dark:bg-gray-800 rounded"></div>
                  <div className="w-48 h-3 bg-gray-105 dark:bg-gray-850 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Information Block Skeleton (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            {/* Tag and badge row */}
            <div className="flex gap-2 items-center">
              <div className="w-24 h-5 bg-gray-150 dark:bg-gray-800 rounded-full"></div>
              <div className="w-20 h-5 bg-gray-150 dark:bg-gray-800 rounded-full"></div>
            </div>

            {/* Title */}
            <div className="w-4/5 h-8 bg-gray-250 dark:bg-gray-750 rounded"></div>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-150 dark:bg-gray-800 rounded-full"></div>
                ))}
              </div>
              <div className="w-24 h-4 bg-gray-150 dark:bg-gray-800 rounded"></div>
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-3 pt-2">
              <div className="w-28 h-8 bg-gray-250 dark:bg-gray-750 rounded"></div>
              <div className="w-16 h-5 bg-gray-150 dark:bg-gray-800 line-through rounded"></div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-150 dark:border-gray-800"></div>

            {/* Description lines */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-3.5 bg-gray-105 dark:bg-gray-850 rounded"></div>
              <div className="w-11/12 h-3.5 bg-gray-105 dark:bg-gray-850 rounded"></div>
              <div className="w-10/12 h-3.5 bg-gray-105 dark:bg-gray-850 rounded"></div>
            </div>

            {/* Action options (Colors/Sizes structure) */}
            <div className="space-y-3 pt-4">
              <div className="w-16 h-3 bg-gray-150 dark:bg-gray-800 rounded"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-105 dark:bg-gray-850 rounded-full border"></div>
                ))}
              </div>
            </div>

            {/* Quantity selector & Add to cart button row */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="w-32 h-12 bg-gray-150 dark:bg-gray-800 rounded-xl"></div>
              <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="w-12 h-12 bg-gray-150 dark:bg-gray-800 rounded-xl"></div>
            </div>
            
            {/* Extra assurance specs */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-150 dark:border-gray-800">
              <div className="h-10 bg-gray-105 dark:bg-gray-850 rounded-xl"></div>
              <div className="h-10 bg-gray-105 dark:bg-gray-850 rounded-xl"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailSkeleton;
