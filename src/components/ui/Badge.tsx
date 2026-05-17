import clsx from "clsx";
import { HTMLAttributes } from "react";

type BadgeTone = "online" | "cusd" | "celo" | "top" | "new" | "default";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  online: "bg-mint/15 text-jade ring-mint/30",
  cusd: "bg-gold/15 text-forest ring-gold/30",
  celo: "bg-forest text-cream ring-forest/20",
  top: "bg-jade/10 text-jade ring-jade/25",
  new: "bg-cream text-forest ring-gold/25",
  default: "bg-white text-forest ring-forest/10",
};

export function Badge({ className, tone = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

