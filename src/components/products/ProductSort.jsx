import React from "react";


export const ProductSort = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
        Sort By
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none transition-all"
      >
        <option value="">Default Featured</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
};

export default ProductSort;
