"use client";

import { useRef } from "react";
import { Sparkles, Compass, Eye, HeartHandshake, ArrowLeft, CalendarCheck, type LucideIcon } from "lucide-react";
import { gsap, DrawSVGPlugin, useGSAP, registerGsap } from "@/lib/gsap";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PolaroidCard } from "@/components/ui/PolaroidCard";
import { expandNavigate } from "@/components/transition/ExpandTransition";

const VALUES: Array<{ title: string; text: string; Icon: LucideIcon }> = [
  {
    title: "Immersion",
    text: "Des sites qui racontent une histoire : animations, images et rythme au service de vos événements et de vos ateliers.",
    Icon: Sparkles,
  },
  {
    title: "Simplicité",
    text: "Vous n’avez rien à faire. On conçoit, on lance, on héberge : vous profitez d’un site qui marche dès le premier jour.",
    Icon: Compass,
  },
  {
    title: "Transparence",
    text: "Des prix clairs, une grille téléchargeable et des KPI accessibles : vous savez toujours où va votre budget.",
    Icon: Eye,
  },
  {
    title: "Accompagnement",
    text: "Après la mise en ligne, on reste à vos côtés : maintenance, conseils et évolutions au fil de vos saisons.",
    Icon: HeartHandshake,
  },
];

const STORY_IMG =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=75";

/** Page « Nos valeurs » : hero dessiné, cartes en stagger, histoire, CTA. */
export function Valeurs() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = rootRef.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      if (reduced) return;

      // Intro hero (le calque forest se rétracte par-dessus à l'arrivée).
      gsap.fromTo(
        [q(".valeurs-title")[0], q(".valeurs-lead")[0]],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "expo.out", delay: 0.55 },
      );

      // Arcs concentriques qui se dessinent (DrawSVG en scrub lent).
      q(".valeurs-arc").forEach((arc) => {
        gsap.fromTo(
          arc,
          { drawSVG: "0%" } as gsap.TweenVars,
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: { trigger: arc as Element, start: "top bottom", end: "bottom 30%", scrub: 1 },
          } as gsap.TweenVars,
        );
      });

      // Cartes de valeurs : apparition en stagger au scroll.
      gsap.fromTo(
        q(".value-card"),
        { y: 70, opacity: 0, rotation: (i: number) => (i % 2 === 0 ? -3 : 3) },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: q(".values-grid")[0], start: "top 82%", toggleActions: "play none none reverse" },
        },
      );

      // Bloc histoire.
      gsap.fromTo(
        q(".story-block"),
        { clipPath: "inset(0 0 100% 0)", y: 50, opacity: 0 },
        {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".story-block")[0], start: "top 80%", toggleActions: "play none none reverse" },
        },
      );
      gsap.fromTo(
        q(".story-polaroid"),
        { y: 60, rotation: -10, opacity: 0 },
        {
          y: 0,
          rotation: -5,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".story-block")[0], start: "top 80%", toggleActions: "play none none reverse" },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <>
      <Header />
      <main ref={rootRef} className="bg-sand pt-[72px]">
        {/* Hero */}
        <section aria-labelledby="valeurs-title" className="relative overflow-clip px-5 py-16 md:px-10 md:py-24">
          <svg className="pointer-events-none absolute -right-20 top-6 h-[380px] w-[380px]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
            <circle className="valeurs-arc" cx="400" cy="40" r="170" stroke="#B05F3F" strokeWidth="1" />
            <circle className="valeurs-arc" cx="400" cy="40" r="235" stroke="#B05F3F" strokeWidth="1" />
          </svg>

          <div className="relative mx-auto max-w-4xl text-center">
            <h1 id="valeurs-title" className="valeurs-title text-balance text-5xl font-bold tracking-tight text-terracotta md:text-7xl">
              Nos valeurs
            </h1>
            <p className="valeurs-lead mx-auto mt-6 max-w-2xl text-[18px] leading-[1.6] text-neutral-900 md:text-[20px]">
              Ce qui guide BeaverLaunch à chaque projet : faire briller vos activités avec des sites immersifs,
              limpides et pensés pour convertir.
            </p>
          </div>
        </section>

        {/* 4 valeurs */}
        <section aria-label="Nos 4 valeurs" className="px-5 pb-16 md:px-10 md:pb-24">
          <div className="values-grid mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ title, text, Icon }) => (
              <article key={title} className="value-card rounded-[24px] border border-terracotta bg-paper p-6 shadow-[0_20px_40px_-20px_rgba(176,95,63,0.35)]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-terracotta">{title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-blue">{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Notre histoire */}
        <section aria-labelledby="histoire-title" className="px-5 pb-20 md:px-10 md:pb-28">
          <div className="story-block mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <h2 id="histoire-title" className="text-3xl font-bold text-terracotta md:text-5xl">
                Notre histoire
              </h2>
              <p className="mt-5 text-[18px] leading-[1.6] text-neutral-900">
                BeaverLaunch est né d’une conviction simple : les acteurs de l’événementiel et de l’activité
                méritent des sites à la hauteur de leurs expériences. Ateliers enfants, loisirs, réservations —
                chaque projet reçoit un site sur-mesure, rapide et immersif, suivi d’un hébergement serein avec
                des accès administrateur complets.
              </p>
              <p className="mt-4 text-[18px] leading-[1.6] text-neutral-900">
                De la première esquisse à la couronne posée, nous restons vos partenaires : c’est ça, notre
                manière de faire.
              </p>
            </div>
            <PolaroidCard src={STORY_IMG} alt="L’équipe BeaverLaunch en atelier de travail" className="story-polaroid mx-auto w-full max-w-[340px] rotate-[-5deg]" />
          </div>
        </section>

        {/* CTA + Retour */}
        <section aria-label="Passer à l’action" className="px-5 pb-24 md:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={(e) => expandNavigate("/", e.currentTarget)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-blue px-8 py-4 text-base font-medium text-slate-blue transition-colors hover:bg-slate-blue hover:text-white"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Retour
            </button>
            <button
              type="button"
              onClick={(e) => expandNavigate("/#offres", e.currentTarget)}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-9 py-4 text-base font-medium text-[#F5F1E0] transition-all hover:bg-[#23402c] active:scale-[0.97]"
            >
              <CalendarCheck size={19} aria-hidden="true" />
              Parlons de votre projet
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export { DrawSVGPlugin };
