"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gold text-foreground font-bold hover:bg-[#e6ac00] transition",
  secondary: "border-2 border-forest text-forest font-bold rounded-full hover:bg-forest hover:text-white transition",
  ghost: "border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-forest transition",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin border-gold text-gold" /> : null}
      {children}
    </button>
  );
}
