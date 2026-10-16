"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, DrawSVGPlugin, useGSAP, registerGsap } from "@/lib/gsap";

/**
 * Préchargeur court : le mot-symbole se dessine (DrawSVG)
 * puis le rideau se lève. Ne bloque jamais plus de ~1.8s.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      registerGsap();
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setGone(true);
        return;
      }
      const stroke = root.querySelector(".preloader-stroke");
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.dataset.loaded = "true";
          setGone(true);
        },
      });
      if (stroke) {
        tl.fromTo(stroke, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, ease: "power2.inOut" });
      }
      tl.to(".preloader-inner", { opacity: 0, y: -20, duration: 0.35, ease: "power2.in" }, "-=0.1");
      tl.to(root, { yPercent: -100, duration: 0.8, ease: "expo.out" }, "-=0.05");
      // Sécurité : forcer la sortie après 2.5s
      const fallback = window.setTimeout(() => {
        document.body.dataset.loaded = "true";
        setGone(true);
      }, 2500);
      return () => window.clearTimeout(fallback);
    },
    { scope: rootRef },
  );

  useEffect(() => {
    document.body.style.overflow = gone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[80] flex items-center justify-center bg-sand" role="status" aria-label="Chargement de BeaverLaunch">
      <div className="preloader-inner flex flex-col items-center gap-5">
        <p className="text-3xl font-bold tracking-tight text-terracotta">BeaverLaunch</p>
        <svg width="220" height="24" viewBox="0 0 220 24" fill="none" aria-hidden="true">
          <path
            className="preloader-stroke"
            d="M4 16 C 60 4, 160 4, 216 14"
            stroke="#B05F3F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export { DrawSVGPlugin };
