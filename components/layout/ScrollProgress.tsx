"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, registerGsap } from "@/lib/gsap";

/** Barre de progression du scroll (terracotta, scaleX en scrub). */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    registerGsap();
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        transformOrigin: "0 50%",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
      },
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden="true">
      <div ref={ref} className="h-full w-full origin-left scale-x-0 bg-terracotta" />
    </div>
  );
}

export { ScrollTrigger };
