import React from "react";
import { cn } from "../../utils/cn";


export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 py-4">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-850 dark:text-gray-300 transition-colors"
      >
        Prev
      </button>

      {/* Pages */}
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;
        const isActive = currentPage === page;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 rounded-lg text-sm font-semibold transition-all border",
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850"
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-850 dark:text-gray-300 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
