"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PenTool, Rocket, Server, MousePointerClick, type LucideIcon } from "lucide-react";
import { gsap, useGSAP, registerGsap } from "@/lib/gsap";

const LABELS = [
  "Création de votre site",
  "Lancement de votre site",
  "Hébergement de votre site",
  "À vous de jouer avec les accès admin",
];

/** Cartes de révélation : numéro, titre, phrase et icône (charte de la marque). */
const STEP_CARDS: Array<{ title: string; text: string; Icon: LucideIcon }> = [
  {
    title: "Création de votre site",
    text: "On conçoit un site à votre image, de zéro, avec un design immersif et une identité soignée.",
    Icon: PenTool,
  },
  {
    title: "Lancement de votre site",
    text: "Mise en ligne, nom de domaine et réglages : tout est prêt, vous n’avez plus qu’à partager.",
    Icon: Rocket,
  },
  {
    title: "Hébergement de votre site",
    text: "Hébergement rapide et sécurisé, avec maintenance et mises à jour assurées en continu.",
    Icon: Server,
  },
  {
    title: "À vous de jouer avec les accès admin",
    text: "Accès administrateur, insights et KPI : votre site entre enfin entre vos mains.",
    Icon: MousePointerClick,
  },
];

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
 * Signature du site : chemin en S qui se dessine au scroll (DrawSVG),
 * stylo lumineux (MotionPath), cartes d'étape qui se révèlent,
 * couronne qui s'illumine progressivement puis explosion finale.
 *
 * Réglages : STEP_TIMES (seuils d'allumage), durées dans la timeline,
 * CROWN_GLOWS (intensité du glow par étape).
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
  const stack = vertical && !reduced;

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
      const cards = q(".step-card");
      const connectors = q(".step-connector");
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
        // Chemin complet, couronne allumée, cartes affichées, pas de pin.
        gsap.set(active, { drawSVG: "100%" } as gsap.TweenVars);
        gsap.set(fills, { scale: 1 });
        gsap.set(numbers, { fill: "#B05F3F" });
        gsap.set(spikes, { opacity: 1, scale: 1 });
        gsap.set(halo, { opacity: 0.5 });
        gsap.set(clipRect, { attr: { y: -80, height: 76 } });
        gsap.set(pen, { opacity: 0 });
        gsap.set(connectors, { opacity: 1 });
        return;
      }

      gsap.set(cards, { y: 40, opacity: 0, scale: 0.92 });
      gsap.set(connectors, { opacity: 0 });

      // ——— Lignes pointillées : carte ↔ point sur le tracé (mesurées au pixel) ———
      const layoutConnectors = (): void => {
        if (vertical || !svgEl) return;
        const srect = svgEl.getBoundingClientRect();
        if (srect.width === 0) return;
        const toViewBoxX = (px: number): number => (px / srect.width) * 1300;
        cards.forEach((card, i) => {
          const crect = card.getBoundingClientRect();
          const centerPx = crect.left + crect.width / 2 - srect.left;
          const cx = toViewBoxX(centerPx);
          const s = steps[i];
          // Du point de l'étape → couloir horizontal (sous le tracé) → centre de la carte.
          connectors[i]?.setAttribute("points", `${s.x},${s.y} ${s.x},320 ${cx},320 ${cx},355`);
        });
      };
      layoutConnectors();
      const onResize = (): void => layoutConnectors();
      window.addEventListener("resize", onResize);
      const ro = new ResizeObserver(() => layoutConnectors());
      ro.observe(root);

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
              trigger: root,
              start: "top 65%",
              end: "+=200%",
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

        // ——— Carte de révélation de l'étape (labels step1…step4) ———
        const card = cards[i] as Element;
        const parts = Array.from((card as HTMLElement).querySelectorAll<HTMLElement>(".step-card-part"));
        tl.to(card, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, t);
        if (parts.length > 0) {
          tl.to(parts, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: "power2.out" }, t);
        }
        if (!stack) {
          // Ligne pointillée qui apparaît quand le tracé atteint l'étape.
          tl.to(connectors[i] as Element, { opacity: 1, duration: 0.4 }, t);
          // La carte précédente se réduit mais reste visible (trace du parcours).
          if (i > 0) tl.to(cards[i - 1] as Element, { scale: 0.95, opacity: 0.5, duration: 0.4 }, t);
        } else if (i > 0) {
          // Mobile : une seule carte visible, la précédente fond.
          tl.to(cards[i - 1] as Element, { y: -12, opacity: 0, duration: 0.4 }, t);
        }
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
        window.removeEventListener("resize", onResize);
        ro.disconnect();
        pulse.kill();
        burstTl?.kill();
      };
    },
    { scope: rootRef, dependencies: [vertical, reduced] },
  );

  return (
    <div ref={rootRef} className="rounded-[12px] border border-terracotta/70 bg-gradient-to-b from-[#F1ECDA] to-[#E2DABD] p-4 md:p-8">
      <h3 className="sr-only">Les étapes de votre projet</h3>
      <ol className="sr-only">
        {LABELS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ol>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full"
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

        {/* Lignes pointillées carte ↔ étape (desktop uniquement) */}
        {!vertical &&
          steps.map((_, i) => (
            <polyline
              key={`connector-${i}`}
              className="step-connector"
              fill="none"
              stroke="#B05F3F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="1 8"
              points=""
            />
          ))}

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

      {/* Cartes de révélation des étapes */}
      <div className={stack ? "relative mt-6 min-h-[260px]" : "mt-6 grid grid-cols-1 gap-4 md:grid-cols-4"}>
        {STEP_CARDS.map(({ title, text, Icon }, i) => (
          <article
            key={title}
            className={[
              "step-card rounded-[24px] border border-terracotta bg-paper p-5 shadow-[0_20px_40px_-20px_rgba(176,95,63,0.35)]",
              stack ? "absolute inset-x-0 top-0" : "",
            ].join(" ")}
          >
            <div className="step-card-part flex items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                {i + 1}
              </span>
              <Icon size={20} className="text-terracotta" aria-hidden="true" />
            </div>
            <h4 className="step-card-part mt-3 text-lg font-bold text-terracotta" style={{ fontWeight: 700 }}>
              {title}
            </h4>
            <p className="step-card-part mt-2 text-[15px] leading-relaxed text-slate-blue" style={{ fontWeight: 400 }}>
              {text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Conteneur responsive : version horizontale desktop / verticale mobile. */
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
    <div className="mx-auto mt-14 max-w-7xl md:mt-20">
      <Canvas key={`${vertical ? "v" : "h"}-${reduced ? "r" : "a"}`} vertical={vertical} reduced={reduced} />
    </div>
  );
}
