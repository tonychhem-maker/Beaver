"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, DrawSVGPlugin, useGSAP, registerGsap } from "@/lib/gsap";
import { StatCard } from "@/components/ui/StatCard";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { scrollToTarget } from "@/lib/utils";

const STATS = [
  { value: 5, prefix: "", suffix: "+", label: "client passé par BeaverLaunch" },
  { value: 10, prefix: "", suffix: "K+", label: "total des recettes à travers tout nos clients" },
  { value: 95, prefix: "+", suffix: "%", label: "taux de satisfaction client" },
];

/** Section réassurance : compteurs, cartes en éventail, arcs DrawSVG. */
export function Stats() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);

      // Cartes en éventail depuis le bas.
      gsap.fromTo(
        q(".stat-card"),
        { y: 120, opacity: 0, rotation: (i: number) => (i === 1 ? 0 : i === 0 ? -8 : 8) },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.15,
          ease: "back.out(1.4)",
          clearProps: "opacity",
          scrollTrigger: { trigger: q(".stats-grid")[0], start: "top 82%", toggleActions: "play none none reverse" },
        },
      );
      // Arcs décoratifs qui se dessinent en scrub lent.
      q(".arc-draw").forEach((arc) => {
        gsap.fromTo(
          arc,
          { drawSVG: "0%" } as gsap.TweenVars,
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: { trigger: arc as Element, start: "top bottom", end: "bottom top", scrub: 1 },
          } as gsap.TweenVars,
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-labelledby="stats-title" className="relative overflow-clip bg-sand px-5 py-20 md:px-10 md:py-28">
      {/* Arcs terracotta bas-gauche */}
      <svg className="pointer-events-none absolute -left-28 bottom-0 h-[480px] w-[480px]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <circle className="arc-draw" cx="40" cy="420" r="200" stroke="#B05F3F" strokeWidth="1" />
        <circle className="arc-draw" cx="40" cy="420" r="260" stroke="#B05F3F" strokeWidth="1" />
      </svg>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <h2 id="stats-title" className="text-balance text-4xl font-bold leading-tight text-terracotta md:text-6xl">
              Les stats parlent d’eux même
            </h2>
            <p className="mt-6 max-w-xl text-[18px] leading-[1.6] text-neutral-900 md:text-[20px]">
              Tout les clients passé par BeaverLaunch tous sont reparti avec des sites immersive et un taux de
              conversion boosté et des réservations pleine
            </p>
            <div className="mt-10 flex items-stretch gap-4">
              <span className="w-[6px] shrink-0 rounded-full bg-forest" aria-hidden="true" />
              <MagneticWrapper>
                <button
                  type="button"
                  onClick={() => scrollToTarget("#offres")}
                  className="group relative overflow-hidden rounded-full bg-forest px-10 py-5 text-lg font-medium text-[#F5F1E0]"
                >
                  <span className="absolute inset-0 translate-y-full bg-[#23402c] transition-transform duration-300 group-hover:translate-y-0" aria-hidden="true" />
                  <span className="relative">Découvrez nos valeurs</span>
                </button>
              </MagneticWrapper>
            </div>
          </div>
          <div className="relative h-72 overflow-hidden rounded-[24px] bg-paper md:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=70"
              alt="Équipe BeaverLaunch en atelier"
              fill
              sizes="(max-width: 768px) 90vw, 560px"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="stats-grid mt-14 grid gap-6 md:grid-cols-3">
          {STATS.map((s) => (
            <StatCard key={s.label} value={s.value} prefix={s.prefix} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { DrawSVGPlugin };
