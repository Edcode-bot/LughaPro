import clsx from "clsx";
import Image from "next/image";

type AvatarProps = {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
};

const sizes = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
  xl: "h-24 w-24 text-2xl",
};

const dotSizes = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-4 w-4",
  xl: "h-5 w-5",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({ src, name, size = "md", online = false, className }: AvatarProps) {
  return (
    <div className={clsx("relative inline-flex shrink-0", className)}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={96}
          height={96}
          className={clsx("rounded-full object-cover ring-2 ring-cream", sizes[size])}
        />
      ) : (
        <div
          className={clsx(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-jade to-forest font-bold text-cream ring-2 ring-cream",
            sizes[size],
          )}
        >
          {initials(name)}
        </div>
      )}
      {online ? (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full border-2 border-white bg-jade",
            dotSizes[size],
          )}
        />
      ) : null}
    </div>
  );
}
