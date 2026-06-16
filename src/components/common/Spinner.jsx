import React from "react";
import { cn } from "../../utils/cn";


export const Spinner = ({ className, size = "md" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2Heading",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };
  return (
    <div
      className={cn(
        "rounded-full border-gray-200 dark:border-gray-800 border-t-blue-600 animate-spin",
        sizes[size],
        className
      )}
    />
  );
};

export default Spinner;
