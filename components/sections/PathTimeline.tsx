"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, registerGsap } from "@/lib/gsap";

/** Libellés sous chaque point du tracé (1 à 3 lignes selon l'espace). */
const STEP_LABELS: string[][] = [
  ["création de", "votre site"],
  ["lancement de", "votre site"],
  ["hébergement de", "votre site"],
  ["à vous de jouer", "avec les accès", "admin"],
];

/** Bloc de contenu affiché au scroll : une section par étape. */
const CONTENT_STEPS = [
  {
    title: "Création de votre site",
    text: "Nous créons votre site web à votre image de marque, de zéro. Rien à faire : contentez-vous d’admirer le site sans rien avoir à faire.",
  },
  {
    title: "Lancement de votre site",
    text: "Mise en ligne, nom de domaine et réglages : tout est prêt le jour J, vous n’avez plus qu’à partager le lien.",
  },
  {
    title: "Hébergement de votre site",
    text: "Une fois votre site hébergé, nous vous proposons l’accès administrateur avec tous les accès aux insights et KPI de votre site.",
  },
  {
    title: "À vous de jouer avec les accès admin",
    text: "Vos accès, vos KPI et vos réglages : à vous de jouer. On reste juste à côté si vous avez besoin de nous.",
  },
];

const CONTENT_IMG = {
  src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=70",
  alt: "Maquette de site web en cours de création",
};

const DESKTOP_PATH =
  "M 60 200 C 140 80, 260 80, 330 190 C 400 300, 520 300, 600 190 C 680 80, 800 80, 870 190 C 940 300, 1060 300, 1140 190";
const MOBILE_PATH =
  "M 200 40 C 300 120, 300 220, 200 300 C 100 380, 100 480, 200 560 C 300 640, 300 720, 200 800";

const DESKTOP_STEPS = [
  { x: 60, y: 200 },
  { x: 330, y: 190 },
  { x: 600, y: 190 },
  { x: 870, y: 190 },
];
const MOBILE_STEPS = [
  { x: 200, y: 40 },
  { x: 200, y: 300 },
  { x: 200, y: 560 },
  { x: 200, y: 800 },
];

const CROWN_BODY = "M -46 -28 L -32 -64 L -16 -34 L 0 -74 L 16 -34 L 32 -64 L 46 -28 Z";
const SPIKES = [
  { x: -32, y: -64 },
  { x: 0, y: -74 },
  { x: 32, y: -64 },
];

/**
 * Section signature (fusion titre + bloc d'étape + tracé) :
 * - un seul bloc épinglé en desktop (`start: "top top+=80"`, `end: "+=260%"`) :
 *   le titre, le bloc de contenu et le tracé tiennent dans le viewport —
 *   plus de vide au-dessus pendant le scrub ;
 * - à chaque étape (`step1…step4`) : le point se remplit, le bloc de contenu
 *   échange sa section (sortie vers le haut / entrée par le bas) ;
 * - DrawSVG + MotionPath sur le tracé, couronne qui se remplit puis éclate.
 *
 * Réglages : STEP_TIMES (seuils), CROWN_GLOWS (glow), durées 0.6/0.45 (échange
 * du bloc), `end: "+=260%"` (longueur totale du défilement).
 */
const STEP_TIMES = [0.05, 1.25, 2.45, 3.35];
const CROWN_GLOWS = [6, 12, 18, 24];

function Canvas({ vertical, reduced }: { vertical: boolean; reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const path = vertical ? MOBILE_PATH : DESKTOP_PATH;
  const steps = vertical ? MOBILE_STEPS : DESKTOP_STEPS;
  const crownPos = vertical ? { x: 200, y: 866 } : { x: 1205, y: 205 };
  const viewBox = vertical ? "0 0 400 930" : "0 0 1300 360";
  const gradId = `beaver-grad-${uid}`;
  const clipId = `crown-clip-${uid}`;

  useGSAP(
    () => {
      registerGsap();
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const active = q(".path-active")[0] as unknown as SVGPathElement;
      const svgEl = q("svg")[0] as unknown as SVGSVGElement;
      const pen = q(".pen")[0];
      const stepEls = q(".step");
      const states = q(".service-state");
      const clipRect = q(".crown-clip-rect")[0];
      const crown = q(".crown")[0];
      const crownColored = q(".crown-colored")[0];
      const halo = q(".crown-halo")[0];
      const spikes = q(".spike");
      const sparks = q(".spark");
      const fills = q(".step-fill");
      const numbers = q(".step-num");

      // ——— État initial (jamais en reduced-motion : tout reste visible) ———
      gsap.set(fills, { scale: 0, transformOrigin: "center" });
      gsap.set(q(".ripple"), { scale: 0, opacity: 0, transformOrigin: "center" });
      gsap.set(spikes, { opacity: 0, scale: 0.4, transformOrigin: "center" });
      gsap.set(sparks, { opacity: 0, x: 0, y: 0 });
      gsap.set(halo, { opacity: 0, scale: 1, transformOrigin: "center" });

      if (reduced) {
        // Chemin complet, couronne allumée, sections empilées, pas de pin.
        gsap.set(active, { drawSVG: "100%" } as gsap.TweenVars);
        gsap.set(fills, { scale: 1 });
        gsap.set(numbers, { fill: "#B05F3F" });
        gsap.set(spikes, { opacity: 1, scale: 1 });
        gsap.set(halo, { opacity: 0.5 });
        gsap.set(clipRect, { attr: { y: -80, height: 76 } });
        gsap.set(pen, { opacity: 0 });
        return;
      }

      gsap.set(states, { y: 30, opacity: 0, scale: 0.98 });

      // Halo qui pulse en boucle (scale seul, l'opacité reste pilotée par le scrub).
      const pulse = gsap.to(halo, { scale: 1.3, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

      // Pop élastique non-scrubbé à 100% (rejoué à chaque arrivée en bas).
      let burstDone = false;
      let burstTl: gsap.core.Timeline | null = null;
      const fireBurst = (): void => {
        if (burstDone) return;
        burstDone = true;
        burstTl = gsap
          .timeline()
          .to(crown as Element, { scale: 1.25, transformOrigin: "center", duration: 0.16, ease: "power2.out" })
          .to(crown as Element, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      };
      const resetBurst = (): void => {
        if (!burstDone) return;
        burstDone = false;
        burstTl?.kill();
        burstTl = null;
        gsap.set(crown as Element, { scale: 1 });
      };
      const onProgressUpdate = (self: { progress: number }): void => {
        if (self.progress >= 0.985) fireBurst();
        else if (self.progress < 0.9) resetBurst();
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: vertical
          ? {
              trigger: root,
              start: "top 75%",
              end: "bottom 55%",
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: onProgressUpdate,
            }
          : {
              // Épinglage juste sous le header : tout le contenu est visible
              // dès le début du scrub (pas de zone vide au-dessus).
              trigger: root,
              start: "top top+=80",
              end: "+=260%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: onProgressUpdate,
            },
      });

      // Labels de timeline nommés (step1…step4) — seuils d'allumage des étapes.
      STEP_TIMES.forEach((t, i) => tl.addLabel(`step${i + 1}`, t));

      // Tracé fantôme déjà visible ; l'actif se dessine 0% → 100%.
      tl.fromTo(active, { drawSVG: "0%" } as gsap.TweenVars, { drawSVG: "100%", duration: 4 } as gsap.TweenVars, 0);
      // Stylo lumineux guidé par MotionPath, synchronisé avec l'extrémité du tracé.
      tl.to(
        pen,
        {
          motionPath: { path: active, align: active, alignOrigin: [0.5, 0.5] },
          duration: 4,
        } as gsap.TweenVars,
        0,
      );
      // Remplissage progressif de la couronne (masque bas → haut : 25/50/75/100%).
      tl.fromTo(clipRect, { attr: { y: -14, height: 6 } }, { attr: { y: -80, height: 76 }, duration: 4 }, 0);

      stepEls.forEach((_, i) => {
        const t: gsap.Position = `step${i + 1}`;
        // Pastille qui se remplit (scale 0 → 1, back.out) + chiffre noir → terracotta.
        tl.to(fills[i] as Element, { scale: 1, duration: 0.3, ease: "back.out(2)" }, t);
        tl.to(numbers[i] as Element, { fill: "#B05F3F", duration: 0.3 }, t);
        // Ripple : anneau qui s'étend et disparaît.
        tl.fromTo(
          q(".ripple")[i] as Element,
          { scale: 0, opacity: 0.8 },
          { scale: 2.4, opacity: 0, duration: 0.6 },
          t,
        );
        // Pointe de couronne + glow croissant.
        tl.to(spikes[i >= 3 ? 2 : i] as Element, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t);
        tl.to(
          crownColored as Element,
          { filter: `drop-shadow(0 0 ${CROWN_GLOWS[i]}px rgba(176,95,63,.9))`, duration: 0.4 },
          t,
        );

        // ——— Section de contenu de l'étape : la précédente glisse vers le haut ———
        if (i > 0) {
          tl.to(states[i - 1] as Element, { y: -30, opacity: 0, duration: 0.45, ease: "power2.in" }, t);
        }
        tl.to(states[i] as Element, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" }, t);
      });

      // Finale : halo, étincelles dorées (angles aléatoires), léger shake.
      tl.to(halo as Element, { opacity: 0.5, duration: 0.3 }, 3.7);
      tl.set(sparks as Element[], { opacity: 1 }, 3.8);
      (sparks as Element[]).forEach((s) => {
        const a = Math.random() * Math.PI * 2;
        const d = 42 + Math.random() * 72;
        tl.to(s, { x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, duration: 0.4 }, 3.82);
      });
      tl.to(svgEl as Element, { x: 5, duration: 0.05, repeat: 3, yoyo: true }, 3.88);

      return () => {
        pulse.kill();
        burstTl?.kill();
      };
    },
    { scope: rootRef, dependencies: [vertical, reduced] },
  );

  const rootClass = [
    "flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-[auto_auto_1fr] md:gap-x-10 md:gap-y-5",
    !reduced && "md:h-[calc(100dvh-96px)]",
  ]
    .filter(Boolean)
    .join(" ");

  const blockClass = [
    "relative min-h-[200px] md:min-h-0 md:h-[clamp(170px,24vh,250px)]",
    !reduced && "sticky top-[76px] z-20 bg-sand pt-1 md:static md:z-auto md:bg-transparent md:pt-0",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={rootClass}>
      <h2 id="services-title" className="text-4xl font-bold tracking-tight text-terracotta md:col-span-2 md:text-5xl xl:text-6xl">
        Nos services et prestations
      </h2>

      {/* Bloc d'étape : une section visible à la fois, remplacée au scroll */}
      <div className={blockClass}>
        <ol className="sr-only">
          {STEP_LABELS.map((lines) => (
            <li key={lines.join(" ")}>{lines.join(" ")}</li>
          ))}
        </ol>
        {CONTENT_STEPS.map((s) => (
          <div
            key={s.title}
            className={["service-state", reduced ? "mb-6 last:mb-0" : "absolute inset-0"].join(" ")}
          >
            <h3 className="text-2xl font-medium text-terracotta">{s.title}</h3>
            <p className="mt-3 max-w-xl text-[17px] leading-[1.6] text-neutral-900">{s.text}</p>
          </div>
        ))}
      </div>

      {/* Visuel d'illustration (statique, comme la maquette) */}
      <div className="relative h-48 overflow-hidden rounded-[24px] bg-paper md:h-[clamp(170px,24vh,250px)]">
        <Image src={CONTENT_IMG.src} alt={CONTENT_IMG.alt} fill sizes="(max-width: 768px) 92vw, 560px" className="object-cover" loading="lazy" />
      </div>

      {/* Tracé + couronne */}
      <div className="flex flex-col overflow-hidden rounded-[12px] border border-terracotta/70 bg-gradient-to-b from-[#F1ECDA] to-[#E2DABD] p-3 md:col-span-2 md:h-full md:min-h-0 md:p-6">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="h-auto w-full md:h-full md:min-h-0"
          role="img"
          aria-label="Parcours en 4 étapes : création, lancement, hébergement de votre site, puis à vous de jouer avec les accès admin, jusqu'à la couronne."
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5F6670" />
              <stop offset="100%" stopColor="#B05F3F" />
            </linearGradient>
            <clipPath id={clipId}>
              <rect className="crown-clip-rect" x="-52" y="-14" width="104" height="6" />
            </clipPath>
          </defs>

          {/* Fantôme gris clair */}
          <path d={path} fill="none" stroke="#5F6670" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
          {/* Actif terracotta (DrawSVG) */}
          <path className="path-active" d={path} fill="none" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />

          {/* Étapes */}
          {steps.map((s, i) => (
            <g key={i} className="step" transform={`translate(${s.x} ${s.y})`}>
              <circle className="ripple" r="17" fill="none" stroke="#B05F3F" strokeWidth="2" />
              <circle r="16" fill="#FFFDF7" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle className="step-fill" r="16" fill="#B05F3F" />
              <text className="step-num" textAnchor="middle" dy="6" fontSize="17" fontWeight="700" fill="#1a1a1a">
                {i + 1}
              </text>
            </g>
          ))}

          {/* Libellés de chaque étape (desktop : sous le point ; mobile : à droite) */}
          {!vertical &&
            STEP_LABELS.map((lines, i) => (
              <text key={`lb-d-${i}`} x={steps[i].x} y={306} textAnchor="middle" fontSize="17" fontWeight="500" fill="#3F5F85">
                {lines.map((ln, j) => (
                  <tspan key={j} x={steps[i].x} dy={j === 0 ? 0 : 20}>
                    {ln}
                  </tspan>
                ))}
              </text>
            ))}
          {vertical &&
            STEP_LABELS.map((lines, i) => (
              <text key={`lb-v-${i}`} x={245} y={steps[i].y + 5} textAnchor="start" fontSize="19" fontWeight="500" fill="#3F5F85">
                {lines.map((ln, j) => (
                  <tspan key={j} x={245} dy={j === 0 ? -6 : 22}>
                    {ln}
                  </tspan>
                ))}
              </text>
            ))}

          {/* Stylo lumineux */}
          <g className="pen" style={{ filter: "drop-shadow(0 0 8px rgba(176,95,63,.9))" }}>
            <circle r="15" fill="#B05F3F" opacity="0.22" />
            <circle r="6" fill="#B05F3F" stroke="#FFFDF7" strokeWidth="2" />
          </g>

          {/* Couronne */}
          <g className="crown" transform={`translate(${crownPos.x} ${crownPos.y})`}>
            <circle className="crown-halo" r="52" fill="#B05F3F" opacity="0" />
            {/* Version inactive grise */}
            <g opacity="0.3" style={{ filter: "grayscale(1)" }}>
              <path d={CROWN_BODY} fill="#8A8F98" />
              <rect x="-46" y="-20" width="92" height="10" rx="2" fill="#8A8F98" />
            </g>
            {/* Version terracotta révélée par le masque */}
            <g className="crown-colored" clipPath={`url(#${clipId})`}>
              <path d={CROWN_BODY} fill="#B05F3F" />
              <rect x="-46" y="-20" width="92" height="10" rx="2" fill="#B05F3F" />
            </g>
            {SPIKES.map((p, i) => (
              <circle key={i} className="spike" cx={p.x} cy={p.y} r="6" fill="#B05F3F" style={{ filter: "drop-shadow(0 0 6px rgba(176,95,63,.9))" }} />
            ))}
            {/* Étincelles dorées */}
            {Array.from({ length: 16 }).map((_, i) => (
              <circle key={i} className="spark" r="3" fill="#E3A83B" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

/** Conteneur responsive : version horizontale desktop (épinglée) / verticale mobile. */
export function PathTimeline() {
  const [vertical, setVertical] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent): void => setVertical(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent): void => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <Canvas key={`${vertical ? "v" : "h"}-${reduced ? "r" : "a"}`} vertical={vertical} reduced={reduced} />
    </div>
  );
}
