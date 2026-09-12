import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 5, size = 16, showValue = true, count = null }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {stars.map((s) => (
          <Star
            key={s}
            size={size}
            className={`${
              s <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-600 fill-transparent'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-gray-300 ml-1">
          {rating}
          {count !== null && <span className="text-gray-500 font-normal"> ({count})</span>}
        </span>
      )}
    </div>
  );
};
