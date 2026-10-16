"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

type CountUpOptions = { duration?: number; once?: boolean };

/**
 * Count-up GSAP sur un objet { val: 0 } avec snap entier.
 * Le suffixe (+, K+, %) reste fixe dans le markup.
 */
export function useCountUp(target: number, options: CountUpOptions = {}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const { duration = 2, once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(target);
      return;
    }
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: target,
      duration,
      ease: "power2.out",
      snap: { val: 1 },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.val));
      },
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [target, duration, once]);

  return ref;
}

export { ScrollTrigger };
