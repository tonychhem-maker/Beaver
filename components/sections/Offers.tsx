"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { ArrowDown, Download, Tag } from "lucide-react";
import { gsap, SplitText, useGSAP, registerGsap } from "@/lib/gsap";

/* Le calendrier dépend de la date du jour : importé en client-only
   (ssr: false) pour préserver le prerender statique de Cache Components.
   Pour brancher un embed Cal.com à sa place :
   const CalComEmbed = dynamic(() => import("@calcom/embed-react").then(m => m.Cal), { ssr: false });
   puis remplacer <BookingPanel /> par <CalComEmbed namespace="beaverlaunch" />. */
const BookingPanel = dynamic(
  () => import("@/components/booking/BookingPanel").then((m) => m.BookingPanel),
  {
    ssr: false,
    loading: () => (
      <div className="h-[560px] animate-pulse rounded-[24px] border border-terracotta bg-paper" aria-hidden="true" />
    ),
  },
);

const FORMULAS = [
  { name: "Création", price: "à partir de 1 490 €", detail: "Site sur-mesure, design immersif, lancement clé en main." },
  { name: "Hébergement", price: "à partir de 29 €/mois", detail: "Hébergement rapide, maintenance, accès admin et KPI." },
  { name: "Pack complet", price: "à partir de 1 690 €", detail: "Création + première année d’hébergement offerte." },
];

/**
 * Section offres : titre SplitText, calendrier de rendez-vous (gauche),
 * formules + téléchargement de la grille tarifaire (droite).
 */
export function Offers() {
  const rootRef = useRef<HTMLElement | null>(null);
  const fillBtnRef = useRef<HTMLAnchorElement | null>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = rootRef.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      if (reduced) return;

      const title = q(".offers-title")[0];
      if (title) {
        const split = new SplitText(title, { type: "words", wordsClass: "offers-word" });
        gsap.fromTo(
          split.words,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.out",
            scrollTrigger: { trigger: title, start: "top 82%", toggleActions: "play none none reverse" },
          },
        );
      }
      gsap.fromTo(
        q(".offer-col"),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 70%", toggleActions: "play none none reverse" },
        },
      );
      gsap.fromTo(
        q(".formula-card"),
        { y: 40, opacity: 0, rotation: (i: number) => (i % 2 === 0 ? -2 : 2) },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: q(".formulas")[0], start: "top 85%", toggleActions: "play none none reverse" },
        },
      );
      gsap.to(q(".offer-arrow")[0], { y: 10, duration: 0.7, yoyo: true, repeat: -1, ease: "sine.inOut" });
    },
    { scope: rootRef },
  );

  // Remplissage circulaire du bouton contour depuis la position du curseur.
  const onFillMove = (e: React.MouseEvent): void => {
    const el = fillBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={rootRef} id="offres" aria-labelledby="offres-title" className="bg-white px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 id="offres-title" className="offers-title mx-auto max-w-3xl text-balance text-center text-4xl font-bold leading-tight text-slate-blue md:text-6xl">
          Des offres adaptées à chaque budget
        </h2>

        <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-12">
          {/* Gauche : prise de rendez-vous */}
          <div className="offer-col">
            <h3 className="mb-6 text-center text-2xl font-medium text-slate-blue">Booker un randez-vous</h3>
            <BookingPanel />
          </div>

          {/* Droite : budget / formules */}
          <div className="offer-col flex flex-col items-center text-center">
            <h3 className="text-2xl font-medium text-slate-blue">Votre budjet , nos offres</h3>
            <ArrowDown className="offer-arrow mt-3 text-neutral-900" size={28} aria-hidden="true" />
            <p className="mt-4 max-w-md text-[17px] leading-[1.6] text-mist">
              Deux formules simples : la <strong className="text-slate-blue">Création</strong> (site sur-mesure,
              design immersif, lancement clé en main) et l’<strong className="text-slate-blue">Hébergement</strong>{" "}
              (maintenance, accès admin, insights et KPI). Combinez-les selon votre budget et vos ambitions.
            </p>

            <a
              ref={fillBtnRef}
              href="/grille-tarifaire.pdf"
              download
              onMouseMove={onFillMove}
              className="group relative mt-8 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-slate-blue px-8 py-4 text-lg font-medium text-slate-blue"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-[var(--mx,50%)_var(--my,50%)] scale-0 rounded-full bg-forest transition-transform duration-500 ease-out group-hover:scale-[2.5]"
              />
              <Download size={20} aria-hidden="true" className="relative transition-colors group-hover:text-white" />
              <span className="relative transition-colors group-hover:text-white">Télécharger la grille tarifaire</span>
            </a>

            {/* Cartes récapitulatives des formules */}
            <div className="formulas mt-8 w-full space-y-3 text-left">
              {FORMULAS.map((f) => (
                <article
                  key={f.name}
                  className="formula-card flex items-start gap-4 rounded-[24px] border border-terracotta bg-paper px-5 py-4 shadow-[0_20px_40px_-20px_rgba(176,95,63,0.35)]"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                    <Tag size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-base font-bold text-terracotta">
                      {f.name} <span className="font-medium text-slate-blue">— {f.price}</span>
                    </p>
                    <p className="mt-1 text-[15px] leading-snug text-slate-blue">{f.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { SplitText };
