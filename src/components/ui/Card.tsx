"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type CardProps = {
  cream?: boolean;
  className?: string;
  children: ReactNode;
};

export function Card({ className, cream = false, children }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={clsx(
        "rounded-2xl border border-forest/10 p-6 shadow-luxury transition-colors",
        cream ? "bg-cream" : "bg-white",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

