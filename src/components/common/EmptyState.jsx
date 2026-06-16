import React from "react";
import { Inbox } from "lucide-react";


export const EmptyState = ({
  message = "No products match your current search constraints.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <div className="p-3.5 bg-gray-100 dark:bg-gray-850 rounded-full text-gray-400 dark:text-gray-600 mb-4 animate-bounce">
        <Inbox size={32} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 uppercase tracking-wide">
        No Data Found
      </h3>
      <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
