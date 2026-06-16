import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";



export const Input = forwardRef(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent transition-all outline-none",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
