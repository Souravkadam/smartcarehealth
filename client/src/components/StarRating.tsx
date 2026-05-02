import { generateStars } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function StarRating({
  rating,
  reviews,
  size = "md",
  showCount = true,
}: StarRatingProps) {
  const stars = generateStars(rating);

  const sizeMap = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {stars.map((star, index) => (
          <div key={index} className="relative">
            {/* Empty star background */}
            <Star
              className={`${sizeMap[size]} text-gray-300 fill-gray-300`}
            />
            {/* Filled star overlay */}
            {star > 0 && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${star * 100}%` }}
              >
                <Star
                  className={`${sizeMap[size]} text-yellow-400 fill-yellow-400`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showCount && (
        <span className={`${textSizeMap[size]} text-gray-600 font-medium`}>
          {rating.toFixed(1)}
          {reviews && <span className="text-gray-500 ml-1">({reviews})</span>}
        </span>
      )}
    </div>
  );
}
