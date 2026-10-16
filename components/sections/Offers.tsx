"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDown, Download, CalendarCheck } from "lucide-react";
import { gsap, SplitText, useGSAP, registerGsap } from "@/lib/gsap";

/**
 * Section offres : titre SplitText, visuels décalés, flèche rebond,
 * bouton contour à remplissage circulaire depuis le curseur.
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

      if (!reduced) {
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
          q(".offer-visual"),
          { y: 80, opacity: 0, rotation: (i: number) => (i === 0 ? -4 : 4) },
          {
            y: 0,
            opacity: 1,
            rotation: (i: number) => (i === 0 ? -2 : 2),
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: q(".offer-visuals")[0], start: "top 80%", toggleActions: "play none none reverse" },
          },
        );
        // Flèche qui rebondit en boucle.
        gsap.to(q(".offer-arrow")[0], { y: 10, duration: 0.7, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }
    },
    { scope: rootRef },
  );

  // Remplissage circulaire depuis la position du curseur.
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

        <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-10">
          {/* Gauche : rendez-vous */}
          <div>
            <h3 className="text-center text-2xl font-medium text-slate-blue">Booker un randez-vous</h3>
            <div className="offer-visuals mt-8 grid grid-cols-2 gap-4">
              <div className="offer-visual relative aspect-[3/4] overflow-hidden rounded-[20px] bg-grey">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=70"
                  alt="Conseillère BeaverLaunch"
                  fill
                  sizes="(max-width: 768px) 45vw, 280px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="offer-visual relative aspect-[3/4] overflow-hidden rounded-[20px] bg-grey">
                <Image
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=70"
                  alt="Conseiller BeaverLaunch"
                  fill
                  sizes="(max-width: 768px) 45vw, 280px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <a
              href="mailto:bonjour@beaverlaunch.fr?subject=Rendez-vous%20BeaverLaunch"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-base font-medium text-[#F5F1E0] transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              <CalendarCheck size={19} aria-hidden="true" />
              Prendre rendez-vous
            </a>
            <p className="mt-3 text-center text-sm text-mist">Intégrez ici votre widget Cal.com ou Calendly.</p>
          </div>

          {/* Droite : budget / offres */}
          <div className="flex flex-col items-center text-center">
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
              className="group relative mt-10 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-slate-blue px-8 py-4 text-lg font-medium text-slate-blue"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 scale-0 rounded-full bg-forest transition-transform duration-500 ease-out group-hover:scale-[2.5]"
                style={{
                  transformOrigin: "var(--mx, 50%) var(--my, 50%)",
                  left: 0,
                  top: 0,
                }}
              />
              <Download size={20} aria-hidden="true" className="relative transition-colors group-hover:text-white" />
              <span className="relative transition-colors group-hover:text-white">Télécharger la grille tarifaire</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export { SplitText };
