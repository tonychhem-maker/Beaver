"use client";

import type { ReactNode, MouseEvent } from "react";
import { motion } from "motion/react";
import { cx } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent) => void;
  variant?: "primary" | "outline" | "light";
  className?: string;
  type?: "button" | "submit";
  ariaLabel?: string;
};

/** Bouton pilule avec micro-interaction whileTap (scale 0.97). */
export function Button({ children, href, onClick, variant = "primary", className, type = "button", ariaLabel }: ButtonProps) {
  const styles = cx(
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium transition-colors duration-300",
    variant === "primary" && "bg-forest text-[#F5F1E0] hover:bg-[#23402c]",
    variant === "outline" && "border border-slate-blue text-slate-blue bg-transparent hover:text-white",
    variant === "light" && "bg-white text-forest hover:bg-sand",
    className,
  );
  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        whileTap={{ scale: 0.97 }}
        className={styles}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} onClick={onClick} aria-label={ariaLabel} whileTap={{ scale: 0.97 }} className={styles}>
      {children}
    </motion.button>
  );
}
