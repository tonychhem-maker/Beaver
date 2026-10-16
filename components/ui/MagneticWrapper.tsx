"use client";

import type { ReactNode } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cx } from "@/lib/utils";

/** Wrapper magnétique : l'enfant suit légèrement le curseur (rayon 80px). */
export function MagneticWrapper({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useMagnetic<HTMLDivElement>({ radius: 80, strength: 0.35 });
  return (
    <div ref={ref} className={cx("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
