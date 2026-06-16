import React from "react";
import { Search } from "lucide-react";


export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search product name, category, or brand...",
}) => {
  return (
    <div className="relative w-full max-w-lg mb-6">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
      />
    </div>
  );
};

export default SearchBar;
