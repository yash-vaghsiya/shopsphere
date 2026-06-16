import React from "react";
import { cn } from "../../utils/cn";
import { Check, X } from "lucide-react";


export const ProductFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  brandList,
  selectedBrand,
  onBrandChange,
  onReset,
}) => {
  return (
    <div className="space-y-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-6 shadow-sm">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider">
          Filter Options
        </h3>
        {(selectedCategory || selectedBrand) && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 dark:text-blue-450 hover:underline flex items-center gap-1 font-bold"
          >
            <X size={12} />
            Clear All
          </button>
        )}
      </div>

      {/* Category selector */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-550 tracking-widest">
          Categories
        </h4>
        <div className="flex flex-col space-y-1.5">
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors",
              selectedCategory === null
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-500 font-bold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850"
            )}
          >
            All Products
            {selectedCategory === null && <Check size={12} />}
          </button>
          
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-500 font-bold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850"
                )}
              >
                {cat}
                {isSelected && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand selector */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-550 tracking-widest">
          Filter Brands
        </h4>
        <div className="flex flex-col space-y-1.5">
          <button
            onClick={() => onBrandChange(null)}
            className={cn(
              "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors",
              selectedBrand === null
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-500 font-bold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-55"
            )}
          >
            All Brands
            {selectedBrand === null && <Check size={12} />}
          </button>

          {brandList.map((brand) => {
            const isSelected = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => onBrandChange(brand)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-500 font-bold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850"
                )}
              >
                {brand}
                {isSelected && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ProductFilters;
