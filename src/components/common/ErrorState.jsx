import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";


export const ErrorState = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/40">
      <div className="p-3.5 bg-red-100 dark:bg-red-950/40 rounded-full text-red-600 dark:text-red-400 mb-4 animate-pulse">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 uppercase tracking-wide">
        System Request Failed
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
