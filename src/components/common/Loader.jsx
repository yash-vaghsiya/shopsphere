import React from "react";

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 dark:border-gray-800 animate-pulse"></div>
        <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
      </div>
      <p className="mt-4 text-xs font-semibold text-gray-500 uppercase tracking-widest animate-pulse">
        Loading ShopSphere...
      </p>
    </div>
  );
};

export default Loader;
