import React from "react";
import { Star } from "lucide-react";


export const RatingStars = ({
  rating = 0,
  maxStars = 5,
  size = 16,
}) => {
  const roundedRating = Math.round(rating * 2) / 2; // Support half ratings if needed, default to round stars

  return (
    <div className="flex items-center gap-0.5 text-yellow-500" aria-label={`Rating: ${rating} out of ${maxStars}`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = roundedRating >= starValue;
        
        return (
          <Star
            key={index}
            size={size}
            className={`${
              isFilled
                ? "fill-yellow-500 text-yellow-500"
                : "text-gray-300 dark:text-gray-700"
            }`}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;
