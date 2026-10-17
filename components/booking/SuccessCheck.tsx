"use client";

import { useRef } from "react";
import { gsap, DrawSVGPlugin, useGSAP, registerGsap } from "@/lib/gsap";

/** Coche animée (DrawSVG) affichée après une réservation confirmée. */
export function SuccessCheck() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useGSAP(
    () => {
      registerGsap();
      const svg = svgRef.current;
      if (!svg) return;
      const circle = svg.querySelector(".success-circle");
      const check = svg.querySelector(".success-check");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([circle, check], { drawSVG: "100%" } as gsap.TweenVars);
        return;
      }
      const tl = gsap.timeline();
      tl.fromTo(circle, { drawSVG: "0%" } as gsap.TweenVars, { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" } as gsap.TweenVars);
      tl.fromTo(check, { drawSVG: "0%" } as gsap.TweenVars, { drawSVG: "100%", duration: 0.35, ease: "power2.out" } as gsap.TweenVars, "-=0.15");
      tl.fromTo(svg, { scale: 0.9, transformOrigin: "center" }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" }, "-=0.35");
    },
    { scope: svgRef },
  );

  return (
    <svg ref={svgRef} width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle className="success-circle" cx="36" cy="36" r="30" stroke="#2D4F38" strokeWidth="3" />
      <path className="success-check" d="M23 37 L32 46 L50 27" stroke="#B05F3F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { DrawSVGPlugin };
