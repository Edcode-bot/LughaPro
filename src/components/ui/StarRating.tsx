import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  size?: number;
  showValue?: boolean;
};

export function StarRating({ rating, size = 16, showValue = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1 text-gold">
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));

        return (
          <span className="relative inline-flex" key={index} style={{ width: size, height: size }}>
            <Star size={size} className="text-gold/30" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="fill-gold text-gold" />
            </span>
          </span>
        );
      })}
      {showValue ? <span className="ml-1 text-sm font-bold text-forest">{rating.toFixed(1)}</span> : null}
    </div>
  );
}

