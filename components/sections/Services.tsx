"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, registerGsap } from "@/lib/gsap";

const BLOCKS = [
  {
    title: "Création et lancement",
    text: "Nous créons votre site web à votre image de marque, de zéro. Rien à faire, il vous suffit de l’admirer.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=70",
    alt: "Maquette de site web en cours de création",
  },
  {
    title: "Hébergement et maintien",
    text: "Une fois votre site hébergé, nous vous proposons l’accès administrateur avec tous les accès aux insights et KPI de votre site.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=70",
    alt: "Tableau de bord avec les KPI du site",
  },
];

/** Section services : reveals clip-path + parallax interne des images. */
export function Services() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = rootRef.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);

      if (reduced) {
        gsap.set(q(".service-block"), { opacity: 1 });
        return;
      }

      q(".service-block").forEach((block) => {
        const text = block.querySelector(".service-text");
        const card = block.querySelector(".service-card");
        const img = block.querySelector(".service-img");
        gsap.fromTo(
          text,
          { clipPath: "inset(0 0 100% 0)", y: 60, opacity: 0 },
          {
            clipPath: "inset(0 0 0% 0)",
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: block as Element, start: "top 78%", toggleActions: "play none none reverse" },
          },
        );
        gsap.fromTo(
          card,
          { clipPath: "inset(12% 8% 12% 8% round 24px)", opacity: 0, y: 40 },
          {
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: block as Element, start: "top 78%", toggleActions: "play none none reverse" },
          },
        );
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.2, yPercent: -10 },
            {
              scale: 1.2,
              yPercent: 10,
              ease: "none",
              scrollTrigger: { trigger: card as Element, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} id="services" aria-labelledby="services-title" className="bg-sand px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 id="services-title" className="text-4xl font-bold tracking-tight text-terracotta md:text-6xl">
          Nos services et prestations
        </h2>
        <div className="mt-14 space-y-14 md:space-y-20">
          {BLOCKS.map((b) => (
            <div key={b.title} className="service-block grid items-center gap-8 md:grid-cols-2 md:gap-14">
              <div className="service-text">
                <h3 className="text-2xl font-medium text-terracotta">{b.title}</h3>
                <p className="mt-4 max-w-xl text-[18px] leading-[1.6] text-neutral-900">{b.text}</p>
              </div>
              <div className="service-card relative h-56 overflow-hidden rounded-[24px] bg-paper md:h-64">
                <Image src={b.img} alt={b.alt} fill sizes="(max-width: 768px) 90vw, 560px" className="service-img object-cover" loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
